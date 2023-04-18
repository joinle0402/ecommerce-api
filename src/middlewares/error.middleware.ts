import { logger } from '@/utilities/logger.utility';
import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { StatusCodes } from 'http-status-codes';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const notFoundHandler = (request: Request, response: Response, next: NextFunction) => {
    throw new createHttpError.NotFound('Route not found');
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (error, request: Request, response: Response, next: NextFunction) => {
    const code = error.status || StatusCodes.INTERNAL_SERVER_ERROR;
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
