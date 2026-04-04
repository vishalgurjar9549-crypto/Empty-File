import { PrismaClient, Prisma, ReviewStatus, EventType } from '@prisma/client';
import { getPrismaClient } from '../utils/prisma';
import { logger } from '../utils/logger';
import { NotFoundError, ForbiddenError, AppError, BusinessLogicError, PhoneRequiredError } from '../errors/AppErrors';
import { PlanLimitService } from './PlanLimitService';
import { normalizeCity } from '../utils/normalize';
import { DemandService } from './DemandService';
import { notificationService } from './NotificationService';
const MAX_SERIALIZATION_RETRIES = 2;
export interface UnlockContactResult {
  ownerName: string;
  ownerPhone: string | null;
  ownerEmail: string;
  alreadyUnlocked: boolean;
}
export interface ReadContactResult {
  ownerName: string;
  ownerPhone: string | null;
  ownerEmail: string;
  alreadyUnlocked: boolean;
}
export class ContactService {
  private prisma: PrismaClient;
  private planLimitService: PlanLimitService;
  private demandService: DemandService;
  constructor(prismaClient?: PrismaClient, planLimitService?: PlanLimitService) {
    this.prisma = prismaClient || getPrismaClient();
    this.planLimitService = planLimitService || new PlanLimitService(this.prisma);
    this.demandService = new DemandService(this.prisma);
  }

