import axios from './axios';

/**
 * Tenant Dashboard API
 *
 * Single aggregated endpoint — fetches bookings, subscription,
 * and recently viewed properties in one call.
 */

export interface TenantDashboardBooking {
  id: string;
  roomId: string;
  moveInDate: string;
  message: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  room: {
    id: string;
    title: string;
    city: string;
    pricePerMonth: number;
    images: string[];
  };
  owner: {
    name: string;
    phone: string | null;
  };
}
export interface TenantDashboardSubscription {
  id: string;
  plan: string;
  city: string;
  startedAt: string;
  expiresAt: string | null;
  isActive: boolean;
}
export interface TenantDashboardRecentView {
  id: string;
  title: string;
  city: string;
  pricePerMonth: number;
  images: string[];
  roomType: string;
  viewedAt: string;
}
export interface TenantDashboardData {
  bookings: TenantDashboardBooking[];
  subscriptions: TenantDashboardSubscription[];
  recentlyViewed: TenantDashboardRecentView[];
}

/**
 * Fetch aggregated tenant dashboard data
 * GET /tenant/dashboard
 */
export const fetchTenantDashboard = async (): Promise<TenantDashboardData> => {
  const response = await axios.get('/tenant/dashboard');
  return response.data.data;
};