"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavoriteController = void 0;
const logger_1 = require("../utils/logger");
/**
 * 💜 FAVORITE CONTROLLER - HTTP Handlers
 *
 * Endpoints:
 * POST   /favorites/toggle       — Add/remove favorite
 * GET    /favorites              — Get user's favorite room IDs
 * GET    /favorites/details      — Get user's favorites with room details
 *
 * All endpoints require authentication
 */
class FavoriteController {
    constructor(favoriteService) {
        this.favoriteService = favoriteService;
        /**
         * ✅ TOGGLE FAVORITE
         * POST /favorites/toggle
         *
         * Request body:
         * { roomId: string }
         *
         * Response:
         * { success: true, data: { isFavorited: boolean, roomId: string } }
         *
         * Supports optimistic UI:
         * - Client updates immediately on response
         * - No need for separate GET request
         */
        this.toggleFavorite = async (req, res, next) => {
            try {
                const userId = req.user?.userId;
                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required'
                    });
                }
                const { roomId } = req.body;
                // ✅ VALIDATION
                if (!roomId) {
                    return res.status(400).json({
                        success: false,
                        message: 'roomId is required'
                    });
                }
                // Toggle favorite
                const result = await this.favoriteService.toggleFavorite(userId, roomId);
                logger_1.logger.info('Favorite toggled via API', {
                    userId,
                    roomId,
                    isFavorited: result.isFavorited
                });
                res.status(200).json({
                    success: true,
                    data: result,
                    message: result.isFavorited ? 'Added to favorites' : 'Removed from favorites'
                });
            }
            catch (error) {
                this.handleError(res, error);
            }
        };
        /**
         * ✅ GET FAVORITES
         * GET /favorites
         *
         * Returns array of room IDs that user has favorited
         * Lightweight response (just IDs) for quick UI updates
         *
         * Response:
         * { success: true, data: string[] }
         */
        this.getFavorites = async (req, res, next) => {
            try {
                const userId = req.user?.userId;
                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required'
                    });
                }
                const favorites = await this.favoriteService.getFavorites(userId);
                res.status(200).json({
                    success: true,
                    data: favorites,
                    message: `Found ${favorites.length} favorite${favorites.length !== 1 ? 's' : ''}`
                });
            }
            catch (error) {
                this.handleError(res, error);
            }
        };
        /**
         * ✅ GET FAVORITES WITH DETAILS
         * GET /favorites/details
         *
         * Returns full room objects for favorites
         * Used for wishlist/favorites page where full room data needed
         *
         * Query params:
         * - limit: number (default: 50, max: 100)
         *
         * Response:
         * { success: true, data: Array<{ room: Room, createdAt: DateTime }> }
         */
        this.getFavoritesWithDetails = async (req, res, next) => {
            try {
                const userId = req.user?.userId;
                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required'
                    });
                }
                const limit = Math.min(100, parseInt(req.query.limit) || 50);
                const favorites = await this.favoriteService.getFavoritesWithDetails(userId, limit);
                res.status(200).json({
                    success: true,
                    data: favorites,
                    message: `Found ${favorites.length} favorite${favorites.length !== 1 ? 's' : ''}`
                });
            }
            catch (error) {
                this.handleError(res, error);
            }
        };
        this.toggleFavorite = this.toggleFavorite.bind(this);
        this.getFavorites = this.getFavorites.bind(this);
        this.getFavoritesWithDetails = this.getFavoritesWithDetails.bind(this);
    }
    /**
     * ❌ ERROR HANDLER
     */
    handleError(res, error) {
        if (error.message?.includes('not found') || error.message?.includes('not exist')) {
            return res.status(404).json({
                success: false,
                message: error.message || 'Resource not found'
            });
        }
        if (error.message?.includes('required')) {
            return res.status(400).json({
                success: false,
                message: error.message || 'Bad request'
            });
        }
        if (error.message?.includes('Forbidden') || error.message?.includes('inactive')) {
            return res.status(403).json({
                success: false,
                message: error.message || 'Forbidden'
            });
        }
        logger_1.logger.error('Favorite controller error', {
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}
exports.FavoriteController = FavoriteController;
//# sourceMappingURL=FavoriteController.js.map