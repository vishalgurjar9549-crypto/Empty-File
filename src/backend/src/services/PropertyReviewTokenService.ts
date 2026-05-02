import crypto from 'crypto';
import { getPrismaClient } from '../utils/prisma';
import { logger } from '../utils/logger';

/**
 * PROPERTY REVIEW TOKEN SERVICE
 *
 * Handles token generation and management for property review links.
 * Tokens are used for WhatsApp auto-login flow (Phase 1).
 *
 * Security:
 * - Tokens are 32-byte crypto-random hex strings (64 chars)
 * - Tokens expire after 5-10 minutes
 * - Tokens are single-use (marked with usedAt timestamp)
 * - Unique constraint on token prevents collisions
 * - Composite unique constraint (propertyId, token) prevents replay
 */
export class PropertyReviewTokenService {
  /**
   * Generate a secure random token for property review
   * Matches pattern from EmailVerificationService
   */
  static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create and store a review token for a property
   * Admin calls this when generating WhatsApp link for owner
   *
   * @param propertyId - UUID of the property
   * @param ownerId - UUID of the property owner
   * @param expiryMinutes - Token expiry in minutes (default: 5)
   *
   * @returns { token, propertyId, expiresAt }
   *
   * @throws Error if property not found or doesn't belong to owner
   */
  static async generateReviewToken(
    propertyId: string,
    ownerId: string,
    expiryMinutes: number = 5
  ): Promise<{
    token: string;
    propertyId: string;
    expiresAt: Date;
  }> {
    const prisma = getPrismaClient();

    try {
      // 1. Verify property exists
      const property = await prisma.room.findUnique({
        where: { id: propertyId },
        select: {
          id: true,
          ownerId: true,
          title: true
        }
      });

      if (!property) {
        throw new Error('Property not found');
      }

      // 2. Verify property belongs to owner
      if (property.ownerId !== ownerId) {
        throw new Error('Property does not belong to this owner');
      }

      // 3. Generate token
      const token = PropertyReviewTokenService.generateToken();

      // 4. Calculate expiry (5-10 minutes from now)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);

      // 5. Create token record in DB
      const tokenRecord = await prisma.propertyReviewToken.create({
        data: {
          token,
          propertyId,
          ownerId,
          expiresAt
        },
        select: {
          token: true,
          propertyId: true,
          expiresAt: true
        }
      });

      logger.info('Property review token generated', {
        propertyId,
        ownerId,
        propertyTitle: property.title,
        expiryMinutes,
        tokenCreatedAt: new Date().toISOString()
      });

      return tokenRecord;
    } catch (error: any) {
      logger.error('Error generating property review token', {
        propertyId,
        ownerId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Verify token exists and hasn't expired
   * (Used later in auto-login flow)
   *
   * @param token - The review token
   * @returns Token record or null if invalid/expired
   */
  static async verifyToken(token: string) {
    const prisma = getPrismaClient();

    try {
      const tokenRecord = await prisma.propertyReviewToken.findUnique({
        where: { token },
        include: {
          property: {
            select: {
              id: true,
              title: true
            }
          },
          owner: {
            select: {
              id: true,
              email: true
            }
          }
        }
      });

      if (!tokenRecord) {
        return null;
      }

      // Check if expired
      if (new Date() > tokenRecord.expiresAt) {
        logger.warn('Property review token expired', {
          token: token.substring(0, 8) + '...',
          expiresAt: tokenRecord.expiresAt
        });
        return null;
      }

      // Check if already used
      if (tokenRecord.usedAt !== null) {
        logger.warn('Property review token already used', {
          token: token.substring(0, 8) + '...',
          usedAt: tokenRecord.usedAt
        });
        return null;
      }

      return tokenRecord;
    } catch (error: any) {
      logger.error('Error verifying property review token', {
        error: error.message
      });
      return null;
    }
  }

  /**
   * Mark token as used (single-use enforcement)
   * Called after successful auto-login
   *
   * @param token - The review token
   */
  static async markTokenAsUsed(token: string): Promise<void> {
    const prisma = getPrismaClient();

    try {
      await prisma.propertyReviewToken.update({
        where: { token },
        data: {
          usedAt: new Date()
        }
      });

      logger.info('Property review token marked as used', {
        token: token.substring(0, 8) + '...'
      });
    } catch (error: any) {
      logger.error('Error marking token as used', {
        error: error.message
      });
      // Non-blocking: log but don't throw
    }
  }
}
