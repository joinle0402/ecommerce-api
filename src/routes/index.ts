import { Router } from 'express';
import { AuthRouter } from './auth.route';
import { UserRouter } from './user.route';
import { ProductRouter } from './product.route';
import { CategoryRouter } from './category.route';
import { KeyTokenRouter } from './keyToken.route';

const routes = Router();

routes.use('/api/v1/auth', AuthRouter);
routes.use('/api/v1/users', UserRouter);
routes.use('/api/v1/products', ProductRouter);
routes.use('/api/v1/categories', CategoryRouter);
routes.use('/api/v1/keyTokens', KeyTokenRouter);

export { routes };
