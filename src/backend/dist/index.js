"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const logging_middleware_1 = require("./middleware/logging.middleware");
const security_middleware_1 = require("./middleware/security.middleware");
const logger_1 = require("./utils/logger");
const env_1 = require("./config/env");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = __importDefault(require("./swagger"));
const prisma_1 = require("./utils/prisma");
// ── Passport Config ───────────────────────────────────
require("./config/passport.config");
const app = (0, express_1.default)();
/* =====================================================
   ✅ RENDER PROXY FIX (CRITICAL)
===================================================== */
app.set("trust proxy", 1);
/* =====================================================
   ✅ BASIC MIDDLEWARE
===================================================== */
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({
    extended: true,
}));
/* =====================================================
   ✅ PASSPORT
===================================================== */
app.use(passport_1.default.initialize());
/* =====================================================
   ✅ LOGGING + SECURITY
===================================================== */
app.use(logging_middleware_1.requestLogger);
app.use(security_middleware_1.helmetMiddleware);
app.use(security_middleware_1.corsMiddleware);
app.use(security_middleware_1.generalRateLimiter);
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
if (env_1.env.NODE_ENV !== "production") {
    app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
}
/* =====================================================
   ✅ ROUTES
===================================================== */
app.use("/api", routes_1.default);
/* =====================================================
   ✅ ERROR HANDLER
===================================================== */
app.use(error_middleware_1.errorHandler);
/* =====================================================
   ✅ DATABASE WARMUP (BIG PERFORMANCE BOOST)
===================================================== */
const prisma = (0, prisma_1.getPrismaClient)();
async function warmupDatabase() {
    try {
        await prisma.$queryRaw `SELECT 1`;
        logger_1.logger.info("✅ Database warmup successful");
    }
    catch (error) {
        logger_1.logger.error("❌ Database warmup failed");
    }
}
/* =====================================================
   ✅ START SERVER
===================================================== */
const PORT = env_1.env.PORT || 3001;
app.listen(PORT, async () => {
    logger_1.logger.info(`Server running on port ${PORT}`);
    logger_1.logger.info(`Environment: ${env_1.env.NODE_ENV}`);
    await warmupDatabase();
});
exports.default = app;
//# sourceMappingURL=index.js.map