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
import { getPrismaClient } from "./utils/prisma";
import { OwnerDailyNudgeService } from "./services/OwnerDailyNudgeService";

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

app.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);

  await warmupDatabase();
  ownerDailyNudgeService.start();
});

export default app;
