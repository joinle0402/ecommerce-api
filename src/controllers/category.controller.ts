import { CategoryService } from '@/services/category.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class CategoryController {
    static async create(request: Request, response: Response) {
        response.status(StatusCodes.CREATED).json({
            code: StatusCodes.CREATED,
            success: true,
            message: 'Create new category successfully!',
            metadata: await CategoryService.create(request.body),
        });
    }

    static async findAll(request: Request, response: Response) {
        response.status(StatusCodes.OK).json({
            code: StatusCodes.OK,
            success: true,
            message: 'Find all category successfully!',
            metadata: await CategoryService.findAll(),
        });
    }

    static async findById(request: Request, response: Response) {
        response.status(StatusCodes.OK).json({
            code: StatusCodes.OK,
            success: true,
            message: 'Find category by id successfully!',
            metadata: await CategoryService.findById(request.params.categoryId),
        });
    }

    static async updateById(request: Request, response: Response) {
        response.status(StatusCodes.OK).json({
            code: StatusCodes.OK,
            success: true,
            message: 'Update category by id successfully!',
            metadata: await CategoryService.updateById(request.params.categoryId, request.body),
        });
    }

    static async deleteById(request: Request, response: Response) {
        response.status(StatusCodes.OK).json({
            code: StatusCodes.OK,
            success: true,
            message: 'Delete by category id successfully!',
            metadata: await CategoryService.deleteById(request.params.categoryId),
        });
    }
}
