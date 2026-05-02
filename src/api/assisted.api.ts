import axios from './axios';
import { assertValidParam, assertValidParams } from '../utils/apiGuard';

/**
 * Assisted Service API
 * 
 * IMPORTANT: This is completely separate from subscription APIs.
 * Assisted Service is a fixed-price (₹500) service, not a recurring subscription.
 * 
 * ✅ KEY DIFFERENCES FROM SUBSCRIPTION:
 * - Amount is ALWAYS ₹500 (50000 paise), never varies by city
 * - No upgrade to any subscription plan
 * - One-time payment, not recurring
 * - Creates assisted request record, not subscription record
 * - Payment goes to service, not subscription activation
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CreateAssistedOrderRequest {
  /**
   * User's city - used for service localization, NOT price calculation
   */
  city: string;
}

export interface CreateAssistedOrderResponse {
  orderId: string;
  amount: number; // Always 50000 (₹500 in paise)
  currency: string; // Always 'INR'
  keyId: string; // Razorpay Key ID for frontend
}

export interface VerifyAssistedPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyAssistedPaymentResponse {
  success: boolean;
  message: string;
  data?: {
    payment: any;
    subscription?: any; // Might not be present for assisted service
  };
}

export interface CreateAssistedRequestData {
  name: string;
  phone: string;
  city: string;
  budget?: number;
  /**
   * Razorpay payment ID from successful payment
   * IMPORTANT: We store actual payment ID, not frontend-calculated amount
   */
  paymentId: string;
  /**
   * Razorpay order ID - for audit trail
   */
  orderId: string;
}

export interface CreateAssistedRequestResponse {
  success: boolean;
  message: string;
  data?: {
    requestId?: string;
    [key: string]: any;
  };
}

// ============================================================================
// API METHODS
// ============================================================================

const ASSISTED_BASE = '/assisted';
const AMOUNT_PAISE = 50000; // ₹500 in paise

/**
 * Create Razorpay order for assisted service
 * 
 * ✅ KEY POINTS:
 * - Amount is ALWAYS ₹500 (50000 paise)
 * - No city-based pricing
 * - No subscription upgrade
 * - Fresh endpoint separate from subscription payment
 * 
 * @param data Request data with city for localization
 * @returns Order details including orderId and amount
 */
export const createAssistedOrder = async (
  data: CreateAssistedOrderRequest
): Promise<CreateAssistedOrderResponse> => {
  assertValidParam(data.city, 'city');

  const response = await axios.post(`${ASSISTED_BASE}/create-order`, {
    city: data.city,
    // Backend will automatically set:
    // - amount: 50000 (₹500)
    // - currency: 'INR'
    // - receipt: 'assist_<timestamp>'
  });

  const result = response.data.data;

  // ✅ SAFETY CHECK: Verify amount is correct
  if (result.amount !== AMOUNT_PAISE) {
    console.error(
      `⚠️  AMOUNT MISMATCH: Expected ${AMOUNT_PAISE} paise, got ${result.amount}. This indicates backend configuration issue.`
    );
    throw new Error(
      `Invalid amount returned: ₹${result.amount / 100}. Expected ₹500.`
    );
  }

  console.log(
    `✅ Order created: ${result.orderId}, Amount: ₹${result.amount / 100}`
  );

  return result;
};

/**
 * Verify payment signature and process payment
 * 
 * ✅ KEY POINTS:
 * - Verifies Razorpay signature
 * - Separate from subscription verification
 * - Does NOT upgrade any subscription
 * 
 * @param data Payment verification data
 * @returns Verification result
 */
export const verifyAssistedPayment = async (
  data: VerifyAssistedPaymentRequest
): Promise<VerifyAssistedPaymentResponse> => {
  assertValidParams({
    razorpay_order_id: data.razorpay_order_id,
    razorpay_payment_id: data.razorpay_payment_id,
    razorpay_signature: data.razorpay_signature,
  });

  const response = await axios.post(`${ASSISTED_BASE}/verify-payment`, {
    razorpay_order_id: data.razorpay_order_id,
    razorpay_payment_id: data.razorpay_payment_id,
    razorpay_signature: data.razorpay_signature,
  });

  const result = response.data;

  if (result.success) {
    console.log(
      `✅ Payment verified: ${data.razorpay_payment_id}`
    );
  } else {
    console.error(`❌ Payment verification failed: ${result.message}`);
  }

  return result;
};

/**
 * Create assisted service request after payment
 * 
 * ✅ KEY POINTS:
 * - Called ONLY after successful payment verification
 * - Receives actual paymentId from Razorpay
 * - No longer sends frontend-calculated paymentAmount
 * - Creates record in assisted_requests table, not subscription table
 * 
 * @param data Assisted request data
 * @returns Creation result
 */
export const createAssistedRequest = async (
  data: CreateAssistedRequestData
): Promise<CreateAssistedRequestResponse> => {
  assertValidParams({
    name: data.name,
    phone: data.phone,
    city: data.city,
    paymentId: data.paymentId,
    orderId: data.orderId,
  });

  const response = await axios.post(`${ASSISTED_BASE}/requests`, {
    name: data.name,
    phone: data.phone,
    city: data.city,
    budget: data.budget,
    paymentId: data.paymentId,
    orderId: data.orderId,
    // Backend will handle:
    // - Creating record with actual payment details
    // - Sending notification to agent
    // - NO subscription upgrade
  });

  const result = response.data;

  if (result.success) {
    console.log(
      `✅ Assisted request created for ${data.name} in ${data.city}`
    );
  } else {
    console.error(`❌ Request creation failed: ${result.message}`);
  }

  return result;
};

// ============================================================================
// EXPORT AS OBJECT (backward compatibility if needed)
// ============================================================================

export const assistedApi = {
  createOrder: createAssistedOrder,
  verifyPayment: verifyAssistedPayment,
  createRequest: createAssistedRequest,
};
