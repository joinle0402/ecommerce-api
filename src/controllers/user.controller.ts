import { StatusCode } from '@/configs/statusCode.config';
import { UserService } from '@/services/user.service';
import { Request, Response } from 'express';

export class UserController {
    static findAll = async (request: Request, response: Response) => {
        response.status(StatusCode.OKE).json({
            code: StatusCode.OKE,
            message: 'Find all users successfully!',
            metadata: await UserService.findAll(),
        });
    };

    static deleteAll = async (request: Request, response: Response) => {
        response.status(StatusCode.OKE).json({
            code: StatusCode.OKE,
            message: 'Delete all users successfully!',
            metadata: await UserService.deleteAll(),
        });
    };
}
