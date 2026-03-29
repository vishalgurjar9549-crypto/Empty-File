import { IBookingRepository } from './interfaces';
import { Booking } from '../models/Booking';
/**
 * PRODUCTION-GRADE Prisma Booking Repository
 *
 * Key improvements:
 * 1. createBookingTransactional — atomic operation with prisma.$transaction
 * 2. Proper Prisma error mapping via mapPrismaError
 * 3. Typed errors instead of generic Error()
 * 4. Consistent date handling (Date objects, not strings)
 */
export declare class PrismaBookingRepository implements IBookingRepository {
    private prisma;
    constructor(prismaClient?: any);
    findById(id: string): Promise<Booking | null>;
    findAll(): Promise<Booking[]>;
    findByRoomId(roomId: string): Promise<Booking[]>;
    findByOwnerId(ownerId: string, page?: number, limit?: number): Promise<{
        bookings: Booking[];
        total: number;
    }>;
    findByTenantId(tenantId: string, page?: number, limit?: number): Promise<{
        bookings: Booking[];
        total: number;
    }>;
    create(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking>;
    /**
     * ATOMIC BOOKING CREATION — prisma.$transaction + OUTBOX EVENT
     *
     * Guarantees ALL of these in a single database transaction:
     * 1. Room exists
     * 2. Room isActive = true
     * 3. Owner exists (via room.ownerId FK)
     * 4. No duplicate booking (same tenant + room + moveInDate with active status)
     * 5. Creates booking
     * 6. ★ NEW: Writes BOOKING_CREATED outbox event
     *
     * If ANY step fails, the entire transaction rolls back.
     * No partial state. No race conditions. No ghost bookings.
     *
     * WHY THE OUTBOX EVENT IS IN THE SAME TRANSACTION:
     * Before: Booking committed → notification fired async → server crashes → notification LOST
     * After:  Booking + outbox event committed atomically → worker delivers notification later
     *
     * The outbox event is just another row in PostgreSQL. Same transaction,
     * same ACID guarantees. If the booking exists, the event exists.
     * If the transaction rolls back, neither exists. Zero ghost bookings.
     */
    createBookingTransactional(bookingData: {
        roomId: string;
        tenantId: string | null;
        tenantName: string;
        tenantEmail: string;
        tenantPhone: string;
        moveInDate: Date;
        message: string | null;
    }): Promise<Booking>;
    update(id: string, data: Partial<Booking>): Promise<Booking | null>;
    /**
     * OPTIMISTIC LOCK UPDATE — Only updates if current status matches expectedStatus.
     * Returns null if 0 rows affected (concurrent modification detected).
     */
    updateWithOptimisticLock(id: string, expectedStatus: string, data: Partial<Booking>): Promise<Booking | null>;
    delete(id: string): Promise<boolean>;
    /**
     * Convert Prisma model to domain model
     * Normalizes dates to ISO strings for API consistency
     * Normalizes status to lowercase for frontend compatibility
     */
    private toDomain;
}
//# sourceMappingURL=PrismaBookingRepository.d.ts.map