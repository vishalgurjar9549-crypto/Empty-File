import bcrypt from "bcryptjs";
import { PrismaUserRepository } from "../repositories/PrismaUserRepository";
import { generateToken } from "../utils/jwt";
import { Role } from "@prisma/client";
import { EmailVerificationService } from "./EmailVerificationService";
import { otpService } from "./OtpService";
import { getPrismaClient } from "../utils/prisma";
import { logger } from "../utils/logger";
import {
  ValidationError,
  DuplicateError,
  ForbiddenError,
  NotFoundError,
} from "../errors/AppErrors";
import { IdentityLinkingService } from "./IdentityLinkingService";

export class AuthService {
  private identityLinking: IdentityLinkingService;

  constructor(private userRepository: PrismaUserRepository) {
    this.identityLinking = new IdentityLinkingService(userRepository);
  }
  async register(
    email: string,
    password: string,
    name: string,
    role: Role,
    phone?: string | null,
  ) {
    // Normalize email
    email = email.toLowerCase().trim();

    // Validate role - only TENANT, OWNER, and AGENT can sign up
    if (role !== Role.TENANT && role !== Role.OWNER && role !== Role.AGENT) {
      throw new ForbiddenError("Only TENANT, OWNER, and AGENT roles can sign up.");
    }

    // Enforce phone is required
    if (!phone || phone.trim() === "") {
      throw new ValidationError("Phone number is required");
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new DuplicateError("User already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const user = await this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      role,
      phone: phone.trim(),
      city: null,
      googleId: null,
      phoneVerified: false,
      phoneVerifiedAt: null,
      isActive: true,
      emailVerified: false,
      emailVerifiedAt: null,
      emailVerifyToken: null,
      emailVerifyExpiry: null,
      passwordResetToken: null,
      passwordResetExpiry: null,
      lastLoginAt: null,
      lastPropertyUpdateAt: null,
    });

    // Send verification email — NEVER crash registration if this fails
    try {
      await EmailVerificationService.generateAndSendVerification(
        user.id,
        user.email,
      );
    } catch (err: any) {
      logger.error("Failed to send verification email during registration", {
        userId: user.id,
        error: err.message,
      });
      // Registration still succeeds — user can resend later
    }

    // Generate JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
    };
  }
  async login(email: string, password: string) {
    // FIX 5: Normalize email before lookup
    email = email.toLowerCase().trim();

    // Fetch user from database
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // FIX 2: Block disabled users from logging in
    if (!user.isActive) {
      throw new ForbiddenError(
        "Account has been disabled. Please contact support.",
      );
    }

    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user without password (SOFT MODE: include emailVerified status)
    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
    };
  }
  async getUserById(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) return null;
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async autoLoginByProperty(propertyId: string) {
    if (!propertyId || propertyId.trim() === "") {
      throw new ValidationError("Property ID is required");
    }

    const prisma = getPrismaClient();
    const normalizedPropertyId = propertyId.trim();

    const property = await prisma.room.findUnique({
      where: { id: normalizedPropertyId },
      select: {
        id: true,
        ownerId: true,
      },
    });

    if (!property) {
      throw new NotFoundError("Property", normalizedPropertyId);
    }

    const owner = await this.userRepository.findById(property.ownerId);
    if (!owner) {
      throw new NotFoundError("Owner", property.ownerId);
    }

    if (!owner.isActive) {
      throw new ForbiddenError(
        "Account has been disabled. Please contact support.",
      );
    }

    const token = generateToken({
      userId: owner.id,
      email: owner.email,
      role: owner.role,
    });

    logger.info("Property review auto-login successful", {
      propertyId: normalizedPropertyId,
      ownerId: owner.id,
    });

    const { password: _, ...userWithoutPassword } = owner;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  // =======================
  // CHECK PHONE (NEW API)
  // =======================
  async checkPhone(phone: string) {
    if (!phone || phone.trim() === "") {
      throw new ValidationError("Phone number is required");
    }

    const user = await this.userRepository.findByPhone(phone.trim());

    return {
      exists: !!user,
      isTemp: user ? user.email.startsWith("temp_") : false,
    };
  }

  // =======================
  // CLAIM ACCOUNT (NEW API)
  // =======================
  async claimAccount(phone: string, email: string, password: string) {
    // Validation
    if (!phone || phone.trim() === "") {
      throw new ValidationError("Phone number is required");
    }
    if (!email || email.trim() === "") {
      throw new ValidationError("Email is required");
    }
    if (!password || password.trim() === "") {
      throw new ValidationError("Password is required");
    }

    const normalizedPhone = phone.trim();
    const normalizedEmail = email.toLowerCase().trim();

    // Find user by phone
    const user = await this.userRepository.findByPhone(normalizedPhone);
    if (!user) {
      throw new ValidationError(
        "No account found with this phone number. Please sign up first.",
      );
    }

    // Check if this is actually a temp account
    if (!user.email.startsWith("temp_")) {
      throw new ValidationError(
        "This account has already been claimed. Please log in instead.",
      );
    }

    // Check if the new email is already taken
    const existingEmail = await this.userRepository.findByEmail(
      normalizedEmail,
    );
    if (existingEmail && existingEmail.id !== user.id) {
      throw new DuplicateError(
        "Email is already registered. Please use a different email.",
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user: email, password, mark as not yet verified
    const updatedUser = await this.userRepository.update(user.id, {
      email: normalizedEmail,
      password: hashedPassword,
      emailVerified: false,
      emailVerifyToken: null,
      emailVerifyExpiry: null,
    });

    // Send verification email — fail silently
    try {
      await EmailVerificationService.generateAndSendVerification(
        updatedUser.id,
        updatedUser.email,
      );
    } catch (err: any) {
      logger.error("Failed to send verification email during account claim", {
        userId: updatedUser.id,
        error: err.message,
      });
      // Claim still succeeds — user can resend later
    }

    // Generate JWT for the claimed account
    const token = generateToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
    });

    const { password: _, ...userWithoutPassword } = updatedUser;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  // =======================
  // LOGIN WITH PHONE (NEW API)
  // =======================
  async loginPhone(phone: string) {
    // Validate phone
    if (!phone || phone.trim() === "") {
      throw new ValidationError("Phone number is required");
    }

    const normalizedPhone = this.identityLinking.normalizePhone(phone);

    // ═════════════════════════════════════════════════════════════════════
    // USE IDENTITY LINKING: Find user by phone
    // ═════════════════════════════════════════════════════════════════════
    const user = await this.userRepository.findByPhone(normalizedPhone);

    if (!user) {
      logger.warn("Phone login attempt - user not found", {
        phone: normalizedPhone,
      });
      throw new ValidationError(
        "No account found with this phone number. Please sign up first.",
      );
    }

    // Security Check 1: Block temp accounts (email starts with "temp_")
    if (user.email.startsWith("temp_")) {
      logger.warn("Phone login attempt - temp account detected", {
        userId: user.id,
        phone: normalizedPhone,
        email: user.email,
      });
      throw new ForbiddenError(
        "This account has not been properly set up. Please claim your account first.",
      );
    }

    // Security Check 2: Only allow if user.isActive === true
    if (!user.isActive) {
      logger.warn("Phone login attempt - inactive account", {
        userId: user.id,
        phone: normalizedPhone,
      });
      throw new ForbiddenError(
        "Account has been disabled. Please contact support.",
      );
    }

    // Log successful phone login attempt
    logger.info("Phone login successful", {
      userId: user.id,
      phone: normalizedPhone,
      email: user.email,
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  // =======================
  // SEND EMAIL OTP
  // =======================
  async sendEmailOTP(userId: string, email: string) {
    email = email.toLowerCase().trim();

    // Get current user from token context if available
    // For now, we just need to validate email and send OTP
    // The user association happens during verification

    try {
      // Generate 6-digit code and store it
      const result = await otpService.createAndSendOTP(userId, email);

      logger.info("Email OTP sent", {
        email,
      });

      return {
        success: true,
        message: "OTP sent to email",
      };
    } catch (error: any) {
      logger.error("Failed to send email OTP", {
        email,
        error: error.message,
      });
      throw error;
    }
  }

  // =======================
  // VERIFY EMAIL OTP
  // =======================
  async verifyEmailOTP(
    userId: string,
    email: string,
    otp: string,
  ): Promise<{
    success: boolean;
    code?: string;
    message: string;
    user?: any;
    token?: string;
  }> {
    const prisma = getPrismaClient();
    email = email.toLowerCase().trim();

    try {
      // Step 1: Verify OTP
      const otpResult = await otpService.verifyOTP(userId, email, otp);

      if (!otpResult.valid) {
        return {
          success: false,
          code: "INVALID_OTP",
          message: otpResult.reason || "Invalid OTP code",
        };
      }

      // Step 2: Get current user
      const currentUser = await this.userRepository.findById(userId);
      if (!currentUser) {
        throw new ValidationError("User not found");
      }

      // Step 3: Check email ownership (CRITICAL SAFETY CHECK)
      // CASE A: Email belongs to different user → ERROR
      // CASE B: Email belongs to same user → Just mark verified
      // CASE C: Email doesn't exist → UPDATE current user
      const existingUserWithEmail = await this.userRepository.findByEmail(
        email,
      );

      if (existingUserWithEmail && existingUserWithEmail.id !== userId) {
        logger.warn("Email ownership conflict detected", {
          userId,
          currentEmail: currentUser.email,
          attemptedEmail: email,
          conflictingUserId: existingUserWithEmail.id,
        });

        return {
          success: false,
          code: "EMAIL_ALREADY_IN_USE",
          message:
            "Email already associated with another account. Please use a different email.",
        };
      }

      // CASE B or C: Update user with new email and mark as verified
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          email,
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });

      logger.info("Email verified via OTP", {
        userId,
        email,
        previousEmail: currentUser.email,
      });

      // Generate new token
      const token = generateToken({
        userId: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      });

      const { password: _, ...userWithoutPassword } = updatedUser;

      return {
        success: true,
        message: "Email verified successfully",
        user: userWithoutPassword,
        token,
      };
    } catch (error: any) {
      logger.error("Email OTP verification error", {
        userId,
        email,
        error: error.message,
      });
      throw error;
    }
  }

  // =======================
  // EMAIL LOGIN OTP REQUEST
  // =======================
  async requestEmailLoginOTP(email: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const prisma = getPrismaClient();
    email = this.identityLinking.normalizeEmail(email);

    try {
      // ═════════════════════════════════════════════════════════════
      // STEP 1: USE IDENTITY LINKING (find or create user)
      // Priority: Email > Phone > Create New
      // ═════════════════════════════════════════════════════════════
      const user = await this.identityLinking.findOrCreateUserByIdentity({
        email,
        role: Role.TENANT,
      });

      logger.info("Email login OTP requested", {
        userId: user.id,
        email,
        isNewUser: !user.emailVerified,
      });

      // ═════════════════════════════════════════════════════════════
      // STEP 2: OTP COOLDOWN CHECK (60 seconds)
      // ═════════════════════════════════════════════════════════════
      const recentOTP = await prisma.emailOtp.findFirst({
        where: {
          userId: user.id,
          email,
          isUsed: false,
        },
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      });

      if (recentOTP) {
        const secondsSinceCreated =
          (new Date().getTime() - recentOTP.createdAt.getTime()) / 1000;
        if (secondsSinceCreated < 60) {
          logger.warn("OTP cooldown enforced - request too soon", {
            userId: user.id,
            email,
            secondsElapsed: secondsSinceCreated,
          });
          throw new ValidationError(
            "Please wait 60 seconds before requesting a new OTP",
          );
        }
      }

      // ═════════════════════════════════════════════════════════════
      // STEP 3: GENERATE AND SEND OTP
      // ═════════════════════════════════════════════════════════════
      await otpService.createAndSendOTP(user.id, email);

      logger.info("Email login OTP sent successfully", {
        userId: user.id,
        email,
      });

      return {
        success: true,
        message: "OTP sent to your email",
      };
    } catch (error: any) {
      // Throw for critical errors only
      if (
        error.message &&
        (error.message.includes("disabled") ||
          error.message.includes("cooldown"))
      ) {
        throw error;
      }

      logger.error("Failed to request email login OTP", {
        email,
        error: error.message,
      });

      // Always return success for security (no email enumeration)
      return {
        success: true,
        message: "OTP sent to your email",
      };
    }
  }

  // =======================
  // EMAIL LOGIN OTP VERIFY
  // =======================
  async verifyEmailLoginOTP(
    email: string,
    otp: string,
  ): Promise<{
    success: boolean;
    code?: string;
    message: string;
    user?: any;
    token?: string;
  }> {
    const prisma = getPrismaClient();
    email = email.toLowerCase().trim();

    try {
      // ═════════════════════════════════════════════════════════════
      // STEP 1: FIND USER BY EMAIL
      // ═════════════════════════════════════════════════════════════
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        logger.warn("Email login OTP verification - user not found", {
          email,
        });
        return {
          success: false,
          code: "USER_NOT_FOUND",
          message: "No account found with this email",
        };
      }

      // ═════════════════════════════════════════════════════════════
      // STEP 2: SECURITY CHECK - ACCOUNT DISABLED
      // ═════════════════════════════════════════════════════════════
      if (!user.isActive) {
        logger.warn("Email login OTP verification - account disabled", {
          userId: user.id,
          email,
        });
        return {
          success: false,
          code: "ACCOUNT_DISABLED",
          message: "Account has been disabled",
        };
      }

      // ═════════════════════════════════════════════════════════════
      // STEP 3: VERIFY OTP CODE
      // ═════════════════════════════════════════════════════════════
      const otpResult = await otpService.verifyOTP(user.id, email, otp);

      if (!otpResult.valid) {
        logger.warn("Email login OTP verification - invalid OTP", {
          userId: user.id,
          email,
          reason: otpResult.reason,
        });
        return {
          success: false,
          code: "INVALID_OTP",
          message: otpResult.reason || "Invalid OTP code",
        };
      }

      // ═════════════════════════════════════════════════════════════
      // STEP 4: MARK EMAIL AS VERIFIED
      // ═════════════════════════════════════════════════════════════
      const verifiedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });

      logger.info("Email marked as verified after OTP", {
        userId: user.id,
        email,
      });

      // ═════════════════════════════════════════════════════════════
      // STEP 5: GENERATE JWT TOKEN (LOGIN)
      // ═════════════════════════════════════════════════════════════
      const token = generateToken({
        userId: verifiedUser.id,
        email: verifiedUser.email,
        role: verifiedUser.role,
      });

      logger.info("Email login OTP verification successful - user logged in", {
        userId: verifiedUser.id,
        email,
        isNewUser: !user.emailVerified, // Was new user if not previously verified
      });

      // ═════════════════════════════════════════════════════════════
      // STEP 6: RETURN USER + TOKEN
      // ═════════════════════════════════════════════════════════════
      const { password: _, ...userWithoutPassword } = verifiedUser;

      return {
        success: true,
        message: "Login successful",
        user: userWithoutPassword,
        token,
      };
    } catch (error: any) {
      logger.error("Email login OTP verification error", {
        email,
        error: error.message,
      });
      return {
        success: false,
        code: "VERIFICATION_ERROR",
        message: error.message || "Failed to verify OTP",
      };
    }
  }
}
