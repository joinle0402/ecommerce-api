import { Role } from '@/models/user.model';
import { AuthService } from '@/services/auth.service';
import { faker } from '@faker-js/faker';

describe('Testing AuthService', () => {
    let userInput;
    beforeEach(() => {
        userInput = {
            fullname: faker.name.fullName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
        };
    });
    it('should return user document if user send valid credentials', async () => {
        const userTestCase = { ...userInput };
        const user = await AuthService.register(userInput);
        expect(user).toHaveProperty('_id');
        expect(user).toHaveProperty('fullname', userTestCase.fullname);
        expect(user).toHaveProperty('email', userTestCase.email.toLowerCase());
        expect(user).toHaveProperty('password', expect.any(String));
        expect(user).toHaveProperty('role', Role.USER);
        expect(user).toHaveProperty('verified', false);
    });

    it('should return user document if user send email already exists', async () => {
        try {
            await AuthService.register(userInput);
            await AuthService.register(userInput);
        } catch (error) {
            expect(error.message).toBe('Email already exists');
        }
    });
});
