import Joi from 'joi';
import { isValidObjectId } from './custom.validation';

export const create = {
    body: Joi.object().keys({
        name: Joi.string().min(5).max(150).trim().required(),
        image: Joi.string().trim().required(),
        category: Joi.string().min(5).max(50).trim().required(),
        price: Joi.number().integer().positive().required(),
        countInStock: Joi.number().integer().positive().required(),
        rating: Joi.number().integer().min(1).max(5).required(),
        description: Joi.string().default(''),
        createdBy: Joi.string().required().custom(isValidObjectId),
    }),
};

export const findById = {
    params: {
        productId: Joi.string().required().custom(isValidObjectId),
    },
};

export const updateById = {
    params: {
        productId: Joi.string().required().custom(isValidObjectId),
    },
    body: Joi.object().keys({
        name: Joi.string().min(5).max(150).trim(),
        image: Joi.string().trim(),
        category: Joi.string().min(5).max(50).trim(),
        price: Joi.number().integer().positive(),
        countInStock: Joi.number().integer().positive(),
        rating: Joi.number().integer().min(1).max(5),
        description: Joi.string(),
        createdBy: Joi.string().custom(isValidObjectId),
    }),
};

export const deleteById = {
    params: {
        productId: Joi.string().required().custom(isValidObjectId),
    },
};
