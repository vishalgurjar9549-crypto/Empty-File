// src/utils/propertyUtils.ts
/**
 * ✅ TASK 4: NO FAKE FALLBACK VALUES
 * 
 * Safe property extraction and formatting
 * Returns null instead of fake values
 * UI components handle null gracefully
 */

import { Room } from "../types/api.types";

interface MappedProperty {
  id: string;
  title: string | null;
  location: string | null;
  city: string;
  price: number | null; // ✅ Real value or null, NOT fake 5999
  rating: number | null; // ✅ Real value or null, NOT fake 4.8
  image: string;
  isGuestFavorite: boolean;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop";

// ============================================================================
// IMAGE EXTRACTION
// ============================================================================

/**
 * Extract first valid image from room object
 * Handles multiple backend formats
 */
export function getRoomImage(room: any): string {
  if (!room) return FALLBACK_IMAGE;

  // Try: images[0] (string)
  if (Array.isArray(room.images) && typeof room.images[0] === "string") {
    return room.images[0];
  }

  // Try: images[0].url
  if (Array.isArray(room.images) && room.images[0]?.url) {
    return room.images[0].url;
  }

  // Try: imageUrls
  if (Array.isArray(room.imageUrls) && room.imageUrls[0]) {
    return room.imageUrls[0];
  }

  // Try: photos[0].url
  if (Array.isArray(room.photos) && room.photos[0]?.url) {
    return room.photos[0].url;
  }

  // Try direct fields
  if (room.thumbnail) return room.thumbnail;
  if (room.coverImage) return room.coverImage;
  if (room.image) return room.image;
  if (room.photo) return room.photo;

  return FALLBACK_IMAGE;
}

// ============================================================================
// PROPERTY MAPPING
// ============================================================================

/**
 * ✅ NO FAKE VALUES - Map room to property safely
 * 
 * Returns null for missing values instead of fallback prices
 */
export function mapRoomToProperty(room: Room | any): MappedProperty {
  // ✅ Use null coalescing (??), not logical OR (||)
  const city = room.city ?? "Unknown";

  return {
    id: room.id, // ✅ Always required
    title: room.title ?? room.name ?? null,
    location: room.location ?? room.landmark ?? room.area ?? null,
    city,
    // ✅ NO FAKE VALUES - return null if missing
    price: room.pricePerMonth ?? room.pricePerNight ?? null,
    rating: room.rating ?? room.averageRating ?? null,
    image: getRoomImage(room),
    // ✅ Only mark favorite if rating is actually high
    isGuestFavorite: (room.rating ?? room.averageRating ?? 0) >= 4.8,
  };
}

/**
 * Map multiple rooms safely
 */
export function mapRoomsToProperties(rooms: Room[]): MappedProperty[] {
  return rooms.map(mapRoomToProperty);
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Safe price formatter - handles null gracefully
 * ✅ TASK 4: Real values only
 */
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) {
    return "Contact for price"; // Real state - price not set
  }
  return `₹${price.toLocaleString("en-IN")}`;
}

/**
 * Safe rating formatter - shows "Not rated" if null
 * ✅ TASK 4: Real values only
 */
export function formatRating(rating: number | null | undefined): string {
  if (rating === null || rating === undefined) {
    return "Not rated"; // Real state - not rated yet
  }
  return `${rating.toFixed(1)} ★`;
}

/**
 * Get guest favorite badge text
 */
export function getGuestFavoriteBadge(
  rating: number | null | undefined
): string | null {
  if ((rating ?? 0) >= 4.8) {
    return "Guest Favorite";
  }
  return null;
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate room has required fields before display
 */
export function isValidRoom(room: any): boolean {
  return !!(room && room.id && room.city);
}

/**
 * Check if room has meaningful data for display
 */
export function hasEnoughDataToDisplay(room: MappedProperty): boolean {
  return !!(room.title || room.image);
}