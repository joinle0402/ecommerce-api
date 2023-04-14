import { IKeyToken } from '@/models/keyToken.model';

declare module 'express' {
    export interface Request {
        keyToken?: IKeyToken;
    }
}
