"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = require("../utils/logger");
/**
 * Request logging middleware
 * Logs incoming requests and their response times
 */
function requestLogger(req, res, next) {
    const start = Date.now();
    const requestId = crypto_1.default.randomUUID();
    req.requestId = requestId;
    // Log request
    logger_1.logger.info({
        requestId,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('user-agent')
    }, 'Incoming request');
    // Log response
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger_1.logger.info({
            requestId,
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`
        }, 'Request completed');
    });
    next();
}
//# sourceMappingURL=logging.middleware.js.map