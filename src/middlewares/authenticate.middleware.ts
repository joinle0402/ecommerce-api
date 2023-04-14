import { config } from '@/configs/config';
import { AuthenticateFailureError } from '@/helpers/error';
import { KeyTokenAttachment } from '@/interfaces';
import { UserDecode } from '@/interfaces/auth.interface';
import { KeyTokenService } from '@/services/keyToken.service';
import { JwtUtil } from '@/utilities/jwt.utility';
import { logger } from '@/utilities/logger.utility';
import { NextFunction, Request, Response } from 'express';

export const authentication = async (request: Request, response: Response, next: NextFunction) => {
    const userId = request.headers[config.auth.headers.clientId] as string;
    logger.info('middleware.authentication.userId: %s', userId);
    if (!userId) {
        throw new AuthenticateFailureError('invalid request!');
    }

    const keyToken = await KeyTokenService.findByUserId(userId);
    if (!keyToken) {
        throw new AuthenticateFailureError('invalid client id!');
    }

    const accessToken = request.headers[config.auth.headers.authorization] as string;
    logger.info('middleware.authentication.accessToken: %s', accessToken);
    if (!accessToken) {
        throw new AuthenticateFailureError('invalid request!');
    }

    const decodedUser = (await JwtUtil.verifyToken(accessToken, keyToken.publicKey)) as UserDecode;
    if (decodedUser.userId != userId) {
        throw new AuthenticateFailureError('invalid user!');
    }

    const keyTokenAttachment: KeyTokenAttachment = {
        _id: keyToken._id,
        publicKey: keyToken.publicKey,
        privateKey: keyToken.privateKey,
        user: keyToken._id,
        refreshToken: keyToken.refreshToken,
        refreshTokensUsed: keyToken.refreshTokensUsed,
    };
    request.keyToken = keyTokenAttachment;
    return next();
};
