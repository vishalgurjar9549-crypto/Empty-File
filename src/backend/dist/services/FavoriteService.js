"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavoriteService = void 0;
const prisma_1 = require("../utils/prisma");
const logger_1 = require("../utils/logger");
const AppErrors_1 = require("../errors/AppErrors");
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
class FavoriteService {
    constructor(prismaClient) {
        this.prisma = prismaClient || (0, prisma_1.getPrismaClient)();
    }
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
    async toggleFavorite(userId, roomId) {
        // ✅ Validate inputs
        if (!userId || !roomId) {
            throw new AppErrors_1.ValidationError('userId and roomId are required');
        }
        // ✅ Check room exists and is active
        const room = await this.prisma.room.findUnique({
            where: { id: roomId },
            select: { id: true, isActive: true }
        });
        if (!room) {
            throw new AppErrors_1.NotFoundError('Room not found');
        }
        if (!room.isActive) {
            throw new AppErrors_1.ForbiddenError('Cannot favorite an inactive property');
        }
        // ✅ Check if favorite already exists
        const existing = await this.prisma.favorite.findUnique({
            where: {
                userId_roomId: {
                    userId,
                    roomId
                }
            }
        });
        let isFavorited;
        if (existing) {
            // ✅ REMOVE favorite
            await this.prisma.favorite.delete({
                where: {
                    userId_roomId: {
                        userId,
                        roomId
                    }
                }
            });
            isFavorited = false;
            logger_1.logger.info('Favorite removed', {
                userId,
                roomId
            });
        }
        else {
            // ✅ ADD favorite
            await this.prisma.favorite.create({
                data: {
                    userId,
                    roomId
                }
            });
            isFavorited = true;
            logger_1.logger.info('Favorite added', {
                userId,
                roomId
            });
        }
        return { isFavorited, roomId };
    }
    /**
     * ✅ GET FAVORITES
     *
     * Returns array of room IDs that user has favorited
     * Used for optimistic UI updates (no need to fetch full room objects)
     *
     * Returns: string[] of roomIds
     */
    async getFavorites(userId) {
        if (!userId) {
            throw new AppErrors_1.ValidationError('userId is required');
        }
        const favorites = await this.prisma.favorite.findMany({
            where: { userId },
            select: { roomId: true },
            orderBy: [{ createdAt: 'desc' }, { id: 'asc' }]
        });
        return favorites.map((f) => f.roomId);
    }
    /**
     * ✅ GET FAVORITES WITH ROOM DETAILS
     *
     * Returns full room objects for favorites (useful for wishlist page)
     *
     * Returns: Array of Room objects
     */
    async getFavoritesWithDetails(userId, limit = 50) {
        if (!userId) {
            throw new AppErrors_1.ValidationError('userId is required');
        }
        const favorites = await this.prisma.favorite.findMany({
            where: { userId },
            include: {
                room: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        city: true,
                        location: true,
                        pricePerMonth: true,
                        roomType: true,
                        amenities: true,
                        images: true,
                        rating: true,
                        reviewsCount: true,
                        isActive: true,
                        isPopular: true
                    }
                }
            },
            orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
            take: limit
        });
        return favorites;
    }
    /**
     * ✅ CHECK IF ROOM IS FAVORITED
     *
     * Quick boolean check for UI rendering
     *
     * Returns: boolean
     */
    async isFavorited(userId, roomId) {
        if (!userId || !roomId) {
            return false;
        }
        const favorite = await this.prisma.favorite.findUnique({
            where: {
                userId_roomId: {
                    userId,
                    roomId
                }
            }
        });
        return !!favorite;
    }
    /**
     * ✅ GET FAVORITE COUNT FOR ROOM
     *
     * Returns how many users have favorited this room
     * Useful for popularity metrics
     */
    async getFavoriteCount(roomId) {
        if (!roomId) {
            throw new AppErrors_1.ValidationError('roomId is required');
        }
        return this.prisma.favorite.count({
            where: { roomId }
        });
    }
}
exports.FavoriteService = FavoriteService;
//# sourceMappingURL=FavoriteService.js.map