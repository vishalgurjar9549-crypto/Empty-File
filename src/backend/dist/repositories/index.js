"use strict";
/**
 * PRODUCTION REPOSITORY EXPORTS
 *
 * FIXED: All repositories receive the singleton Prisma client via constructor.
 * No more broken named imports from utils/prisma.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.propertyViewRepository = exports.paymentRepository = exports.tenantSubscriptionRepository = exports.bookingRepository = exports.roomRepository = exports.userRepository = void 0;
const prisma_1 = require("../utils/prisma");
const PrismaUserRepository_1 = require("./PrismaUserRepository");
const PrismaRoomRepository_1 = require("./PrismaRoomRepository");
const PrismaBookingRepository_1 = require("./PrismaBookingRepository");
const PrismaTenantSubscriptionRepository_1 = require("./PrismaTenantSubscriptionRepository");
const PrismaPaymentRepository_1 = require("./PrismaPaymentRepository");
const PrismaPropertyViewRepository_1 = require("./PrismaPropertyViewRepository");
// Singleton Prisma
const prisma = (0, prisma_1.getPrismaClient)();
exports.prisma = prisma;
// ✅ REAL DATABASE REPOSITORIES — all using singleton client
exports.userRepository = new PrismaUserRepository_1.PrismaUserRepository(prisma);
exports.roomRepository = new PrismaRoomRepository_1.PrismaRoomRepository(prisma);
exports.bookingRepository = new PrismaBookingRepository_1.PrismaBookingRepository(prisma);
exports.tenantSubscriptionRepository = new PrismaTenantSubscriptionRepository_1.PrismaTenantSubscriptionRepository(prisma);
exports.paymentRepository = new PrismaPaymentRepository_1.PrismaPaymentRepository(prisma);
exports.propertyViewRepository = new PrismaPropertyViewRepository_1.PrismaPropertyViewRepository(prisma);
// Interfaces
__exportStar(require("./interfaces"), exports);
//# sourceMappingURL=index.js.map