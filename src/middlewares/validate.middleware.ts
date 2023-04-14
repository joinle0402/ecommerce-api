import { StatusCode } from '@/configs/statusCode.config';
import { pick } from '@/helpers/lodash';
import { logger } from '@/utilities/logger.utility';
import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

export const validateResource = schema => async (request: Request, response: Response, next: NextFunction) => {
    const validSchema = pick(schema, ['params', 'query', 'body']);
    const object = pick(request, Object.keys(validSchema));
    const { value, error } = Joi.compile(validSchema)
        .prefs({ errors: { label: 'key' }, abortEarly: false })
        .validate(object);

    if (error) {
        const errors = error.details.reduce(
            (result, errorDetail) => ({
                ...result,
                [errorDetail.path[1]]: errorDetail.message,
            }),
            {}
        );

        logger.error('ValidateResource.errors: ', { errors });
        return response.status(StatusCode.BAD_REQUEST).json({
            code: response.statusCode,
            type: 'ValidationError',
            success: false,
            errors,
        });
    }
    Object.assign(request, value);
    return next();
};
