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
      const [stats] = await this.prisma.$queryRaw<PlatformStats[]>`
        WITH grouped_stats AS (
          SELECT
            GROUPING(city) AS city_grouped,
            GROUPING("ownerId") AS owner_grouped,
            COUNT(*)::int AS row_count
          FROM "Room"
          WHERE "isActive" = true
            AND "reviewStatus" = ${ReviewStatus.APPROVED}::"ReviewStatus"
          GROUP BY GROUPING SETS ((), (city), ("ownerId"))
        )
        SELECT
          COALESCE(
            MAX(row_count) FILTER (
              WHERE city_grouped = 1 AND owner_grouped = 1
            ),
            0
          )::int AS "totalProperties",
          COUNT(*) FILTER (
            WHERE city_grouped = 0 AND owner_grouped = 1
          )::int AS "totalCities",
          COUNT(*) FILTER (
            WHERE city_grouped = 1 AND owner_grouped = 0
          )::int AS "totalOwners"
        FROM grouped_stats
      `;

      const totalProperties = stats?.totalProperties ?? 0;
      const totalCities = stats?.totalCities ?? 0;
      const totalOwners = stats?.totalOwners ?? 0;

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
