"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const AppErrors_1 = require("../errors/AppErrors");
const logger_1 = require("../utils/logger");
const prisma_1 = require("../utils/prisma");
const OutboxWriter_1 = require("./OutboxWriter");
const OutboxEventTypes_1 = require("./OutboxEventTypes");
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
class BookingService {
    constructor(bookingRepository, roomRepository) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        // Bind methods to preserve 'this' context
        this.createBooking = this.createBooking.bind(this);
        this.getUserBookings = this.getUserBookings.bind(this);
        this.getOwnerBookings = this.getOwnerBookings.bind(this);
        this.getBookingById = this.getBookingById.bind(this);
        this.updateBookingStatus = this.updateBookingStatus.bind(this);
        this.cancelBooking = this.cancelBooking.bind(this);
    }
    /**
     * CREATE BOOKING — Production Grade (Outbox Pattern)
     *
     * ✅ PHONE REQUIREMENT ENFORCEMENT (SIMPLIFIED):
     * User must provide phone number before creating bookings.
     * No OTP verification required - just phone presence check.
     */
    async createBooking(bookingData) {
        // ── PHONE REQUIREMENT CHECK (SIMPLIFIED) ────────────────────────
        if (bookingData.userId || bookingData.tenantId) {
            const userId = bookingData.userId || bookingData.tenantId;
            const prisma = (0, prisma_1.getPrismaClient)();
            const user = await prisma.user.findUnique({
                where: {
                    id: userId
                },
                select: {
                    phone: true
                }
            });
            if (user && !user.phone) {
                throw new AppErrors_1.PhoneRequiredError();
            }
        }
        // STEP 1: Normalize moveInDate with timezone safety
        const normalizedDate = this.normalizeMoveInDate(bookingData.moveInDate);
        // STEP 2: Create booking via atomic transaction
        // This now handles: room exists, isActive, owner exists, duplicate check,
        // AND writes the BOOKING_CREATED outbox event — all atomically.
        const booking = await this.bookingRepository.createBookingTransactional({
            roomId: bookingData.roomId,
            tenantId: bookingData.userId || bookingData.tenantId || null,
            tenantName: bookingData.tenantName,
            tenantEmail: bookingData.tenantEmail,
            tenantPhone: bookingData.tenantPhone,
            moveInDate: normalizedDate,
            message: bookingData.message || null
        });
        // ★ NO MORE fire-and-forget notification here.
        // The outbox worker handles notification delivery with:
        // - Guaranteed delivery (persisted in DB)
        // - Exponential backoff retries
        // - Dead-letter queue for poison pills
        // - Idempotent consumers (no duplicate notifications)
        logger_1.logger.info('Booking created successfully (outbox event queued)', {
            bookingId: booking.id,
            roomId: booking.roomId,
            tenantEmail: booking.tenantEmail
        });
        return booking;
    }
    /**
     * NORMALIZE MOVE-IN DATE — Timezone Safe
     *
     * Never trust frontend dates. This method:
     * 1. Parses the date string
     * 2. Rejects invalid dates (NaN)
     * 3. Rejects past dates
     * 4. Normalizes to midnight UTC (strips time component)
     */
    normalizeMoveInDate(dateString) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new AppErrors_1.InvalidDateError(`Invalid date: "${dateString}". Use ISO 8601 format (YYYY-MM-DD).`);
        }
        const normalized = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const today = new Date();
        const todayNormalized = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
        if (normalized < todayNormalized) {
            throw new AppErrors_1.InvalidDateError('Move-in date must be today or in the future');
        }
        return normalized;
    }
    async getUserBookings(userId) {
        return this.bookingRepository.findByTenantId(userId);
    }
    async getOwnerBookings(ownerId) {
        return this.bookingRepository.findByOwnerId(ownerId);
    }
    async getBookingById(bookingId) {
        return this.bookingRepository.findById(bookingId);
    }
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
    async updateBookingStatus(bookingId, status, userId) {
        const booking = await this.bookingRepository.findById(bookingId);
        if (!booking) {
            throw new AppErrors_1.NotFoundError('Booking', bookingId);
        }
        // Verify caller is the room owner
        if (userId && booking.ownerId !== userId) {
            throw new AppErrors_1.ForbiddenError('Only the property owner can update booking status');
        }
        // Validate status transitions
        const validTransitions = {
            PENDING: ['APPROVED', 'REJECTED'],
            APPROVED: ['REJECTED']
        };
        const currentStatus = booking.status.toUpperCase();
        const newStatus = status.toUpperCase();
        const allowed = validTransitions[currentStatus] || [];
        if (!allowed.includes(newStatus)) {
            throw new AppErrors_1.InvalidStatusTransitionError(currentStatus, newStatus);
        }
        // Atomic: status update + outbox event in single transaction
        const prisma = (0, prisma_1.getPrismaClient)();
        const result = await prisma.$transaction(async (tx) => {
            // Optimistic lock: only update if status hasn't changed since we read it
            const updateResult = await tx.booking.updateMany({
                where: {
                    id: bookingId,
                    status: currentStatus
                },
                data: {
                    status: newStatus
                }
            });
            if (updateResult.count === 0) {
                throw new AppErrors_1.BusinessLogicError('Booking was modified concurrently. Please retry.');
            }
            // Write BOOKING_STATUS_CHANGED outbox event atomically
            const outboxPayload = {
                bookingId: booking.id,
                roomId: booking.roomId,
                ownerId: booking.ownerId,
                tenantId: booking.tenantId || null,
                tenantEmail: booking.tenantEmail,
                previousStatus: currentStatus,
                newStatus: newStatus,
                changedBy: userId || 'SYSTEM',
                changedAt: new Date().toISOString()
            };
            await (0, OutboxWriter_1.writeOutboxEvent)(tx, {
                aggregateType: OutboxEventTypes_1.OutboxAggregateType.BOOKING,
                aggregateId: booking.id,
                eventType: OutboxEventTypes_1.OutboxEventType.BOOKING_STATUS_CHANGED,
                payload: outboxPayload
            });
            // Fetch updated booking
            const updated = await tx.booking.findUnique({
                where: {
                    id: bookingId
                }
            });
            return updated;
        }, {
            isolationLevel: 'Serializable',
            timeout: 10000
        });
        if (!result) {
            throw new AppErrors_1.BusinessLogicError('Failed to update booking status.');
        }
        logger_1.logger.info('Booking status updated with outbox event', {
            bookingId,
            from: currentStatus,
            to: newStatus
        });
        return {
            id: result.id,
            roomId: result.roomId,
            ownerId: result.ownerId,
            tenantId: result.tenantId,
            tenantName: result.tenantName,
            tenantEmail: result.tenantEmail,
            tenantPhone: result.tenantPhone,
            moveInDate: result.moveInDate instanceof Date ? result.moveInDate.toISOString() : result.moveInDate,
            message: result.message,
            status: typeof result.status === 'string' ? result.status.toLowerCase() : result.status,
            createdAt: result.createdAt instanceof Date ? result.createdAt.toISOString() : result.createdAt,
            updatedAt: result.updatedAt instanceof Date ? result.updatedAt.toISOString() : result.updatedAt
        };
    }
    /**
     * CANCEL BOOKING — FIXED: Optimistic locking
     */
    async cancelBooking(bookingId, userId) {
        const booking = await this.bookingRepository.findById(bookingId);
        if (!booking) {
            throw new AppErrors_1.NotFoundError('Booking', bookingId);
        }
        if (booking.tenantId !== userId) {
            throw new AppErrors_1.ForbiddenError('Unauthorized to cancel this booking');
        }
        if (booking.status.toUpperCase() !== 'PENDING') {
            throw new AppErrors_1.BusinessLogicError('Only pending bookings can be cancelled');
        }
        const result = await this.bookingRepository.updateWithOptimisticLock(bookingId, 'PENDING', {
            status: 'REJECTED'
        });
        if (!result) {
            throw new AppErrors_1.BusinessLogicError('Booking was modified concurrently. Please retry.');
        }
        return result;
    }
}
exports.BookingService = BookingService;
//# sourceMappingURL=BookingService.js.map