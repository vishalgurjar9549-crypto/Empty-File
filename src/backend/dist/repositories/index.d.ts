/**
 * PRODUCTION REPOSITORY EXPORTS
 *
 * FIXED: All repositories receive the singleton Prisma client via constructor.
 * No more broken named imports from utils/prisma.
 */
import { PrismaUserRepository } from './PrismaUserRepository';
import { PrismaRoomRepository } from './PrismaRoomRepository';
import { PrismaBookingRepository } from './PrismaBookingRepository';
import { PrismaTenantSubscriptionRepository } from './PrismaTenantSubscriptionRepository';
import { PrismaPaymentRepository } from './PrismaPaymentRepository';
import { PrismaPropertyViewRepository } from './PrismaPropertyViewRepository';
declare const prisma: import(".prisma/client").PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
export declare const userRepository: PrismaUserRepository;
export declare const roomRepository: PrismaRoomRepository;
export declare const bookingRepository: PrismaBookingRepository;
export declare const tenantSubscriptionRepository: PrismaTenantSubscriptionRepository;
export declare const paymentRepository: PrismaPaymentRepository;
export declare const propertyViewRepository: PrismaPropertyViewRepository;
export { prisma };
export * from './interfaces';
//# sourceMappingURL=index.d.ts.map