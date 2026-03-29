/**
 * PRODUCTION-GRADE ERROR HIERARCHY
 *
 * Staff Engineer Pattern: Typed errors with HTTP status codes.
 * Controllers catch these and return proper HTTP responses.
 *
 * NEVER throw generic Error() in services — always use these.
 */
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly isOperational: boolean;
    readonly code: string;
    constructor(statusCode: number, message: string, code?: string, isOperational?: boolean);
}
export declare class ValidationError extends AppError {
    readonly details: any[];
    constructor(message: string, details?: any[]);
}
export declare class InvalidDateError extends AppError {
    constructor(message?: string);
}
export declare class IdempotencyConflictError extends AppError {
    constructor(message?: string);
}
export declare class IdempotencyKeyMissingError extends AppError {
    constructor(message?: string);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
export declare class PhoneRequiredError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(resource: string, id?: string);
}
export declare class DuplicateError extends AppError {
    constructor(message?: string);
}
export declare class DuplicateBookingError extends AppError {
    constructor();
}
export declare class BusinessLogicError extends AppError {
    constructor(message: string);
}
export declare class InvalidStatusTransitionError extends AppError {
    constructor(from: string, to: string);
}
export declare class RateLimitError extends AppError {
    constructor(message?: string);
}
export declare class InternalError extends AppError {
    constructor(message?: string);
}
/**
 * Maps Prisma error codes to typed AppErrors.
 * Call this in repository catch blocks.
 */
export declare function mapPrismaError(error: any): AppError;
//# sourceMappingURL=AppErrors.d.ts.map