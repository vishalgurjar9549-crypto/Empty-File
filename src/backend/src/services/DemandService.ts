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

const CONTACT_EVENT_TYPES = [EventType.CONTACT_UNLOCK, EventType.CONTACT_ACCESS];

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

    const [totalViews, totalContacts, todayViews, todayContacts] =
      await Promise.all([
        this.prisma.event.count({
          where: {
            propertyId,
            type: EventType.PROPERTY_VIEW,
            createdAt: { gte: sevenDaysAgo },
          },
        }),
        this.prisma.event.count({
          where: {
            propertyId,
            type: { in: CONTACT_EVENT_TYPES },
            createdAt: { gte: sevenDaysAgo },
          },
        }),
        this.prisma.event.count({
          where: {
            propertyId,
            type: EventType.PROPERTY_VIEW,
            createdAt: { gte: twentyFourHoursAgo },
          },
        }),
        this.prisma.event.count({
          where: {
            propertyId,
            type: { in: CONTACT_EVENT_TYPES },
            createdAt: { gte: twentyFourHoursAgo },
          },
        }),
      ]);

    return {
      totalViews,
      totalContacts,
      todayViews,
      todayContacts,
    };
  }

  async getDemandMap(propertyIds: string[]): Promise<Map<string, RoomDemandSummary>> {
    const uniqueIds = Array.from(new Set(propertyIds.filter(Boolean)));
    const demandMap = new Map<string, RoomDemandSummary>();

    if (uniqueIds.length === 0) {
      return demandMap;
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const groupedCounts = await this.prisma.event.groupBy({
      by: ["propertyId", "type"],
      where: {
        propertyId: { in: uniqueIds },
        createdAt: { gte: sevenDaysAgo },
        type: {
          in: [EventType.PROPERTY_VIEW, ...CONTACT_EVENT_TYPES],
        },
      },
      _count: {
        _all: true,
      },
    });

    uniqueIds.forEach((propertyId) => {
      demandMap.set(propertyId, {
        weeklyViews: 0,
        weeklyContacts: 0,
      });
    });

    groupedCounts.forEach((row) => {
      if (!row.propertyId) {
        return;
      }

      const current = demandMap.get(row.propertyId) || {
        weeklyViews: 0,
        weeklyContacts: 0,
      };

      if (row.type === EventType.PROPERTY_VIEW) {
        current.weeklyViews += row._count._all;
      } else if (
        row.type === EventType.CONTACT_UNLOCK ||
        row.type === EventType.CONTACT_ACCESS
      ) {
        current.weeklyContacts += row._count._all;
      }

      demandMap.set(row.propertyId, current);
    });

    return demandMap;
  }
}
