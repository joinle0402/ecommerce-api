import Joi from 'joi';

export const registerSchema = {
    body: Joi.object().keys({
        fullname: Joi.string().min(5).max(50).required(),
        email: Joi.string().email().lowercase().required(),
        password: Joi.string().min(5).max(50).required(),
    }),
};

export const loginSchema = {
    body: Joi.object().keys({
        email: Joi.string().email().lowercase().required(),
        password: Joi.string().min(5).max(50).required(),
    }),
};

export const refreshTokenSchema = {
    body: Joi.object().keys({
        refreshToken: Joi.string().required(),
    }),
};
