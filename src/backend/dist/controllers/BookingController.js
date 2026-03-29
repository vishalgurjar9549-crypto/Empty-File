"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingController = void 0;
const AppErrors_1 = require("../errors/AppErrors");
const logger_1 = require("../utils/logger");
class BookingController {
    constructor(bookingService) {
        this.bookingService = bookingService;
        /**
         * CREATE BOOKING
         * FIX: Use handleError (which checks errors/AppErrors.ts) instead of next()
         *      which delegates to error.middleware.ts with a DIFFERENT AppError class.
         */
        this.createBooking = async (req, res, next) => {
            try {
                const userId = req.user?.userId;
                const bookingData = {
                    ...req.body,
                    userId
                };
                const booking = await this.bookingService.createBooking(bookingData);
                logger_1.logger.info('Booking created', {
                    bookingId: booking.id,
                    userId
                });
                res.status(201).json({
                    success: true,
                    data: this.sanitizeBooking(booking),
                    message: 'Booking created successfully'
                });
            }
            catch (error) {
                this.handleError(res, error);
            }
        };
        /**
         * GET BOOKING BY ID — FIXED: Added authorization check
         */
        this.getBookingById = async (req, res) => {
            try {
                const { id } = req.params;
                const userId = req.user?.userId;
                const userRole = req.user?.role;
                const booking = await this.bookingService.getBookingById(id);
                if (!booking) {
                    return res.status(404).json({
                        success: false,
                        message: 'Booking not found'
                    });
                }
                // SECURITY FIX: Only allow access to own bookings or admin
                if (userRole !== 'ADMIN' && booking.tenantId !== userId && booking.ownerId !== userId) {
                    return res.status(403).json({
                        success: false,
                        message: 'You do not have permission to view this booking'
                    });
                }
                return res.json({
                    success: true,
                    data: this.sanitizeBooking(booking)
                });
            }
            catch (error) {
                return this.handleError(res, error);
            }
        };
        /**
         * CANCEL BOOKING
         */
        this.cancelBooking = async (req, res) => {
            try {
                const { id } = req.params;
                const userId = req.user?.userId;
                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: 'Unauthorized'
                    });
                }
                const booking = await this.bookingService.cancelBooking(id, userId);
                return res.json({
                    success: true,
                    data: this.sanitizeBooking(booking),
                    message: 'Booking cancelled successfully'
                });
            }
            catch (error) {
                return this.handleError(res, error);
            }
        };
        /**
         * TENANT BOOKINGS
         */
        this.getTenantBookings = async (req, res) => {
            try {
                const userId = req.user?.userId;
                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: 'User not authenticated'
                    });
                }
                const result = await this.bookingService.getUserBookings(userId);
                const bookings = Array.isArray(result) ? result : result.bookings;
                const total = Array.isArray(result) ? result.length : result.total;
                return res.json({
                    success: true,
                    data: bookings.map(this.sanitizeBooking),
                    meta: {
                        page: 1,
                        limit: 20,
                        total
                    }
                });
            }
            catch (error) {
                return this.handleError(res, error);
            }
        };
        /**
         * OWNER BOOKINGS
         */
        this.getOwnerBookings = async (req, res) => {
            try {
                const ownerId = req.user?.userId;
                if (!ownerId) {
                    return res.status(401).json({
                        success: false,
                        message: 'User not authenticated'
                    });
                }
                const result = await this.bookingService.getOwnerBookings(ownerId);
                const bookings = Array.isArray(result) ? result : result.bookings;
                const total = Array.isArray(result) ? result.length : result.total;
                return res.json({
                    success: true,
                    data: bookings.map(this.sanitizeBooking),
                    meta: {
                        page: 1,
                        limit: 20,
                        total
                    }
                });
            }
            catch (error) {
                return this.handleError(res, error);
            }
        };
        /**
         * UPDATE STATUS
         */
        this.updateBookingStatus = async (req, res) => {
            try {
                const { id } = req.params;
                const { status } = req.body;
                const userId = req.user?.userId;
                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: 'User not authenticated'
                    });
                }
                const booking = await this.bookingService.updateBookingStatus(id, status, userId);
                return res.json({
                    success: true,
                    data: booking ? this.sanitizeBooking(booking) : null,
                    message: 'Booking status updated successfully'
                });
            }
            catch (error) {
                return this.handleError(res, error);
            }
        };
        /**
         * SANITIZER
         * Normalizes status to lowercase for frontend compatibility.
         * Defense-in-depth: even if upstream forgets, API output is always lowercase.
         */
        this.sanitizeBooking = (booking) => ({
            id: booking.id,
            roomId: booking.roomId,
            ownerId: booking.ownerId,
            tenantId: booking.tenantId || null,
            tenantName: booking.tenantName,
            tenantEmail: booking.tenantEmail,
            tenantPhone: booking.tenantPhone,
            moveInDate: booking.moveInDate,
            message: booking.message || null,
            status: typeof booking.status === 'string' ? booking.status.toLowerCase() : booking.status,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt
        });
    }
    /**
     * ERROR HANDLER
     */
    handleError(res, error) {
        if (error instanceof AppErrors_1.AppError) {
            logger_1.logger.warn('Booking error', {
                code: error.code,
                message: error.message
            });
            return res.status(error.statusCode).json({
                success: false,
                code: error.code,
                message: error.message
            });
        }
        logger_1.logger.error('Unexpected booking error', {
            message: error.message,
            stack: error.stack
        });
        return res.status(500).json({
            success: false,
            message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
        });
    }
}
exports.BookingController = BookingController;
//# sourceMappingURL=BookingController.js.map