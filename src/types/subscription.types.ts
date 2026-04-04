export type PlanName = 'FREE' | 'GOLD' | 'PLATINUM';
export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
export interface CurrentSubscription {
  plan: PlanName;
  city: string | null;
  canViewContact: boolean;
  canViewMap: boolean;
  price: number;
  expiresAt?: string;
  viewCount?: number;
  viewLimit?: number | null;
  planActive?: boolean;
  isUnlocked?: boolean;
}
export interface SubscriptionPlan {
  plan: PlanName;
  price: number;
  features: string[];
}
export interface Subscription {
  id: string;
  userId: string;
  plan: PlanName;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  startDate: string;
  endDate: string | null;
  city: string;
}
export interface UpgradeInput {
  plan: 'GOLD' | 'PLATINUM';
  city: string;
}
export interface VisibilityResponse {
  canViewContact: boolean;
  canViewMap: boolean;
  plan: PlanName;
  message?: string;
  viewCount?: number;
  viewLimit?: number | null;
  planActive?: boolean;
  isUnlocked?: boolean;
}
export interface TrackViewInput {
  propertyId: string;
}

// ✅ Payment-specific types
export interface CreateOrderRequest {
  plan: 'GOLD' | 'PLATINUM'; // Only paid plans
  city: string;
}
export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
}

// PHASE-2: Payment Types

export type PaymentStatus = 'CREATED' | 'INITIATED' | 'PENDING' | 'VERIFIED' | 'FAILED' | 'EXPIRED';
export interface Payment {
  id: string;
  tenantId: string;
  plan: string;
  city: string;
  amount: number;
  orderId: string;
  utr?: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
}
export interface PaymentInitiationResponse {
  orderId: string;
  amount: number;
  upiId: string;
  qrCode?: string;
  deepLink?: string;
  status: PaymentStatus;
}
export interface PaymentVerificationRequest {
  orderId: string;
  utr: string;
}
export interface PaymentVerificationResponse {
  orderId: string;
  status: PaymentStatus;
  verified: boolean;
  subscriptionActivated: boolean;
  message?: string;
}
export interface PaymentHistoryResponse {
  payments: Payment[];
}
