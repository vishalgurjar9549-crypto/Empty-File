import { z } from "zod";
import { isValidAmenityId } from '../config/amenities.config';
export const RoomType = z.enum(["Single", "Shared", "PG", "1RK", "2RK", "1BHK", "2BHK", "3BHK", "4BHK", "Independent House"]);
export const IdealFor = z.enum(["Students", "Working Professionals", "Family"]);
// ✅ NEW: Gender preference for property restrictions
export const GenderPreference = z.enum(["ANY", "MALE_ONLY", "FEMALE_ONLY"]);
export type RoomType = z.infer<typeof RoomType>;
export type IdealFor = z.infer<typeof IdealFor>;
export type GenderPreference = z.infer<typeof GenderPreference>;
export interface Room {
  id: string;
  title: string;
  description: string;
  city: string;
  location: string;
  landmark: string;
  latitude?: number | null;
  longitude?: number | null;
  pricePerMonth: number;
  roomType: RoomType;
  idealFor: IdealFor[];
  amenities: string[];
  images: string[];
  rating: number;
  reviewsCount: number;
  isPopular: boolean;
  isVerified?: boolean;
  reviewStatus?: string;
  // ✅ NEW: Gender preference for property rentals
  genderPreference?: GenderPreference;
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
  demand?: {
    weeklyViews: number;
    weeklyContacts: number;
  };
  isActive: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}
export const CreateRoomSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  city: z.string().min(1, "City is required"),
  location: z.string().min(3, "Location is required"),
  landmark: z.string().optional().default(""),
  latitude: z
    .number()
    .min(-90)
    .max(90, "Latitude must be between -90 and 90")
    .optional()
    .nullable(),
  longitude: z
    .number()
    .min(-180)
    .max(180, "Longitude must be between -180 and 180")
    .optional()
    .nullable(),
  pricePerMonth: z.number().positive("Price must be positive"),
  roomType: RoomType,
  idealFor: z.array(IdealFor).min(1, "Please select at least one tenant type"),
  // ✅ REFACTORED: Amenities validation against allowed list
  amenities: z
    .array(z.string())
    .default([])
    .refine(
      (ids) => ids.every((id) => isValidAmenityId(id)),
      (ids) => {
        const invalidIds = ids.filter((id) => !isValidAmenityId(id));
        return {
          message: `Invalid amenities: ${invalidIds.join(', ')}. Only allowed amenity IDs are accepted.`,
        };
      }
    ),
  images: z.array(z.string()).min(1, "At least one image is required"),
  // ✅ NEW: Gender preference validation
  genderPreference: GenderPreference.default("ANY"),
});
export const UpdateRoomSchema = CreateRoomSchema.partial();
export const RoomFiltersSchema = z.object({
  city: z.string().trim().min(1).optional(),
  roomType: z.string().trim().min(1).optional(),
  // ✅ Multi-select room types (array or comma-separated string)
  roomTypes: z.union([
    z.array(z.string().trim().min(1)),
    z.string().trim().min(1)
  ]).optional(),
  // ✅ NEW: Ideal for multi-select filter (array or comma-separated string)
  idealFor: z.union([
    z.array(IdealFor),
    z.string().trim().min(1)
  ]).optional(),
  // ✅ NEW: Gender preference filter
  genderPreference: GenderPreference.optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  sort: z
    .enum(["latest", "price_low", "price_high", "most_viewed", "most_contacted"])
    .default("latest"),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
}).strict();
export type CreateRoomInput = z.infer<typeof CreateRoomSchema>;
export type UpdateRoomInput = z.infer<typeof UpdateRoomSchema>;
export type RoomFilters = z.infer<typeof RoomFiltersSchema> & {
  reviewStatus?: string;
};
