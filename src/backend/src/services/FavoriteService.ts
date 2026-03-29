import { PrismaClient } from '@prisma/client';
import { getPrismaClient } from '../utils/prisma';
import { logger } from '../utils/logger';
import { NotFoundError, ForbiddenError, ValidationError } from '../errors/AppErrors';

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
export class FavoriteService {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || getPrismaClient();
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
  async toggleFavorite(
    userId: string,
    roomId: string
  ): Promise<{ isFavorited: boolean; roomId: string }> {
    // ✅ Validate inputs
    if (!userId || !roomId) {
      throw new ValidationError('userId and roomId are required');
    }

    // ✅ Check room exists and is active
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      select: { id: true, isActive: true }
    });

    if (!room) {
      throw new NotFoundError('Room not found');
    }

    if (!room.isActive) {
      throw new ForbiddenError('Cannot favorite an inactive property');
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

    let isFavorited: boolean;

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

      logger.info('Favorite removed', {
        userId,
        roomId
      });
    } else {
      // ✅ ADD favorite
      await this.prisma.favorite.create({
        data: {
          userId,
          roomId
        }
      });
      isFavorited = true;

      logger.info('Favorite added', {
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
  async getFavorites(userId: string): Promise<string[]> {
    if (!userId) {
      throw new ValidationError('userId is required');
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
  async getFavoritesWithDetails(userId: string, limit: number = 50) {
    if (!userId) {
      throw new ValidationError('userId is required');
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
  async isFavorited(userId: string, roomId: string): Promise<boolean> {
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
  async getFavoriteCount(roomId: string): Promise<number> {
    if (!roomId) {
      throw new ValidationError('roomId is required');
    }

    return this.prisma.favorite.count({
      where: { roomId }
    });
  }
}
