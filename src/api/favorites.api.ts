import api from './axios';
import { ApiResponse } from '../types/api.types';
import { assertValidParam } from '../utils/apiGuard';

/**
 * 💜 FAVORITE API - Type-safe API calls for favorites (wishlist)
 * 
 * Endpoints:
 * - POST /favorites/toggle — Add or remove favorite
 * - GET /favorites — Get user's favorite room IDs
 * - GET /favorites/details — Get full room details for favorites
 */

export interface FavoriteToggleResponse {
  isFavorited: boolean;
  roomId: string;
}

export interface FavoriteApiError {
  success: false;
  message: string;
}

export interface FavoriteApiSuccess<T> {
  success: true;
  data: T;
  message: string;
}

export type FavoriteApiResult<T> = FavoriteApiSuccess<T> | FavoriteApiError;

export const favoritesApi = {
  /**
   * ✅ TOGGLE FAVORITE
   * POST /favorites/toggle
   * 
   * @param roomId - Room ID to add/remove from favorites
   * @returns { isFavorited: boolean, roomId: string }
   * 
   * Supports optimistic UI:
   * - Returns immediately with current state
   * - No need for separate GET request
   * 
   * Throws on:
   * - 401: Not authenticated
   * - 404: Room not found
   * - 403: Room is inactive
   */
  toggleFavorite: async (roomId: string): Promise<FavoriteToggleResponse> => {
    assertValidParam(roomId, 'roomId');

    const response = await api.post<FavoriteApiSuccess<FavoriteToggleResponse>>(
      '/favorites/toggle',
      { roomId }
    );

    return response.data.data;
  },

  /**
   * ✅ GET FAVORITES
   * GET /favorites
   * 
   * Returns array of room IDs that user has favorited
   * Lightweight response for quick favorites check on app load
   * 
   * @returns string[] - Array of favorited room IDs
   * 
   * Throws on:
   * - 401: Not authenticated
   */
  getFavorites: async (): Promise<string[]> => {
    const response = await api.get<FavoriteApiSuccess<string[]>>('/favorites');
    return response.data.data;
  },

  /**
   * ✅ GET FAVORITES WITH DETAILS
   * GET /favorites/details
   * 
   * Returns full room objects for favorites
   * Used for favorites/wishlist page
   * 
   * @param limit - Max number of favorites to return (default: 50, max: 100)
   * @returns Array of favorites with full room details
   * 
   * Throws on:
   * - 401: Not authenticated
   */
  getFavoritesWithDetails: async (
    limit: number = 50
  ): Promise<any[]> => {
    const response = await api.get<FavoriteApiSuccess<any[]>>(
      '/favorites/details',
      {
        params: {
          limit: Math.min(100, limit)
        }
      }
    );
    return response.data.data;
  }
};

/**
 * Error handler for favorite API calls
 * Converts axios errors to friendly messages
 */
export function handleFavoriteApiError(error: any): string {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.response?.status === 401) {
    return 'Please log in to save favorites';
  }

  if (error?.response?.status === 404) {
    return 'Property not found';
  }

  if (error?.response?.status === 403) {
    return 'This property is no longer available';
  }

  if (error?.response?.status === 400) {
    return 'Invalid property ID';
  }

  return 'Failed to update favorites';
}
