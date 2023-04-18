import { KeyTokenController } from '@/controllers/keyToken.controller';
import { Router } from 'express';

export const KeyTokenRouter = Router();

KeyTokenRouter.get('/', KeyTokenController.findAll);
KeyTokenRouter.delete('/', KeyTokenController.deleteAll);
