import { logger } from '@/utilities/logger.utility';
import { Document, Model, Schema, Types, model } from 'mongoose';
import slugify from 'slugify';
import { PaginationResponse, paginatePlugin } from './plugins/paginate.plugin';

export interface IProduct {
    name: string;
    slug: string;
    image: string;
    category?: Types.ObjectId;
    price: number;
    countInStock: number;
    rating: number;
    description: string;
    createdBy?: Types.ObjectId;
}

export interface ProductDocument extends Document {}

interface IProductMethods {}

interface IProductModel extends Model<IProduct, {}, IProductMethods> {
    paginate: (query) => PaginationResponse<IProduct & { _id: string }>;
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
            type: Types.ObjectId,
            ref: 'categories',
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
        collection: 'products',
    }
);

ProductSchema.plugin(paginatePlugin);

ProductSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, trim: true });
        logger.info(`ProductSchema.pre('save').slug: %s`, this.slug);
    }

    next();
});

export const Product = model<IProduct, IProductModel>('Products', ProductSchema);
