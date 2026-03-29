import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { env } from "../config/env";

/**
 * Helmet configuration for security headers
 */
export const helmetMiddleware = helmet({
  crossOriginResourcePolicy: {
    policy: "cross-origin",
  },

  crossOriginEmbedderPolicy: false,

  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: [
        "'self'",
        "https:",
        "http:",
        "https://homilivo.onrender.com",
      ],
    },
  },
});

/**
 * CORS configuration
 * Allows requests from configured origins
//  */
// export const corsMiddleware = cors({
//   origin: (origin, callback) => {
//     // allow server-to-server / curl / mobile internal calls
//     if (!origin) return callback(null, true);
//     const allowedOrigins = [...env.CORS_ORIGIN.split(',').map((o) => o.trim()), 'capacitor://localhost', 'http://localhost', 'http://localhost:5173'];
//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }

//     // FIX 6: Reject disallowed origins (removed temporary allow-all bypass)
//     return callback(new Error(`CORS: origin ${origin} not allowed`), false);
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
//   preflightContinue: false,
//   optionsSuccessStatus: 204
// });

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow server-to-server / mobile internal calls
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, "");

    const allowedOrigins = [
      "https://homilivo.com",
      "https://www.homilivo.com",
      "https://localhost",
      "http://localhost",
      "capacitor://localhost",
    ];

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    // Allow localhost variants for Capacitor
    if (normalizedOrigin.includes("localhost")) {
      return callback(null, true);
    }

    console.warn("Unknown origin:", normalizedOrigin);

    return callback(null, true); // allow but log
  },

  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key"],
});

/**
 * General rate limiter for all routes
 * 100 requests per 15 minutes per IP
 */
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // 15 minutes
  max: 1000,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for authentication routes
 * 5 requests per 15 minutes per IP
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // 15 minutes
  max: 5,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});
