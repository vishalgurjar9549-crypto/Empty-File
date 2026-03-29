import { PrismaUserRepository } from "../repositories/PrismaUserRepository";
import { Role } from "@prisma/client";
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
export declare class IdentityLinkingService {
    private prisma;
    private userRepository;
    constructor(userRepository: PrismaUserRepository);
    /**
     * ═════════════════════════════════════════════════════════════════════
     * NORMALIZE EMAIL
     * ═════════════════════════════════════════════════════════════════════
     */
    normalizeEmail(email: string): string;
    /**
     * ═════════════════════════════════════════════════════════════════════
     * NORMALIZE PHONE
     * ═════════════════════════════════════════════════════════════════════
     */
    normalizePhone(phone: string): string;
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
    findOrCreateUserByIdentity(params: {
        email?: string;
        phone?: string;
        name?: string;
        role?: Role;
    }): Promise<any>;
    /**
     * ═════════════════════════════════════════════════════════════════════
     * LINK EMAIL TO EXISTING USER (phone user adding email)
     * ═════════════════════════════════════════════════════════════════════
     */
    linkEmailToUser(userId: string, email: string): Promise<any>;
    /**
     * ═════════════════════════════════════════════════════════════════════
     * LINK PHONE TO EXISTING USER (email user adding phone)
     * ═════════════════════════════════════════════════════════════════════
     */
    linkPhoneToUser(userId: string, phone: string): Promise<any>;
    /**
     * ═════════════════════════════════════════════════════════════════════
     * LINK GOOGLE ID TO EXISTING USER
     * ═════════════════════════════════════════════════════════════════════
     */
    linkGoogleIdToUser(userId: string, googleId: string): Promise<any>;
    /**
     * ═════════════════════════════════════════════════════════════════════
     * CHECK IF EMAIL VERIFIED
     *
     * Used as guard for sensitive operations like property creation
     * ═════════════════════════════════════════════════════════════════════
     */
    requireEmailVerified(userId: string): Promise<{
        verified: boolean;
    }>;
}
//# sourceMappingURL=IdentityLinkingService.d.ts.map