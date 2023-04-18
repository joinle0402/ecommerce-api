import { config } from '@/configs/config';
import { UserDecode } from '@/interfaces/auth.interface';
import { KeyTokenService } from '@/services/keyToken.service';
import { JwtUtil } from '@/utilities/jwt.utility';
import { logger } from '@/utilities/logger.utility';
import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

export const authentication = async (request: Request, response: Response, next: NextFunction) => {
    const userId = request.headers[config.auth.headers.clientId] as string;
    logger.info('middleware.authentication.userId: %s', userId);
    if (!userId) {
        throw new createHttpError.Unauthorized('invalid request!');
    }

    const keyToken = await KeyTokenService.findByUserId(userId);
    if (!keyToken) {
        throw new createHttpError.Unauthorized('invalid client id!');
    }

    const accessToken = request.headers[config.auth.headers.authorization] as string;
    logger.info('middleware.authentication.accessToken: %s', accessToken);
    if (!accessToken) {
        throw new createHttpError.Unauthorized('invalid request!');
    }

    const decodedUser = (await JwtUtil.verifyToken(accessToken, keyToken.publicKey)) as UserDecode;
    if (decodedUser.userId != userId) {
        throw new createHttpError.Unauthorized('invalid user!');
    }
    response.locals.keyToken = keyToken;
    return next();
};
