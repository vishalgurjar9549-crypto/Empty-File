import { createHash } from 'crypto';
import { getPrismaClient } from '../utils/prisma';
import { logger } from '../utils/logger';
import { emailService } from './EmailService';

/**
 * OTP SERVICE
 *
 * Handles email OTP generation, storage, sending, and validation.
 *
 * DESIGN:
 * - Generate: Create 6-digit code, hash it, store in DB with 10-min expiry
 * - Send: Call EmailService with code
 * - Verify: Check hash, expiry, attempt count
 *
 * SECURITY:
 * - Code stored as SHA256 hash (never plaintext)
 * - Max 3 attempts per OTP (brute force protection)
 * - Progressive delays: 500ms → 1000ms → 2000ms (slow down attacks)
 * - Generic error messages (don't reveal failure reason)
 * - Expires after 10 minutes
 * - Marked as used after successful verification
 */
export class OtpService {
  private prisma = getPrismaClient();
  private readonly OTP_LENGTH = 6;
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 3; // ✅ SECURITY: Reduced from 5 to 3

  /**
   * Generate a random 6-digit OTP
   */
  generateCode(): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return code;
  }

  /**
   * Hash an OTP code (SHA256)
   */
  private hashCode(code: string): string {
    return createHash('sha256').update(code).digest('hex');
  }

  /**
   * Create and send OTP to email
   *
   * Steps:
   * 1. Generate 6-digit code
   * 2. Hash code
   * 3. Store in DB with 10-min expiry
   * 4. Send via email (async, non-blocking)
   * 5. Return success
   */
  async createAndSendOTP(userId: string, email: string): Promise<{ success: boolean }> {
    try {
      // Generate code
      const code = this.generateCode();
      const codeHash = this.hashCode(code);

      // Calculate expiry
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES);
      // Store in DB
      await this.prisma.emailOtp.create({
        data: {
          userId,
          email,
          otpHash: codeHash,
          expiresAt,
          attempts: 0,
          isUsed: false
        }
      });

      logger.info('OTP stored in DB', {
        userId,
        email,
        expiresAt
      });

      // Send email (async, fire-and-forget)
      await emailService.sendOTP(email, code);

      return { success: true };
    } catch (error: any) {
      logger.error('Failed to create and send OTP', {
        userId,
        email,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Verify OTP code
   *
   * Steps:
   * 1. Find active OTP for user+email
   * 2. Check not expired
   * 3. Check not used
   * 4. Check attempts < max
   * 5. Verify hash matches
   * 6. Mark as used
   * 7. Return { valid: true }
   *
   * Returns: { valid: boolean, reason?: string }
   */
  async verifyOTP(userId: string, email: string, enteredCode: string): Promise<{
    valid: boolean;
    reason?: string;
  }> {
    try {
      // Find OTP
      const otp = await this.prisma.emailOtp.findFirst({
        where: {
          userId,
          email,
          isUsed: false
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }]
      });

      // Not found
      if (!otp) {
        logger.warn('OTP verification failed: not found', {
          userId,
          email
        });
        return { valid: false, reason: 'Invalid OTP code' };
      }

      // Expired
      if (otp.expiresAt < new Date()) {
        logger.warn('OTP verification failed: expired', {
          userId,
          otpId: otp.id,
          expiresAt: otp.expiresAt
        });
        return { valid: false, reason: 'Invalid OTP code' };
      }

      // Max attempts exceeded
      if (otp.attempts >= this.MAX_ATTEMPTS) {
        logger.warn('OTP verification failed: max attempts exceeded', {
          userId,
          otpId: otp.id,
          attempts: otp.attempts
        });
        return { valid: false, reason: 'Invalid OTP code' };
      }

      // Check code hash
      const enteredHash = this.hashCode(enteredCode);
      if (enteredHash !== otp.otpHash) {
        // ✅ SECURITY: Add progressive delay before responding (slow down brute force)
        const delayMs = Math.min(500 * Math.pow(2, otp.attempts), 5000); // 500ms, 1000ms, 2000ms
        await new Promise(r => setTimeout(r, delayMs));

        // Increment attempts
        await this.prisma.emailOtp.update({
          where: { id: otp.id },
          data: { attempts: otp.attempts + 1 }
        });

        logger.warn('OTP verification failed: invalid code', {
          userId,
          otpId: otp.id,
          attempt: otp.attempts + 1
        });

        return { valid: false, reason: 'Invalid OTP code' };
      }

      // ✅ Valid! Mark as used
      await this.prisma.emailOtp.update({
        where: { id: otp.id },
        data: { isUsed: true }
      });

      logger.info('OTP verification successful', {
        userId,
        email: email.substring(0, 5) + '***', // Mask email in logs
        otpId: otp.id
      });

      return { valid: true };
    } catch (error: any) {
      logger.error('OTP verification error', {
        userId,
        email,
        error: error.message
      });
      throw error;
    }
  }
}

// Singleton export
export const otpService = new OtpService();
