import axios from './axios';
import { SubscriptionPlan, CurrentSubscription } from '../types/subscription.types';
import { assertValidParam, assertValidParams } from '../utils/apiGuard';

// ✅ CORRECT: Only plan and city (backend calculates amount)
export interface CreateOrderRequest {
  plan: 'GOLD' | 'PLATINUM';
  city: string;
}
export interface UpgradeSubscriptionResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}
export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  data?: {
    payment: any;
    subscription: any;
  };
}
export interface TrackConversionEventRequest {
  type: 'PLAN_VIEW' | 'PLAN_PURCHASE_CLICK';
  propertyId?: string;
  city?: string;
  plan?: string;
  source?: string;
}
const BASE = '/tenant-subscriptions';

/**
 * Get current subscription
 */
export const getCurrentSubscription = async (): Promise<CurrentSubscription> => {
  const response = await axios.get(`${BASE}/current`);
  return response.data.data;
};

/**
 * Get pricing for a city
 */
export const getPricing = async (city: string): Promise<SubscriptionPlan[]> => {
  if (!assertValidParam(city, 'city')) return [];
  const response = await axios.get(`${BASE}/pricing`, {
    params: {
      city
    }
  });
  return response.data.data;
};

/**
 * Create order (Step 1) - ✅ FIX: Use PaymentController which saves Payment record in DB
 * Changed from /tenant-subscriptions/create-order (no DB save) to /payments/initiate (saves payment)
 */
export const createOrder = async (data: CreateOrderRequest): Promise<UpgradeSubscriptionResponse> => {
  assertValidParam(data.plan, 'plan');
  assertValidParam(data.city, 'city');
  if (data.plan !== 'GOLD' && data.plan !== 'PLATINUM') {
    throw new Error('Invalid plan. Only GOLD and PLATINUM plans require payment.');
  }
  const response = await axios.post('/payments/initiate', data);
  return response.data.data;
};

/**
 * Verify payment (Step 2)
 */
export const verifyPayment = async (data: VerifyPaymentRequest): Promise<VerifyPaymentResponse> => {
  const response = await axios.post('/payments/verify', data);
  return response.data;
};

/**
 * Upgrade subscription directly
 */
export const upgradeSubscription = async (data: {
  plan: string;
  city: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}) => {
  const response = await axios.post(`${BASE}/upgrade`, data);
  return response.data.data;
};

/**
 * Track property view
 */
export const trackPropertyView = async (data: {
  propertyId: string;
}) => {
  assertValidParam(data.propertyId, 'propertyId');
  await axios.post(`${BASE}/track-view`, data);
};

export const trackConversionEvent = async (
  data: TrackConversionEventRequest,
): Promise<void> => {
  await axios.post(`${BASE}/track-conversion`, data);
};

/**
 * Check property visibility (access control)
 */
export const checkPropertyVisibility = async (propertyId: string, city: string) => {
  if (!assertValidParams({
    propertyId,
    city
  })) return null;
  const response = await axios.get(`${BASE}/visibility`, {
    params: {
      roomId: propertyId,
      city
    }
  });
  return response.data.data;
};

/**
 * Check access (alias for checkPropertyVisibility)
 */
export const checkAccess = async (city: string, roomId: string) => {
  if (!assertValidParams({
    city,
    roomId
  })) return null;
  const response = await axios.get(`${BASE}/visibility`, {
    params: {
      roomId,
      city
    }
  });
  return response.data.data;
};

/**
 * Get subscription by city
 */
export const getSubscriptionByCity = async (city: string) => {
  if (!assertValidParam(city, 'city')) return [];
  const response = await axios.get(`${BASE}/pricing`, {
    params: {
      city
    }
  });
  return response.data.data;
};

/**
 * Export as object (backward compatibility)
 */
export const subscriptionApi = {
  getCurrent: getCurrentSubscription,
  getPricing,
  createOrder,
  upgrade: upgradeSubscription,
  verifyPayment,
  trackView: trackPropertyView,
  trackConversionEvent,
  getVisibility: checkPropertyVisibility,
  checkAccess,
  getSubscriptionByCity
};
