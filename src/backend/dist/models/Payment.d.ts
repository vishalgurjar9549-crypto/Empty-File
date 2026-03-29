import { z } from 'zod';
export declare const PaymentStatus: z.ZodEnum<["CREATED", "INITIATED", "PENDING", "VERIFIED", "FAILED", "EXPIRED"]>;
export type PaymentStatus = z.infer<typeof PaymentStatus>;
export interface Payment {
    id: string;
    tenantId: string;
    plan: string;
    city: string;
    amount: number;
    orderId: string;
    utr?: string;
    status: PaymentStatus;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    verifiedAt?: string;
    subscriptionId?: string;
}
export declare const CreatePaymentSchema: z.ZodObject<{
    plan: z.ZodEnum<["GOLD", "PLATINUM"]>;
    city: z.ZodString;
    amount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    city: string;
    plan: "GOLD" | "PLATINUM";
    amount: number;
}, {
    city: string;
    plan: "GOLD" | "PLATINUM";
    amount: number;
}>;
export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;
export declare const VerifyPaymentSchema: z.ZodObject<{
    orderId: z.ZodString;
    utr: z.ZodString;
}, "strip", z.ZodTypeAny, {
    orderId: string;
    utr: string;
}, {
    orderId: string;
    utr: string;
}>;
export type VerifyPaymentInput = z.infer<typeof VerifyPaymentSchema>;
export declare const PaymentWebhookSchema: z.ZodObject<{
    orderId: z.ZodString;
    status: z.ZodString;
    utr: z.ZodOptional<z.ZodString>;
    amount: z.ZodOptional<z.ZodNumber>;
    signature: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    status: string;
    orderId: string;
    amount?: number | undefined;
    utr?: string | undefined;
    signature?: string | undefined;
    metadata?: Record<string, any> | undefined;
}, {
    status: string;
    orderId: string;
    amount?: number | undefined;
    utr?: string | undefined;
    signature?: string | undefined;
    metadata?: Record<string, any> | undefined;
}>;
export type PaymentWebhookInput = z.infer<typeof PaymentWebhookSchema>;
export interface PaymentInitiationResponse {
    orderId: string;
    amount: number;
    upiId: string;
    qrCode?: string;
    deepLink?: string;
    status: PaymentStatus;
}
export interface PaymentVerificationResponse {
    orderId: string;
    status: PaymentStatus;
    verified: boolean;
    subscriptionActivated: boolean;
    message?: string;
}
//# sourceMappingURL=Payment.d.ts.map