import { KeyTokenService } from '@/services/keyToken.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class KeyTokenController {
    static async findAll(request: Request, response: Response) {
        response.status(StatusCodes.OK).json({
            code: StatusCodes.OK,
            success: true,
            message: 'Find all key tokens successfully!',
            metadata: await KeyTokenService.findAll(),
        });
    }

    static async deleteAll(request: Request, response: Response) {
        response.status(StatusCodes.OK).json({
            code: StatusCodes.OK,
            success: true,
            message: 'Delete all key tokens successfully!',
            metadata: await KeyTokenService.deleteAll(),
        });
    }
}
