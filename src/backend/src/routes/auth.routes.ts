import { Router } from "express";
import { z } from "zod";
import passport from "passport";

import { AuthController } from "../controllers/AuthController";
import { AuthService } from "../services/AuthService";
import { userRepository } from "../repositories";

import { authMiddleware } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validation.middleware";
import { authRateLimiter } from "../middleware/security.middleware";
import { otpVerifyLimiter } from "../middleware/productionSafety.middleware";

import { generateToken } from "../utils/jwt";
import { logger } from "../utils/logger";
import { env } from "../config/env";

const router = Router();

/* =====================================================
   SERVICES & CONTROLLER (MUST BE FIRST)
===================================================== */

const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

/* =====================================================
   ZOD SCHEMAS
===================================================== */

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["TENANT", "OWNER", "tenant", "owner"]),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number too long"),
  city: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const CheckPhoneSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number too long"),
});

const ClaimAccountSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number too long"),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const LoginPhoneSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number too long"),
});

const SendEmailOtpSchema = z.object({
  email: z.string().email().toLowerCase()
});

const VerifyEmailOtpSchema = z.object({
  email: z.string().email().toLowerCase(),
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only digits")
});

const RequestEmailLoginOtpSchema = z.object({
  email: z.string().email().toLowerCase()
});

const VerifyEmailLoginOtpSchema = z.object({
  email: z.string().email().toLowerCase(),
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only digits")
});

const ForgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase()
});

const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters")
});

const ValidateResetTokenSchema = z.object({
  token: z.string().min(1, "Token is required")
});

/* =====================================================
   GOOGLE OAUTH ROUTES
===================================================== */

// Step 1 → Redirect user to Google
router.get("/google", (req, res, next) => {
  const isMobile = req.query.mobile === "true";

  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    state: isMobile ? "mobile" : "web",
  })(req, res, next);
});

// Step 2 → Google Callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${env.FRONTEND_URL}/auth/login?error=google_auth_failed`,
  }),
  (req: any, res) => {
    try {
      const user = req.user;

      if (!user) {
        logger.error("Google OAuth returned no user");
        return res.redirect(`${env.FRONTEND_URL}/auth/login?error=auth_failed`);
      }

      // Generate JWT (same as normal login)
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Redirect to frontend
      const isMobile = req.query.state === "mobile";

      if (isMobile) {
        return res.redirect(`homilivo://auth?token=${token}`);
      }

      return res.redirect(
        `${env.FRONTEND_URL}/auth/google/callback?token=${token}`,
      );
    } catch (error: any) {
      logger.error("Google OAuth callback error", {
        error: error.message,
        stack: error.stack,
      });

      return res.redirect(
        `${env.FRONTEND_URL}/auth/login?error=callback_failed`,
      );
    }
  },
);

/* =====================================================
   RATE LIMITING
===================================================== */

router.use(authRateLimiter);

/* =====================================================
   AUTH ROUTES
===================================================== */

// Register
router.post("/register", validateBody(RegisterSchema), (req, res, next) =>
  authController.register(req, res, next),
);

// Login
router.post("/login", validateBody(LoginSchema), (req, res, next) =>
  authController.login(req, res),
);

// Current User
router.get("/me", authMiddleware, (req, res) =>
  authController.getCurrentUser(req as any, res),
);

/* =====================================================
   EMAIL VERIFICATION
===================================================== */

// Verify email
router.get("/verify-email", (req, res) => authController.verifyEmail(req, res));

// Resend verification
router.post("/resend-verification", authMiddleware, (req, res) =>
  authController.resendVerification(req as any, res),
);

/* =====================================================
   PHONE-BASED ACCOUNT CLAIMING
===================================================== */

// Check if phone exists and if account is temp
router.post("/check-phone", validateBody(CheckPhoneSchema), (req, res) =>
  authController.checkPhone(req, res),
);

// Claim temp account with phone + email + password
router.post("/claim-account", validateBody(ClaimAccountSchema), (req, res) =>
  authController.claimAccount(req, res),
);

// Login with phone (for existing, non-temp accounts)
router.post("/login-phone", validateBody(LoginPhoneSchema), (req, res) =>
  authController.loginPhone(req, res),
);

/* =====================================================
   EMAIL OTP VERIFICATION (NEW)
===================================================== */

// Send OTP to email
router.post("/send-email-otp", authMiddleware, validateBody(SendEmailOtpSchema), (req, res) =>
  authController.sendEmailOTP(req, res),
);

// Verify email OTP (🔒 Rate limited: 3 attempts/minute per email - production safety)
router.post("/verify-email-otp", authMiddleware, validateBody(VerifyEmailOtpSchema), otpVerifyLimiter, (req, res) =>
  authController.verifyEmailOTP(req as any, res),
);

/* =====================================================
   EMAIL LOGIN (NEW)
===================================================== */

// Request OTP for email login
router.post("/request-email-login-otp", validateBody(RequestEmailLoginOtpSchema), (req, res) =>
  authController.requestEmailLoginOTP(req, res),
);

// Verify OTP and login via email (🔒 Rate limited: 3 attempts/minute per email - production safety)
router.post("/verify-email-login-otp", validateBody(VerifyEmailLoginOtpSchema), otpVerifyLimiter, (req, res) =>
  authController.verifyEmailLoginOTP(req, res),
);

/* =====================================================
   PASSWORD RESET
===================================================== */

// Request password reset (forgot password)
router.post("/forgot-password", validateBody(ForgotPasswordSchema), (req, res) =>
  authController.requestPasswordReset(req, res),
);

// Reset password with token
router.post("/reset-password", validateBody(ResetPasswordSchema), (req, res) =>
  authController.resetPassword(req, res),
);

// Validate reset token before showing form
router.post("/validate-reset-token", validateBody(ValidateResetTokenSchema), (req, res) =>
  authController.validateResetToken(req, res),
);

export default router;
