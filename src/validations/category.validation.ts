import Joi from 'joi';
import { isValidObjectId } from './custom.validation';

export const create = {
    body: Joi.object().keys({
        name: Joi.string().min(3).max(50).required(),
    }),
};

export const findById = {
    params: {
        categoryId: Joi.string().required().custom(isValidObjectId),
    },
};

export const updateById = {
    params: {
        categoryId: Joi.string().required().custom(isValidObjectId),
    },
    body: Joi.object().keys({
        name: Joi.string().min(3).max(50).required(),
    }),
};

export const deleteById = {
    params: {
        categoryId: Joi.string().required().custom(isValidObjectId),
    },
};
