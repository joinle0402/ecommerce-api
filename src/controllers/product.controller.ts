import { ProductService } from '@/services/product.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class ProductController {
    static create = async (request: Request, response: Response) => {
        response.status(StatusCodes.CREATED).json({
            code: StatusCodes.CREATED,
            success: true,
            message: 'Created new product!',
            metadata: await ProductService.create(request.body),
        });
    };
    static updateById = async (request: Request, response: Response) => {
        response.status(StatusCodes.OK).json({
            code: StatusCodes.OK,
            success: true,
            message: 'Updated product!',
            metadata: await ProductService.updateById(request.params.productId, request.body),
        });
    };
    static deleteById = async (request: Request, response: Response) => {
        response.status(StatusCodes.OK).json({
            code: StatusCodes.OK,
            success: true,
            message: 'Deleted product!',
            metadata: await ProductService.deleteById(request.params.productId),
        });
    };
}
