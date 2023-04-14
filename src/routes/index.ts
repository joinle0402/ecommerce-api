import { Router } from 'express';
import { AuthRouter } from './auth.route';
import { UserRouter } from './user.route';
import { ProductRouter } from './product.route';

const routes = Router();

routes.use('/api/v1/auth', AuthRouter);
routes.use('/api/v1/users', UserRouter);
routes.use('/api/v1/products', ProductRouter);

export { routes };
