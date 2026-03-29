"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaPaymentRepository = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../utils/prisma");
const logger_1 = require("../utils/logger");
/**
 * PrismaPaymentRepository — FIXED
 *
 * Changes:
 * 1. Uses getPrismaClient() singleton instead of broken named import
 * 2. Removed non-existent `paymentId` field references → uses `razorpayPaymentId` and `utr`
 * 3. Uses PaymentStatus.VERIFIED instead of non-existent PaymentStatus.PAID
 * 4. Accepts prisma client via constructor for consistency
 */
class PrismaPaymentRepository {
    constructor(prismaClient) {
        this.prisma = prismaClient || (0, prisma_1.getPrismaClient)();
    }
    async create(data) {
        try {
            return await this.prisma.payment.create({
                data: {
                    tenantId: data.tenantId,
                    orderId: data.orderId,
                    amount: data.amount,
                    plan: data.plan,
                    city: data.city,
                    status: data.status
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Error creating payment', {
                error: error.message,
                stack: error.stack
            });
            throw new Error('Failed to create payment');
        }
    }
    async findById(id) {
        try {
            return await this.prisma.payment.findUnique({
                where: {
                    id
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Error finding payment by id', {
                error: error.message
            });
            throw new Error('Failed to find payment');
        }
    }
    async findByOrderId(orderId) {
        try {
            return await this.prisma.payment.findUnique({
                where: {
                    orderId
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Error finding payment by order id', {
                error: error.message
            });
            throw new Error('Failed to find payment');
        }
    }
    async findByTenantId(tenantId) {
        try {
            return await this.prisma.payment.findMany({
                where: {
                    tenantId
                },
                orderBy: [{ createdAt: 'desc' }, { id: 'asc' }]
            });
        }
        catch (error) {
            logger_1.logger.error('Error finding payments by tenant id', {
                error: error.message
            });
            throw new Error('Failed to find payments');
        }
    }
    async findAll() {
        try {
            return await this.prisma.payment.findMany({
                orderBy: [{ createdAt: 'desc' }, { id: 'asc' }]
            });
        }
        catch (error) {
            logger_1.logger.error('Error finding all payments', {
                error: error.message
            });
            throw new Error('Failed to find payments');
        }
    }
    async update(id, data) {
        try {
            return await this.prisma.payment.update({
                where: {
                    id
                },
                data
            });
        }
        catch (error) {
            logger_1.logger.error('Error updating payment', {
                error: error.message
            });
            throw new Error('Failed to update payment');
        }
    }
    async getStats() {
        try {
            // Use VERIFIED instead of non-existent PAID
            const [totalPayments, verifiedPayments, failedPayments, totalRevenue] = await Promise.all([this.prisma.payment.count(), this.prisma.payment.count({
                    where: {
                        status: client_1.PaymentStatus.VERIFIED
                    }
                }), this.prisma.payment.count({
                    where: {
                        status: client_1.PaymentStatus.FAILED
                    }
                }), this.prisma.payment.aggregate({
                    where: {
                        status: client_1.PaymentStatus.VERIFIED
                    },
                    _sum: {
                        amount: true
                    }
                })]);
            return {
                totalPayments,
                verifiedPayments,
                failedPayments,
                pendingPayments: totalPayments - verifiedPayments - failedPayments,
                totalRevenue: totalRevenue._sum.amount || 0
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting payment stats', {
                error: error.message
            });
            throw new Error('Failed to get payment stats');
        }
    }
}
exports.PrismaPaymentRepository = PrismaPaymentRepository;
//# sourceMappingURL=PrismaPaymentRepository.js.map