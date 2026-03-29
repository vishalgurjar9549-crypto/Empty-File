import cors from "cors";
/**
 * Helmet configuration for security headers
 */
export declare const helmetMiddleware: (req: import("http").IncomingMessage, res: import("http").ServerResponse, next: (err?: unknown) => void) => void;
/**
 * CORS configuration
 * Allows requests from configured origins
//  */
export declare const corsMiddleware: (req: cors.CorsRequest, res: {
    statusCode?: number | undefined;
    setHeader(key: string, value: string): any;
    end(): any;
}, next: (err?: any) => any) => void;
/**
 * General rate limiter for all routes
 * 100 requests per 15 minutes per IP
 */
export declare const generalRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Strict rate limiter for authentication routes
 * 5 requests per 15 minutes per IP
 */
export declare const authRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=security.middleware.d.ts.map