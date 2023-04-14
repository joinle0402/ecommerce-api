import { ConflictError, NotFoundError } from '@/helpers/error';
import { CreateProductBody, UpdateProductBody } from '@/interfaces/product.interface';
import { ProductModel } from '@/models/product.model';
import { logger } from '@/utilities/logger.utility';

export class ProductService {
    static isExistByName = async (name: string) => {
        return Boolean(await ProductModel.findOne({ name }).select({ _id: 1 }).lean());
    };

    static create = async (createProductBody: CreateProductBody) => {
        logger.info('ProductService.create.createProductBody: ', createProductBody);

        const isProductNameAlreadyExists = await ProductService.isExistByName(createProductBody.name);
        logger.info('ProductService.create.isProductNameAlreadyExists: %s', isProductNameAlreadyExists);
        if (isProductNameAlreadyExists) {
            throw new ConflictError('Product name already exists!');
        }

        const createdProduct = await ProductModel.create(createProductBody);
        logger.info('ProductService.create.createdProduct: ', createdProduct.toObject());

        return {
            createdProduct,
        };
    };

    static updateById = async (productId: string, updateProductBody: UpdateProductBody) => {
        logger.info('ProductService.update.productId: %s', productId);
        logger.info('ProductService.update.updateProductBody: ', updateProductBody);
        if (updateProductBody.name) {
            const isProductNameAlreadyExists = await ProductService.isExistByName(updateProductBody.name);
            logger.info('ProductService.create.isProductNameAlreadyExists: %s', isProductNameAlreadyExists);
            if (isProductNameAlreadyExists) {
                throw new ConflictError('Product name already exists!');
            }
        }
        const updatedProduct = await ProductModel.findById(productId);
        if (!updatedProduct) {
            throw new NotFoundError('Invalid product id!');
        }
        Object.assign(updatedProduct, updateProductBody);
        await updatedProduct.save();

        return {
            updatedProduct,
        };
    };

    static deleteById = async (productId: string) => {
        logger.info('ProductService.update.productId: %s', productId);
        const productToDelete = await ProductModel.findById(productId);
        if (!productToDelete) {
            throw new NotFoundError('Invalid product id!');
        }
        const deleteInfo = await productToDelete.deleteOne();
        logger.info('ProductService.update.deleteInfo: ', deleteInfo);
    };
}
