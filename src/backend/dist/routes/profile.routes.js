"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const ProfileController_1 = require("../controllers/ProfileController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
// =======================
// ZOD SCHEMAS (INLINE)
// =======================
const UpdateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    phone: zod_1.z.string().optional(),
    city: zod_1.z.string().optional()
});
const UpdatePhoneSchema = zod_1.z.object({
    phone: zod_1.z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number')
});
// Controller
const profileController = new ProfileController_1.ProfileController();
/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 */
router.get('/', auth_middleware_1.authMiddleware, (req, res, next) => profileController.getProfile(req, res));
/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 */
router.put('/', auth_middleware_1.authMiddleware, (0, validation_middleware_1.validateBody)(UpdateProfileSchema), (req, res, next) => profileController.updateProfile(req, res));
/**
 * @swagger
 * /api/profile/phone:
 *   post:
 *     summary: Update phone number (replaces OTP verification)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 */
router.post('/phone', auth_middleware_1.authMiddleware, (0, validation_middleware_1.validateBody)(UpdatePhoneSchema), (req, res, next) => profileController.updatePhone(req, res));
exports.default = router;
//# sourceMappingURL=profile.routes.js.map