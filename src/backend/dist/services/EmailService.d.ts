/**
 * EMAIL SERVICE
 *
 * Handles all email sending via Resend API.
 * Non-blocking: All sends are fire-and-forget (never blocks API responses).
 * Failures are logged but never thrown to caller (fail silently).
 *
 * SAFETY PRINCIPLES:
 * - Email failures never crash the API
 * - All operations wrapped in try-catch
 * - Errors logged for debugging
 * - Caller never sees email errors
 */
export declare class EmailService {
    private resend;
    constructor();
    /**
     * Send basic email (non-blocking)
     *
     * Returns immediately. Email sent in background.
     * Caller never sees errors — errors logged only.
     */
    send(params: {
        to: string;
        subject: string;
        html?: string;
        text?: string;
    }): Promise<void>;
    /**
     * Internal async send with error handling
     */
    private sendAsync;
    /**
     * Send OTP email
     */
    sendOTP(email: string, code: string): Promise<void>;
    /**
     * Send email verification
     */
    sendVerificationEmail(email: string, verificationLink: string): Promise<void>;
    /**
     * Send password reset email
     */
    sendPasswordReset(email: string, resetLink: string): Promise<void>;
}
export declare const emailService: EmailService;
//# sourceMappingURL=EmailService.d.ts.map