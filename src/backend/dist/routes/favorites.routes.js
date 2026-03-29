"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const FavoriteController_1 = require("../controllers/FavoriteController");
const FavoriteService_1 = require("../services/FavoriteService");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const favoriteService = new FavoriteService_1.FavoriteService();
const favoriteController = new FavoriteController_1.FavoriteController(favoriteService);
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
router.post('/toggle', auth_middleware_1.authMiddleware, (req, res, next) => favoriteController.toggleFavorite(req, res, next));
// ✅ GET /favorites — Get user's favorite room IDs
// Lightweight endpoint for quick favorites check on app load
router.get('/', auth_middleware_1.authMiddleware, (req, res, next) => favoriteController.getFavorites(req, res, next));
// ✅ GET /favorites/details — Get full favorites with room details
// Used for favorites/wishlist page
router.get('/details', auth_middleware_1.authMiddleware, (req, res, next) => favoriteController.getFavoritesWithDetails(req, res, next));
exports.default = router;
//# sourceMappingURL=favorites.routes.js.map