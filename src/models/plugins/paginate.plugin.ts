import { logger } from '@/utilities/logger.utility';

export interface Pagination {
    sort?: string;
    fields?: string;
    page?: number;
    limit?: number;
}

export interface PaginationResponse<T> {
    documents: T[];
    total: number;
    count: number;
    currentPage: number;
    limit: number;
}

export function paginatePlugin(schema) {
    schema.static('paginate', async function (query) {
        const queries = { ...query };
        const excludeFields = ['sort', 'fields', 'page', 'limit'];
        for (const excludeField of excludeFields) {
            delete queries[excludeField];
        }

        let queryString = JSON.stringify(queries);
        queryString = queryString.replace(/\b(gt|gte|lt|lte)\b/g, matchedElement => `$${matchedElement}`);
        const filter = JSON.parse(queryString);

        if (query.name) {
            filter.name = { $regex: queries.name, $options: 'i' };
        }

        logger.info('ProductService.findAll.filter: %o', filter);

        let queryCommand = this.find(filter);
        if (query.sort) {
            const sort = query.sort.split(',').join(' ');
            queryCommand = queryCommand.sort(sort);
        }

        if (query.fields) {
            const fields = query.fields.split(',').join(' ');
            queryCommand = queryCommand.select(fields);
        }

        const currentPage = Number(query.page) || 1;
        const limit = Number(query.limit) || 5;
        queryCommand = queryCommand.skip((currentPage - 1) * limit).limit(limit);

        const documents = await queryCommand.exec();
        const total = await this.find(filter).countDocuments();
        const count = documents.length;

        return { documents, total, count, currentPage, limit };
    });
}
