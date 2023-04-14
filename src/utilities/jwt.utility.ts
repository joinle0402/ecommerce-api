import { config } from '@/configs/config';
import { sign, verify } from 'jsonwebtoken';
import { logger } from './logger.utility';
import { UserPayload } from '@/interfaces/auth.interface';

export class JwtUtil {
    static generateKeyPair = async (payload: UserPayload, publicKey: string, privateKey: string) => {
        logger.info('JwtUtil.generateKeyPair.payload: ', payload);
        logger.info('JwtUtil.generateKeyPair.publicKey: %s', publicKey);
        logger.info('JwtUtil.generateKeyPair.privateKey: %s', privateKey);

        const accessToken = await sign(payload, publicKey, {
            expiresIn: config.auth.jwt.accessToken.expiresIn,
        });

        const refreshToken = await sign(payload, privateKey, {
            expiresIn: config.auth.jwt.refreshToken.expiresIn,
        });

        verify(accessToken, publicKey, (error, decoded) => {
            if (error) {
                logger.error('JwtUtil.generateKeyPair.verify token error: ', error);
                throw error;
            }

            logger.info('JwtUtil.generateKeyPair.verify token decoded: ', decoded);
        });

        logger.info('JwtUtil.generateKeyPair.tokenPair: ', { accessToken, refreshToken });

        return { accessToken, refreshToken };
    };

    static verifyToken = async (token: string, keyToken: string) => {
        return await verify(token, keyToken);
    };
}
