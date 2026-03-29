"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentWebhookSchema = exports.VerifyPaymentSchema = exports.CreatePaymentSchema = exports.PaymentStatus = void 0;
const zod_1 = require("zod");
// Payment Status enum matching Prisma
exports.PaymentStatus = zod_1.z.enum(['CREATED', 'INITIATED', 'PENDING', 'VERIFIED', 'FAILED', 'EXPIRED']);
// Create payment input schema
exports.CreatePaymentSchema = zod_1.z.object({
    plan: zod_1.z.enum(['GOLD', 'PLATINUM']),
    city: zod_1.z.string().min(1, 'City is required'),
    amount: zod_1.z.number().min(1, 'Amount must be positive')
});
// Verify payment input schema
exports.VerifyPaymentSchema = zod_1.z.object({
    orderId: zod_1.z.string().min(1, 'Order ID is required'),
    utr: zod_1.z.string().min(1, 'UTR (transaction reference) is required')
});
// Payment webhook schema
exports.PaymentWebhookSchema = zod_1.z.object({
    orderId: zod_1.z.string(),
    status: zod_1.z.string(),
    utr: zod_1.z.string().optional(),
    amount: zod_1.z.number().optional(),
    signature: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional()
});
//# sourceMappingURL=Payment.js.map