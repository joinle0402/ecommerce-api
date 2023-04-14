import { AuthController } from '@/controllers/auth.controller';
import { authentication } from '@/middlewares/authenticate.middleware';
import { validateResource } from '@/middlewares/validate.middleware';
import { loginSchema, refreshTokenSchema, registerSchema } from '@/validations/auth.validation';
import { Router } from 'express';

export const AuthRouter = Router();

AuthRouter.post('/register', validateResource(registerSchema), AuthController.register);
AuthRouter.post('/login', validateResource(loginSchema), AuthController.login);

AuthRouter.use(authentication);

AuthRouter.post('/refreshToken', validateResource(refreshTokenSchema), AuthController.refreshToken);
AuthRouter.delete('/logout', AuthController.logout);
