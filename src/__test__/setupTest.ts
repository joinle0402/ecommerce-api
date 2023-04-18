import request from 'supertest';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '@/app';

beforeAll(async () => {
    mongoose.set('strictQuery', false);
    const mongoDatabase = await MongoMemoryServer.create();
    await mongoose.connect(mongoDatabase.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
});

export async function initialAuthenticate() {
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

    return {
        userId: loginResponse.body.metadata.user._id as string,
        accessToken: loginResponse.body.metadata.tokenPair.accessToken as string,
    };
}
