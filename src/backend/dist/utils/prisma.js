"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.getPrismaClient = getPrismaClient;
exports.connectDatabase = connectDatabase;
exports.disconnectDatabase = disconnectDatabase;
exports.checkDatabaseHealth = checkDatabaseHealth;
const client_1 = require("@prisma/client");
const logger_1 = require("./logger");
// Singleton Prisma client instance
let prisma;
/**
 * Get or create Prisma client instance
 * Implements singleton pattern to avoid multiple connections
 */
function getPrismaClient() {
    if (!prisma) {
        exports.prisma = prisma = new client_1.PrismaClient({
            log: [{
                    level: 'warn',
                    emit: 'event'
                }, {
                    level: 'error',
                    emit: 'event'
                }]
        });
        prisma.$on('warn', (e) => {
            logger_1.logger.warn('Prisma warning', e);
        });
        prisma.$on('error', (e) => {
            logger_1.logger.error('Prisma error', e);
        });
        logger_1.logger.info('Prisma client initialized');
    }
    return prisma;
}
/**
 * Connect to database
 */
async function connectDatabase() {
    try {
        const client = getPrismaClient();
        await client.$connect();
        logger_1.logger.info('Database connected successfully');
    }
    catch (error) {
        logger_1.logger.error('Failed to connect to database', error);
        throw error;
    }
}
/**
 * Disconnect from database
 */
async function disconnectDatabase() {
    try {
        if (prisma) {
            await prisma.$disconnect();
            logger_1.logger.info('Database disconnected');
        }
    }
    catch (error) {
        logger_1.logger.error('Error disconnecting from database', error);
    }
}
/**
 * Health check - verify database connectivity
 */
async function checkDatabaseHealth() {
    try {
        const client = getPrismaClient();
        await client.$queryRaw `SELECT 1`;
        return true;
    }
    catch (error) {
        logger_1.logger.error('Database health check failed', error);
        return false;
    }
}
//# sourceMappingURL=prisma.js.map