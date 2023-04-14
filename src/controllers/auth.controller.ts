import { Request, Response } from 'express';
import { LoginBody, RefreshTokenBody } from '@/interfaces/auth.interface';
import { AuthService } from '@/services/auth.service';
import { StatusCode } from '@/configs/statusCode.config';

export class AuthController {
    /**
     * @description Register a new user.
     * @route POST /api/v1/auth/register
     * @access Public
     * @param request Request
     * @param response Response
     */
    static register = async (request: Request, response: Response) => {
        response.status(StatusCode.CREATED).json({
            code: StatusCode.CREATED,
            success: true,
            message: 'register user!',
            metadata: await AuthService.register(request.body),
        });
    };

    /**
     * @description Login user.
     * @route POST /api/v1/auth/login
     * @access Public
     * @param request Request
     * @param response Response
     */
    static login = async (request: Request<undefined, undefined, LoginBody>, response: Response) => {
        response.status(StatusCode.OKE).json({
            code: StatusCode.OKE,
            success: true,
            message: 'login user!',
            metadata: await AuthService.login(request.body),
        });
    };

    /**
     * @description Logout user.
     * @route POST /api/v1/auth/logout
     * @access Public
     * @param request Request
     * @param response Response
     */
    static logout = async (request: Request<undefined, undefined, RefreshTokenBody>, response: Response) => {
        response.status(StatusCode.OKE).json({
            code: StatusCode.OKE,
            success: true,
            message: 'logout user!',
            // metadata: await AuthService.logout(request.keyToken._id),
        });
    };

    /**
     * @description Logout user.
     * @route POST /api/v1/auth/logout
     * @access Public
     * @param request Request
     * @param response Response
     */
    static refreshToken = async (request: Request<undefined, undefined, RefreshTokenBody>, response: Response) => {
        response.status(StatusCode.OKE).json({
            code: StatusCode.OKE,
            success: true,
            message: 'refresh token user!',
            metadata: await AuthService.refreshToken(request.body.refreshToken),
        });
    };
}
