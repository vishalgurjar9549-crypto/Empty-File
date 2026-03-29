"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorHandler = errorHandler;
const logger_1 = require("../utils/logger");
class AppError extends Error {
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
function errorHandler(err, req, res, next) {
    // Log error with context
    logger_1.logger.error({
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        requestId: req.requestId
    }, 'Request error');
    // Handle known operational errors
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    }
    // Handle unknown errors (don't leak details in production)
    const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
    res.status(500).json({
        success: false,
        message
    });
}
//# sourceMappingURL=error.middleware.js.map