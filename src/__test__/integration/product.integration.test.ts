import request from 'supertest';
import slugify from 'slugify';
import { faker } from '@faker-js/faker';
import { app } from '@/app';
import { randomInt } from '@/helpers/random';
import { config } from '@/configs/config';
import { StatusCodes } from 'http-status-codes';
import { User } from '@/models/user.model';
import { KeyToken } from '@/models/keyToken.model';
import { initialAuthentication } from '../setupTest';
import { Category } from '@/models/category.model';
import { ProductDocument, Product } from '@/models/product.model';
import { Types } from 'mongoose';

describe('Testing Product Api', () => {
    describe('POST - /api/v1/products - Create new product', () => {
        let headers;
        let productInput;
        beforeAll(async () => {
            headers = await initialAuthentication();
        });
        beforeEach(async () => {
            const categoryInput = { name: faker.random.words(2) };
            const category = await Category.create(categoryInput);
            productInput = {
                name: faker.commerce.productName(),
                image: faker.image.imageUrl(640, 480, 'cat', true),
                category: category._id,
                price: randomInt(11, 99) * 100000,
                countInStock: randomInt(1, 9) * 10,
                rating: randomInt(1, 5),
                description: faker.commerce.productDescription(),
                createdBy: headers[config.auth.headers.clientId],
            };
        });
        afterEach(async () => {
            await Category.deleteMany({});
            await Product.deleteMany({});
        });
        afterAll(async () => {
            await KeyToken.deleteMany({});
            await User.deleteMany({});
        });
        it('should return status 201 & a created product if user send valid input', async () => {
            const testcase = { ...productInput };
            const response = await request(app).post('/api/v1/products').set(headers).send(testcase);
            expect(response.statusCode).toBe(StatusCodes.CREATED);
            expect(response.body).toHaveProperty('code', StatusCodes.CREATED);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'Created new product!');
            expect(response.body).toHaveProperty('metadata');
            expect(response.body.metadata).toHaveProperty('createdProduct');
        });
        it('should return CONFLICT_ERROR if user send product name already exists', async () => {
            const testcase = { ...productInput };
            await request(app).post('/api/v1/products').set(headers).send(testcase);
            const response = await request(app).post('/api/v1/products').set(headers).send(testcase);
            expect(response.statusCode).toBe(StatusCodes.CONFLICT);
            expect(response.body).toHaveProperty('code', StatusCodes.CONFLICT);
            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('error', 'Product name already exists!');
        });
    });
    describe('GET - /api/v1/products - Find all products', () => {
        let headers;
        const products: ProductDocument[] = [];
        beforeAll(async () => {
            headers = await initialAuthentication();
        });
        beforeEach(async () => {
            const categoryInput = { name: faker.random.words(2) };
            const category = await Category.create(categoryInput);
            for (let index = 0; index < 5; index++) {
                const product = await Product.create({
                    name: faker.commerce.productName(),
                    image: faker.image.imageUrl(640, 480, 'cat', true),
                    category: category._id,
                    price: randomInt(11, 99) * 100000,
                    countInStock: randomInt(1, 9) * 10,
                    rating: randomInt(1, 5),
                    description: faker.commerce.productDescription(),
                    createdBy: headers[config.auth.headers.clientId],
                });
                products.push(product);
            }
        });
        afterEach(async () => {
            await Category.deleteMany({});
            await Product.deleteMany({});
        });
        afterAll(async () => {
            await KeyToken.deleteMany({});
            await User.deleteMany({});
        });
        it('should return status 200', async () => {
            const response = await request(app).get('/api/v1/products').set(headers);
            expect(response.statusCode).toBe(StatusCodes.OK);
            expect(response.body).toHaveProperty('code', StatusCodes.OK);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'Find all products!');
            expect(response.body).toHaveProperty('metadata');
            expect(response.body.metadata).toHaveProperty('products');
            expect(response.body.metadata.products.length).toBe(5);
        });
    });
    describe('GET - /api/v1/products/:productId - Find by product id', () => {
        let headers;
        let productId;
        beforeAll(async () => {
            headers = await initialAuthentication();
        });
        beforeEach(async () => {
            const categoryInput = { name: faker.random.words(2) };
            const category = await Category.create(categoryInput);
            for (let index = 0; index < 5; index++) {
                const product = await Product.create({
                    name: faker.commerce.productName(),
                    image: faker.image.imageUrl(640, 480, 'cat', true),
                    category: category._id,
                    price: randomInt(11, 99) * 100000,
                    countInStock: randomInt(1, 9) * 10,
                    rating: randomInt(1, 5),
                    description: faker.commerce.productDescription(),
                    createdBy: headers[config.auth.headers.clientId],
                });
                productId = product._id;
            }
        });
        afterEach(async () => {
            await Category.deleteMany({});
            await Product.deleteMany({});
        });
        afterAll(async () => {
            await KeyToken.deleteMany({});
            await User.deleteMany({});
        });
        it('should return status 200 & product if user send valid product id', async () => {
            const response = await request(app).get(`/api/v1/products/${productId}`).set(headers);
            expect(response.statusCode).toBe(StatusCodes.OK);
            expect(response.body).toHaveProperty('code', StatusCodes.OK);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'Find by product id!');
            expect(response.body).toHaveProperty('metadata');
            expect(response.body.metadata).toHaveProperty('product');
        });
        it('should return status 404 if user send product id not exists database', async () => {
            const testcase = new Types.ObjectId();
            const url = `/api/v1/products/${testcase}`;
            const response = await request(app).get(url).set(headers).send(testcase);
            expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
            expect(response.body).toHaveProperty('code', StatusCodes.NOT_FOUND);
            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('error', 'Product id is not found!');
        });
    });
    describe('PUT - /api/v1/products/:productId - Update product', () => {
        let headers;
        let product1;
        let product2;
        beforeAll(async () => {
            headers = await initialAuthentication();
        });
        beforeEach(async () => {
            const categoryInput = { name: faker.random.words(2) };
            const category = await Category.create(categoryInput);
            product1 = await Product.create({
                name: faker.commerce.productName(),
                image: faker.image.imageUrl(640, 480, 'cat', true),
                category: category._id,
                price: randomInt(11, 99) * 100000,
                countInStock: randomInt(1, 9) * 10,
                rating: randomInt(1, 5),
                description: faker.commerce.productDescription(),
                createdBy: headers[config.auth.headers.clientId],
            });
            product2 = await Product.create({
                name: faker.commerce.productName(),
                image: faker.image.imageUrl(640, 480, 'cat', true),
                category: category._id,
                price: randomInt(11, 99) * 100000,
                countInStock: randomInt(1, 9) * 10,
                rating: randomInt(1, 5),
                description: faker.commerce.productDescription(),
                createdBy: headers[config.auth.headers.clientId],
            });
        });
        afterEach(async () => {
            await Category.deleteMany({});
            await Product.deleteMany({});
        });
        afterAll(async () => {
            await KeyToken.deleteMany({});
            await User.deleteMany({});
        });
        it('should return status 200 & a updated product if user send valid input', async () => {
            const testcase = { name: 'Updated product name' };
            const response = await request(app).put(`/api/v1/products/${product1._id}`).set(headers).send(testcase);
            expect(response.statusCode).toBe(StatusCodes.OK);
            expect(response.body).toHaveProperty('code', StatusCodes.OK);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'Updated product!');
            expect(response.body).toHaveProperty('metadata');
            expect(response.body.metadata).toHaveProperty('updatedProduct');
            expect(response.body.metadata.updatedProduct).toHaveProperty('name', 'Updated product name');
            expect(response.body.metadata.updatedProduct).toHaveProperty(
                'slug',
                slugify('Updated product name', { trim: true, lower: true })
            );
        });
        it('should return status 404 if user send product id not exists in database', async () => {
            const testcase = { name: 'Updated product name' };
            const productId = new Types.ObjectId();
            const response = await request(app).put(`/api/v1/products/${productId}`).set(headers).send(testcase);
            expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
            expect(response.body).toHaveProperty('code', StatusCodes.NOT_FOUND);
            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('error', 'Product id not found!');
        });
        it('should return status 409 if user send product name exists in database', async () => {
            const testcase = { name: product2.name };
            const productId = product1._id;
            const response = await request(app).put(`/api/v1/products/${productId}`).set(headers).send(testcase);
            expect(response.statusCode).toBe(StatusCodes.CONFLICT);
            expect(response.body).toHaveProperty('code', StatusCodes.CONFLICT);
            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('error', 'Product name already exists!');
        });
    });
    describe('DELETE - /api/v1/products/:productId - Delete product by id', () => {
        let headers;
        let product;
        beforeAll(async () => {
            headers = await initialAuthentication();
        });
        beforeEach(async () => {
            const categoryInput = { name: faker.random.words(2) };
            const category = await Category.create(categoryInput);
            const productInput = {
                name: faker.commerce.productName(),
                image: faker.image.imageUrl(640, 480, 'cat', true),
                category: category._id,
                price: randomInt(11, 99) * 100000,
                countInStock: randomInt(1, 9) * 10,
                rating: randomInt(1, 5),
                description: faker.commerce.productDescription(),
                createdBy: headers[config.auth.headers.clientId],
            };
            product = await Product.create(productInput);
        });
        afterEach(async () => {
            await Category.deleteMany({});
            await Product.deleteMany({});
        });
        afterAll(async () => {
            await KeyToken.deleteMany({});
            await User.deleteMany({});
        });
        it('should return status 200 & delete info if user send valid input', async () => {
            const response = await request(app).delete(`/api/v1/products/${product._id}`).set(headers);
            expect(response.statusCode).toBe(StatusCodes.OK);
            expect(response.body).toHaveProperty('code', StatusCodes.OK);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'Deleted product!');
        });
        it('should return status 404 if user send invalid product id', async () => {
            const testcase = new Types.ObjectId();
            const response = await request(app).delete(`/api/v1/products/${testcase}`).set(headers);
            expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
            expect(response.body).toHaveProperty('code', StatusCodes.NOT_FOUND);
            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('error', 'Product id not found!');
        });
    });
});
