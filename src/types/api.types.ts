// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
  // ✅ CURSOR PAGINATION FIELDS (non-breaking addition)
  hasNextPage?: boolean;
  nextCursor?: string;
}

// User Types
export enum Role {
  TENANT = 'TENANT',
  OWNER = 'OWNER',
  AGENT = 'AGENT',
  ADMIN = 'ADMIN',
}
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  phoneVerified: boolean;
  phoneVerifiedAt?: string;
  city?: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
  // ==================== OWNER ENGAGEMENT TRACKING (PROMPT 2) ====================
  lastLoginAt?: string | null;
  lastPropertyUpdateAt?: string | null;
}
export interface AuthResponse {
  user: User;
  token: string;
}
export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  city?: string;
  role: Role;
}
export interface LoginInput {
  email: string;
  password: string;
  portal?: string;
}

// Room Types
export type RoomType = 'Single' | 'Shared' | 'PG' | '1BHK' | '2BHK';
export type IdealFor = 'Students' | 'Working Professionals' | 'Family';

// Review Status for Admin Moderation
export type ReviewStatus = 'draft' // Owner only
| 'pending' // Submitted for review
| 'approved' // Visible to users
| 'needs_correction' // Admin feedback sent
| 'rejected' // Hard rejection
| 'suspended'; // Policy violation

export type FeedbackReason = 'wrong_price' | 'fake_images' | 'wrong_address' | 'missing_amenities' | 'duplicate_listing' | 'policy_violation' | 'other';
export type FeedbackSeverity = 'minor' | 'major';
export interface AdminFeedback {
  reason: FeedbackReason;
  reasonLabel: string;
  message: string;
  severity?: FeedbackSeverity;
  adminId: string;
  adminName: string;
  createdAt: string;
}
export interface Room {
  id: string;
  title: string;
  description: string;
  city: string;
  location: string;
  landmark: string;
  latitude?: number | null;    // Geographic latitude for map (-90 to 90)
  longitude?: number | null;   // Geographic longitude for map (-180 to 180)
  pricePerMonth: number;
  roomType: RoomType;
  idealFor: IdealFor[];
  amenities: string[];
  images: string[];
  rating: number;
  reviewsCount: number;
  isPopular: boolean;
  isVerified: boolean;
  isActive: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  // Admin Review Fields
  reviewStatus?: ReviewStatus;
  adminFeedback?: AdminFeedback;
  demand?: {
    weeklyViews: number;
    weeklyContacts: number;
  };
  // ==================== CONTACT TRACKING (PROMPT 1) ====================
  lastContactedAt?: string | null;
  contactCount?: number;
  // ==================== ENGAGEMENT TRACKING (PROMPT 2) ====================
  lastPropertyUpdateAt?: string | null;
}
export interface RoomFilters {
  city?: string;
  minPrice?: string;
  maxPrice?: string;
  roomType?: string;
  sort?: string;
  page?: number;
  limit?: number;
  cursor?: string;
}
export interface CreateRoomInput {
  title: string;
  description: string;
  city: string;
  location: string;
  landmark?: string;
  latitude?: number | null;    // Optional: Geographic latitude (-90 to 90)
  longitude?: number | null;   // Optional: Geographic longitude (-180 to 180)
  pricePerMonth: number;
  roomType: RoomType;
  idealFor: IdealFor[];
  amenities: string[];
  images: string[];
}
export type UpdateRoomInput = Partial<CreateRoomInput>;

// Booking Types
export type BookingStatus = 'pending' | 'approved' | 'rejected';
export interface Booking {
  id: string;
  roomId: string;
  ownerId: string;
  tenantId?: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  moveInDate: string;
  message?: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}
export interface CreateBookingInput {
  roomId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  moveInDate: string;
  message?: string;
}
export interface UpdateBookingStatusInput {
  status: BookingStatus;
}

// Owner Dashboard Types
export interface OwnerSummary {
  totalRooms: number;
  totalLeads: number;
  totalEarnings: number;
}

export interface DemandStats {
  totalViews: number;
  totalContacts: number;
  todayViews: number;
  todayContacts: number;
}

export interface OwnerActivityItem {
  id: string;
  type: "PROPERTY_VIEW" | "CONTACT_UNLOCK" | "CONTACT_ACCESS";
  propertyId: string;
  propertyTitle: string;
  createdAt: string;
}

export interface NotificationPayload {
  propertyId?: string;
  propertyTitle?: string;
  propertyCity?: string;
  timestamp?: string;
  eventType?: string;
}

export interface AppNotification {
  id: string;
  recipientId: string;
  type: string;
  title: string;
  message: string;
  payload: NotificationPayload | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationsResponse {
  data: AppNotification[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
    unreadCount: number;
  };
}

// Profile Types
export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  city?: string;
}

// Property Note Types (Read-only for Owner/Tenant)
export interface PropertyNote {
  id: string;
  propertyId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    role: string;
  };
}
