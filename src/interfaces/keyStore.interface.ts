import { Types } from 'mongoose';

export interface CreateKeyToken {
    user: Types.ObjectId;
    privateKey: string;
    publicKey: string;
    refreshToken: string;
}
