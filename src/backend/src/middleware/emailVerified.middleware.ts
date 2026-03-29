import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { userRepository } from '../repositories';
import { logger } from '../utils/logger';

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

export const emailVerifiedMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Find user from database
    const user = await userRepository.findById(req.user.userId);

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
      logger.warn('Operation blocked - email not verified', {
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
  } catch (error: any) {
    logger.error('Email verification middleware error', {
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
