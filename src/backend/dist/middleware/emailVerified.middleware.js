"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailVerifiedMiddleware = void 0;
const repositories_1 = require("../repositories");
const logger_1 = require("../utils/logger");
/**
 * ═════════════════════════════════════════════════════════════════════
 * EMAIL VERIFICATION MIDDLEWARE
 * ═════════════════════════════════════════════════════════════════════
 *
 * Guards protected APIs that require email verification (e.g., create property).
 *
 * If user is not email verified, returns:
 * {
 *   code: "EMAIL_VERIFICATION_REQUIRED",
 *   message: "Please verify your email before proceeding"
 * }
 *
 * Frontend should catch this, show verification modal, retry operation after success.
 *
 * Usage:
 * router.post('/properties', authMiddleware, emailVerifiedMiddleware, createProperty);
 */
const emailVerifiedMiddleware = async (req, res, next) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        // Find user from database
        const user = await repositories_1.userRepository.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // ═════════════════════════════════════════════════════════════
        // CHECK EMAIL VERIFICATION
        // ═════════════════════════════════════════════════════════════
        if (!user.emailVerified) {
            logger_1.logger.warn('Operation blocked - email not verified', {
                userId: user.id,
                email: user.email,
                path: req.path
            });
            return res.status(403).json({
                success: false,
                code: 'EMAIL_VERIFICATION_REQUIRED',
                message: 'Please verify your email before proceeding',
                data: {
                    needsVerification: true,
                    email: user.email
                }
            });
        }
        // ✅ User is verified - proceed
        next();
    }
    catch (error) {
        logger_1.logger.error('Email verification middleware error', {
            error: error.message
        });
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.emailVerifiedMiddleware = emailVerifiedMiddleware;
//# sourceMappingURL=emailVerified.middleware.js.map