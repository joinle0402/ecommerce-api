import { CategoryController } from '@/controllers/category.controller';
import { authentication } from '@/middlewares/authenticate.middleware';
import { validateResource } from '@/middlewares/validate.middleware';
import { create, deleteById, findById, updateById } from '@/validations/category.validation';
import { Router } from 'express';

export const CategoryRouter = Router();

CategoryRouter.use(authentication);
CategoryRouter.post('/', validateResource(create), CategoryController.create);
CategoryRouter.get('/', CategoryController.findAll);
CategoryRouter.get('/:categoryId', validateResource(findById), CategoryController.findById);
CategoryRouter.patch('/:categoryId', validateResource(updateById), CategoryController.updateById);
CategoryRouter.delete('/:categoryId', validateResource(deleteById), CategoryController.deleteById);
