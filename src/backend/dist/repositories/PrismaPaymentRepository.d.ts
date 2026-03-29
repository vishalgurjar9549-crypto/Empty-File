import { Payment, PaymentStatus } from '@prisma/client';
interface CreatePaymentInput {
    tenantId: string;
    orderId: string;
    amount: number;
    plan: string;
    city: string;
    status: PaymentStatus;
}
interface UpdatePaymentInput {
    status?: PaymentStatus;
    razorpayPaymentId?: string;
    utr?: string;
    verifiedAt?: Date;
}
/**
 * PrismaPaymentRepository — FIXED
 *
 * Changes:
 * 1. Uses getPrismaClient() singleton instead of broken named import
 * 2. Removed non-existent `paymentId` field references → uses `razorpayPaymentId` and `utr`
 * 3. Uses PaymentStatus.VERIFIED instead of non-existent PaymentStatus.PAID
 * 4. Accepts prisma client via constructor for consistency
 */
export declare class PrismaPaymentRepository {
    private prisma;
    constructor(prismaClient?: any);
    create(data: CreatePaymentInput): Promise<Payment>;
    findById(id: string): Promise<Payment | null>;
    findByOrderId(orderId: string): Promise<Payment | null>;
    findByTenantId(tenantId: string): Promise<Payment[]>;
    findAll(): Promise<Payment[]>;
    update(id: string, data: UpdatePaymentInput): Promise<Payment>;
    getStats(): Promise<any>;
}
export {};
//# sourceMappingURL=PrismaPaymentRepository.d.ts.map