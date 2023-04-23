import { CreateProductBody, FindAllProductQuery, UpdateProductBody } from '@/interfaces/product.interface';
import { Product } from '@/models/product.model';
import { logger } from '@/utilities/logger.utility';
import createHttpError from 'http-errors';

export class ProductService {
    static async create(createProductBody: CreateProductBody) {
        logger.info('ProductService.create.createProductBody: ', createProductBody);

        const foundProduct = await Product.findOne({ name: createProductBody.name }).lean();
        logger.info('ProductService.create.foundProduct: %s', foundProduct);
        if (foundProduct) {
            throw new createHttpError.Conflict('Product name already exists!');
        }

        const createdProduct = await Product.create(createProductBody);
        logger.info('ProductService.create.createdProduct: ', createdProduct.toObject());

        return {
            createdProduct,
        };
    }

    static async findAll(query: FindAllProductQuery) {
        return await Product.paginate(query);
    }

    static async findById(productId: string) {
        const product = await Product.findById(productId).lean();
        logger.info('ProductService.findAll.product: %o', product);
        if (!product) {
            throw new createHttpError.NotFound('Product id is not found!');
        }
        return { product };
    }

    static async updateById(productId: string, updateProductBody: UpdateProductBody) {
        logger.info('ProductService.update.productId: %s', productId);
        logger.info('ProductService.update.updateProductBody: ', updateProductBody);
        if (updateProductBody.name) {
            const foundProduct = await Product.findOne({ name: updateProductBody.name }).lean();
            logger.info('ProductService.create.foundProduct: %s', foundProduct);
            if (foundProduct) {
                throw new createHttpError.Conflict('Product name already exists!');
            }
        }
        const updatedProduct = await Product.findById(productId);
        if (!updatedProduct) {
            throw new createHttpError.NotFound('Product id not found!');
        }
        Object.assign(updatedProduct, updateProductBody);
        await updatedProduct.save();

        return {
            updatedProduct,
        };
    }

    static async deleteById(productId: string) {
        logger.info('ProductService.update.productId: %s', productId);
        const productToDelete = await Product.findById(productId);
        if (!productToDelete) {
            throw new createHttpError.NotFound('Product id not found!');
        }
        await productToDelete.deleteOne();
    }
}
