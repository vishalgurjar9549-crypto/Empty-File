import { Router } from 'express';
import { z } from 'zod';
import { ProfileController } from '../controllers/ProfileController';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
const router = Router();

// =======================
// ZOD SCHEMAS (INLINE)
// =======================
const UpdateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  city: z.string().optional()
});
const UpdatePhoneSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number')
});

// Controller
const profileController = new ProfileController();

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
router.get('/', authMiddleware, (req, res, next) => profileController.getProfile(req as any, res));

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 */
router.put('/', authMiddleware, validateBody(UpdateProfileSchema), (req, res, next) => profileController.updateProfile(req as any, res));

/**
 * @swagger
 * /api/profile/phone:
 *   post:
 *     summary: Update phone number (replaces OTP verification)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 */
router.post('/phone', authMiddleware, validateBody(UpdatePhoneSchema), (req, res, next) => profileController.updatePhone(req as any, res));
export default router;