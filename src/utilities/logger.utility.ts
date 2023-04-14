import winston from 'winston';

export const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
        winston.format(info => ({ ...info, level: info.level.toUpperCase() }))(),
        winston.format.prettyPrint(),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.metadata({ fillExcept: ['timestamp', 'level', 'message'] }),
        winston.format.printf(info => {
            const { timestamp, level, message, ...restParams } = info;

            let metadata = '';
            if (Object.keys(restParams.metadata).length > 0) {
                metadata = JSON.stringify(restParams.metadata, null, 4);
                return `[${timestamp}] [${level}]: ${message} \n${metadata}`;
            }

            return `[${timestamp}] [${level}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize({ all: true })),
        }),
    ],
});
