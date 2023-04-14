import { Role, UserModel } from '@/models/user.model';

const userInput = {
    fullname: 'John Doe',
    email: 'john@doe.com',
    password: 'password',
};

describe('Testing User model', () => {
    it('should return user model if user send valid user info', async () => {
        const userTestCase = { ...userInput };
        const createdUser = await UserModel.create(userTestCase);
        expect(createdUser).toHaveProperty('_id');
        expect(createdUser).toHaveProperty('fullname', userTestCase.fullname);
        expect(createdUser).toHaveProperty('email', userTestCase.email);
        expect(createdUser).toHaveProperty('password', expect.any(String));
        expect(createdUser).toHaveProperty('role', Role.USER);
        expect(createdUser).toHaveProperty('verified', false);
    });

    describe('Testing modal validations', () => {
        it('should return ValidationError If user sends fields containing empty string', async () => {
            const userTestCase = { fullname: '', email: '', password: '' };
            try {
                await new UserModel(userTestCase).save();
            } catch (error) {
                expect(error.errors.fullname.message).toBe('Fullname is required!');
                expect(error.errors.email.message).toBe('Email is required!');
                expect(error.errors.password.message).toBe('Password is required!');
            }
        });

        it('should return ValidationError If user sends a fullname that is less than 5 characters long', async () => {
            const userTestCase = { ...userInput, fullname: 'John' };
            try {
                await new UserModel(userTestCase).save();
            } catch (error) {
                expect(error.errors.fullname.message).toBe(
                    'Fullname must contain at least 5 characters and maximum 50 characters'
                );
            }
        });

        it('should return ValidationError If user sends fullname over 50 characters in length', async () => {
            const userTestCase = { ...userInput, fullname: 'John'.repeat(15) };
            try {
                await new UserModel(userTestCase).save();
            } catch (error) {
                expect(error.errors.fullname.message).toBe(
                    'Fullname must contain at least 5 characters and maximum 50 characters'
                );
            }
        });

        it('should return ValidationError If user sends email already exists', async () => {
            const userTestCase = { ...userInput };
            try {
                await new UserModel(userTestCase).save();
                await new UserModel(userTestCase).save();
            } catch (error) {
                expect(error.code).toBe(11000);
            }
        });
    });

    describe('Testing model methods', () => {
        describe('Testing comparePassword()', () => {
            it('should return true if user send valid password', async () => {
                const userTestCase = { ...userInput };
                const createdUser = await UserModel.create(userTestCase);
                expect(await createdUser.comparePassword(userTestCase.password)).toBe(true);
            });

            it('should return true if user send invalid password', async () => {
                const userTestCase = { ...userInput };
                const createdUser = await UserModel.create(userTestCase);
                expect(await createdUser.comparePassword('invalid password')).toBe(false);
            });
        });
    });
});
