import { ProductService } from '@/services/product.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class ProductController {
    static async create(request: Request, response: Response) {
        response.status(StatusCodes.CREATED).json({
            code: StatusCodes.CREATED,
            success: true,
            message: 'Created new product!',
            metadata: await ProductService.create(request.body),
        });
    }
    static async findAll(request: Request, response: Response) {
        response.status(StatusCodes.OK).json({
            code: StatusCodes.OK,
            success: true,
            message: 'Find all products!',
            metadata: await ProductService.findAll(request.query),
        });
    }
    static async findById(request: Request, response: Response) {
        response.status(StatusCodes.OK).json({
            code: StatusCodes.OK,
            success: true,
            message: 'Find by product id!',
            metadata: await ProductService.findById(request.params.productId),
        });
    }
    static async updateById(request: Request, response: Response) {
        response.status(StatusCodes.OK).json({
            code: StatusCodes.OK,
            success: true,
            message: 'Updated product!',
            metadata: await ProductService.updateById(request.params.productId, request.body),
        });
    }
    static async deleteById(request: Request, response: Response) {
        response.status(StatusCodes.OK).json({
            code: StatusCodes.OK,
            success: true,
            message: 'Deleted product!',
            metadata: await ProductService.deleteById(request.params.productId),
        });
    }
}
