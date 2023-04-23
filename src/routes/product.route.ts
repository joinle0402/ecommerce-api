import { Router } from 'express';
import { ProductController } from '@/controllers/product.controller';
import { authentication } from '@/middlewares/authenticate.middleware';
import { validateResource } from '@/middlewares/validate.middleware';
import { create, findById, updateById, deleteById } from '@/validations/product.validation';

export const ProductRouter = Router();

ProductRouter.use(authentication);
ProductRouter.post('/', validateResource(create), ProductController.create);
ProductRouter.get('/', ProductController.findAll);
ProductRouter.get('/:productId', validateResource(findById), ProductController.findById);
ProductRouter.put('/:productId', validateResource(updateById), ProductController.updateById);
ProductRouter.delete('/:productId', validateResource(deleteById), ProductController.deleteById);
