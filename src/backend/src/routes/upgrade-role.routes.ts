import { Router } from 'express';
import { upgradeRole } from '../controllers/UpgradeRoleController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/users/upgrade-role
 * Upgrades authenticated TENANT to OWNER role.
 */
router.post('/upgrade-role', authMiddleware, upgradeRole);

export default router;