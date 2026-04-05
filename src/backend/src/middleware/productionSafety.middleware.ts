/**
 * PRODUCTION SAFETY MIDDLEWARE
 * 
 * In-memory rate limiting for critical endpoints
 * - Contact Unlock: 5 requests/minute per user
 * - OTP Verification: 3 attempts/minute per email
 * - Payment Verification: 2 attempts/minute per user
 * 
 * Simple, stateless implementation without Redis
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitStore {
  [key: string]: RateLimitEntry;
}

// In-memory stores with automatic cleanup
const contactUnlockStore: RateLimitStore = {};
const otpVerifyStore: RateLimitStore = {};
const paymentVerifyStore: RateLimitStore = {};

/**
 * Check rate limit and increment counter
 * Returns: true if allowed, false if rate limited
 */
function checkAndIncrementLimit(
  store: RateLimitStore,
  key: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = store[key];

  // No entry or window expired - reset
  if (!entry || entry.resetTime < now) {
    store[key] = { count: 1, resetTime: now + windowMs };
    return true;
  }

  // Increment counter
  entry.count++;

  // Check if exceeded
  if (entry.count > maxRequests) {
    return false;
  }

  return true;
}

/**
 * Get rate limit info (for response headers)
 */
function getRateLimitInfo(
  store: RateLimitStore,
  key: string,
  maxRequests: number
): { remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store[key];

  if (!entry || entry.resetTime < now) {
    return { remaining: maxRequests, resetAt: now + 60000 };
  }

  return {
    remaining: Math.max(0, maxRequests - entry.count),
    resetAt: entry.resetTime
  };
}

/**
 * Cleanup old entries periodically (prevent memory leak)
 */
function cleanupExpiredEntries(store: RateLimitStore): void {
  const now = Date.now();
  const keys = Object.keys(store);

  keys.forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}

// Cleanup every 5 minutes
setInterval(() => {
  cleanupExpiredEntries(contactUnlockStore);
  cleanupExpiredEntries(otpVerifyStore);
  cleanupExpiredEntries(paymentVerifyStore);
}, 5 * 60 * 1000);

// ====================================================================
// CONTACT UNLOCK RATE LIMITER
// ====================================================================
export function contactUnlockLimiter(req: Request, res: Response, next: NextFunction): void {
  const MAX_REQUESTS = 5;
  const WINDOW_MS = 60 * 1000; // 1 minute

  const userId = (req as any).user?.id;
  if (!userId) {
    next();
    return;
  }

  const key = `contact_unlock:${userId}`;
  const allowed = checkAndIncrementLimit(contactUnlockStore, key, MAX_REQUESTS, WINDOW_MS);

  if (!allowed) {
    const info = getRateLimitInfo(contactUnlockStore, key, MAX_REQUESTS);
    logger.warn('Contact unlock rate limit exceeded', {
      userId: userId.substring(0, 8),
      attempts: contactUnlockStore[key]?.count || 0,
      limit: MAX_REQUESTS
    });

    res.status(429).json({
      error: 'Too many requests',
      message: 'You can only unlock 5 contacts per minute. Please try again later.',
      retryAfter: Math.ceil((info.resetAt - Date.now()) / 1000)
    });
    return;
  }

  // Continue
  next();
}

// ====================================================================
// OTP VERIFICATION RATE LIMITER
// ====================================================================
export function otpVerifyLimiter(req: Request, res: Response, next: NextFunction): void {
  const MAX_REQUESTS = 3;
  const WINDOW_MS = 60 * 1000; // 1 minute

  const email = (req.body as any)?.email;
  if (!email) {
    next();
    return;
  }

  const key = `otp_verify:${email}`;
  const allowed = checkAndIncrementLimit(otpVerifyStore, key, MAX_REQUESTS, WINDOW_MS);

  if (!allowed) {
    const info = getRateLimitInfo(otpVerifyStore, key, MAX_REQUESTS);
    logger.warn('OTP verification rate limit exceeded', {
      email: email.substring(0, 5) + '***',
      attempts: otpVerifyStore[key]?.count || 0,
      limit: MAX_REQUESTS
    });

    res.status(429).json({
      error: 'Too many attempts',
      message: 'Too many OTP verification attempts. Please try again in a moment.',
      retryAfter: Math.ceil((info.resetAt - Date.now()) / 1000)
    });
    return;
  }

  next();
}

// ====================================================================
// PAYMENT VERIFICATION RATE LIMITER
// ====================================================================
export function paymentVerifyLimiter(req: Request, res: Response, next: NextFunction): void {
  const MAX_REQUESTS = 2;
  const WINDOW_MS = 60 * 1000; // 1 minute

  const userId = (req as any).user?.id;
  if (!userId) {
    next();
    return;
  }

  const key = `payment_verify:${userId}`;
  const allowed = checkAndIncrementLimit(paymentVerifyStore, key, MAX_REQUESTS, WINDOW_MS);

  if (!allowed) {
    const info = getRateLimitInfo(paymentVerifyStore, key, MAX_REQUESTS);
    logger.error('Payment verification rate limit exceeded - potential fraud attempt', {
      userId: userId.substring(0, 8),
      attempts: paymentVerifyStore[key]?.count || 0,
      limit: MAX_REQUESTS
    });

    res.status(429).json({
      error: 'Too many payment verification attempts',
      message: 'Please wait before trying another payment verification.',
      retryAfter: Math.ceil((info.resetAt - Date.now()) / 1000)
    });
    return;
  }

  next();
}

export default { contactUnlockLimiter, otpVerifyLimiter, paymentVerifyLimiter };
