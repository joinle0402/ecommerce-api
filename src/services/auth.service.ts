import crypto from 'crypto';
import { AuthenticateFailureError, BadRequestError, ConflictError } from '@/helpers/error';
import { LoginBody, RegisterBody, UserDecode } from '@/interfaces/auth.interface';
import { UserModel } from '@/models/user.model';
import { JwtUtil } from '@/utilities/jwt.utility';
import { logger } from '@/utilities/logger.utility';
import { KeyTokenService } from './keyToken.service';
import { pick } from '@/helpers/lodash';
import { ForbiddenError } from '@/helpers/error';
import { UserService } from './user.service';

export class AuthService {
    static register = async (registerBody: RegisterBody) => {
        const { fullname, email, password } = registerBody;
        logger.info('AuthService.register.registerBody: ', registerBody);

        const userExists = await UserModel.findOne({ email }).lean();
        if (userExists) {
            logger.info('AuthService.register.userExists: ', userExists);
            throw new ConflictError('email already exists!');
        }

        const createdUser = await UserModel.create({ fullname, email, password });
        logger.info('AuthService.register.createdUser: ', createdUser.toObject());

        return {
            createdUser,
        };
    };

    static login = async (loginBody: LoginBody) => {
        const { email, password } = loginBody;
        logger.info('AuthService.login.loginBody: ', loginBody);

        const foundUser = await UserModel.findOne({ email });
        if (!foundUser) {
            throw new AuthenticateFailureError('Invalid email or password!');
        }
        logger.info('AuthService.login.foundUser: ', foundUser.toObject());

        const isMatch = await foundUser.comparePassword(password);
        logger.info('AuthService.login.isMatch: %s', isMatch);
        if (!isMatch) {
            throw new AuthenticateFailureError('Invalid email or password!');
        }

        const privateKey = crypto.randomBytes(64).toString('hex');
        const publicKey = crypto.randomBytes(64).toString('hex');
        logger.info('AuthService.login: Generate key pair::', {
            privateKey,
            publicKey,
        });

        const userPayload = { userId: foundUser._id, email: foundUser.email };
        const tokenPair = await JwtUtil.generateKeyPair(userPayload, publicKey, privateKey);

        await KeyTokenService.createKeyStore({
            user: foundUser._id,
            privateKey,
            publicKey,
            refreshToken: tokenPair.refreshToken,
        });

        return {
            user: pick(foundUser.toObject(), ['_id', 'fullname', 'email']),
            tokenPair,
        };
    };

    static logout = async (keyTokenId: string) => {
        logger.info('AuthService.logout.keyToken: %s', keyTokenId);
        await KeyTokenService.deleteById(keyTokenId);
    };

    static refreshToken = async (refreshTokenInput: string) => {
        const foundKeyToken = await KeyTokenService.findByRefreshTokensUsed(refreshTokenInput);
        if (foundKeyToken) {
            const decodedUser = (await JwtUtil.verifyToken(refreshTokenInput, foundKeyToken.privateKey)) as UserDecode;
            logger.info(`user used refresh token? (id: ${decodedUser.userId}, email: ${decodedUser.email})`);
            await KeyTokenService.deleteByUserId(decodedUser.userId);
            throw new ForbiddenError('Something went wrong !! Please log in again!');
        }

        const keyToken = await KeyTokenService.findByRefreshToken(refreshTokenInput);
        if (!keyToken) {
            throw new BadRequestError('invalid refresh token!');
        }

        const { userId, email } = (await JwtUtil.verifyToken(refreshTokenInput, keyToken.privateKey)) as UserDecode;
        logger.info('User decode from refresh token: ', { userId, email });

        const foundUser = await UserService.findByEmail(email);
        if (!foundUser) {
            throw new BadRequestError();
        }

        const userPayload = { userId: foundUser._id, email: foundUser.email };
        const tokenPair = await JwtUtil.generateKeyPair(userPayload, keyToken.publicKey, keyToken.privateKey);

        await KeyTokenService.updateRefreshToken(refreshTokenInput, tokenPair.refreshToken);

        return {
            user: { userId, email },
            tokenPair,
        };
    };
}
