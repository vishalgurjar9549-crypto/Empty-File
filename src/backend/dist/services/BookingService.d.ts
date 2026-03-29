import { IBookingRepository } from '../repositories/interfaces';
import { IRoomRepository } from '../repositories/interfaces';
/**
 * PRODUCTION-GRADE BOOKING SERVICE
 *
 * Staff Engineer improvements:
 * 1. Uses typed errors (not generic Error)
 * 2. Delegates atomic creation to repository transaction
 * 3. Proper date normalization with timezone safety
 * 4. Status transition validation with typed errors
 * 5. Ownership verification on all mutations
 * 6. Notification trigger point (architectural hook)
 */
export declare class BookingService {
    private bookingRepository;
    private roomRepository;
    constructor(bookingRepository: IBookingRepository, roomRepository: IRoomRepository);
    /**
     * CREATE BOOKING — Production Grade (Outbox Pattern)
     *
     * ✅ PHONE REQUIREMENT ENFORCEMENT (SIMPLIFIED):
     * User must provide phone number before creating bookings.
     * No OTP verification required - just phone presence check.
     */
    createBooking(bookingData: {
        roomId: string;
        userId?: string;
        tenantId?: string;
        tenantName: string;
        tenantEmail: string;
        tenantPhone: string;
        moveInDate: string;
        message?: string;
    }): Promise<import("../models/Booking").Booking>;
    /**
     * NORMALIZE MOVE-IN DATE — Timezone Safe
     *
     * Never trust frontend dates. This method:
     * 1. Parses the date string
     * 2. Rejects invalid dates (NaN)
     * 3. Rejects past dates
     * 4. Normalizes to midnight UTC (strips time component)
     */
    private normalizeMoveInDate;
    getUserBookings(userId: string): Promise<{
        bookings: import("../models/Booking").Booking[];
        total: number;
    }>;
    getOwnerBookings(ownerId: string): Promise<{
        bookings: import("../models/Booking").Booking[];
        total: number;
    }>;
    getBookingById(bookingId: string): Promise<import("../models/Booking").Booking | null>;
    /**
     * UPDATE BOOKING STATUS — PRODUCTION FIX
     *
     * Now wrapped in a Prisma $transaction that:
     * 1. Validates the booking exists and caller is owner
     * 2. Validates status transition
     * 3. Atomically updates status with optimistic lock (WHERE status = current)
     * 4. Writes BOOKING_STATUS_CHANGED outbox event in SAME transaction
     *
     * If any step fails, entire transaction rolls back. Zero silent status changes.
     */
    updateBookingStatus(bookingId: string, status: string, userId?: string): Promise<{
        id: any;
        roomId: any;
        ownerId: any;
        tenantId: any;
        tenantName: any;
        tenantEmail: any;
        tenantPhone: any;
        moveInDate: any;
        message: any;
        status: any;
        createdAt: any;
        updatedAt: any;
    }>;
    /**
     * CANCEL BOOKING — FIXED: Optimistic locking
     */
    cancelBooking(bookingId: string, userId: string): Promise<import("../models/Booking").Booking>;
}
//# sourceMappingURL=BookingService.d.ts.map