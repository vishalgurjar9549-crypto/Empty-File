import { Router } from 'express';
import { StatsController } from '../controllers/StatsController';
import { StatsService } from '../services/StatsService';

const router = Router();
const statsService = new StatsService();
const statsController = new StatsController(statsService);

/**
 * GET /stats
 * Retrieve platform statistics (total properties, cities, owners)
 * Public endpoint - no authentication required
 */
router.get('/', (req, res) => statsController.getPlatformStats(req, res));

export default router;
