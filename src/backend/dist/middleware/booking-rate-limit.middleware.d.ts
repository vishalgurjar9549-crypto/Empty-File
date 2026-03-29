/**
 * BOOKING RATE LIMITER — Enterprise Level
 *
 * Prevents booking spam per authenticated user.
 * Uses userId from JWT (not IP) for accurate per-user limiting.
 *
 * Policy: 5 booking creations per user per hour.
 *
 * WHY per-user, not per-IP:
 * - Multiple users behind same NAT/VPN share IP
 * - A single user can rotate IPs (mobile networks)
 * - userId from JWT is tamper-proof
 *
 * FALLBACK: If no userId (shouldn't happen — auth middleware runs first),
 * falls back to IP-based limiting.
 */
export declare const bookingRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * OWNER STATUS UPDATE RATE LIMITER
 *
 * Prevents rapid status toggling (accidental or malicious).
 * Policy: 20 status updates per owner per hour.
 */
export declare const bookingStatusRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=booking-rate-limit.middleware.d.ts.map