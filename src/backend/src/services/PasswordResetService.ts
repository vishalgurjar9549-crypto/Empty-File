import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getPrismaClient } from '../utils/prisma';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import { emailService } from './EmailService';

const prisma = getPrismaClient();

// Token expiry: 20 minutes (1200 seconds)
const TOKEN_EXPIRY_MINUTES = 20;

/**
 * PASSWORD RESET SERVICE
 *
 * Handles secure password reset flow:
 * 1. Generate reset token when user requests password reset
 * 2. Send email with reset link
 * 3. Validate token and update password
 * 4. Clear token after use (single-use)
 *
 * Security:
 * - Tokens are 32-byte crypto-random hex strings (64 chars)
 * - Tokens expire after 20 minutes
 * - Tokens are cleared after successful reset (single-use)
 * - Design does NOT reveal if email exists (always return 200 OK)
 * - Passwords are bcrypt hashed before saving
 * - Unique constraint on passwordResetToken prevents collisions
 */
export class PasswordResetService {
  /**
   * Generate a secure random reset token
   */
  static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Request password reset for a user.
   * Returns success regardless of whether email exists (security).
   * If user exists, creates and stores reset token.
   * If user doesn't exist, silently succeeds (attacker cannot enumerate emails).
   */
  static async requestPasswordReset(email: string): Promise<{ success: boolean; reset: boolean }> {
    const normalizedEmail = email.toLowerCase().trim();

    logger.info('Password reset requested', { email: normalizedEmail });

    try {
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      });

      if (!user) {
        // ✅ SECURITY: Always return success to prevent email enumeration
        logger.info('Password reset requested for non-existent email', {
          email: normalizedEmail
        });
        return {
          success: true,
          reset: false // Indicates no action was taken
        };
      }

      // Generate and store reset token
      const token = PasswordResetService.generateToken();
      const expiry = new Date();
      expiry.setMinutes(expiry.getMinutes() + TOKEN_EXPIRY_MINUTES);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: token,
          passwordResetExpiry: expiry
        }
      });

      logger.info('Password reset token created', {
        userId: user.id,
        expiresIn: TOKEN_EXPIRY_MINUTES + ' minutes'
      });

      // Send reset email
      await PasswordResetService.sendPasswordResetEmail(user.email, token);

      return {
        success: true,
        reset: true // Indicates token was created and email sent
      };
    } catch (error: any) {
      logger.error('Error requesting password reset', {
        error: error.message
      });

      // Still return success to client (don't leak errors)
      return {
        success: true,
        reset: false
      };
    }
  }

  /**
   * Send password reset email to user via Resend.
   * Non-blocking: Email sent in background, failures don't crash the app.
   * Masks email in logs for security.
   */
  static async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${env.FRONTEND_URL}/auth/reset-password?token=${token}`;
    
    // Mask email for logging (e.g., "u***@example.com")
    const maskedEmail = email.replace(/(.{1})(.*)(@.*)/, '$1***$3');

    try {
      // Send password reset email via Resend
      await emailService.sendPasswordReset(email, resetUrl);
      
      logger.info('Password reset email sent', {
        email: maskedEmail,
        expiresIn: TOKEN_EXPIRY_MINUTES + ' minutes'
      });
    } catch (error: any) {
      // Log error but don't throw (fire-and-forget)
      logger.error('Failed to send password reset email', {
        email: maskedEmail,
        error: error.message
      });
    }
  }

  /**
   * Validate reset token and update password.
   * Throws error if:
   * - Token is invalid or expired
   * - Token doesn't exist
   * - Password validation fails
   */
  static async resetPassword(token: string, newPassword: string): Promise<{ success: boolean }> {
    if (!token || token.trim() === '') {
      throw new Error('Reset token is required');
    }

    if (!newPassword || newPassword.trim() === '') {
      throw new Error('New password is required');
    }

    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    logger.info('Password reset attempt', { tokenLength: token.length });

    try {
      const user = await prisma.user.findUnique({
        where: { passwordResetToken: token }
      });

      if (!user) {
        logger.warn('Password reset attempted with invalid token');
        throw new Error('Invalid or expired reset token');
      }

      // Check if token has expired
      if (!user.passwordResetExpiry || user.passwordResetExpiry < new Date()) {
        logger.warn('Password reset attempted with expired token', {
          userId: user.id,
          expiry: user.passwordResetExpiry
        });

        // Clear the expired token
        await prisma.user.update({
          where: { id: user.id },
          data: {
            passwordResetToken: null,
            passwordResetExpiry: null
          }
        });

        throw new Error('Reset token has expired. Please request a new one.');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and clear token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpiry: null
        }
      });

      logger.info('Password reset successful', { userId: user.id });

      return { success: true };
    } catch (error: any) {
      logger.error('Error resetting password', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Validate a reset token without resetting the password.
   * Useful for checking if token is valid before showing the reset form.
   */
  static async validateResetToken(token: string): Promise<{ valid: boolean; email?: string }> {
    if (!token || token.trim() === '') {
      return { valid: false };
    }

    try {
      const user = await prisma.user.findUnique({
        where: { passwordResetToken: token }
      });

      if (!user) {
        return { valid: false };
      }

      // Check if token has expired
      if (!user.passwordResetExpiry || user.passwordResetExpiry < new Date()) {
        return { valid: false };
      }

      return {
        valid: true,
        email: user.email
      };
    } catch (error: any) {
      logger.error('Error validating reset token', {
        error: error.message
      });
      return { valid: false };
    }
  }
}
