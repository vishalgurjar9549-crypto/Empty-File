"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const BookingController_1 = require("../controllers/BookingController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const booking_rate_limit_middleware_1 = require("../middleware/booking-rate-limit.middleware");
const idempotency_middleware_1 = require("../middleware/idempotency.middleware");
const BookingService_1 = require("../services/BookingService");
const PrismaBookingRepository_1 = require("../repositories/PrismaBookingRepository");
const PrismaRoomRepository_1 = require("../repositories/PrismaRoomRepository");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// ✅ Dependency Injection (VERY IMPORTANT)
const bookingRepository = new PrismaBookingRepository_1.PrismaBookingRepository();
const roomRepository = new PrismaRoomRepository_1.PrismaRoomRepository();
const bookingService = new BookingService_1.BookingService(bookingRepository, roomRepository);
const bookingController = new BookingController_1.BookingController(bookingService);
// ✅ READ — Tenant bookings
// FIX: Frontend calls /bookings/my, keep /my-bookings as alias for backward compat
router.get('/my', auth_middleware_1.authMiddleware, (req, res, next) => bookingController.getTenantBookings(req, res));
router.get('/my-bookings', auth_middleware_1.authMiddleware, (req, res, next) => bookingController.getTenantBookings(req, res));
// ✅ READ — Owner bookings
// FIX: Frontend calls /bookings/owner — route was completely missing
router.get('/owner', auth_middleware_1.authMiddleware, (0, auth_middleware_1.authorizeRoles)(client_1.Role.OWNER, client_1.Role.ADMIN), (req, res, next) => bookingController.getOwnerBookings(req, res));
// ✅ CREATE
router.post('/', auth_middleware_1.authMiddleware, (0, auth_middleware_1.authorizeRoles)(client_1.Role.TENANT, client_1.Role.ADMIN), booking_rate_limit_middleware_1.bookingRateLimiter, (0, idempotency_middleware_1.idempotencyMiddleware)(), (req, res, next) => bookingController.createBooking(req, res, next));
// ✅ UPDATE STATUS
// FIX: Frontend calls PATCH, keep PUT as alias for backward compat
router.patch('/:id/status', auth_middleware_1.authMiddleware, (0, auth_middleware_1.authorizeRoles)(client_1.Role.ADMIN, client_1.Role.OWNER), (req, res, next) => bookingController.updateBookingStatus(req, res));
router.put('/:id/status', auth_middleware_1.authMiddleware, (0, auth_middleware_1.authorizeRoles)(client_1.Role.ADMIN, client_1.Role.OWNER), (req, res, next) => bookingController.updateBookingStatus(req, res));
// ✅ CANCEL BOOKING — Tenant can cancel their own pending bookings
router.patch('/:id/cancel', auth_middleware_1.authMiddleware, (0, auth_middleware_1.authorizeRoles)(client_1.Role.TENANT), (req, res) => bookingController.cancelBooking(req, res));
exports.default = router;
//# sourceMappingURL=booking.routes.js.map