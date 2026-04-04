import { Response, NextFunction } from "express";
import { FavoriteService } from "../services/FavoriteService";
import { AuthRequest } from "../middleware/auth.middleware";
import { AppError } from "../errors/AppErrors";
import { logger } from "../utils/logger";

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
console.log("🚨 FAVORITE CONTROLLER FILE LOADED");
export class FavoriteController {
  constructor(private favoriteService: FavoriteService) {
    this.toggleFavorite = this.toggleFavorite.bind(this);
    this.getFavorites = this.getFavorites.bind(this);
    this.getFavoritesWithDetails = this.getFavoritesWithDetails.bind(this);
  }

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
  toggleFavorite = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const { roomId } = req.body;

      // ✅ VALIDATION
      if (!roomId) {
        return res.status(400).json({
          success: false,
          message: "roomId is required",
        });
      }

      // Toggle favorite
      const result = await this.favoriteService.toggleFavorite(userId, roomId);

      logger.info("Favorite toggled via API", {
        userId,
        roomId,
        isFavorited: result.isFavorited,
      });

      res.status(200).json({
        success: true,
        data: result,
        message: result.isFavorited
          ? "Added to favorites"
          : "Removed from favorites",
      });
    } catch (error: any) {
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
  getFavorites = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
          console.log("✅ STEP 1: CONTROLLER STARTED"); // 👈 ADD THIS

      console.log("🔥 CONTROLLER HIT");
      console.log("🔥 REQ.USER:", req.user);
      const userId = req.user?.userId;
      console.log("✅ USER ID BEFORE SERVICE:", userId);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }
      console.log("REQ USER:", req.user);
      const favorites = await this.favoriteService.getFavorites(userId);

      res.status(200).json({
        success: true,
        data: favorites,
        message: `Found ${favorites.length} favorite${
          favorites.length !== 1 ? "s" : ""
        }`,
      });
    } catch (error: any) {
      console.error("🔥🔥🔥 REAL ERROR FULL:", {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
        full: error,
      });

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
  getFavoritesWithDetails = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.userId || (req.user as any)?.id;
      console.log("👤 REQ.USER:", req.user);
      if (!userId) {
        console.log("❌ USER NOT FOUND:", req.user);

        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const limit = Math.min(100, parseInt(req.query.limit as string) || 50);

      const favorites = await this.favoriteService.getFavoritesWithDetails(
        userId,
        limit,
      );

      res.status(200).json({
        success: true,
        data: favorites,
        message: `Found ${favorites.length} favorite${
          favorites.length !== 1 ? "s" : ""
        }`,
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  /**
   * ❌ ERROR HANDLER
   */
  private handleError(res: Response, error: any) {
    if (
      error.message?.includes("not found") ||
      error.message?.includes("not exist")
    ) {
      return res.status(404).json({
        success: false,
        message: error.message || "Resource not found",
      });
    }

    if (error.message?.includes("required")) {
      return res.status(400).json({
        success: false,
        message: error.message || "Bad request",
      });
    }

    if (
      error.message?.includes("Forbidden") ||
      error.message?.includes("inactive")
    ) {
      return res.status(403).json({
        success: false,
        message: error.message || "Forbidden",
      });
    }

    logger.error("Favorite controller error", {
      error: error.message,
      stack: error.stack,
    });
    console.error("🔥 FULL FAVORITE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
