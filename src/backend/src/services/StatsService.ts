import { getPrismaClient } from '../utils/prisma';
import { ReviewStatus } from '@prisma/client';
import { logger } from '../utils/logger';

export interface PlatformStats {
  totalProperties: number;
  totalCities: number;
  totalOwners: number;
}

export class StatsService {
  private prisma = getPrismaClient();

  async getPlatformStats(): Promise<PlatformStats> {
    try {
      // ✅ SAFE OPTIMIZATION: Use Prisma Promise.all() for parallel queries
      // This achieves same performance as raw SQL with proper Prisma error handling
      const [totalProperties, distinctCities, distinctOwners] = await Promise.all([
        // Count approved and active properties
        this.prisma.room.count({
          where: {
            isActive: true,
            reviewStatus: ReviewStatus.APPROVED,
          },
        }),
        // Get distinct cities with approved properties
        this.prisma.room.findMany({
          where: {
            isActive: true,
            reviewStatus: ReviewStatus.APPROVED,
          },
          distinct: ['city'],
          select: {
            city: true,
          },
        }),
        // Get distinct owners with approved properties
        this.prisma.room.findMany({
          where: {
            isActive: true,
            reviewStatus: ReviewStatus.APPROVED,
          },
          distinct: ['ownerId'],
          select: {
            ownerId: true,
          },
        }),
      ]);

      const totalCities = distinctCities.length;
      const totalOwners = distinctOwners.length;

      logger.info('Platform stats retrieved successfully', {
        totalProperties,
        totalCities,
        totalOwners,
      });

      return {
        totalProperties,
        totalCities,
        totalOwners,
      };
    } catch (error) {
      logger.error('Error retrieving platform stats', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error('Failed to retrieve platform stats');
    }
  }
}
