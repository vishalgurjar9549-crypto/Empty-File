import { getPrismaClient } from '../utils/prisma';
import { logger } from '../utils/logger';

/**
 * TenantDashboardService — MULTI-CITY ARCHITECTURE
 *
 * Returns all city subscriptions for the tenant.
 * Phone masking uses ANY active subscription (not city-specific for dashboard).
 */

export interface TenantDashboardBooking {
  id: string;
  roomId: string;
  moveInDate: string;
  message: string | null;
  status: string;
  createdAt: string;
  room: {
    id: string;
    title: string;
    city: string;
    pricePerMonth: number;
    images: string[];
  };
  owner: {
    name: string;
    phone: string | null;
  };
}
export interface TenantDashboardSubscription {
  id: string;
  plan: string;
  city: string;
  startedAt: string;
  expiresAt: string | null;
  isActive: boolean;
}
export interface TenantDashboardRecentView {
  id: string;
  title: string;
  city: string;
  pricePerMonth: number;
  images: string[];
  roomType: string;
  viewedAt: string;
}
export interface TenantDashboardData {
  bookings: TenantDashboardBooking[];
  subscriptions: TenantDashboardSubscription[];
  recentlyViewed: TenantDashboardRecentView[];
}

type DashboardRawRow = {
  bookings: any[];
  subscriptions: any[];
  recentlyViewed: any[];
};

export class TenantDashboardService {
  private prisma = getPrismaClient();

