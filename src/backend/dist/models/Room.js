"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomFiltersSchema = exports.UpdateRoomSchema = exports.CreateRoomSchema = exports.IdealFor = exports.RoomType = void 0;
const zod_1 = require("zod");
exports.RoomType = zod_1.z.enum(['Single', 'Shared', 'PG', '1BHK', '2BHK']);
exports.IdealFor = zod_1.z.enum(['Students', 'Working Professionals', 'Family']);
exports.CreateRoomSchema = zod_1.z.object({
    title: zod_1.z.string().min(5, 'Title must be at least 5 characters'),
    description: zod_1.z.string().min(20, 'Description must be at least 20 characters'),
    city: zod_1.z.string().min(1, 'City is required'),
    location: zod_1.z.string().min(3, 'Location is required'),
    landmark: zod_1.z.string().optional().default(''),
    latitude: zod_1.z.number().min(-90).max(90, 'Latitude must be between -90 and 90').optional().nullable(),
    longitude: zod_1.z.number().min(-180).max(180, 'Longitude must be between -180 and 180').optional().nullable(),
    pricePerMonth: zod_1.z.number().positive('Price must be positive'),
    roomType: exports.RoomType,
    idealFor: zod_1.z.array(exports.IdealFor).min(1, 'Please select at least one tenant type'),
    amenities: zod_1.z.array(zod_1.z.string()).default([]),
    images: zod_1.z.array(zod_1.z.string()).min(1, 'At least one image is required')
});
exports.UpdateRoomSchema = exports.CreateRoomSchema.partial();
exports.RoomFiltersSchema = zod_1.z.object({
    city: zod_1.z.string().optional(),
    sort: zod_1.z.string().optional(),
    minPrice: zod_1.z.coerce.number().optional(),
    maxPrice: zod_1.z.coerce.number().optional(),
    roomType: zod_1.z.union([exports.RoomType, zod_1.z.string().transform((v) => v.split(',').map(s => s.trim()).filter(Boolean))]).optional(),
    idealFor: exports.IdealFor.optional(),
    amenities: zod_1.z.string().transform((v) => v.split(',')).optional(),
    // 🔥 homepage filters
    isPopular: zod_1.z.coerce.boolean().optional(),
    isVerified: zod_1.z.coerce.boolean().optional(),
    onlyActive: zod_1.z.coerce.boolean().default(true),
    // ✅ FIX 2: direct reviewStatus filter (used internally by service)
    reviewStatus: zod_1.z.string().optional(),
    // pagination
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
    /** Keyset pagination: pass last seen room id; when set, offset skip is not used. */
    cursor: zod_1.z.string().optional()
});
//# sourceMappingURL=Room.js.map