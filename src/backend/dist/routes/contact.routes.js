"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ContactController_1 = require("../controllers/ContactController");
const ContactService_1 = require("../services/ContactService");
const PlanLimitService_1 = require("../services/PlanLimitService");
const auth_middleware_1 = require("../middleware/auth.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const planLimitService = new PlanLimitService_1.PlanLimitService();
const contactService = new ContactService_1.ContactService(undefined, planLimitService);
const contactController = new ContactController_1.ContactController(contactService);
/**
 * GET /api/contacts/:roomId
 * Auth: TENANT only
 * Pure READ — no writes, no transactions
 * Returns owner contact if previously unlocked OR paid subscription active
 * Returns 403 CONTACT_LOCKED otherwise
 */
router.get('/:roomId', auth_middleware_1.authMiddleware, (0, auth_middleware_1.authorizeRoles)(client_1.Role.TENANT), (req, res, next) => contactController.readContact(req, res));
/**
 * POST /api/contacts/unlock
 * Auth: TENANT only
 * Body: { roomId: string }
 * Returns: { ownerName, ownerPhone, ownerEmail }
 * ⚠️ WRITE path — SERIALIZABLE transaction, limit enforcement, dedup
 */
router.post('/unlock', auth_middleware_1.authMiddleware, (0, auth_middleware_1.authorizeRoles)(client_1.Role.TENANT), (req, res, next) => contactController.unlockContact(req, res));
exports.default = router;
//# sourceMappingURL=contact.routes.js.map