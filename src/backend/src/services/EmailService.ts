import { Resend } from "resend";
import { logger } from "../utils/logger";
import { env } from "../config/env";

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
export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(env.EMAIL.RESEND_API_KEY);
  }

  /**
   * Send basic email (non-blocking)
   *
   * Returns immediately. Email sent in background.
   * Caller never sees errors — errors logged only.
   */
  async send(params: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
  }): Promise<void> {
    // Non-blocking: fire and forget
    this.sendAsync({
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    }).catch((err) => {
      // Error already logged in sendAsync
    });
  }

  /**
   * Internal async send with error handling
   */
  private async sendAsync(params: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
  }): Promise<void> {
    try {
      const response = await this.resend.emails.send({
        from: `${env.EMAIL.FROM_NAME} <${env.EMAIL.FROM_EMAIL}>`,
        to: params.to,
        subject: params.subject,
        html: params.html || "",
        text: params.text || "",
      });

      if (!response.data?.id) {
        throw new Error("Email sending failed");
      }

      logger.info("Email sent successfully", {
        to: params.to,
        messageId: response.data.id,
        subject: params.subject,
      });
    } catch (error: any) {
      // Error is logged, NOT thrown
      logger.error("Email send failed", {
        to: params.to,
        subject: params.subject,
        error: error.message,
        code: error.code,
      });
    }
  }

  /**
   * Send OTP email
   */
  async sendOTP(email: string, code: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto;">
      <h2>Welcome to Homilivo</h2>
        <h2 style="color: #333;">Your OTP Code</h2>
        <p style="color: #666; font-size: 16px;">Your one-time password is:</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="font-size: 48px; letter-spacing: 8px; margin: 0; color: #000; font-family: monospace;">${code}</h1>
        </div>
        <p style="color: #999; font-size: 14px;">This code expires in 10 minutes.</p>
        <p style="color: #999; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
      </div>
    `;

    const text = `Your OTP: ${code}\nExpires in 10 minutes.`;

    await this.send({
      to: email,
      subject: "Your OTP Code — Homilivo",
      html,
      text,
    });
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(
    email: string,
    verificationLink: string,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #333;">Verify Your Email</h2>
        <p style="color: #666; font-size: 16px;">Click the link below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="background: #000; color: white; padding: 12px 40px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Verify Email</a>
        </div>
        <p style="color: #666; font-size: 14px;">Or copy this link:<br/><code style="background: #f5f5f5; padding: 8px; display: block; margin: 10px 0; word-break: break-all;">${verificationLink}</code></p>
        <p style="color: #999; font-size: 14px;">This link expires in 24 hours.</p>
      </div>
    `;

    const text = `Verify your email: ${verificationLink}\nThis link expires in 24 hours.`;

    await this.send({
      to: email,
      subject: "Verify Your Email — Homilivo",
      html,
      text,
    });
  }

  /**
   * Send password reset email
   * Expiry: 20 minutes
   */
  async sendPasswordReset(email: string, resetLink: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p style="color: #666; font-size: 16px;">Click the link below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background: #000; color: white; padding: 12px 40px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #999; font-size: 14px;">This link expires in 20 minutes.</p>
        <p style="color: #999; font-size: 14px;">If you didn't request this, please ignore this email.</p>
      </div>
    `;

    const text = `Reset your password: ${resetLink}\nThis link expires in 20 minutes.`;

    await this.send({
      to: email,
      subject: "Reset Your Password — Homilivo",
      html,
      text,
    });
  }
}

// Singleton export
export const emailService = new EmailService();
