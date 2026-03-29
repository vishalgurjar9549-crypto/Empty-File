import { z } from 'zod';
export declare const BookingStatus: z.ZodEnum<["PENDING", "APPROVED", "REJECTED"]>;
export type BookingStatus = z.infer<typeof BookingStatus>;
export interface Booking {
    id: string;
    roomId: string;
    ownerId: string;
    tenantId?: string;
    tenantName: string;
    tenantEmail: string;
    tenantPhone: string;
    moveInDate: string;
    message?: string;
    status: BookingStatus;
    createdAt: string;
    updatedAt: string;
}
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
export declare const CreateBookingSchema: z.ZodObject<{
    roomId: z.ZodString;
    tenantName: z.ZodString;
    tenantEmail: z.ZodEffects<z.ZodString, string, string>;
    tenantPhone: z.ZodPipeline<z.ZodEffects<z.ZodString, string, string>, z.ZodString>;
    moveInDate: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    message: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    roomId: string;
    tenantEmail: string;
    moveInDate: string;
    tenantName: string;
    tenantPhone: string;
    message?: string | null | undefined;
}, {
    roomId: string;
    tenantEmail: string;
    moveInDate: string;
    tenantName: string;
    tenantPhone: string;
    message?: string | null | undefined;
}>;
export declare const UpdateBookingStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["PENDING", "APPROVED", "REJECTED"]>;
}, "strip", z.ZodTypeAny, {
    status: "PENDING" | "APPROVED" | "REJECTED";
}, {
    status: "PENDING" | "APPROVED" | "REJECTED";
}>;
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof UpdateBookingStatusSchema>;
//# sourceMappingURL=Booking.d.ts.map