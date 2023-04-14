import { logger } from '@/utilities/logger.utility';
import { Schema, Types, model } from 'mongoose';
import slugify from 'slugify';

interface IProduct {
    name: string;
    slug: string;
    image: string;
    category: string;
    price: number;
    countInStock: number;
    rating: number;
    description: string;
    createdBy?: Types.ObjectId;
}

const ProductSchema = new Schema<IProduct>(
    {
        name: {
            type: String,
            trim: true,
            unique: true,
            minlength: 5,
            maxlength: 150,
            required: true,
        },
        slug: {
            type: String,
            trim: true,
            index: true,
            unique: true,
        },
        image: {
            type: String,
            trim: true,
            required: true,
        },
        category: {
            type: String,
            trim: true,
            minlength: 3,
            maxlength: 50,
            required: true,
        },
        price: {
            type: Number,
            min: 0,
            validate: {
                validator: Number.isInteger,
                message: '{VALUE} is not an integer value',
            },
            required: true,
        },
        countInStock: {
            type: Number,
            min: 0,
            validate: {
                validator: Number.isInteger,
                message: '{VALUE} is not an integer value',
            },
            required: true,
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            validate: {
                validator: Number.isInteger,
                message: '{VALUE} is not an integer value',
            },
            required: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        createdBy: {
            type: Types.ObjectId,
            required: true,
            ref: 'User',
        },
    },
    {
        timestamps: true,
        collection: 'Products',
    }
);

ProductSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true, trim: true });
    logger.info('Product.pre.save.slug: %s', this.slug);
    next();
});

export const Product = model<IProduct>('Product', ProductSchema);
