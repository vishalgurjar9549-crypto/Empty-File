"use strict";
/**
 * PRODUCTION-GRADE ERROR HIERARCHY
 *
 * Staff Engineer Pattern: Typed errors with HTTP status codes.
 * Controllers catch these and return proper HTTP responses.
 *
 * NEVER throw generic Error() in services — always use these.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalError = exports.RateLimitError = exports.InvalidStatusTransitionError = exports.BusinessLogicError = exports.DuplicateBookingError = exports.DuplicateError = exports.NotFoundError = exports.PhoneRequiredError = exports.ForbiddenError = exports.UnauthorizedError = exports.IdempotencyKeyMissingError = exports.IdempotencyConflictError = exports.InvalidDateError = exports.ValidationError = exports.AppError = void 0;
exports.mapPrismaError = mapPrismaError;
class AppError extends Error {
    constructor(statusCode, message, code = 'UNKNOWN_ERROR', isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.AppError = AppError;
// ============================================================================
// 400 — VALIDATION ERRORS
// ============================================================================
class ValidationError extends AppError {
    constructor(message, details = []) {
        super(400, message, 'VALIDATION_ERROR');
        this.details = details;
    }
}
exports.ValidationError = ValidationError;
class InvalidDateError extends AppError {
    constructor(message = 'Invalid or past date provided') {
        super(400, message, 'INVALID_DATE');
    }
}
exports.InvalidDateError = InvalidDateError;
class IdempotencyConflictError extends AppError {
    constructor(message = 'Idempotency key reused with different payload') {
        super(409, message, 'IDEMPOTENCY_CONFLICT');
        this.name = 'IdempotencyConflictError';
    }
}
exports.IdempotencyConflictError = IdempotencyConflictError;
class IdempotencyKeyMissingError extends AppError {
    constructor(message = 'Idempotency-Key header is required') {
        super(400, message, 'IDEMPOTENCY_KEY_MISSING');
        this.name = 'IdempotencyKeyMissingError';
    }
}
exports.IdempotencyKeyMissingError = IdempotencyKeyMissingError;
// ============================================================================
// 401 — AUTHENTICATION ERRORS
// ============================================================================
class UnauthorizedError extends AppError {
    constructor(message = 'Authentication required') {
        super(401, message, 'UNAUTHORIZED');
    }
}
exports.UnauthorizedError = UnauthorizedError;
// ============================================================================
// 403 — AUTHORIZATION ERRORS
// ============================================================================
class ForbiddenError extends AppError {
    constructor(message = 'You do not have permission to perform this action') {
        super(403, message, 'FORBIDDEN');
    }
}
exports.ForbiddenError = ForbiddenError;
// ✅ Phone required error
// User must provide phone number before performing certain actions.
// Frontend detects code === 'PHONE_REQUIRED' and shows the phone capture modal.
class PhoneRequiredError extends AppError {
    constructor(message = 'Phone number is required before performing this action') {
        super(403, message, 'PHONE_REQUIRED');
    }
}
exports.PhoneRequiredError = PhoneRequiredError;
// ============================================================================
// 404 — NOT FOUND ERRORS
// ============================================================================
class NotFoundError extends AppError {
    constructor(resource, id) {
        const message = id ? `${resource} with ID "${id}" not found` : `${resource} not found`;
        super(404, message, 'NOT_FOUND');
    }
}
exports.NotFoundError = NotFoundError;
// ============================================================================
// 409 — CONFLICT / DUPLICATE ERRORS
// ============================================================================
class DuplicateError extends AppError {
    constructor(message = 'Duplicate resource detected') {
        super(409, message, 'DUPLICATE');
    }
}
exports.DuplicateError = DuplicateError;
class DuplicateBookingError extends AppError {
    constructor() {
        super(409, 'You already have an active booking request for this room on this date', 'DUPLICATE_BOOKING');
    }
}
exports.DuplicateBookingError = DuplicateBookingError;
// ============================================================================
// 422 — BUSINESS LOGIC ERRORS
// ============================================================================
class BusinessLogicError extends AppError {
    constructor(message) {
        super(422, message, 'BUSINESS_LOGIC_ERROR');
    }
}
exports.BusinessLogicError = BusinessLogicError;
class InvalidStatusTransitionError extends AppError {
    constructor(from, to) {
        super(422, `Cannot change booking status from ${from} to ${to}`, 'INVALID_STATUS_TRANSITION');
    }
}
exports.InvalidStatusTransitionError = InvalidStatusTransitionError;
// ============================================================================
// 429 — RATE LIMIT ERRORS
// ============================================================================
class RateLimitError extends AppError {
    constructor(message = 'Too many requests. Please try again later.') {
        super(429, message, 'RATE_LIMIT_EXCEEDED');
    }
}
exports.RateLimitError = RateLimitError;
// ============================================================================
// 500 — INTERNAL ERRORS
// ============================================================================
class InternalError extends AppError {
    constructor(message = 'An unexpected error occurred') {
        super(500, message, 'INTERNAL_ERROR', false);
    }
}
exports.InternalError = InternalError;
// ============================================================================
// PRISMA ERROR MAPPER
// ============================================================================
/**
 * Maps Prisma error codes to typed AppErrors.
 * Call this in repository catch blocks.
 */
function mapPrismaError(error) {
    const code = error?.code;
    switch (code) {
        case 'P2002':
            {
                // Unique constraint violation
                const target = error?.meta?.target;
                if (target?.includes('roomId') && target?.includes('tenantEmail') && target?.includes('moveInDate')) {
                    return new DuplicateBookingError();
                }
                return new DuplicateError(`Duplicate entry: ${target?.join(', ') || 'unknown field'}`);
            }
        case 'P2025':
            // Record not found
            return new NotFoundError('Record');
        case 'P2003':
            // Foreign key constraint failed
            return new ValidationError('Referenced record does not exist');
        case 'P2014':
            // Required relation violation
            return new ValidationError('Required relation is missing');
        default:
            return new InternalError(process.env.NODE_ENV === 'production' ? 'Database operation failed' : `Database error: ${error?.message || 'unknown'}`);
    }
}
//# sourceMappingURL=AppErrors.js.map