import { PrismaClient } from '@prisma/client';
import { PlanLimitService } from './PlanLimitService';
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
export declare class ContactService {
    private prisma;
    private planLimitService;
    constructor(prismaClient?: PrismaClient, planLimitService?: PlanLimitService);
    /**
     * Detect PostgreSQL serialization failure.
     */
    private isSerializationError;
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
    unlockContact(tenantId: string, roomId: string): Promise<UnlockContactResult>;
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
    readContact(tenantId: string, roomId: string): Promise<ReadContactResult>;
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
    private executeUnlockTransaction;
}
//# sourceMappingURL=ContactService.d.ts.map