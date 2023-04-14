import { StatusCode } from '@/configs/statusCode.config';
import { NotFoundError } from '@/helpers/error';
import { logger } from '@/utilities/logger.utility';
import { NextFunction, Request, Response } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const notFoundHandler = (request: Request, response: Response, next: NextFunction) => {
    throw new NotFoundError('Route not found');
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (error, request: Request, response: Response, next: NextFunction) => {
    const code = error.status || StatusCode.INTERNAL_SERVER_ERROR;
    const message = error.message || 'Internal Server Error';
    logger.error('ErrorHandler.error: ', {
        code,
        error: message,
    });
    return response.status(code).json({
        code,
        success: false,
        error: message,
    });
};
