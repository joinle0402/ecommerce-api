import { Types } from 'mongoose';

export interface RegisterBody {
    fullname: string;
    email: string;
    password: string;
}

export interface LoginBody {
    email: string;
    password: string;
}

export interface UserPayload {
    userId: Types.ObjectId;
    email: string;
}

export interface UserDecode {
    userId: string;
    email: string;
    iat: number;
    exp: number;
}

export interface RefreshTokenBody {
    refreshToken: string;
}
