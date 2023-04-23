import request from 'supertest';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '@/app';
import { config } from '@/configs/config';

beforeAll(async () => {
    mongoose.set('strictQuery', false);
    const mongoDatabase = await MongoMemoryServer.create();
    await mongoose.connect(mongoDatabase.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
});

export async function initialAuthentication() {
    const registerInput = {
        fullname: faker.name.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
    };
    await request(app).post('/api/v1/auth/register').send(registerInput);
    const loginInput = { email: registerInput.email, password: registerInput.password };
    const login = await request(app).post('/api/v1/auth/login').send(loginInput);

    return {
        [config.auth.headers.clientId]: login.body.metadata.user._id,
        [config.auth.headers.authorization]: login.body.metadata.tokenPair.accessToken,
    };
}
