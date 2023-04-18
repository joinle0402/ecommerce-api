import crypto from 'crypto';
import { LoginBody, RegisterBody, UserDecode } from '@/interfaces/auth.interface';
import { User } from '@/models/user.model';
import { JwtUtil } from '@/utilities/jwt.utility';
import { logger } from '@/utilities/logger.utility';
import { KeyTokenService } from './keyToken.service';
import { pick } from '@/helpers/lodash';
import { UserService } from './user.service';
import createHttpError from 'http-errors';

export class AuthService {
    static register = async (registerBody: RegisterBody) => {
        const { fullname, email, password } = registerBody;
        logger.info('AuthService.register.registerBody: ', registerBody);

        if (await User.findOne({ email }).lean()) {
            logger.info('AuthService.register.error: email already exists!');
            throw new createHttpError.Conflict('email already exists!');
        }

        const createdUser = await User.create({ fullname, email, password });
        logger.info('AuthService.register.createdUser: ', createdUser.toObject());

        return {
            createdUser,
        };
    };

    static login = async (loginBody: LoginBody) => {
        const { email, password } = loginBody;
        logger.info('AuthService.login.loginBody: ', loginBody);

        const foundUser = await User.findOne({ email });
        if (!foundUser) {
            throw new createHttpError.Unauthorized('Invalid email or password!');
        }
        logger.info('AuthService.login.foundUser: ', foundUser.toObject());

        const isMatch = await foundUser.comparePassword(password);
        logger.info('AuthService.login.isMatch: %s', isMatch);
        if (!isMatch) {
            throw new createHttpError.Unauthorized('Invalid email or password!');
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
            throw new createHttpError.Forbidden('Something went wrong !! Please log in again!');
        }

        const keyToken = await KeyTokenService.findByRefreshToken(refreshTokenInput);
        if (!keyToken) {
            throw new createHttpError.BadRequest('invalid refresh token!');
        }

        const { userId, email } = (await JwtUtil.verifyToken(refreshTokenInput, keyToken.privateKey)) as UserDecode;
        logger.info('User decode from refresh token: ', { userId, email });

        const foundUser = await UserService.findByEmail(email);
        if (!foundUser) {
            throw new createHttpError.BadRequest();
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
