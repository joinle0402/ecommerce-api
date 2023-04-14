import { CustomHelpers } from 'joi';
import { Types } from 'mongoose';

export function isValidObjectId(objectId: string, helpers: CustomHelpers) {
    if (Types.ObjectId.isValid(objectId) && String(new Types.ObjectId(objectId)) === objectId) {
        return objectId;
    }
    return helpers.error('Invalid id');
}
