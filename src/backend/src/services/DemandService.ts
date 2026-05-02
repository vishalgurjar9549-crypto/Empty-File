import { EventType, Prisma, PrismaClient } from "@prisma/client";
import { getPrismaClient } from "../utils/prisma";
import { logger } from "../utils/logger";

export interface DemandStats {
  totalViews: number;
  totalContacts: number;
  todayViews: number;
  todayContacts: number;
}

export interface RoomDemandSummary {
  weeklyViews: number;
  weeklyContacts: number;
}

export class DemandService {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || getPrismaClient();
  }

  async recordEvent(params: {
    type: EventType;
    propertyId?: string | null;
    userId?: string | null;
    metadata?: Prisma.InputJsonValue;
  }): Promise<void> {
    try {
      await this.prisma.event.create({
        data: {
          type: params.type,
          propertyId: params.propertyId ?? null,
          userId: params.userId ?? null,
          metadata: params.metadata ?? undefined,
        },
      });
    } catch (error: any) {
      logger.warn("Failed to record demand event", {
        type: params.type,
        propertyId: params.propertyId ?? null,
        userId: params.userId,
        error: error?.message || "Unknown error",
      });
    }
  }

  async getDemandStats(propertyId: string): Promise<DemandStats> {
    const now = Date.now();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);

    const [stats] = await this.prisma.$queryRaw<DemandStats[]>`
      SELECT
        COUNT(*) FILTER (
          WHERE type = ${EventType.PROPERTY_VIEW}::"EventType"
        )::int AS "totalViews",
        COUNT(*) FILTER (
          WHERE type IN (
            ${EventType.CONTACT_UNLOCK}::"EventType",
            ${EventType.CONTACT_ACCESS}::"EventType"
          )
        )::int AS "totalContacts",
        COUNT(*) FILTER (
          WHERE type = ${EventType.PROPERTY_VIEW}::"EventType"
            AND "createdAt" >= ${twentyFourHoursAgo}
        )::int AS "todayViews",
        COUNT(*) FILTER (
          WHERE type IN (
            ${EventType.CONTACT_UNLOCK}::"EventType",
            ${EventType.CONTACT_ACCESS}::"EventType"
          )
            AND "createdAt" >= ${twentyFourHoursAgo}
        )::int AS "todayContacts"
      FROM events
      WHERE "propertyId" = ${propertyId}
        AND "createdAt" >= ${sevenDaysAgo}
        AND type IN (
          ${EventType.PROPERTY_VIEW}::"EventType",
          ${EventType.CONTACT_UNLOCK}::"EventType",
          ${EventType.CONTACT_ACCESS}::"EventType"
        )
    `;

    return {
      totalViews: stats?.totalViews ?? 0,
      totalContacts: stats?.totalContacts ?? 0,
      todayViews: stats?.todayViews ?? 0,
      todayContacts: stats?.todayContacts ?? 0,
    };
  }

  async getDemandMap(propertyIds: string[]): Promise<Map<string, RoomDemandSummary>> {
    const uniqueIds = Array.from(new Set(propertyIds.filter(Boolean)));
    const demandMap = new Map<string, RoomDemandSummary>();

    if (uniqueIds.length === 0) {
      return demandMap;
    }

    // Initialize all properties with 0 values
    uniqueIds.forEach((propertyId) => {
      demandMap.set(propertyId, {
        weeklyViews: 0,
        weeklyContacts: 0,
      });
    });

    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const groupedCounts = await this.prisma.$queryRaw<
        Array<{
          propertyId: string;
          weeklyViews: number;
          weeklyContacts: number;
        }>
      >`
        SELECT
          "propertyId",
          COUNT(*) FILTER (
            WHERE type = ${EventType.PROPERTY_VIEW}::"EventType"
          )::int AS "weeklyViews",
          COUNT(*) FILTER (
            WHERE type IN (
              ${EventType.CONTACT_UNLOCK}::"EventType",
              ${EventType.CONTACT_ACCESS}::"EventType"
            )
          )::int AS "weeklyContacts"
        FROM events
        WHERE "propertyId" IN (${Prisma.join(uniqueIds)})
          AND "createdAt" >= ${sevenDaysAgo}
          AND type IN (
            ${EventType.PROPERTY_VIEW}::"EventType",
            ${EventType.CONTACT_UNLOCK}::"EventType",
            ${EventType.CONTACT_ACCESS}::"EventType"
          )
        GROUP BY "propertyId"
      `;

      groupedCounts.forEach((row) => {
        if (!row.propertyId) {
          return;
        }

        demandMap.set(row.propertyId, {
          weeklyViews: row.weeklyViews,
          weeklyContacts: row.weeklyContacts,
        });
      });

      return demandMap;
    } catch (error) {
      logger.error('Error fetching demand map', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        propertyIds: uniqueIds.length,
      });
      // Return initialized empty map on error (safe fallback)
      return demandMap;
    }
  }
}
