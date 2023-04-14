import request from 'supertest';
import { faker } from '@faker-js/faker';
import { app } from '@/app';
import { StatusCode } from '@/configs/statusCode.config';
import { randomInt } from '@/helpers/random';
import { config } from '@/configs/config';
import slugify from 'slugify';
import { logger } from '@/utilities/logger.utility';

async function initial(isInitProduct = false) {
    const userInput = {
        fullname: faker.name.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
    };
    await request(app).post('/api/v1/auth/register').send(userInput);
    const loginResponse = await request(app).post('/api/v1/auth/login').send({
        email: userInput.email,
        password: userInput.password,
    });
    const productInput = {
        name: faker.commerce.productName(),
        image: faker.image.imageUrl(640, 480, 'cat', true),
        category: faker.random.words(2),
        price: randomInt(11, 99) * 100000,
        countInStock: randomInt(1, 9) * 10,
        rating: randomInt(1, 5),
        description: faker.commerce.productDescription(),
        createdBy: loginResponse.body.metadata.user._id,
    };
    logger.info({ createdBy: loginResponse.body.metadata.user._id });
    let createdProductResponse;
    if (isInitProduct) {
        createdProductResponse = await request(app)
            .post('/api/v1/products/')
            .set({
                [config.auth.headers.clientId]: loginResponse.body.metadata.user._id,
                [config.auth.headers.authorization]: loginResponse.body.metadata.tokenPair.accessToken,
            })
            .send({
                name: faker.commerce.productName(),
                image: faker.image.imageUrl(640, 480, 'cat', true),
                category: faker.commerce.product(),
                price: randomInt(11, 99) * 100000,
                countInStock: randomInt(1, 9) * 10,
                rating: randomInt(1, 5),
                description: faker.commerce.productDescription(),
                createdBy: loginResponse.body.metadata.user._id,
            });
    }

    return {
        userId: loginResponse.body.metadata.user._id as string,
        accessToken: loginResponse.body.metadata.tokenPair.accessToken as string,
        productInput,
        createdProduct: isInitProduct ? createdProductResponse.body.metadata.createdProduct : undefined,
    };
}

describe('Testing Product Api', () => {
    describe('POST - /api/v1/products/ - Create new product', () => {
        let initialState;

        beforeAll(async () => {
            initialState = await initial();
        });
        it('should return status 201 & a created product if user send valid input', async () => {
            const testCase = { ...initialState.productInput };
            const response = await request(app)
                .post('/api/v1/products/')
                .set({
                    [config.auth.headers.clientId]: initialState.userId,
                    [config.auth.headers.authorization]: initialState.accessToken,
                })
                .send(testCase);
            expect(response.statusCode).toBe(StatusCode.CREATED);
            expect(response.body).toHaveProperty('code', StatusCode.CREATED);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'Created new product!');
            expect(response.body).toHaveProperty('metadata');
            expect(response.body.metadata).toHaveProperty('createdProduct');
        });

        it('should return CONFLICT_ERROR if user send product name already exists', async () => {
            const testCase = { ...initialState.productInput };
            const response = await request(app)
                .post('/api/v1/products/')
                .set({
                    [config.auth.headers.clientId]: initialState.userId,
                    [config.auth.headers.authorization]: initialState.accessToken,
                })
                .send(testCase);
            expect(response.statusCode).toBe(StatusCode.CONFLICT);
            expect(response.body).toHaveProperty('code', StatusCode.CONFLICT);
            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('error', 'Product name already exists!');
        });
    });

    describe('PUT - /api/v1/products/:productId', () => {
        let initialState;

        beforeAll(async () => {
            initialState = await initial(true);
        });

        it('should return status 200 & a updated product if user send valid input', async () => {
            const testCase = { name: 'Updated product name' };
            const response = await request(app)
                .put(`/api/v1/products/${initialState.createdProduct._id}`)
                .set({
                    [config.auth.headers.clientId]: initialState.userId,
                    [config.auth.headers.authorization]: initialState.accessToken,
                })
                .send(testCase);
            expect(response.statusCode).toBe(StatusCode.OKE);
            expect(response.body).toHaveProperty('code', StatusCode.OKE);
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
    });

    describe('DELETE - /api/v1/products/:productId', () => {
        let initialState;

        beforeAll(async () => {
            initialState = await initial(true);
        });

        it('should return status 200 & delete info if user send valid input', async () => {
            const response = await request(app)
                .delete(`/api/v1/products/${initialState.createdProduct._id}`)
                .set({
                    [config.auth.headers.clientId]: initialState.userId,
                    [config.auth.headers.authorization]: initialState.accessToken,
                });
            expect(response.statusCode).toBe(StatusCode.OKE);
            expect(response.body).toHaveProperty('code', StatusCode.OKE);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'Deleted product!');
        });
    });
});
