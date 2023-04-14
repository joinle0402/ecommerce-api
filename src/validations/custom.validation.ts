import { CustomHelpers } from 'joi';
import { Types } from 'mongoose';

export function isValidObjectId(objectId: string, helpers: CustomHelpers) {
    if (objectId || (Types.ObjectId.isValid(objectId) && String(new Types.ObjectId(objectId)) === objectId)) {
        return objectId;
    }
    return helpers.error('Invalid id');
}
