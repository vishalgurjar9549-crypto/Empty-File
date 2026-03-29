"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailVerificationService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../utils/prisma");
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
const prisma = (0, prisma_1.getPrismaClient)();
// Token expiry: 24 hours
const TOKEN_EXPIRY_HOURS = 24;
/**
 * EMAIL VERIFICATION SERVICE
 *
 * Handles token generation, storage, verification, and resend logic.
 * Email sending is abstracted — currently logs the verification URL.
 * Replace sendVerificationEmail() internals with real provider (SendGrid, SES, etc.)
 * when ready.
 *
 * Security:
 * - Tokens are 32-byte crypto-random hex strings (64 chars)
 * - Tokens expire after 24 hours
 * - Tokens are cleared after successful verification (single-use)
 * - Unique constraint on emailVerifyToken prevents collisions
 */
class EmailVerificationService {
    /**
     * Generate a secure random verification token
     */
    static generateToken() {
        return crypto_1.default.randomBytes(32).toString('hex');
    }
    /**
     * Create and store a verification token for a user.
     * Returns the raw token (to be sent via email).
     */
    static async createVerificationToken(userId) {
        const token = EmailVerificationService.generateToken();
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + TOKEN_EXPIRY_HOURS);
        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                emailVerifyToken: token,
                emailVerifyExpiry: expiry
            }
        });
        return token;
    }
    /**
     * Send verification email to user.
     *
     * PLACEHOLDER: Logs the verification URL.
     * Replace with real email provider (SendGrid, AWS SES, Resend, etc.)
     * when ready for production email delivery.
     */
    static async sendVerificationEmail(email, token) {
        const verificationUrl = `${env_1.env.FRONTEND_URL}/auth/verify-email?token=${token}`;
        // ──────────────────────────────────────────────────────────────────
        // TODO: Replace with real email provider
        // Example with SendGrid:
        //   await sgMail.send({
        //     to: email,
        //     from: 'noreply@kangaroorooms.com',
        //     subject: 'Verify your email — Kangaroo Rooms',
        //     html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
        //   });
        // ──────────────────────────────────────────────────────────────────
        logger_1.logger.info('Verification email sent', {
            email,
            verificationUrl
        });
    }
    /**
     * Generate token + send email in one call.
     * Used by registration flow and resend endpoint.
     */
    static async generateAndSendVerification(userId, email) {
        const token = await EmailVerificationService.createVerificationToken(userId);
        await EmailVerificationService.sendVerificationEmail(email, token);
    }
    /**
     * Verify email using token.
     *
     * Steps:
     * 1. Find user by token
     * 2. Check token hasn't expired
     * 3. Set emailVerified = true, emailVerifiedAt = now()
     * 4. Clear token fields (single-use)
     *
     * Returns: { success, message, email? }
     */
    static async verifyEmail(token) {
        if (!token || typeof token !== 'string' || token.length < 10) {
            return {
                success: false,
                message: 'Invalid verification token'
            };
        }
        // Find user by token
        const user = await prisma.user.findUnique({
            where: {
                emailVerifyToken: token
            },
            select: {
                id: true,
                email: true,
                emailVerified: true,
                emailVerifyExpiry: true
            }
        });
        if (!user) {
            return {
                success: false,
                message: 'Invalid or expired verification token'
            };
        }
        // Already verified
        if (user.emailVerified) {
            return {
                success: true,
                message: 'Email already verified',
                email: user.email
            };
        }
        // Check expiry
        if (user.emailVerifyExpiry && user.emailVerifyExpiry < new Date()) {
            return {
                success: false,
                message: 'Verification token has expired. Please request a new one.'
            };
        }
        // Mark as verified + clear token fields
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                emailVerified: true,
                emailVerifiedAt: new Date(),
                emailVerifyToken: null,
                emailVerifyExpiry: null
            }
        });
        logger_1.logger.info('Email verified successfully', {
            userId: user.id,
            email: user.email
        });
        return {
            success: true,
            message: 'Email verified successfully',
            email: user.email
        };
    }
    /**
     * Resend verification email.
     *
     * Guards:
     * - User must exist
     * - User must NOT already be verified
     * - Generates fresh token + expiry (invalidates old one)
     */
    static async resendVerification(userId) {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                email: true,
                emailVerified: true,
                isActive: true
            }
        });
        if (!user) {
            return {
                success: false,
                message: 'User not found'
            };
        }
        if (!user.isActive) {
            return {
                success: false,
                message: 'Account has been disabled'
            };
        }
        if (user.emailVerified) {
            return {
                success: false,
                message: 'Email is already verified'
            };
        }
        await EmailVerificationService.generateAndSendVerification(user.id, user.email);
        return {
            success: true,
            message: 'Verification email sent'
        };
    }
}
exports.EmailVerificationService = EmailVerificationService;
//# sourceMappingURL=EmailVerificationService.js.map