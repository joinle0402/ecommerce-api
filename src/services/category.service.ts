import { CreateCategoryBody, UpdateCategoryBody } from '@/interfaces/category.interface';
import { Category } from '@/models/category.model';
import { logger } from '@/utilities/logger.utility';
import createHttpError from 'http-errors';

export class CategoryService {
    static async create(createCategoryBody: CreateCategoryBody) {
        logger.info('CategoryServer.create.createCategoryBody: %o', createCategoryBody);

        const alreadyExistCategory = await Category.findOne({ name: createCategoryBody.name }).lean();
        if (alreadyExistCategory) {
            logger.info('CategoryServer.create.error: Category name already exists!');
            throw new createHttpError.Conflict('Category name already exists!');
        }

        const createdCategory = await Category.create(createCategoryBody);
        logger.info('CategoryServer.create.createdCategory: %o', createdCategory);

        return { createdCategory };
    }

    static async findAll() {
        const categories = await Category.find();
        logger.info('CategoryService.findAll.categories: %o', categories);
        return { categories };
    }

    static async findById(categoryId: string) {
        logger.info('CategoryService.findById.categoryId: %s', categoryId);

        const category = await Category.findOne({ _id: categoryId }).lean();
        if (!category) {
            logger.info('CategoryService.findById.error: Category not found!');
            throw new createHttpError.NotFound('Category not found!');
        }

        logger.info('CategoryService.findById.category: %o', category);
        return { category };
    }

    static async deleteById(categoryId: string) {
        logger.info('CategoryService.deleteById.categoryId: %s', categoryId);

        const category = await Category.findById(categoryId).lean();
        if (!category) {
            logger.info('CategoryService.findById.error: Category not found!');
            throw new createHttpError.NotFound('Category not found!');
        }
        logger.info('CategoryService.deleteById.category: %o', category);

        return await Category.findByIdAndDelete(categoryId);
    }

    static async updateById(categoryId: string, updateCategoryBody: UpdateCategoryBody) {
        logger.info('CategoryService.updateById.categoryId: %s', categoryId);
        logger.info('CategoryService.updateById.updateCategoryBody: %o', updateCategoryBody);

        const alreadyExistCategory = await Category.findOne({ name: updateCategoryBody.name });
        if (alreadyExistCategory) {
            logger.info('CategoryService.updateById.error: Category name already exists!');
            throw new createHttpError.Conflict('Category name already exists!');
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            logger.info('CategoryService.findById.error: Category not found!');
            throw new createHttpError.NotFound('Category not found!');
        }

        category.name = updateCategoryBody.name;
        const updatedCategory = await category.save();
        return { updatedCategory };
    }
}
