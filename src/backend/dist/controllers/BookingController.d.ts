import { Response, NextFunction } from 'express';
import { Request } from 'express';
import { BookingService } from '../services/BookingService';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class BookingController {
    private bookingService;
    constructor(bookingService: BookingService);
    /**
     * CREATE BOOKING
     * FIX: Use handleError (which checks errors/AppErrors.ts) instead of next()
     *      which delegates to error.middleware.ts with a DIFFERENT AppError class.
     */
    createBooking: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * GET BOOKING BY ID — FIXED: Added authorization check
     */
    getBookingById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * CANCEL BOOKING
     */
    cancelBooking: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * TENANT BOOKINGS
     */
    getTenantBookings: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * OWNER BOOKINGS
     */
    getOwnerBookings: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * UPDATE STATUS
     */
    updateBookingStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * ERROR HANDLER
     */
    private handleError;
    /**
     * SANITIZER
     * Normalizes status to lowercase for frontend compatibility.
     * Defense-in-depth: even if upstream forgets, API output is always lowercase.
     */
    private sanitizeBooking;
}
//# sourceMappingURL=BookingController.d.ts.map