import { UserService } from '@/services/user.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class UserController {
    static findAll = async (request: Request, response: Response) => {
        response.status(StatusCodes.OK).json({
            code: StatusCodes.OK,
            message: 'Find all users successfully!',
            metadata: await UserService.findAll(),
        });
    };

    static deleteAll = async (request: Request, response: Response) => {
        response.status(StatusCodes.OK).json({
            code: StatusCodes.OK,
            message: 'Delete all users successfully!',
            metadata: await UserService.deleteAll(),
        });
    };
}
