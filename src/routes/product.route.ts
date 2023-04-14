import { ProductController } from '@/controllers/product.controller';
import { authentication } from '@/middlewares/authenticate.middleware';
import { validateResource } from '@/middlewares/validate.middleware';
import { createProductSchema, updateProductSchema, deleteProductSchema } from '@/validations/product.validation';
import { Router } from 'express';

export const ProductRouter = Router();

ProductRouter.use(authentication);
ProductRouter.post('/', validateResource(createProductSchema), ProductController.create);
ProductRouter.put('/:productId', validateResource(updateProductSchema), ProductController.updateById);
ProductRouter.delete('/:productId', validateResource(deleteProductSchema), ProductController.deleteById);
