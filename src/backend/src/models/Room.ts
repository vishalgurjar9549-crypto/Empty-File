import { z } from 'zod';
export const RoomType = z.enum(['Single', 'Shared', 'PG', '1BHK', '2BHK']);
export const IdealFor = z.enum(['Students', 'Working Professionals', 'Family']);
export type RoomType = z.infer<typeof RoomType>;
export type IdealFor = z.infer<typeof IdealFor>;
export interface Room {
  id: string;
  title: string;
  description: string;
  city: string;
  location: string;
  landmark: string;
  latitude?: number | null;  // Optional geographic latitude for map feature
  longitude?: number | null; // Optional geographic longitude for map feature
  pricePerMonth: number;
  roomType: RoomType;
  idealFor: IdealFor[];
  amenities: string[];
  images: string[];
  rating: number;
  reviewsCount: number;
  isPopular: boolean;
  isVerified?: boolean; // kept for backward compat (deprecated)
  reviewStatus?: string; // ✅ FIX 3: expose reviewStatus to frontend/consumers
  adminFeedback?: {
    reason: string;
    reasonLabel: string;
    message: string;
    severity?: string;
    adminId: string;
    adminName: string;
    createdAt: string;
  };
  feedbackHistory?: Array<{
    reason: string;
    reasonLabel: string;
    message: string;
    severity?: string;
    adminId: string;
    adminName: string;
    createdAt: string;
  }>;
  isActive: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}
export const CreateRoomSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  city: z.string().min(1, 'City is required'),
  location: z.string().min(3, 'Location is required'),
  landmark: z.string().optional().default(''),
  latitude: z.number().min(-90).max(90, 'Latitude must be between -90 and 90').optional().nullable(),
  longitude: z.number().min(-180).max(180, 'Longitude must be between -180 and 180').optional().nullable(),
  pricePerMonth: z.number().positive('Price must be positive'),
  roomType: RoomType,
  idealFor: z.array(IdealFor).min(1, 'Please select at least one tenant type'),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string()).min(1, 'At least one image is required')
});
export const UpdateRoomSchema = CreateRoomSchema.partial();
export const RoomFiltersSchema = z.object({
  city: z.string().optional(),
  sort: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  // 🔥 VALIDATION FIX: Accept roomType as string or string array
  // Input: "Single" or "Single,PG,1BHK" → Parsed to array in controller
  // Manual validation happens in controller for each value
  roomType: z.union([z.string(), z.array(z.string())]).optional(),
  idealFor: IdealFor.optional(),
  amenities: z.string().transform((v) => v.split(',')).optional(),
  // 🔥 homepage filters
  isPopular: z.coerce.boolean().optional(),
  isVerified: z.coerce.boolean().optional(),
  onlyActive: z.coerce.boolean().default(true),
  // ✅ FIX 2: direct reviewStatus filter (used internally by service)
  reviewStatus: z.string().optional(),
  // pagination
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  /** Keyset pagination: pass last seen room id; when set, offset skip is not used. */
  cursor: z.string().optional()
});
export type CreateRoomInput = z.infer<typeof CreateRoomSchema>;
export type UpdateRoomInput = z.infer<typeof UpdateRoomSchema>;
export type RoomFilters = z.infer<typeof RoomFiltersSchema>;
