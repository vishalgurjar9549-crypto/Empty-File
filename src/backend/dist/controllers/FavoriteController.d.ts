import { Response, NextFunction } from 'express';
import { FavoriteService } from '../services/FavoriteService';
import { AuthRequest } from '../middleware/auth.middleware';
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
export declare class FavoriteController {
    private favoriteService;
    constructor(favoriteService: FavoriteService);
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
    toggleFavorite: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
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
    getFavorites: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
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
    getFavoritesWithDetails: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * ❌ ERROR HANDLER
     */
    private handleError;
}
//# sourceMappingURL=FavoriteController.d.ts.map