import { StatusCode } from '@/configs/statusCode.config';
import { ProductService } from '@/services/product.service';
import { Request, Response } from 'express';

export class ProductController {
    static create = async (request: Request, response: Response) => {
        response.status(StatusCode.CREATED).json({
            code: StatusCode.CREATED,
            success: true,
            message: 'Created new product!',
            metadata: await ProductService.create(request.body),
        });
    };
    static updateById = async (request: Request, response: Response) => {
        response.status(StatusCode.OKE).json({
            code: StatusCode.OKE,
            success: true,
            message: 'Updated product!',
            metadata: await ProductService.updateById(request.params.productId, request.body),
        });
    };
    static deleteById = async (request: Request, response: Response) => {
        response.status(StatusCode.OKE).json({
            code: StatusCode.OKE,
            success: true,
            message: 'Deleted product!',
            metadata: await ProductService.deleteById(request.params.productId),
        });
    };
}
