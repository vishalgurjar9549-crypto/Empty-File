import { PrismaUserRepository } from "../repositories/PrismaUserRepository";
import { getPrismaClient } from "../utils/prisma";
import { logger } from "../utils/logger";
import { ValidationError, ForbiddenError } from "../errors/AppErrors";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

/**
 * ═════════════════════════════════════════════════════════════════════
 * IDENTITY LINKING SERVICE
 * ═════════════════════════════════════════════════════════════════════
 *
 * Prevents duplicate users by intelligently linking identities.
 * Priority: Email > Phone > Create New
 *
 * Rules:
 * 1. If email exists → use that user
 * 2. Else if phone exists → use that user
 * 3. Else → create new user
 *
 * Security:
 * - Email always normalized (lowercase + trimmed)
 * - Phone always normalized (trimmed)
 * - Never create duplicate identities
 * - Check account active status
 */

export class IdentityLinkingService {
  private prisma = getPrismaClient();
  private userRepository: PrismaUserRepository;

  constructor(userRepository: PrismaUserRepository) {
    this.userRepository = userRepository;
  }

  /**
   * ═════════════════════════════════════════════════════════════════════
   * NORMALIZE EMAIL
   * ═════════════════════════════════════════════════════════════════════
   */
  normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  /**
   * ═════════════════════════════════════════════════════════════════════
   * NORMALIZE PHONE
   * ═════════════════════════════════════════════════════════════════════
   */
  normalizePhone(phone: string): string {
    return phone.trim();
  }

  /**
   * ═════════════════════════════════════════════════════════════════════
   * FIND OR CREATE USER BY IDENTITY
   *
   * Priority Resolution:
   * 1. If email exists → use that user
   * 2. Else if phone exists → use that user
   * 3. Else → create new user with placeholder password
   *
   * Use Case: Email OTP login, Google OAuth, Phone registration
   * ═════════════════════════════════════════════════════════════════════
   */
  async findOrCreateUserByIdentity(params: {
    email?: string;
    phone?: string;
    name?: string;
    role?: Role;
  }): Promise<any> {
    const { email, phone, name = "User", role = Role.TENANT } = params;

    // Normalize inputs
    const normalizedEmail = email ? this.normalizeEmail(email) : null;
    const normalizedPhone = phone ? this.normalizePhone(phone) : null;

    // ═════════════════════════════════════════════════════════════════════
    // STEP 1: CHECK IF EMAIL EXISTS (highest priority)
    // ═════════════════════════════════════════════════════════════════════
    if (normalizedEmail) {
      const userByEmail = await this.userRepository.findByEmail(
        normalizedEmail,
      );
      if (userByEmail) {
        if (!userByEmail.isActive) {
          throw new ForbiddenError("Account has been disabled");
        }
        logger.info("Found existing user by email", {
          userId: userByEmail.id,
          email: normalizedEmail,
        });
        return userByEmail;
      }
    }

    // ═════════════════════════════════════════════════════════════════════
    // STEP 2: CHECK IF PHONE EXISTS
    // ═════════════════════════════════════════════════════════════════════
    if (normalizedPhone) {
      const userByPhone = await this.userRepository.findByPhone(
        normalizedPhone,
      );
      if (userByPhone) {
        if (!userByPhone.isActive) {
          throw new ForbiddenError("Account has been disabled");
        }
        logger.info("Found existing user by phone", {
          userId: userByPhone.id,
          phone: normalizedPhone,
        });
        return userByPhone;
      }
    }

    // ═════════════════════════════════════════════════════════════════════
    // STEP 3: CREATE NEW USER (no existing identity found)
    // ═════════════════════════════════════════════════════════════════════
    logger.info("Creating new user from identity", {
      email: normalizedEmail,
      phone: normalizedPhone,
    });

    // Create placeholder password for passwordless users
    const placeholderPassword = await bcrypt.hash("", 10);

    const newUser = await this.userRepository.create({
      email: normalizedEmail || `temp_${Date.now()}@temporary.local`,
      password: placeholderPassword,
      name: name || normalizedEmail?.split("@")[0] || "User",
      role,
      phone: normalizedPhone || null,
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
      city: null,
      lastLoginAt: null,
      lastPropertyUpdateAt: null,
    });

    logger.info("Successfully created new user", {
      userId: newUser.id,
      email: normalizedEmail,
      phone: normalizedPhone,
    });

    return newUser;
  }

  /**
   * ═════════════════════════════════════════════════════════════════════
   * LINK EMAIL TO EXISTING USER (phone user adding email)
   * ═════════════════════════════════════════════════════════════════════
   */
  async linkEmailToUser(userId: string, email: string): Promise<any> {
    const normalizedEmail = this.normalizeEmail(email);

    // Check if this email is already in use by another user
    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser && existingUser.id !== userId) {
      throw new ValidationError("Email already in use by another account");
    }

    // Update user with email
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: normalizedEmail,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    logger.info("Linked email to user", {
      userId,
      email: normalizedEmail,
    });

    return updatedUser;
  }

  /**
   * ═════════════════════════════════════════════════════════════════════
   * LINK PHONE TO EXISTING USER (email user adding phone)
   * ═════════════════════════════════════════════════════════════════════
   */
  async linkPhoneToUser(userId: string, phone: string): Promise<any> {
    const normalizedPhone = this.normalizePhone(phone);

    // Check if this phone is already in use by another user
    const existingUser = await this.userRepository.findByPhone(normalizedPhone);
    if (existingUser && existingUser.id !== userId) {
      throw new ValidationError("Phone already in use by another account");
    }

    // Update user with phone
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        phone: normalizedPhone,
        phoneVerified: true,
        phoneVerifiedAt: new Date(),
      },
    });

    logger.info("Linked phone to user", {
      userId,
      phone: normalizedPhone,
    });

    return updatedUser;
  }

  /**
   * ═════════════════════════════════════════════════════════════════════
   * LINK GOOGLE ID TO EXISTING USER
   * ═════════════════════════════════════════════════════════════════════
   */
  async linkGoogleIdToUser(userId: string, googleId: string): Promise<any> {
    // Check if this googleId is already in use
    const existingUser = await this.prisma.user.findUnique({
      where: { googleId },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new ValidationError(
        "Google account already linked to another user",
      );
    }

    // Update user with Google ID + auto-verify email (Google already verified)
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        googleId,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        emailVerifyToken: null,
        emailVerifyExpiry: null,
      },
    });

    logger.info("Linked Google ID to user", {
      userId,
      googleId,
    });

    return updatedUser;
  }

  /**
   * ═════════════════════════════════════════════════════════════════════
   * CHECK IF EMAIL VERIFIED
   *
   * Used as guard for sensitive operations like property creation
   * ═════════════════════════════════════════════════════════════════════
   */
  async requireEmailVerified(userId: string): Promise<{ verified: boolean }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ValidationError("User not found");
    }

    if (!user.emailVerified) {
      return {
        verified: false,
      };
    }

    return {
      verified: true,
    };
  }
}
