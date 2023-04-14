import { Schema, Types, model } from 'mongoose';

export interface IKeyToken {
    user?: Types.ObjectId;
    publicKey: string;
    privateKey: string;
    refreshToken: string;
    refreshTokensUsed: string[];
}

const KeyTokenSchema = new Schema<IKeyToken>(
    {
        user: {
            type: Types.ObjectId,
            required: true,
            ref: 'User',
        },
        publicKey: {
            type: String,
            required: true,
        },
        privateKey: {
            type: String,
            required: true,
        },
        refreshToken: {
            type: String,
            required: true,
        },
        refreshTokensUsed: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
        collection: 'KeyTokens',
    }
);

export const KeyToken = model<IKeyToken>('KeyToken', KeyTokenSchema);