  /**
   * Detect PostgreSQL serialization failure.
   */
  private isSerializationError(error: unknown): boolean {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return error.code === 'P2034';
    }
    if (error instanceof Error && 'code' in error) {
      return (error as any).code === '40001';
    }
    return false;
  }

  private async emitOwnerInterestNotification(params: {
    propertyId: string;
    eventType: 'CONTACT_UNLOCK' | 'CONTACT_ACCESS';
    timestamp: string;
  }): Promise<void> {
    try {
      const room = await this.prisma.room.findUnique({
        where: {
          id: params.propertyId
        },
        select: {
          id: true,
          title: true,
          ownerId: true
        }
      });

      if (!room) {
        return;
      }

      await notificationService.onOwnerContactInterest({
        ownerId: room.ownerId,
        propertyId: room.id,
        propertyTitle: room.title,
        eventType: params.eventType,
        timestamp: params.timestamp
      });
    } catch (error: any) {
      logger.warn('Failed to emit owner contact interest notification', {
        propertyId: params.propertyId,
        eventType: params.eventType,
        error: error?.message || 'Unknown error'
      });
    }
  }

  /**
   * CONTACT UNLOCK — Server-side authority over owner contact data.
   *
   * ✅ PHONE REQUIREMENT ENFORCEMENT (SIMPLIFIED):
   * User must provide phone number before unlocking contacts.
   * No OTP verification required - just phone presence check.
   *
   * MULTI-CITY FIX: Subscription lookup now uses composite key tenantId_city.
   * A Kota subscription can NEVER unlock Bangalore contacts.
   *
   * CONCURRENCY PROTECTION:
   * - Uses SERIALIZABLE isolation to prevent phantom reads at the limit boundary.
   * - Retries up to MAX_SERIALIZATION_RETRIES times on serialization conflicts.
   */
  async unlockContact(tenantId: string, roomId: string): Promise<UnlockContactResult> {
    // ── PHONE REQUIREMENT CHECK (SIMPLIFIED) ────────────────────────
    const user = await this.prisma.user.findUnique({
      where: {
        id: tenantId
      },
      select: {
        phone: true
      }
    });
    if (user && !user.phone) {
      throw new PhoneRequiredError();
    }
    let lastError: unknown;
    for (let attempt = 0; attempt <= MAX_SERIALIZATION_RETRIES; attempt++) {
      try {
        const result = await this.executeUnlockTransaction(tenantId, roomId);
        void this.emitOwnerInterestNotification({
          propertyId: roomId,
          eventType: result.alreadyUnlocked ? 'CONTACT_ACCESS' : 'CONTACT_UNLOCK',
          timestamp: new Date().toISOString()
        });
        return result;
      } catch (error: unknown) {
        lastError = error;
        if (!this.isSerializationError(error)) {
          throw error;
        }
        logger.warn('Serialization conflict in unlockContact, retrying', {
          tenantId,
          roomId,
          attempt: attempt + 1,
          maxRetries: MAX_SERIALIZATION_RETRIES
        });
      }
    }
    logger.error('unlockContact failed after all retries', {
      tenantId,
      roomId,
      attempts: MAX_SERIALIZATION_RETRIES + 1
    });
    throw new BusinessLogicError('Unable to process your request due to high demand. Please try again in a moment.');
  }

  /**
   * READ-ONLY contact access check.
   *
   * NO transactions. NO writes. NO counting. NO PropertyView creation.
   * Pure read path — backend remains authoritative.
   *
   * Logic:
   * 1. Check PropertyView (composite key: tenantId_propertyId)
   *    → If found: return owner contact (alreadyUnlocked = true)
   * 2. Check TenantSubscription (composite key: tenantId_city)
   *    → If paid + not expired: return owner contact (alreadyUnlocked = false)
   * 3. Otherwise: throw CONTACT_LOCKED (403)
   */
  async readContact(tenantId: string, roomId: string): Promise<ReadContactResult> {
    // ── 1. VALIDATE ROOM EXISTS ──────────────────────────────────────
    const room = await this.prisma.room.findUnique({
      where: {
        id: roomId
      },
      select: {
        id: true,
        city: true,
        isActive: true,
        reviewStatus: true,
        ownerId: true
      }
    });
    if (!room) {
      throw new NotFoundError('Room', roomId);
    }

    // ── 2. CHECK PROPERTY VIEW (composite key: tenantId + propertyId) ─
    const existingView = await this.prisma.propertyView.findUnique({
      where: {
        tenantId_propertyId: {
          tenantId,
          propertyId: roomId
        }
      }
    });
    if (existingView) {
      // Already unlocked — return contact immediately
      const owner = await this.prisma.user.findUnique({
        where: {
          id: room.ownerId
        },
        select: {
          name: true,
          phone: true,
          email: true
        }
      });
      if (!owner) {
        throw new NotFoundError('Owner', room.ownerId);
      }
      await this.demandService.recordEvent({
        type: EventType.CONTACT_ACCESS,
        propertyId: roomId,
        userId: tenantId,
        metadata: {
          source: 'read_contact',
          accessMode: 'previous_unlock'
        }
      });
      void this.emitOwnerInterestNotification({
        propertyId: roomId,
        eventType: 'CONTACT_ACCESS',
        timestamp: new Date().toISOString()
      });
      return {
        ownerName: owner.name,
        ownerPhone: owner.phone,
        ownerEmail: owner.email,
        alreadyUnlocked: true
      };
    }

    // ── 3. CHECK SUBSCRIPTION (composite key: tenantId + city) ────────
    const normalizedRoomCity = normalizeCity(room.city);
    const subscription = await this.prisma.tenantSubscription.findUnique({
      where: {
        tenantId_city: {
          tenantId,
          city: normalizedRoomCity
        }
      }
    });
    if (subscription) {
      const now = new Date();
      const isExpired = subscription.expiresAt && subscription.expiresAt <= now;
      const effectivePlan = !isExpired ? subscription.plan.toUpperCase() : 'FREE';
      if (effectivePlan !== 'FREE') {
        // Paid plan, not expired — return contact WITHOUT creating PropertyView
        const owner = await this.prisma.user.findUnique({
          where: {
            id: room.ownerId
          },
          select: {
            name: true,
            phone: true,
            email: true
          }
        });
        if (!owner) {
          throw new NotFoundError('Owner', room.ownerId);
        }
        await this.demandService.recordEvent({
          type: EventType.CONTACT_ACCESS,
          propertyId: roomId,
          userId: tenantId,
          metadata: {
            source: 'read_contact',
            accessMode: 'active_plan',
            plan: effectivePlan
          }
        });
        void this.emitOwnerInterestNotification({
          propertyId: roomId,
          eventType: 'CONTACT_ACCESS',
          timestamp: new Date().toISOString()
        });
        return {
          ownerName: owner.name,
          ownerPhone: owner.phone,
          ownerEmail: owner.email,
          alreadyUnlocked: false
        };
      }
    }

    // ── 4. CONTACT LOCKED ─────────────────────────────────────────────
    throw new AppError(403, 'Contact is locked. Unlock to view owner details.', 'CONTACT_LOCKED');
  }

  /**
   * Core transaction logic — MULTI-CITY ARCHITECTURE
   *
   * CRITICAL FIX: Step 2 now uses composite key tenantId_city
   * to look up the subscription for the SPECIFIC city of the room.
   * This eliminates the cross-city authorization bypass.
   *
   * Step order:
   * 1. Validate room (exists + active + approved)
   * 2. Normalize city
   * 3. Fetch subscription (composite key: tenantId + city)
   * 4. Determine effectivePlan
   * 5. Resolve limit via PlanLimitService (plan-aware, city-aware)
   * 6. Check existingView (dedup)
   * 7. Count PropertyView if needed (limit enforcement)
   * 8. Create PropertyView if new
   * 9. Fetch and return owner contact
   */
  private async executeUnlockTransaction(tenantId: string, roomId: string): Promise<UnlockContactResult> {
    return await this.prisma.$transaction(async (tx) => {
      // ================================================================
      // 1. VALIDATE ROOM EXISTS + ACTIVE + APPROVED
      // ================================================================
      const room = await tx.room.findUnique({
        where: {
          id: roomId
        },
        select: {
          id: true,
          city: true,
          isActive: true,
          reviewStatus: true,
          ownerId: true
        }
      });
      if (!room) {
        throw new NotFoundError('Room', roomId);
      }
      if (!room.isActive) {
        throw new AppError(400, 'This property is no longer active', 'ROOM_INACTIVE');
      }
      if (room.reviewStatus !== ReviewStatus.APPROVED) {
        throw new AppError(400, 'This property is not yet approved for viewing', 'ROOM_NOT_APPROVED');
      }

      // ================================================================
      // 2. NORMALIZE CITY
      // ================================================================
      const normalizedRoomCity = normalizeCity(room.city);

      // ================================================================
      // 3. FETCH SUBSCRIPTION — COMPOSITE KEY: tenantId + room.city
      // ================================================================
      const subscription = await tx.tenantSubscription.findUnique({
        where: {
          tenantId_city: {
            tenantId,
            city: normalizedRoomCity
          }
        }
      });

      // ================================================================
      // 4. DETERMINE EFFECTIVE PLAN
      // ================================================================
      let effectivePlan = 'FREE';
      if (subscription) {
        const now = new Date();
        const isExpired = subscription.expiresAt && subscription.expiresAt <= now;
        if (!isExpired) {
          effectivePlan = subscription.plan.toUpperCase();
        }
      }

      // ================================================================
      // 5. RESOLVE LIMIT — plan-aware, city-aware
      //    Uses actual effectivePlan (not hardcoded FREE).
      //    Paid plans return null (unlimited). FREE returns numeric limit.
      //    City-specific overrides are respected.
      // ================================================================
      const limit = await this.planLimitService.getEffectiveLimit(effectivePlan, normalizedRoomCity);

      // ================================================================
      // 6. CHECK IF ALREADY UNLOCKED (dedup before limit check)
      // ================================================================
      const existingView = await tx.propertyView.findUnique({
        where: {
          tenantId_propertyId: {
            tenantId,
            propertyId: roomId
          }
        }
      });
      const alreadyUnlocked = !!existingView;

      // ================================================================
      // 7. ENFORCE LIMIT (city-scoped) — only if NOT already unlocked
      // ================================================================
      if (!alreadyUnlocked && limit !== null) {
        const cityViewCount = await tx.propertyView.count({
          where: {
            tenantId,
            city: normalizedRoomCity
          }
        });
        if (cityViewCount >= limit) {
          throw new AppError(403, `You have reached the limit of ${limit} contact unlocks in ${room.city}. Please upgrade your subscription.`, 'CONTACT_LIMIT_REACHED');
        }
      }

      // ================================================================
      // 8. CREATE PROPERTY VIEW (prevent duplicate increment)
      // ================================================================
      if (!alreadyUnlocked) {
        await tx.propertyView.create({
          data: {
            tenantId,
            propertyId: roomId,
            city: normalizedRoomCity
          }
        });
        logger.info('Contact unlocked', {
          tenantId,
          roomId,
          city: normalizedRoomCity,
          plan: effectivePlan
        });
      }

      await tx.event.create({
        data: {
          type: alreadyUnlocked ? EventType.CONTACT_ACCESS : EventType.CONTACT_UNLOCK,
          propertyId: roomId,
          userId: tenantId,
          metadata: {
            city: normalizedRoomCity,
            plan: effectivePlan,
            source: 'unlock_contact'
          }
        }
      });

      // ================================================================
      // 9. FETCH AND RETURN OWNER CONTACT — ONLY NOW
      // ================================================================
      const owner = await tx.user.findUnique({
        where: {
          id: room.ownerId
        },
        select: {
          name: true,
          phone: true,
          email: true
        }
      });
      if (!owner) {
        throw new NotFoundError('Owner', room.ownerId);
      }
      return {
        ownerName: owner.name,
        ownerPhone: owner.phone,
        ownerEmail: owner.email,
        alreadyUnlocked
      };
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      timeout: 15000
    });
  }
}
