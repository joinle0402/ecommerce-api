import { Types } from 'mongoose';

interface KeyTokenAttachment {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    privateKey: string;
    publicKey: string;
    refreshToken: string;
    refreshTokensUsed: string[];
}

declare module 'express' {
    export interface Request {
        keyToken?: KeyTokenAttachment;
    }
}
