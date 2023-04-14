import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

beforeAll(async () => {
    mongoose.set('strictQuery', false);
    const mongoDatabase = await MongoMemoryServer.create();
    await mongoose.connect(mongoDatabase.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
});
