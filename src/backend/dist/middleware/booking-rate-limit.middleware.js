"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingStatusRateLimiter = exports.bookingRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
/**
 * BOOKING RATE LIMITER — Enterprise Level
 *
 * Prevents booking spam per authenticated user.
 * Uses userId from JWT (not IP) for accurate per-user limiting.
 *
 * Policy: 5 booking creations per user per hour.
 *
 * WHY per-user, not per-IP:
 * - Multiple users behind same NAT/VPN share IP
 * - A single user can rotate IPs (mobile networks)
 * - userId from JWT is tamper-proof
 *
 * FALLBACK: If no userId (shouldn't happen — auth middleware runs first),
 * falls back to IP-based limiting.
 */
exports.bookingRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    // 1 hour window
    max: 5,
    // 5 bookings per user per hour
    standardHeaders: true,
    legacyHeaders: false,
    // Key by authenticated userId, fallback to IP
    keyGenerator: (req) => {
        const authReq = req;
        return authReq.user?.userId || req.ip || 'unknown';
    },
    message: {
        success: false,
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many booking requests. Maximum 5 bookings per hour. Please try again later.'
    },
    // Only count successful booking creations (status < 400)
    skipFailedRequests: true
});
/**
 * OWNER STATUS UPDATE RATE LIMITER
 *
 * Prevents rapid status toggling (accidental or malicious).
 * Policy: 20 status updates per owner per hour.
 */
exports.bookingStatusRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        const authReq = req;
        return `status_${authReq.user?.userId || req.ip || 'unknown'}`;
    },
    message: {
        success: false,
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many status update requests. Please try again later.'
    },
    skipFailedRequests: true
});
//# sourceMappingURL=booking-rate-limit.middleware.js.map