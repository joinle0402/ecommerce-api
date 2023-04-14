import { UserController } from '@/controllers/user.controller';
import { Router } from 'express';

export const UserRouter = Router();

UserRouter.get('/', UserController.findAll);
UserRouter.delete('/', UserController.deleteAll);
