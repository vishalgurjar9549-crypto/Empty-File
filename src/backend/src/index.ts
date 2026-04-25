import express from "express";
import passport from "passport";

import routes from "./routes";
import { errorHandler } from "./middleware/error.middleware";
import { requestLogger } from "./middleware/logging.middleware";
import {
  helmetMiddleware,
  corsMiddleware,
  generalRateLimiter,
} from "./middleware/security.middleware";

import { logger } from "./utils/logger";
import { env } from "./config/env";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger";
import { getPrismaClient, disconnectDatabase } from "./utils/prisma";
import { OwnerDailyNudgeService } from "./services/OwnerDailyNudgeService";
import ogRoutes from "./routes/og.routes";

// ── Passport Config ───────────────────────────────────
import "./config/passport.config";

const app = express();

/* =====================================================
   ✅ RENDER PROXY FIX (CRITICAL)
===================================================== */
app.set("trust proxy", 1);

/* =====================================================
   ✅ BASIC MIDDLEWARE
===================================================== */
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

/* =====================================================
   ✅ PASSPORT
===================================================== */
app.use(passport.initialize());

/* =====================================================
   ✅ LOGGING + SECURITY
===================================================== */
app.use(requestLogger);
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(generalRateLimiter);

/* =====================================================
   ✅ HEALTH CHECK (VERY IMPORTANT)
   Used for Render wake-up + uptime monitoring
===================================================== */
app.get("/health", (_, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

/* =====================================================
   ✅ PUBLIC OG PREVIEW ROUTES (NO AUTH)
===================================================== */
app.use("/og", ogRoutes);

/* =====================================================
   ✅ SWAGGER (DISABLED IN PRODUCTION)
===================================================== */
if (env.NODE_ENV !== "production") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

/* =====================================================
   ✅ ROUTES
===================================================== */
app.use("/api", routes);

/* =====================================================
   ✅ ERROR HANDLER
===================================================== */
app.use(errorHandler);

/* =====================================================
   ✅ DATABASE WARMUP (BIG PERFORMANCE BOOST)
===================================================== */
const prisma = getPrismaClient();
const ownerDailyNudgeService = new OwnerDailyNudgeService();

async function warmupDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info("✅ Database warmup successful");
  } catch (error) {
    logger.error("❌ Database warmup failed");
  }
}

/* =====================================================
   ✅ START SERVER
===================================================== */
const PORT = env.PORT || 3001;

const server = app.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);

  await warmupDatabase();
  ownerDailyNudgeService.start();
});

/* =====================================================
   ✅ GRACEFUL SHUTDOWN HANDLERS
   Handle SIGTERM (production deployments) and SIGINT (development)
===================================================== */
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, initiating graceful shutdown...`);

  // Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed');
    
    try {
      // Stop background services
      ownerDailyNudgeService.stop();
      logger.info('Background services stopped');

      // Disconnect Prisma (closes database connection pool)
      await disconnectDatabase();
      logger.info('Database connections closed');

      logger.info('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (err) {
      logger.error('Error during graceful shutdown:', err);
      process.exit(1);
    }
  });

  // Force shutdown after 30 seconds if graceful shutdown stalls
  setTimeout(() => {
    logger.error('❌ Graceful shutdown timeout, forcing exit');
    process.exit(1);
  }, 30000);
};

// Handle SIGTERM (production deployments, Docker, etc.)
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle SIGINT (Ctrl+C in development)
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('❌ Uncaught exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;
