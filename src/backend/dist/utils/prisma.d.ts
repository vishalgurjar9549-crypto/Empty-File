import { PrismaClient } from '@prisma/client';
declare let prisma: PrismaClient;
/**
 * Get or create Prisma client instance
 * Implements singleton pattern to avoid multiple connections
 */
export declare function getPrismaClient(): PrismaClient;
export { prisma };
/**
 * Connect to database
 */
export declare function connectDatabase(): Promise<void>;
/**
 * Disconnect from database
 */
export declare function disconnectDatabase(): Promise<void>;
/**
 * Health check - verify database connectivity
 */
export declare function checkDatabaseHealth(): Promise<boolean>;
//# sourceMappingURL=prisma.d.ts.map