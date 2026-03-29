import { Router } from 'express';
import { FavoriteController } from '../controllers/FavoriteController';
import { FavoriteService } from '../services/FavoriteService';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const favoriteService = new FavoriteService();
const favoriteController = new FavoriteController(favoriteService);

/**
 * FAVORITE (WISHLIST) ROUTES
 *
 * 💜 Endpoints:
 * POST   /favorites/toggle      — Add or remove favorite
 * GET    /favorites             — Get user's favorite room IDs
 * GET    /favorites/details     — Get full room details for favorites
 *
 * 🔐 Authorization:
 * - All endpoints require authentication (TENANT or OWNER)
 * - Users can only access their own favorites
 */

// ✅ POST /favorites/toggle — Toggle favorite (add or remove)
// Used for optimistic UI updates (button click instantly updates)
router.post(
  '/toggle',
  authMiddleware,
  (req, res, next) => favoriteController.toggleFavorite(req as any, res, next)
);

// ✅ GET /favorites — Get user's favorite room IDs
// Lightweight endpoint for quick favorites check on app load
router.get(
  '/',
  authMiddleware,
  (req, res, next) => favoriteController.getFavorites(req as any, res, next)
);

// ✅ GET /favorites/details — Get full favorites with room details
// Used for favorites/wishlist page
router.get(
  '/details',
  authMiddleware,
  (req, res, next) => favoriteController.getFavoritesWithDetails(req as any, res, next)
);

export default router;
