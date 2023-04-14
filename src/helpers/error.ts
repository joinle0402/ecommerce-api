import { ReasonStatusCode, StatusCode } from '@/configs/statusCode.config';

export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

export class BadRequestError extends ApiError {
    constructor(message = ReasonStatusCode.BAD_REQUEST, status = StatusCode.BAD_REQUEST) {
        super(message, status);
    }
}

export class NotFoundError extends ApiError {
    constructor(message = ReasonStatusCode.NOT_FOUND, status = StatusCode.NOT_FOUND) {
        super(message, status);
    }
}

export class AuthenticateFailureError extends ApiError {
    constructor(message = ReasonStatusCode.UNAUTHORIZED, status = StatusCode.UNAUTHORIZED) {
        super(message, status);
    }
}

export class ForbiddenError extends ApiError {
    constructor(message = ReasonStatusCode.FORBIDDEN, status = StatusCode.FORBIDDEN) {
        super(message, status);
    }
}

export class ConflictError extends ApiError {
    constructor(message = ReasonStatusCode.CONFLICT, status = StatusCode.CONFLICT) {
        super(message, status);
    }
}
