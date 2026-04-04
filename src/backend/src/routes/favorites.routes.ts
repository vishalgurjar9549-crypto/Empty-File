import { Router } from "express";
import { FavoriteController } from "../controllers/FavoriteController";
import { FavoriteService } from "../services/FavoriteService";
import { authMiddleware } from "../middleware/auth.middleware";

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
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    await favoriteController.getFavorites(req as any, res, next);
  } catch (err) {
    next(err);
  }
});

router.post("/toggle", authMiddleware, async (req, res, next) => {
  try {
    await favoriteController.toggleFavorite(req as any, res, next);
  } catch (err) {
    next(err);
  }
});

router.get("/details", authMiddleware, async (req, res, next) => {
  try {
    await favoriteController.getFavoritesWithDetails(req as any, res, next);
  } catch (err) {
    next(err);
  }
});

export default router;
