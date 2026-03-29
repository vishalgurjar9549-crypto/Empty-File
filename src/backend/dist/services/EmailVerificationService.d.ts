/**
 * EMAIL VERIFICATION SERVICE
 *
 * Handles token generation, storage, verification, and resend logic.
 * Email sending is abstracted — currently logs the verification URL.
 * Replace sendVerificationEmail() internals with real provider (SendGrid, SES, etc.)
 * when ready.
 *
 * Security:
 * - Tokens are 32-byte crypto-random hex strings (64 chars)
 * - Tokens expire after 24 hours
 * - Tokens are cleared after successful verification (single-use)
 * - Unique constraint on emailVerifyToken prevents collisions
 */
export declare class EmailVerificationService {
    /**
     * Generate a secure random verification token
     */
    static generateToken(): string;
    /**
     * Create and store a verification token for a user.
     * Returns the raw token (to be sent via email).
     */
    static createVerificationToken(userId: string): Promise<string>;
    /**
     * Send verification email to user.
     *
     * PLACEHOLDER: Logs the verification URL.
     * Replace with real email provider (SendGrid, AWS SES, Resend, etc.)
     * when ready for production email delivery.
     */
    static sendVerificationEmail(email: string, token: string): Promise<void>;
    /**
     * Generate token + send email in one call.
     * Used by registration flow and resend endpoint.
     */
    static generateAndSendVerification(userId: string, email: string): Promise<void>;
    /**
     * Verify email using token.
     *
     * Steps:
     * 1. Find user by token
     * 2. Check token hasn't expired
     * 3. Set emailVerified = true, emailVerifiedAt = now()
     * 4. Clear token fields (single-use)
     *
     * Returns: { success, message, email? }
     */
    static verifyEmail(token: string): Promise<{
        success: boolean;
        message: string;
        email?: string;
    }>;
    /**
     * Resend verification email.
     *
     * Guards:
     * - User must exist
     * - User must NOT already be verified
     * - Generates fresh token + expiry (invalidates old one)
     */
    static resendVerification(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=EmailVerificationService.d.ts.map