  /**
   * GET DASHBOARD — Aggregated endpoint
   *
   * MULTI-CITY: Returns ALL subscriptions (one per city).
   * Phone masking: visible if tenant has ANY active subscription or booking is APPROVED.
   */
  async getDashboard(tenantId: string): Promise<TenantDashboardData> {
    try {
      logger.info('[DASHBOARD DIAG] Fetching tenant dashboard...', {
        tenantId
      });

      const [dashboardRaw] = await this.prisma.$queryRaw<DashboardRawRow[]>`
        WITH bookings_data AS (
          SELECT
            b.id,
            b."roomId",
            to_char(b."moveInDate", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS "moveInDate",
            b.message,
            b.status,
            to_char(b."createdAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS "createdAt",
            jsonb_build_object(
              'id', r.id,
              'title', r.title,
              'city', r.city,
              'pricePerMonth', r."pricePerMonth",
              'images', r.images
            ) AS room,
            jsonb_build_object(
              'name', o.name,
              'phone', o.phone
            ) AS owner
          FROM "Booking" b
          JOIN "Room" r ON r.id = b."roomId"
          JOIN "User" o ON o.id = b."ownerId"
          WHERE b."tenantId" = ${tenantId}
          ORDER BY b."createdAt" DESC, b.id ASC
        ),
        subscriptions_data AS (
          SELECT
            id,
            plan,
            city,
            to_char("startedAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS "startedAt",
            CASE
              WHEN "expiresAt" IS NULL THEN NULL
              ELSE to_char("expiresAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
            END AS "expiresAt"
          FROM "TenantSubscription"
          WHERE "tenantId" = ${tenantId}
          ORDER BY "startedAt" DESC, id ASC
        ),
        recently_viewed_data AS (
          SELECT
            pv.id,
            to_char(pv."viewedAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS "viewedAt",
            jsonb_build_object(
              'id', r.id,
              'title', r.title,
              'city', r.city,
              'pricePerMonth', r."pricePerMonth",
              'images', r.images,
              'roomType', r."roomType"
            ) AS property
          FROM "PropertyView" pv
          JOIN "Room" r ON r.id = pv."propertyId"
          WHERE pv."tenantId" = ${tenantId}
            AND r."isActive" = true
            AND r."reviewStatus" = 'APPROVED'::"ReviewStatus"
          ORDER BY pv."viewedAt" DESC, pv.id ASC
          LIMIT 5
        )
        SELECT
          COALESCE(
            (
              SELECT jsonb_agg(
                jsonb_build_object(
                  'id', id,
                  'roomId', "roomId",
                  'moveInDate', "moveInDate",
                  'message', message,
                  'status', status,
                  'createdAt', "createdAt",
                  'room', room,
                  'owner', owner
                )
                ORDER BY "createdAt" DESC, id ASC
              )
              FROM bookings_data
            ),
            '[]'::jsonb
          ) AS bookings,
          COALESCE(
            (
              SELECT jsonb_agg(
                jsonb_build_object(
                  'id', id,
                  'plan', plan,
                  'city', city,
                  'startedAt', "startedAt",
                  'expiresAt', "expiresAt"
                )
                ORDER BY "startedAt" DESC, id ASC
              )
              FROM subscriptions_data
            ),
            '[]'::jsonb
          ) AS subscriptions,
          COALESCE(
            (
              SELECT jsonb_agg(
                jsonb_build_object(
                  'id', id,
                  'viewedAt', "viewedAt",
                  'property', property
                )
                ORDER BY "viewedAt" DESC, id ASC
              )
              FROM recently_viewed_data
            ),
            '[]'::jsonb
          ) AS "recentlyViewed"
      `;

      const bookingsRaw = Array.isArray(dashboardRaw?.bookings)
        ? dashboardRaw.bookings
        : [];
      const subscriptionsRaw = Array.isArray(dashboardRaw?.subscriptions)
        ? dashboardRaw.subscriptions
        : [];
      const viewsRaw = Array.isArray(dashboardRaw?.recentlyViewed)
        ? dashboardRaw.recentlyViewed
        : [];

      logger.info('[DASHBOARD DIAG] Dashboard query OK', {
        bookingCount: bookingsRaw.length,
        subscriptionCount: subscriptionsRaw.length,
        recentViewCount: viewsRaw.length
      });

      // Compute isActive for each subscription
      const now = new Date();
      const subscriptions: TenantDashboardSubscription[] = subscriptionsRaw.map((s: any) => ({
        id: s.id,
        plan: s.plan,
        city: s.city,
        startedAt: s.startedAt instanceof Date ? s.startedAt.toISOString() : s.startedAt,
        expiresAt: s.expiresAt ? s.expiresAt instanceof Date ? s.expiresAt.toISOString() : s.expiresAt : null,
        isActive: !s.expiresAt || (s.expiresAt instanceof Date ? s.expiresAt > now : new Date(s.expiresAt) > now)
      }));

      // Phone masking: visible if tenant has ANY active subscription
      const hasAnyActiveSubscription = subscriptions.some((s) => s.isActive);

      // Map bookings with owner phone masking
      const bookings: TenantDashboardBooking[] = bookingsRaw.map((b: any) => {
        const canSeePhone = hasAnyActiveSubscription || b.status === 'APPROVED';
        return {
          id: b.id,
          roomId: b.roomId,
          moveInDate: b.moveInDate instanceof Date ? b.moveInDate.toISOString() : b.moveInDate,
          message: b.message || null,
          status: b.status,
          createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt,
          room: {
            id: b.room.id,
            title: b.room.title,
            city: b.room.city,
            pricePerMonth: b.room.pricePerMonth,
            images: b.room.images || []
          },
          owner: {
            name: b.owner.name,
            phone: canSeePhone ? b.owner.phone || null : null
          }
        };
      });

      // Map recently viewed
      const recentlyViewed: TenantDashboardRecentView[] = viewsRaw.filter((v: any) => v.property !== null).map((v: any) => ({
        id: v.property.id,
        title: v.property.title,
        city: v.property.city,
        pricePerMonth: v.property.pricePerMonth,
        images: v.property.images || [],
        roomType: v.property.roomType,
        viewedAt: v.viewedAt instanceof Date ? v.viewedAt.toISOString() : v.viewedAt
      }));

      logger.info('Tenant dashboard fetched', {
        tenantId,
        bookingCount: bookings.length,
        subscriptionCount: subscriptions.length,
        recentViewCount: recentlyViewed.length
      });

      return {
        bookings,
        subscriptions,
        recentlyViewed
      };
    } catch (err: any) {
      logger.error('[DASHBOARD DIAG] DASHBOARD QUERY FAILED:', {
        name: err?.name,
        message: err?.message,
        code: err?.code,
        meta: err?.meta
      });
      throw err;
    }
  }

  /**
   * FETCH BOOKINGS
   */
  private async fetchBookings(tenantId: string) {
    return this.prisma.booking.findMany({
      where: {
        tenantId
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      include: {
        room: {
          select: {
            id: true,
            title: true,
            city: true,
            pricePerMonth: true,
            images: true
          }
        },
        owner: {
          select: {
            name: true,
            phone: true
          }
        }
      }
    });
  }

  /**
   * FETCH SUBSCRIPTIONS — ALL CITIES
   *
   * Uses findMany to return every subscription row for this tenant.
   * One row per city.
   */
  private async fetchSubscriptions(tenantId: string) {
    return this.prisma.tenantSubscription.findMany({
      where: {
        tenantId
      },
      orderBy: [{ startedAt: 'desc' }, { id: 'asc' }]
    });
  }

  /**
   * FETCH RECENTLY VIEWED
   */
  private async fetchRecentlyViewed(tenantId: string) {
    return this.prisma.propertyView.findMany({
      where: {
        tenantId,
        property: {
          isActive: true,
          reviewStatus: 'APPROVED'
        }
      },
      orderBy: [{ viewedAt: 'desc' }, { id: 'asc' }],
      take: 5,
      select: {
        viewedAt: true,
        property: {
          select: {
            id: true,
            title: true,
            city: true,
            pricePerMonth: true,
            images: true,
            roomType: true
          }
        }
      }
    });
  }
}
