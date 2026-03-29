import { PrismaClient } from '@prisma/client';
/**
 * 💜 FAVORITE SERVICE - Wishlist Management
 *
 * Handles:
 * - Toggle favorite (add/remove)
 * - Get user's favorites
 * - Check if room is favorited
 *
 * Key Features:
 * - Prevents duplicate favorites via unique constraint
 * - Optimistic UI support (toggle returns current state)
 * - Fast queries with indexed lookups
 * - Cascading deletes on user/room deletion
 */
export declare class FavoriteService {
    private prisma;
    constructor(prismaClient?: PrismaClient);
    /**
     * ✅ TOGGLE FAVORITE
     *
     * If favorite exists → remove it
     * If doesn't exist → create it
     *
     * Returns: { isFavorited: boolean }
     *
     * Throws on:
     * - 404: User or room not found
     * - 400: Invalid roomId
     */
    toggleFavorite(userId: string, roomId: string): Promise<{
        isFavorited: boolean;
        roomId: string;
    }>;
    /**
     * ✅ GET FAVORITES
     *
     * Returns array of room IDs that user has favorited
     * Used for optimistic UI updates (no need to fetch full room objects)
     *
     * Returns: string[] of roomIds
     */
    getFavorites(userId: string): Promise<string[]>;
    /**
     * ✅ GET FAVORITES WITH ROOM DETAILS
     *
     * Returns full room objects for favorites (useful for wishlist page)
     *
     * Returns: Array of Room objects
     */
    getFavoritesWithDetails(userId: string, limit?: number): Promise<({
        room: {
            city: string;
            id: string;
            isActive: boolean;
            title: string;
            description: string;
            location: string;
            pricePerMonth: number;
            roomType: string;
            amenities: string[];
            images: string[];
            isPopular: boolean;
            rating: number;
            reviewsCount: number;
        };
    } & {
        id: string;
        createdAt: Date;
        roomId: string;
        userId: string;
    })[]>;
    /**
     * ✅ CHECK IF ROOM IS FAVORITED
     *
     * Quick boolean check for UI rendering
     *
     * Returns: boolean
     */
    isFavorited(userId: string, roomId: string): Promise<boolean>;
    /**
     * ✅ GET FAVORITE COUNT FOR ROOM
     *
     * Returns how many users have favorited this room
     * Useful for popularity metrics
     */
    getFavoriteCount(roomId: string): Promise<number>;
}
//# sourceMappingURL=FavoriteService.d.ts.map