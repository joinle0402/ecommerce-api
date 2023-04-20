import { logger } from '@/utilities/logger.utility';
import { Schema, model } from 'mongoose';
import slugify from 'slugify';

interface ICategory {
    name: string;
    slug: string;
}

const CategorySchema = new Schema<ICategory>(
    {
        name: {
            type: String,
            trim: true,
            unique: true,
            minlength: 3,
            maxlength: 50,
            required: true,
        },
        slug: {
            type: String,
            trim: true,
            unique: true,
            index: true,
        },
    },
    {
        timestamps: true,
        collection: 'categories',
    }
);

CategorySchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, trim: true });
        logger.info(`CategorySchema.pre('save').slug: %s`, this.slug);
    }
    next();
});

export const Category = model<ICategory>('Categories', CategorySchema);
