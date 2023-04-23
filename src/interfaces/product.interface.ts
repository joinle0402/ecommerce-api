import { Pagination } from '@/models/plugins/paginate.plugin';

export interface ProductType {
    name: string;
    image: string;
    category: string;
    price: number;
    countInStock: number;
    rating: number;
    description: string;
    createdBy: string;
}

export interface FindAllProductQuery extends Pagination {
    name?: string;
}

export interface CreateProductBody {
    name: string;
    image: string;
    category: string;
    price: number;
    countInStock: number;
    rating: number;
    description: string;
    createdBy: string;
}

export interface UpdateProductBody {
    name?: string;
    image?: string;
    category?: string;
    price?: number;
    countInStock?: number;
    rating?: number;
    description?: string;
    createdBy?: string;
}
