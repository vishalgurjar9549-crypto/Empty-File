/**
 * OTP SERVICE
 *
 * Handles email OTP generation, storage, sending, and validation.
 *
 * DESIGN:
 * - Generate: Create 6-digit code, hash it, store in DB with 10-min expiry
 * - Send: Call EmailService with code
 * - Verify: Check hash, expiry, attempt count
 *
 * SECURITY:
 * - Code stored as SHA256 hash (never plaintext)
 * - Max 5 attempts per OTP
 * - Expires after 10 minutes
 * - Marked as used after successful verification
 */
export declare class OtpService {
    private prisma;
    private readonly OTP_LENGTH;
    private readonly OTP_EXPIRY_MINUTES;
    private readonly MAX_ATTEMPTS;
    /**
     * Generate a random 6-digit OTP
     */
    generateCode(): string;
    /**
     * Hash an OTP code (SHA256)
     */
    private hashCode;
    /**
     * Create and send OTP to email
     *
     * Steps:
     * 1. Generate 6-digit code
     * 2. Hash code
     * 3. Store in DB with 10-min expiry
     * 4. Send via email (async, non-blocking)
     * 5. Return success
     */
    createAndSendOTP(userId: string, email: string): Promise<{
        success: boolean;
    }>;
    /**
     * Verify OTP code
     *
     * Steps:
     * 1. Find active OTP for user+email
     * 2. Check not expired
     * 3. Check not used
     * 4. Check attempts < max
     * 5. Verify hash matches
     * 6. Mark as used
     * 7. Return { valid: true }
     *
     * Returns: { valid: boolean, reason?: string }
     */
    verifyOTP(userId: string, email: string, enteredCode: string): Promise<{
        valid: boolean;
        reason?: string;
    }>;
}
export declare const otpService: OtpService;
//# sourceMappingURL=OtpService.d.ts.map