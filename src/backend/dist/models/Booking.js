"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBookingStatusSchema = exports.CreateBookingSchema = exports.BookingStatus = void 0;
const zod_1 = require("zod");
// ============================================================================
// ENUMS
// ============================================================================
exports.BookingStatus = zod_1.z.enum(['PENDING', 'APPROVED', 'REJECTED']);
// ============================================================================
// PRODUCTION-GRADE VALIDATION SCHEMAS
// ============================================================================
/**
 * CreateBookingSchema — Staff Engineer Level
 *
 * CHANGES FROM PREVIOUS VERSION:
 * 1. roomId: Now validates UUID format (was just min(1))
 * 2. tenantName: min(2), max(100), trimmed
 * 3. tenantEmail: email + lowercase transform + max(255)
 * 4. tenantPhone: 10-15 digits only, strips non-digits
 * 5. moveInDate: ISO date string, MUST be future date (server-enforced)
 * 6. message: optional, max 500 chars, trimmed
 *
 * REJECTS invalid requests BEFORE hitting Prisma.
 */
exports.CreateBookingSchema = zod_1.z.object({
    roomId: zod_1.z.string({
        required_error: 'Room ID is required'
    }).uuid('Room ID must be a valid UUID'),
    tenantName: zod_1.z.string({
        required_error: 'Tenant name is required'
    }).trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
    tenantEmail: zod_1.z.string({
        required_error: 'Email is required'
    }).email('Invalid email address').max(255, 'Email must be at most 255 characters').transform((val) => val.toLowerCase().trim()),
    tenantPhone: zod_1.z.string({
        required_error: 'Phone number is required'
    }).transform((val) => val.replace(/[\s\-\+\(\)]/g, '')) // Strip formatting
        .pipe(zod_1.z.string().regex(/^\d{10,15}$/, 'Phone must be 10-15 digits')),
    moveInDate: zod_1.z.string({
        required_error: 'property visit date is required'
    }).refine((val) => {
        const date = new Date(val);
        return !isNaN(date.getTime());
    }, {
        message: 'Invalid date format'
    }).refine((val) => {
        const date = new Date(val);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
    }, {
        message: 'Move-in date must be today or in the future'
    }),
    message: zod_1.z.string().trim().max(500, 'Message must be at most 500 characters').optional().nullable()
});
exports.UpdateBookingStatusSchema = zod_1.z.object({
    status: exports.BookingStatus
});
//# sourceMappingURL=Booking.js.map