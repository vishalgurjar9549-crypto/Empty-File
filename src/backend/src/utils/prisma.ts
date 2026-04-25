import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// Singleton Prisma client instance
let prisma: PrismaClient;
let isDisconnecting = false;

/**
 * Get or create Prisma client instance
 * Implements singleton pattern to avoid multiple connections
 */
export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: [
        {
          level: 'warn',
          emit: 'event'
        },
        {
          level: 'error',
          emit: 'event'
        }
      ]
    });

    // Set up error handlers
    prisma.$on('warn' as never, (e: any) => {
      logger.warn('Prisma warning', e);
    });

    prisma.$on('error' as never, (e: any) => {
      logger.error('Prisma error', e);
    });

    logger.info('Prisma client initialized');
  }

  return prisma;
}

// Export prisma for backward compatibility with `import { prisma } from '../utils/prisma'`
export { prisma };

/**
 * Connect to database
 */
export async function connectDatabase(): Promise<void> {
  try {
    const client = getPrismaClient();
    await client.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Failed to connect to database', error);
    throw error;
  }
}

/**
 * Disconnect from database
 * Called during graceful shutdown
 * Prevents new queries and gracefully closes connection pool
 */
export async function disconnectDatabase(): Promise<void> {
  // Prevent multiple disconnect attempts
  if (isDisconnecting) {
    logger.warn('Database disconnect already in progress');
    return;
  }

  isDisconnecting = true;

  try {
    if (prisma) {
      await prisma.$disconnect();
      logger.info('Database disconnected successfully');
      prisma = undefined as any;
      isDisconnecting = false;
    }
  } catch (error) {
    logger.error('Error disconnecting from database', error);
    isDisconnecting = false;
    throw error;
  }
}

/**
 * Health check - verify database connectivity
 * Used by health check endpoint
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const client = getPrismaClient();
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database health check failed', error);
    return false;
  }
}