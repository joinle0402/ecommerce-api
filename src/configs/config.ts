import 'dotenv/config';

export const config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    app: {
        port: Number(process.env.PORT || 8000),
    },
    database: {
        url: process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/test',
    },
    auth: {
        bcrypt: {
            saltRounds: Number(process.env.SALT_ROUNDS || 'SALT_ROUNDS'),
        },
        jwt: {
            accessToken: {
                expiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRES_IN || 'AUTH_ACCESS_TOKEN_EXPIRES_IN',
            },
            refreshToken: {
                expiresIn: process.env.AUTH_REFRESH_TOKEN_EXPIRES_IN || 'AUTH_REFRESH_TOKEN_EXPIRES_IN',
            },
        },
        headers: {
            clientId: process.env.AUTH_HEADERS_CLIENT_ID || 'x-client-id',
            authorization: process.env.AUTH_HEADERS_AUTHORIZATION || 'authorization',
        },
    },
};
