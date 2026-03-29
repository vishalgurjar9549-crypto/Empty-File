"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const OwnerController_1 = require("../controllers/OwnerController");
const OwnerService_1 = require("../services/OwnerService");
const auth_middleware_1 = require("../middleware/auth.middleware");
const client_1 = require("@prisma/client");
const repositories_1 = require("../repositories");
const router = (0, express_1.Router)();
// Instantiate service with Prisma repositories
const ownerService = new OwnerService_1.OwnerService(repositories_1.roomRepository, 
// PrismaRoomRepository
repositories_1.bookingRepository); // PrismaBookingRepository
// Instantiate controller with service
const ownerController = new OwnerController_1.OwnerController(ownerService);
/**
 * Owner dashboard summary
 */
router.get('/me/summary', auth_middleware_1.authMiddleware, (0, auth_middleware_1.authorizeRoles)(client_1.Role.OWNER, client_1.Role.ADMIN), (req, res, next) => ownerController.getSummary(req, res));
/**
 * Owner rooms
 */
router.get('/me/rooms', auth_middleware_1.authMiddleware, (0, auth_middleware_1.authorizeRoles)(client_1.Role.OWNER, client_1.Role.ADMIN), (req, res, next) => ownerController.getMyRooms(req, res));
/**
 * Owner bookings
 */
router.get('/me/bookings', auth_middleware_1.authMiddleware, (0, auth_middleware_1.authorizeRoles)(client_1.Role.OWNER, client_1.Role.ADMIN), (req, res, next) => ownerController.getMyBookings(req, res));
exports.default = router;
//# sourceMappingURL=owner.routes.js.map