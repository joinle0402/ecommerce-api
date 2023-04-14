export type ProductType = {
    name: string;
    image: string;
    category: string;
    price: number;
    countInStock: number;
    rating: number;
    description: string;
    createdBy: string;
};

export type CreateProductBody = {
    name: string;
    image: string;
    category: string;
    price: number;
    countInStock: number;
    rating: number;
    description: string;
    createdBy: string;
};

export type UpdateProductBody = Partial<CreateProductBody>;
