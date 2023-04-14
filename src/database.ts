import util from 'util';
import mongoose from 'mongoose';
import { logger } from '@/utilities/logger.utility';
import { config } from './configs/config';

export const connectDatabase = async () => {
    try {
        await mongoose.connect(config.database.url, {
            connectTimeoutMS: 3000,
        });
        logger.info(`connectDatabase.connected successfully!!`);
    } catch (error) {
        logger.error(`ConnectDatabase.Error: ${error.message}`);
        process.exit(0);
    }
};

mongoose.set('debug', function (collectionName, methodName, ...methodArgs) {
    const messageMapper = message => {
        return util
            .inspect(message, false, 10, true)
            .replace(/\n/g, '')
            .replace(/\s{2,}/g, ' ');
    };
    logger.info(
        `\x1B[0;36mMongoose::\x1B[0m ${collectionName}.${methodName}` + `(${methodArgs.map(messageMapper).join(', ')})`
    );
});

mongoose.connection.on('disconnected', () => {
    logger.info(`Mongodb disconnected is disconnected!!`);
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
});
