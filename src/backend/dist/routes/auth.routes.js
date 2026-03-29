"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const passport_1 = __importDefault(require("passport"));
const AuthController_1 = require("../controllers/AuthController");
const AuthService_1 = require("../services/AuthService");
const repositories_1 = require("../repositories");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const security_middleware_1 = require("../middleware/security.middleware");
const jwt_1 = require("../utils/jwt");
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
const router = (0, express_1.Router)();
/* =====================================================
   SERVICES & CONTROLLER (MUST BE FIRST)
===================================================== */
const authService = new AuthService_1.AuthService(repositories_1.userRepository);
const authController = new AuthController_1.AuthController(authService);
/* =====================================================
   ZOD SCHEMAS
===================================================== */
const RegisterSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    role: zod_1.z.enum(["TENANT", "OWNER", "tenant", "owner"]),
    phone: zod_1.z
        .string()
        .min(10, "Phone number must be at least 10 digits")
        .max(15, "Phone number too long"),
    city: zod_1.z.string().optional(),
});
const LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
const CheckPhoneSchema = zod_1.z.object({
    phone: zod_1.z
        .string()
        .min(10, "Phone number must be at least 10 digits")
        .max(15, "Phone number too long"),
});
const ClaimAccountSchema = zod_1.z.object({
    phone: zod_1.z
        .string()
        .min(10, "Phone number must be at least 10 digits")
        .max(15, "Phone number too long"),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
const LoginPhoneSchema = zod_1.z.object({
    phone: zod_1.z
        .string()
        .min(10, "Phone number must be at least 10 digits")
        .max(15, "Phone number too long"),
});
const SendEmailOtpSchema = zod_1.z.object({
    email: zod_1.z.string().email().toLowerCase()
});
const VerifyEmailOtpSchema = zod_1.z.object({
    email: zod_1.z.string().email().toLowerCase(),
    otp: zod_1.z
        .string()
        .min(6, "OTP must be 6 digits")
        .max(6, "OTP must be 6 digits")
        .regex(/^\d+$/, "OTP must contain only digits")
});
const RequestEmailLoginOtpSchema = zod_1.z.object({
    email: zod_1.z.string().email().toLowerCase()
});
const VerifyEmailLoginOtpSchema = zod_1.z.object({
    email: zod_1.z.string().email().toLowerCase(),
    otp: zod_1.z
        .string()
        .min(6, "OTP must be 6 digits")
        .max(6, "OTP must be 6 digits")
        .regex(/^\d+$/, "OTP must contain only digits")
});
/* =====================================================
   GOOGLE OAUTH ROUTES
===================================================== */
// Step 1 → Redirect user to Google
router.get("/google", (req, res, next) => {
    const isMobile = req.query.mobile === "true";
    passport_1.default.authenticate("google", {
        scope: ["profile", "email"],
        session: false,
        state: isMobile ? "mobile" : "web",
    })(req, res, next);
});
// Step 2 → Google Callback
router.get("/google/callback", passport_1.default.authenticate("google", {
    session: false,
    failureRedirect: `${env_1.env.FRONTEND_URL}/auth/login?error=google_auth_failed`,
}), (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            logger_1.logger.error("Google OAuth returned no user");
            return res.redirect(`${env_1.env.FRONTEND_URL}/auth/login?error=auth_failed`);
        }
        // Generate JWT (same as normal login)
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        // Redirect to frontend
        const isMobile = req.query.state === "mobile";
        if (isMobile) {
            return res.redirect(`homilivo://auth?token=${token}`);
        }
        return res.redirect(`${env_1.env.FRONTEND_URL}/auth/google/callback?token=${token}`);
    }
    catch (error) {
        logger_1.logger.error("Google OAuth callback error", {
            error: error.message,
            stack: error.stack,
        });
        return res.redirect(`${env_1.env.FRONTEND_URL}/auth/login?error=callback_failed`);
    }
});
/* =====================================================
   RATE LIMITING
===================================================== */
router.use(security_middleware_1.authRateLimiter);
/* =====================================================
   AUTH ROUTES
===================================================== */
// Register
router.post("/register", (0, validation_middleware_1.validateBody)(RegisterSchema), (req, res, next) => authController.register(req, res, next));
// Login
router.post("/login", (0, validation_middleware_1.validateBody)(LoginSchema), (req, res, next) => authController.login(req, res));
// Current User
router.get("/me", auth_middleware_1.authMiddleware, (req, res) => authController.getCurrentUser(req, res));
/* =====================================================
   EMAIL VERIFICATION
===================================================== */
// Verify email
router.get("/verify-email", (req, res) => authController.verifyEmail(req, res));
// Resend verification
router.post("/resend-verification", auth_middleware_1.authMiddleware, (req, res) => authController.resendVerification(req, res));
/* =====================================================
   PHONE-BASED ACCOUNT CLAIMING
===================================================== */
// Check if phone exists and if account is temp
router.post("/check-phone", (0, validation_middleware_1.validateBody)(CheckPhoneSchema), (req, res) => authController.checkPhone(req, res));
// Claim temp account with phone + email + password
router.post("/claim-account", (0, validation_middleware_1.validateBody)(ClaimAccountSchema), (req, res) => authController.claimAccount(req, res));
// Login with phone (for existing, non-temp accounts)
router.post("/login-phone", (0, validation_middleware_1.validateBody)(LoginPhoneSchema), (req, res) => authController.loginPhone(req, res));
/* =====================================================
   EMAIL OTP VERIFICATION (NEW)
===================================================== */
// Send OTP to email
router.post("/send-email-otp", auth_middleware_1.authMiddleware, (0, validation_middleware_1.validateBody)(SendEmailOtpSchema), (req, res) => authController.sendEmailOTP(req, res));
// Verify email OTP (requires auth)
router.post("/verify-email-otp", auth_middleware_1.authMiddleware, (0, validation_middleware_1.validateBody)(VerifyEmailOtpSchema), (req, res) => authController.verifyEmailOTP(req, res));
/* =====================================================
   EMAIL LOGIN (NEW)
===================================================== */
// Request OTP for email login
router.post("/request-email-login-otp", (0, validation_middleware_1.validateBody)(RequestEmailLoginOtpSchema), (req, res) => authController.requestEmailLoginOTP(req, res));
// Verify OTP and login via email
router.post("/verify-email-login-otp", (0, validation_middleware_1.validateBody)(VerifyEmailLoginOtpSchema), (req, res) => authController.verifyEmailLoginOTP(req, res));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map