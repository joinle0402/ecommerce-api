import { CreateKeyToken } from '@/interfaces/keyStore.interface';
import { KeyToken } from '@/models/keyToken.model';
import { logger } from '@/utilities/logger.utility';

export class KeyTokenService {
    static findAll = async () => {
        const keyTokens = await KeyToken.find().lean();
        logger.info('KeyTokenService.findAll.keyTokens: ', keyTokens);
        return keyTokens;
    };

    static findByUserId = async (userId: string) => {
        const keyToken = await KeyToken.findOne({ user: userId }).lean();
        logger.info('KeyTokenService.findByUserId.keyToken: ', keyToken);
        return keyToken;
    };

    static findByRefreshTokensUsed = async (refreshToken: string) => {
        logger.info('KeyTokenService.findByRefreshToken.refreshToken: %s', refreshToken);
        const keyToken = await KeyToken.findOne({ refreshTokensUsed: refreshToken }).lean();
        logger.info('KeyTokenService.findByRefreshTokensUsed.keyToken: ', keyToken);
        return keyToken;
    };

    static findByRefreshToken = async (refreshToken: string) => {
        logger.info('KeyTokenService.findByRefreshToken.refreshToken: %s', refreshToken);
        const keyToken = await KeyToken.findOne({ refreshToken }).lean();
        logger.info('KeyTokenService.findByRefreshToken.keyToken: ', keyToken);
        return keyToken;
    };

    static createKeyStore = async (createKeyStore: CreateKeyToken) => {
        const { user, privateKey, publicKey, refreshToken } = createKeyStore;
        logger.info('KeyTokenService.createKeyStore.createKeyStore: ', createKeyStore);

        try {
            const keyToken = await KeyToken.findOneAndUpdate(
                { user },
                { privateKey, publicKey, refreshToken, refreshTokensUsed: [] },
                { upsert: true, new: true }
            );
            logger.info('KeyTokenService.createKeyStore.keyToken: ', keyToken.toObject());

            return keyToken ? keyToken.publicKey : null;
        } catch (error) {
            throw error;
        }
    };

    static updateRefreshToken = async (oldRefreshToken: string, newRefreshToken: string) => {
        const updatedKeyToken = await KeyToken.findOneAndUpdate(
            { refreshToken: oldRefreshToken },
            {
                $set: {
                    refreshToken: newRefreshToken,
                },
                $addToSet: {
                    refreshTokensUsed: oldRefreshToken,
                },
            },
            { new: true }
        );
        logger.info('KeyTokenService.updateRefreshToken.updatedKeyToken: ', updatedKeyToken);
        return updatedKeyToken;
    };

    static deleteById = async (id: string) => {
        const deleteInfo = await KeyToken.deleteOne({ _id: id });
        logger.info('KeyTokenService.deleteById.deleteInfo: ', deleteInfo);
    };

    static deleteByUserId = async (userId: string) => {
        const deleteInfo = await KeyToken.deleteOne({ user: userId });
        logger.info('KeyTokenService.deleteByUserId.deleteInfo: ', deleteInfo);
    };

    static deleteAll = async () => {
        const deleteInfo = await KeyToken.deleteMany({});
        logger.info('KeyTokenService.deleteAll.deleteInfo: ', deleteInfo);
    };
}
