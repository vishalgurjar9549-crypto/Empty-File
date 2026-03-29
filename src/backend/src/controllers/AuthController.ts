import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AuthService } from '../services/AuthService';
import { EmailVerificationService } from '../services/EmailVerificationService';
import { Role } from '@prisma/client';
export class AuthController {
  constructor(private authService: AuthService) {
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.getCurrentUser = this.getCurrentUser.bind(this);
    this.verifyEmail = this.verifyEmail.bind(this);
    this.resendVerification = this.resendVerification.bind(this);
    this.checkPhone = this.checkPhone.bind(this);
    this.claimAccount = this.claimAccount.bind(this);
    this.loginPhone = this.loginPhone.bind(this);
    this.sendEmailOTP = this.sendEmailOTP.bind(this);
    this.verifyEmailOTP = this.verifyEmailOTP.bind(this);
    this.requestEmailLoginOTP = this.requestEmailLoginOTP.bind(this);
    this.verifyEmailLoginOTP = this.verifyEmailLoginOTP.bind(this);
  }

  // =======================
  // GET CURRENT USER
  // =======================
  async getCurrentUser(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: 'Unauthorized'
        });
      }
      console.log("req.user:", req.user);
      const user = await this.authService.getUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }
      return res.json({
        success: true,
        data: user
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch current user'
      });
    }
  }

  // =======================
  // REGISTER
  // =======================
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        email,
        password,
        name,
        role,
        phone
      } = req.body;
      if (!email || !password || !name || !role) {
        return res.status(400).json({
          success: false,
          message: 'Email, password, name, and role are required'
        });
      }
      if (!phone || String(phone).trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Phone number is required'
        });
      }
      const roleMap: Record<string, Role> = {
        tenant: Role.TENANT,
        owner: Role.OWNER,
        agent: Role.AGENT,
        admin: Role.ADMIN
      };
      const normalizedRole = String(role).toLowerCase();
      if (!roleMap[normalizedRole]) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Must be tenant or owner'
        });
      }
      const result = await this.authService.register(email, password, name, roleMap[normalizedRole], String(phone).trim());
      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      if (error.message === 'User already registered') {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }
      if (error.message === 'Phone number is required') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  // =======================
  // LOGIN
  // =======================
  async login(req: Request, res: Response) {
    try {
      const {
        email,
        password,
        portal = 'USER'
      } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }
      const result = await this.authService.login(email, password);

      // ── TEMP USER CHECK (NEW) ───────────────────────────────────────
      // Prevent temp (unverified owner) accounts from logging in
      // They must claim their account first via /auth/claim-account
      if (result.user.email.startsWith("temp_")) {
        return res.status(403).json({
          success: false,
          code: 'ACCOUNT_NOT_VERIFIED',
          message: 'Please claim your account first. Use your phone number to verify your account.'
        });
      }
      // ────────────────────────────────────────────────────────────────

      // ── Portal enforcement ───────────────────────────────────────────
      // USER portal: block ADMIN accounts (must use /admin/login)
      // ADMIN portal: block non-ADMIN accounts
      if (portal !== 'ADMIN' && result.user.role === 'ADMIN') {
        return res.status(403).json({
          success: false,
          code: 'ADMIN_PORTAL_REQUIRED',
          message: 'Admin accounts must login from the admin portal'
        });
      }
      if (portal === 'ADMIN' && result.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          code: 'ADMIN_ONLY',
          message: 'This portal is for admin accounts only'
        });
      }
      // ────────────────────────────────────────────────────────────────

      return res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Login failed'
      });
    }
  }

  // =======================
  // VERIFY EMAIL
  // =======================
  async verifyEmail(req: Request, res: Response) {
    try {
      const {
        token
      } = req.query;
      if (!token || typeof token !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Verification token is required'
        });
      }
      const result = await EmailVerificationService.verifyEmail(token);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }
      return res.json({
        success: true,
        message: result.message,
        data: {
          email: result.email
        }
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Email verification failed'
      });
    }
  }

  // =======================
  // RESEND VERIFICATION
  // =======================
  async resendVerification(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      const result = await EmailVerificationService.resendVerification(userId);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }
      return res.json({
        success: true,
        message: result.message
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to resend verification email'
      });
    }
  }

  // =======================
  // CHECK PHONE (NEW API)
  // =======================
  async checkPhone(req: Request, res: Response) {
    try {
      const { phone } = req.body;
      
      if (!phone || String(phone).trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Phone number is required'
        });
      }

      const result = await this.authService.checkPhone(String(phone).trim());
      
      return res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to check phone'
      });
    }
  }

  // =======================
  // CLAIM ACCOUNT (NEW API)
  // =======================
  async claimAccount(req: Request, res: Response) {
    try {
      const { phone, email, password } = req.body;

      if (!phone || String(phone).trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Phone number is required'
        });
      }
      if (!email || String(email).trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }
      if (!password || String(password).trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Password is required'
        });
      }

      const result = await this.authService.claimAccount(
        String(phone).trim(),
        String(email).trim(),
        String(password).trim()
      );

      return res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      if (error.message && error.message.includes('already been claimed')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }
      if (error.message && error.message.includes('already registered')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }
      if (error.message && error.message.includes('No account found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to claim account'
      });
    }
  }

  // =======================
  // LOGIN WITH PHONE (NEW API)
  // =======================
  async loginPhone(req: Request, res: Response) {
    try {
      const { phone } = req.body;

      if (!phone || String(phone).trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Phone number is required'
        });
      }

      const result = await this.authService.loginPhone(String(phone).trim());

      return res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      // 404: User not found
      if (error.message && error.message.includes('No account found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      // 403: Forbidden reasons (temp account, disabled)
      if (error.message && (error.message.includes('not been properly set up') ||
                           error.message.includes('disabled'))) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }
      // Generic error handling
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to login with phone'
      });
    }
  }

  // =======================
  // SEND EMAIL OTP (NEW)
  // =======================
  async sendEmailOTP(req: AuthRequest, res: Response) {
    try {
      const { email } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!email || String(email).trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      const result = await this.authService.sendEmailOTP(userId, String(email).trim());

      return res.json({
        success: true,
        message: 'OTP sent to your email',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to send OTP'
      });
    }
  }

  // =======================
  // VERIFY EMAIL OTP (NEW)
  // =======================
  async verifyEmailOTP(req: AuthRequest, res: Response) {
    try {
      const { email, otp } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!email || String(email).trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      if (!otp || String(otp).trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'OTP is required'
        });
      }

      const result = await this.authService.verifyEmailOTP(
        userId,
        String(email).trim(),
        String(otp).trim()
      );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          code: result.code,
          message: result.message
        });
      }

      return res.json({
        success: true,
        message: 'Email verified successfully',
        data: result
      });
    } catch (error: any) {
      if (error.message && error.message.includes('EMAIL_ALREADY_IN_USE')) {
        return res.status(409).json({
          success: false,
          code: 'EMAIL_ALREADY_IN_USE',
          message: error.message
        });
      }

      res.status(400).json({
        success: false,
        message: error.message || 'Failed to verify OTP'
      });
    }
  }

  // =======================
  // REQUEST EMAIL LOGIN OTP (PASSWORDLESS)
  // =======================
  async requestEmailLoginOTP(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email || String(email).trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      // ✅ PASSWORDLESS: Always attempts to send OTP
      // If user doesn't exist → creates temporary user
      // Security: Never reveals whether email exists (prevents enumeration)
      const result = await this.authService.requestEmailLoginOTP(String(email).trim());

      return res.json({
        success: true,
        message: result.message,
        data: { success: true }
      });
    } catch (error: any) {
      // Only disabled accounts should throw
      if (error.message && error.message.includes('disabled')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }
      
      // Cooldown error
      if (error.message && error.message.includes('cooldown')) {
        return res.status(429).json({
          success: false,
          message: error.message
        });
      }
      
      // Generic error - still return success for security
      // (don't expose that OTP generation failed)
      res.json({
        success: true,
        message: 'OTP sent to your email'
      });
    }
  }

  // =======================
  // VERIFY EMAIL LOGIN OTP (PASSWORDLESS)
  // =======================
  async verifyEmailLoginOTP(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;

      if (!email || String(email).trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      if (!otp || String(otp).trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'OTP is required'
        });
      }

      // ✅ PASSWORDLESS: Verify OTP and login
      // Creates/joins user account via email OTP
      const result = await this.authService.verifyEmailLoginOTP(
        String(email).trim(),
        String(otp).trim()
      );

      if (!result.success) {
        // Map error codes to HTTP status codes
        if (result.code === 'ACCOUNT_DISABLED') {
          return res.status(403).json({
            success: false,
            code: result.code,
            message: result.message
          });
        }
        
        if (result.code === 'INVALID_OTP') {
          return res.status(400).json({
            success: false,
            code: result.code,
            message: result.message
          });
        }
        
        // Default error (USER_NOT_FOUND, VERIFICATION_ERROR, etc)
        return res.status(400).json({
          success: false,
          code: result.code,
          message: result.message
        });
      }

      // ✅ SUCCESS: Return user + JWT token
      return res.json({
        success: true,
        message: result.message,
        data: {
          user: result.user,
          token: result.token
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to verify OTP'
      });
    }
  }
}