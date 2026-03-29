"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRateLimiter = exports.generalRateLimiter = exports.corsMiddleware = exports.helmetMiddleware = void 0;
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
/**
 * Helmet configuration for security headers
 */
exports.helmetMiddleware = (0, helmet_1.default)({
    crossOriginResourcePolicy: {
        policy: "cross-origin",
    },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: [
                "'self'",
                "https:",
                "http:",
                "https://homilivo.onrender.com",
            ],
        },
    },
});
/**
 * CORS configuration
 * Allows requests from configured origins
//  */
// export const corsMiddleware = cors({
//   origin: (origin, callback) => {
//     // allow server-to-server / curl / mobile internal calls
//     if (!origin) return callback(null, true);
//     const allowedOrigins = [...env.CORS_ORIGIN.split(',').map((o) => o.trim()), 'capacitor://localhost', 'http://localhost', 'http://localhost:5173'];
//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }
//     // FIX 6: Reject disallowed origins (removed temporary allow-all bypass)
//     return callback(new Error(`CORS: origin ${origin} not allowed`), false);
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
//   preflightContinue: false,
//   optionsSuccessStatus: 204
// });
exports.corsMiddleware = (0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow server-to-server / mobile internal calls
        if (!origin)
            return callback(null, true);
        const normalizedOrigin = origin.replace(/\/$/, "");
        const allowedOrigins = [
            "https://homilivo.com",
            "https://www.homilivo.com",
            "https://localhost",
            "http://localhost",
            "capacitor://localhost",
        ];
        if (allowedOrigins.includes(normalizedOrigin)) {
            return callback(null, true);
        }
        // Allow localhost variants for Capacitor
        if (normalizedOrigin.includes("localhost")) {
            return callback(null, true);
        }
        console.warn("Unknown origin:", normalizedOrigin);
        return callback(null, true); // allow but log
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key"],
});
/**
 * General rate limiter for all routes
 * 100 requests per 15 minutes per IP
 */
exports.generalRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    // 15 minutes
    max: 1000,
    message: {
        success: false,
        message: "Too many requests from this IP, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
/**
 * Strict rate limiter for authentication routes
 * 5 requests per 15 minutes per IP
 */
exports.authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    // 15 minutes
    max: 5,
    message: {
        success: false,
        message: "Too many authentication attempts, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
});
//# sourceMappingURL=security.middleware.js.map