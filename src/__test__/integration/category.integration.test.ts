import request from 'supertest';
import slugify from 'slugify';
import { faker } from '@faker-js/faker';
import { StatusCodes } from 'http-status-codes';
import { app } from '@/app';
import { initialAuthenticate } from '../setupTest';
import { config } from '@/configs/config';
import { Category } from '@/models/category.model';
import { Types } from 'mongoose';
import { User } from '@/models/user.model';
import { KeyToken } from '@/models/keyToken.model';

describe('Test Category API', () => {
    describe('POST - /api/v1/categories - Create new category', () => {
        let authenticateState;
        let categoryInput;
        beforeAll(async () => {
            authenticateState = await initialAuthenticate();
        });
        afterAll(async () => {
            await User.deleteMany({});
            await KeyToken.deleteMany({});
        });
        beforeEach(async () => {
            categoryInput = {
                name: faker.commerce.product(),
            };
        });
        afterEach(async () => {
            await Category.deleteMany({});
        });
        it('should return status 201 and createdCategory if send valid info', async () => {
            const testcase = { ...categoryInput };
            const headers = {
                [config.auth.headers.clientId]: authenticateState.userId,
                [config.auth.headers.authorization]: authenticateState.accessToken,
            };
            const response = await request(app).post('/api/v1/categories').set(headers).send(testcase);
            expect(response.status).toBe(StatusCodes.CREATED);
            expect(response.body).toHaveProperty('code', StatusCodes.CREATED);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'Create new category successfully!');
            expect(response.body).toHaveProperty('metadata');
            expect(response.body.metadata).toHaveProperty('createdCategory');
            expect(response.body.metadata.createdCategory).toHaveProperty('_id', expect.any(String));
            expect(response.body.metadata.createdCategory).toHaveProperty('name', testcase.name);
            expect(response.body.metadata.createdCategory).toHaveProperty(
                'slug',
                slugify(testcase.name, { lower: true, trim: true })
            );
        });
        it('should return status 409 and error message if send name has already been', async () => {
            const testcase = { ...categoryInput };
            const headers = {
                [config.auth.headers.clientId]: authenticateState.userId,
                [config.auth.headers.authorization]: authenticateState.accessToken,
            };
            await request(app).post('/api/v1/categories').set(headers).send(testcase);
            const response = await request(app).post('/api/v1/categories').set(headers).send(testcase);
            expect(response.status).toBe(StatusCodes.CONFLICT);
            expect(response.body).toHaveProperty('code', StatusCodes.CONFLICT);
            expect(response.body).toHaveProperty('error', 'Category name already exists!');
            expect(response.body).toHaveProperty('success', false);
        });
    });
    describe('GET - /api/v1/categories - find all category ', () => {
        let authenticateState;
        beforeAll(async () => {
            authenticateState = await initialAuthenticate();
        });
        afterAll(async () => {
            await User.deleteMany({});
            await KeyToken.deleteMany({});
        });
        beforeEach(async () => {
            const categories: Array<{ name: string }> = [];
            while (categories.length != 5) {
                const categoryName = faker.commerce.product();
                const index = categories.findIndex(category => category.name === categoryName);
                if (index == -1) {
                    categories.push({
                        name: categoryName,
                    });
                }
            }

            for (const category of categories) {
                await Category.create(category);
            }
        });
        afterEach(async () => {
            await Category.deleteMany({});
        });
        it('should return status code 200 and categories', async () => {
            const headers = {
                [config.auth.headers.clientId]: authenticateState.userId,
                [config.auth.headers.authorization]: authenticateState.accessToken,
            };
            const response = await request(app).get(`/api/v1/categories`).set(headers);
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body).toHaveProperty('code', StatusCodes.OK);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'Find all category successfully!');
            expect(response.body).toHaveProperty('metadata');
            expect(response.body.metadata).toHaveProperty('categories');
            expect(response.body.metadata.categories.length).toBe(5);
        });
    });
    describe('GET - /api/v1/categories/:categoryId - find category by id ', () => {
        let categoryId;
        let authenticateState;
        beforeAll(async () => {
            authenticateState = await initialAuthenticate();
        });
        afterAll(async () => {
            await User.deleteMany({});
            await KeyToken.deleteMany({});
        });
        beforeAll(async () => {
            const createdCategory = await Category.create({
                name: faker.commerce.product(),
            });
            categoryId = createdCategory._id;
        });
        afterAll(async () => {
            await Category.deleteMany({});
        });
        it('should return status code 200 and category if user send category id exist in database', async () => {
            const headers = {
                [config.auth.headers.clientId]: authenticateState.userId,
                [config.auth.headers.authorization]: authenticateState.accessToken,
            };
            const response = await request(app).get(`/api/v1/categories/${categoryId}`).set(headers);
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body).toHaveProperty('code', StatusCodes.OK);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'Find category by id successfully!');
            expect(response.body).toHaveProperty('metadata');
            expect(response.body.metadata).toHaveProperty('category');
        });

        it('should return status code 404 and error if user send category id not exist in database', async () => {
            const testcase = { categoryId: new Types.ObjectId() };
            const headers = {
                [config.auth.headers.clientId]: authenticateState.userId,
                [config.auth.headers.authorization]: authenticateState.accessToken,
            };
            const response = await request(app).get(`/api/v1/categories/${testcase.categoryId}`).set(headers);
            expect(response.status).toBe(StatusCodes.NOT_FOUND);
            expect(response.body).toHaveProperty('code', StatusCodes.NOT_FOUND);
            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('error', 'Category not found!');
        });
    });
    describe('UPDATE - /api/v1/categories/:categoryId - Update by id', () => {
        let categoryToUpdate;
        let categoryIdToUpdate;
        let authenticateState;
        beforeAll(async () => {
            authenticateState = await initialAuthenticate();
        });
        afterAll(async () => {
            await User.deleteMany({});
            await KeyToken.deleteMany({});
        });
        beforeEach(async () => {
            categoryToUpdate = { name: faker.commerce.product() };
            const createdCategory = await Category.create(categoryToUpdate);
            categoryIdToUpdate = createdCategory._id;
        });
        afterAll(async () => {
            await Category.deleteMany({});
        });
        it('should return 409 if send category name already exist database', async () => {
            const testcase = { ...categoryToUpdate };
            const headers = {
                [config.auth.headers.clientId]: authenticateState.userId,
                [config.auth.headers.authorization]: authenticateState.accessToken,
            };
            const response = await request(app)
                .patch(`/api/v1/categories/${categoryIdToUpdate}`)
                .set(headers)
                .send(testcase);
            expect(response.status).toBe(StatusCodes.CONFLICT);
            expect(response.body).toHaveProperty('code', StatusCodes.CONFLICT);
            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('error', 'Category name already exists!');
        });

        it('should return 404 if send category id not exist in database', async () => {
            const testcase = { ...categoryToUpdate, name: 'Valid category name' };
            const invalidCategoryId = new Types.ObjectId();
            const headers = {
                [config.auth.headers.clientId]: authenticateState.userId,
                [config.auth.headers.authorization]: authenticateState.accessToken,
            };
            const response = await request(app)
                .patch(`/api/v1/categories/${invalidCategoryId}`)
                .set(headers)
                .send(testcase);
            expect(response.status).toBe(StatusCodes.NOT_FOUND);
            expect(response.body).toHaveProperty('code', StatusCodes.NOT_FOUND);
            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('error', 'Category not found!');
        });

        it('should return 200 and updatedCategory if send category id not exist in database', async () => {
            const testcase = { ...categoryToUpdate, name: '       Valid category name     ' };
            const headers = {
                [config.auth.headers.clientId]: authenticateState.userId,
                [config.auth.headers.authorization]: authenticateState.accessToken,
            };
            const response = await request(app)
                .patch(`/api/v1/categories/${categoryIdToUpdate}`)
                .set(headers)
                .send(testcase);
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body).toHaveProperty('code', StatusCodes.OK);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'Update category by id successfully!');
            expect(response.body).toHaveProperty('metadata');
            expect(response.body.metadata).toHaveProperty('updatedCategory');
            expect(response.body.metadata.updatedCategory).toHaveProperty('name', testcase.name.trim());
            expect(response.body.metadata.updatedCategory).toHaveProperty(
                'slug',
                slugify(testcase.name, { trim: true, lower: true })
            );
        });
    });
    describe('DELETE - /api/v1/categories/:categoryId - Delete by id', () => {
        let categoryIdToDelete;
        let authenticateState;
        beforeAll(async () => {
            authenticateState = await initialAuthenticate();
        });
        afterAll(async () => {
            await User.deleteMany({});
            await KeyToken.deleteMany({});
        });
        beforeEach(async () => {
            const createdCategory = await Category.create({ name: faker.commerce.product() });
            categoryIdToDelete = createdCategory._id;
        });
        afterEach(async () => {
            await Category.deleteMany({});
        });
        it('should return status code 200 if send valid id', async () => {
            const headers = {
                [config.auth.headers.clientId]: authenticateState.userId,
                [config.auth.headers.authorization]: authenticateState.accessToken,
            };
            const response = await request(app).delete(`/api/v1/categories/${categoryIdToDelete}`).set(headers);
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body).toHaveProperty('code', StatusCodes.OK);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'Delete by category id successfully!');
        });

        it('should return status code 404 if send category id is not found', async () => {
            const categoryIdTestCase = new Types.ObjectId();
            const headers = {
                [config.auth.headers.clientId]: authenticateState.userId,
                [config.auth.headers.authorization]: authenticateState.accessToken,
            };
            const response = await request(app).delete(`/api/v1/categories/${categoryIdTestCase}`).set(headers);
            expect(response.status).toBe(StatusCodes.NOT_FOUND);
            expect(response.body).toHaveProperty('code', StatusCodes.NOT_FOUND);
            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('error', 'Category not found!');
        });
    });
});
