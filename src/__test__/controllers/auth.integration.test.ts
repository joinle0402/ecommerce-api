import request from 'supertest';
import { faker } from '@faker-js/faker';
import { app } from '@/app';
import { Role } from '@/models/user.model';
import { StatusCode } from '@/configs/statusCode.config';
import { config } from '@/configs/config';

describe('Authenticate API', () => {
    describe('POST - /api/v1/auth/register', () => {
        let userInput;
        beforeEach(() => {
            userInput = {
                fullname: faker.name.fullName(),
                email: faker.internet.email(),
                password: faker.internet.password(),
            };
        });
        it('should return statusCode = 201 if user send valid credentials', async () => {
            const testCase = { ...userInput };
            const response = await request(app).post('/api/v1/auth/register').send(testCase);
            expect(response.statusCode).toBe(StatusCode.CREATED);
            expect(response.body).toHaveProperty('code', StatusCode.CREATED);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'register user!');
            expect(response.body).toHaveProperty('metadata');
            expect(response.body.metadata).toHaveProperty('createdUser');
            expect(response.body.metadata.createdUser).toHaveProperty('_id');
            expect(response.body.metadata.createdUser).toHaveProperty('fullname', testCase.fullname);
            expect(response.body.metadata.createdUser).toHaveProperty('email', testCase.email.toLowerCase());
            expect(response.body.metadata.createdUser).toHaveProperty('password', expect.any(String));
            expect(response.body.metadata.createdUser).toHaveProperty('roles', [Role.USER]);
            expect(response.body.metadata.createdUser).toHaveProperty('verified', false);
        });
        it('should return statusCode = 409 if user send email already exists', async () => {
            const testCase = { ...userInput };
            await request(app).post('/api/v1/auth/register').send(testCase);
            const response = await request(app).post('/api/v1/auth/register').send(testCase);
            expect(response.statusCode).toBe(StatusCode.CONFLICT);
            expect(response.body).toHaveProperty('code', StatusCode.CONFLICT);
            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('error', 'email already exists!');
        });

        describe('Test Validation', () => {
            it('should return stateCode = 400 and error if user send empty object', async () => {
                const testCase = {};
                const response = await request(app).post('/api/v1/auth/register').send(testCase);
                expect(response.statusCode).toBe(StatusCode.BAD_REQUEST);
                expect(response.body).toHaveProperty('errors');
                expect(response.body.errors).toHaveProperty('fullname');
                expect(response.body.errors.fullname).toContain('is required');
                expect(response.body.errors).toHaveProperty('email');
                expect(response.body.errors.email).toContain('is required');
                expect(response.body.errors).toHaveProperty('password');
                expect(response.body.errors.password).toContain('is required');
            });

            it('should return stateCode = 400 and error if user send fields is empty string', async () => {
                const testCase = { fullname: '', email: '', password: '' };
                const response = await request(app).post('/api/v1/auth/register').send(testCase);
                expect(response.statusCode).toBe(StatusCode.BAD_REQUEST);
                expect(response.body).toHaveProperty('errors');
                expect(response.body.errors).toHaveProperty('fullname');
                expect(response.body.errors.fullname).toContain('is not allowed to be empty');
                expect(response.body.errors).toHaveProperty('email');
                expect(response.body.errors.email).toContain('is not allowed to be empty');
                expect(response.body.errors).toHaveProperty('password');
                expect(response.body.errors.password).toContain('is not allowed to be empty');
            });

            it('should return stateCode = 400 and error if user sent wrong data type', async () => {
                const testCase = { fullname: {}, email: ['Hello'], password: 123 };
                const response = await request(app).post('/api/v1/auth/register').send(testCase);
                expect(response.statusCode).toBe(StatusCode.BAD_REQUEST);
                expect(response.body).toHaveProperty('errors');
                expect(response.body.errors).toHaveProperty('fullname');
                expect(response.body.errors.fullname).toContain('must be a string');
                expect(response.body.errors).toHaveProperty('email');
                expect(response.body.errors.email).toContain('must be a string');
                expect(response.body.errors).toHaveProperty('password');
                expect(response.body.errors.password).toContain('must be a string');
            });

            it('should return stateCode = 400 and error if user sent wrong length of fullname, password', async () => {
                const testCase = { ...userInput, fullname: 'John', password: '12344'.repeat(20) };
                const response = await request(app).post('/api/v1/auth/register').send(testCase);
                expect(response.statusCode).toBe(StatusCode.BAD_REQUEST);
                expect(response.body).toHaveProperty('errors');
                expect(response.body.errors).toHaveProperty('fullname');
                expect(response.body.errors).toHaveProperty('password');
            });
        });
    });
    describe('POST - /api/v1/auth/login', () => {
        const userInput = {
            email: faker.internet.email(),
            password: faker.internet.password(),
        };

        beforeAll(async () => {
            const testCase = { ...userInput, fullname: faker.name.fullName() };
            await request(app).post('/api/v1/auth/register').send(testCase);
        });

        it('should return statusCode = 401 if user send invalid email', async () => {
            const testCase = { ...userInput, email: faker.internet.email() };
            const response = await request(app).post('/api/v1/auth/login').send(testCase);
            expect(response.statusCode).toBe(StatusCode.UNAUTHORIZED);
            expect(response.body).toHaveProperty('code', StatusCode.UNAUTHORIZED);
            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('error', 'Invalid email or password!');
        });

        it('should return statusCode = 401 if user send invalid password', async () => {
            const testCase = { ...userInput, password: 'invalid' };
            const response = await request(app).post('/api/v1/auth/login').send(testCase);
            expect(response.statusCode).toBe(StatusCode.UNAUTHORIZED);
            expect(response.body).toHaveProperty('code', StatusCode.UNAUTHORIZED);
            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('error', 'Invalid email or password!');
        });

        it('should return statusCode = 200 if user send valid credentials', async () => {
            const testCase = { ...userInput };
            const response = await request(app).post('/api/v1/auth/login').send(testCase);
            expect(response.statusCode).toBe(StatusCode.OKE);
            expect(response.body).toHaveProperty('code', StatusCode.OKE);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'login user!');
            expect(response.body).toHaveProperty('metadata');
            expect(response.body.metadata).toHaveProperty('user');
            expect(response.body.metadata.user).toHaveProperty('_id');
            expect(response.body.metadata.user).toHaveProperty('fullname');
            expect(response.body.metadata.user).toHaveProperty('email');
            expect(response.body.metadata).toHaveProperty('tokenPair');
            expect(response.body.metadata.tokenPair).toHaveProperty('accessToken');
            expect(response.body.metadata.tokenPair).toHaveProperty('refreshToken');
        });
    });
    describe('DELETE /api/v1/auth/logout', () => {
        let userId = '';
        let accessToken = '';
        beforeAll(async () => {
            const userInput = {
                fullname: faker.name.fullName(),
                email: faker.internet.email(),
                password: faker.internet.password(),
            };
            await request(app).post('/api/v1/auth/register').send(userInput);
            const response = await request(app).post('/api/v1/auth/login').send({
                email: userInput.email,
                password: userInput.password,
            });
            userId = response.body.metadata.user._id;
            accessToken = response.body.metadata.tokenPair.accessToken;
        });

        describe('User login failed', () => {
            it("should return statusCode = 401 if user send headers doesn't have client id", async () => {
                const response = await request(app)
                    .delete('/api/v1/auth/logout')
                    .set({
                        [config.auth.headers.authorization]: accessToken,
                    });

                expect(response.statusCode).toBe(StatusCode.UNAUTHORIZED);
                expect(response.body).toHaveProperty('code', StatusCode.UNAUTHORIZED);
                expect(response.body).toHaveProperty('success', false);
                expect(response.body).toHaveProperty('error', 'invalid request!');
            });

            it('should return statusCode = 401 if user send headers have invalid client id', async () => {
                const response = await request(app)
                    .delete('/api/v1/auth/logout')
                    .set({
                        [config.auth.headers.clientId]: '6433e45b5d188273d2b41414',
                        [config.auth.headers.authorization]: accessToken,
                    });

                expect(response.statusCode).toBe(StatusCode.UNAUTHORIZED);
                expect(response.body).toHaveProperty('code', StatusCode.UNAUTHORIZED);
                expect(response.body).toHaveProperty('success', false);
                expect(response.body).toHaveProperty('error', 'invalid client id!');
            });

            it("should return statusCode = 401 if user send headers doesn't have authorization", async () => {
                const response = await request(app)
                    .delete('/api/v1/auth/logout')
                    .set({
                        [config.auth.headers.clientId]: userId,
                    });

                expect(response.statusCode).toBe(StatusCode.UNAUTHORIZED);
                expect(response.body).toHaveProperty('code', StatusCode.UNAUTHORIZED);
                expect(response.body).toHaveProperty('success', false);
                expect(response.body).toHaveProperty('error', 'invalid request!');
            });

            it('should return statusCode = 401 if user send headers have invalid accessToken', async () => {
                const response = await request(app)
                    .delete('/api/v1/auth/logout')
                    .set({
                        [config.auth.headers.clientId]: userId,
                        [config.auth.headers.authorization]: '6433e45b5d188273d2b41414',
                    });

                expect(response.statusCode).toBe(StatusCode.INTERNAL_SERVER_ERROR);
                expect(response.body).toHaveProperty('code', StatusCode.INTERNAL_SERVER_ERROR);
                expect(response.body).toHaveProperty('success', false);
            });
        });

        it('should return statusCode = 200 if user send valid credentials', async () => {
            const response = await request(app)
                .delete('/api/v1/auth/logout')
                .set({
                    [config.auth.headers.clientId]: userId,
                    [config.auth.headers.authorization]: accessToken,
                });

            expect(response.statusCode).toBe(StatusCode.OKE);
            expect(response.body).toHaveProperty('code', StatusCode.OKE);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'logout user!');
        });
    });
    describe('POST /api/v1/auth/refreshToken', () => {
        const userInput = {
            fullname: faker.name.fullName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
        };
        let userId = '';
        let accessToken = '';
        let refreshToken = '';
        beforeAll(async () => {
            await request(app).post('/api/v1/auth/register').send(userInput);
            const response = await request(app).post('/api/v1/auth/login').send({
                email: userInput.email,
                password: userInput.password,
            });
            userId = response.body.metadata.user._id;
            accessToken = response.body.metadata.tokenPair.accessToken;
            refreshToken = response.body.metadata.tokenPair.refreshToken;
        });

        describe('Test ValidationResource', () => {
            it('should return stateCode = 400 and error if user send empty object', async () => {
                const response = await request(app)
                    .post('/api/v1/auth/refreshToken')
                    .set({
                        [config.auth.headers.clientId]: userId,
                        [config.auth.headers.authorization]: accessToken,
                    })
                    .send({});
                expect(response.statusCode).toBe(StatusCode.BAD_REQUEST);
                expect(response.body).toHaveProperty('code', StatusCode.BAD_REQUEST);
                expect(response.body).toHaveProperty('success', false);
                expect(response.body).toHaveProperty('errors');
                expect(response.body.errors).toHaveProperty('refreshToken');
                expect(response.body.errors.refreshToken).toContain('is required');
            });

            it('should return stateCode = 400 and error if user send refreshToken is empty string', async () => {
                const response = await request(app)
                    .post('/api/v1/auth/refreshToken')
                    .set({
                        [config.auth.headers.clientId]: userId,
                        [config.auth.headers.authorization]: accessToken,
                    })
                    .send({
                        refreshToken: '',
                    });

                expect(response.statusCode).toBe(StatusCode.BAD_REQUEST);
                expect(response.body).toHaveProperty('code', StatusCode.BAD_REQUEST);
                expect(response.body).toHaveProperty('success', false);
                expect(response.body).toHaveProperty('errors');
                expect(response.body.errors).toHaveProperty('refreshToken');
                expect(response.body.errors.refreshToken).toContain('is not allowed to be empty');
            });
            it('should return stateCode = 400 and error if user sent wrong data type', async () => {
                const testCase = { refreshToken: 123 };
                const response = await request(app)
                    .post('/api/v1/auth/refreshToken')
                    .set({
                        [config.auth.headers.clientId]: userId,
                        [config.auth.headers.authorization]: accessToken,
                    })
                    .send(testCase);
                expect(response.statusCode).toBe(StatusCode.BAD_REQUEST);
                expect(response.body).toHaveProperty('code', StatusCode.BAD_REQUEST);
                expect(response.body).toHaveProperty('success', false);
                expect(response.body).toHaveProperty('errors');
                expect(response.body.errors).toHaveProperty('refreshToken');
                expect(response.body.errors.refreshToken).toContain('must be a string');
            });
        });

        it('should return statusCode = 200 if user send valid credentials', async () => {
            const response = await request(app)
                .post('/api/v1/auth/refreshToken')
                .set({
                    [config.auth.headers.clientId]: userId,
                    [config.auth.headers.authorization]: accessToken,
                })
                .send({
                    refreshToken,
                });

            expect(response.statusCode).toBe(StatusCode.OKE);
            expect(response.body).toHaveProperty('code', StatusCode.OKE);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'refresh token user!');
            expect(response.body).toHaveProperty('metadata');
            expect(response.body.metadata).toHaveProperty('user');
            expect(response.body.metadata.user).toHaveProperty('userId', userId);
            expect(response.body.metadata.user).toHaveProperty('email', userInput.email.toLowerCase());
            expect(response.body.metadata).toHaveProperty('tokenPair');
            expect(response.body.metadata.tokenPair).toHaveProperty('accessToken', expect.any(String));
            expect(response.body.metadata.tokenPair).toHaveProperty('refreshToken', expect.any(String));
        });

        it('should return statusCode = FORBIDDEN', async () => {
            const response = await request(app)
                .post('/api/v1/auth/refreshToken')
                .set({
                    [config.auth.headers.clientId]: userId,
                    [config.auth.headers.authorization]: accessToken,
                })
                .send({
                    refreshToken,
                });

            expect(response.statusCode).toBe(StatusCode.FORBIDDEN);
            expect(response.body).toHaveProperty('code', StatusCode.FORBIDDEN);
            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('error', 'Something went wrong !! Please log in again!');
        });
    });
});
