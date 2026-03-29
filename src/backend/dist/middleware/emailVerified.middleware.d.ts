import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
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
export declare const emailVerifiedMiddleware: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=emailVerified.middleware.d.ts.map