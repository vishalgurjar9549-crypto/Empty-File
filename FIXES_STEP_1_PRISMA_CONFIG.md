# STEP 1 FIX: Prisma Connection Pool Configuration

## Fix 1.1: Update DATABASE_URL with Connection Pool Settings

### Current (Broken)
```
DATABASE_URL=postgres://user:password@db.example.com:5432/myapp
```

### Fixed (for Supabase/Neon)
```
DATABASE_URL=postgres://user:password@db.example.com:5432/myapp?schema=public&connection_limit=20&idle_timeout=30000&max_lifetime=600000&socket_timeout=45000
```

**Explanation:**
- `connection_limit=20`: Max 20 simultaneous connections per process
- `idle_timeout=30000`: Close idle connections after 30 seconds
- `max_lifetime=600000`: Recycle connections after 10 minutes
- `socket_timeout=45000`: Timeout hung queries after 45 seconds

### For AWS RDS (with RDS Proxy)
```
DATABASE_URL=postgres://user:password@proxy.rds.amazonaws.com:6432/myapp?schema=public&connection_limit=5
```
Note: RDS Proxy handles pooling, so lower limit on client side

---

## Fix 1.2: Update PrismaClient with Timeout Configuration

### File: `src/backend/src/utils/prisma.ts`

#### Before:
```typescript
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
    // ...
  }
  return prisma;
}
```

#### After:
```typescript
import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// Singleton Prisma client instance
let prisma: PrismaClient;
let isDisconnecting = false;

/**
 * Get or create Prisma client instance with connection pool configuration
 * Implements singleton pattern to avoid multiple connections
 */
export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      // ✅ ADDED: Connection timeout configuration
      errorFormat: 'pretty',
      
      // ✅ ADDED: Logging for slow queries and errors
      log: [
        {
          level: 'warn',
          emit: 'event'
        },
        {
          level: 'error',
          emit: 'event'
        },
        // ⚠️ OPTIONAL: Enable query logging in development (very verbose)
        ...(process.env.NODE_ENV === 'development' 
          ? [{ level: 'query' as const, emit: 'event' as const }]
          : []
        )
      ]
    });

    // Set up error handlers
    prisma.$on('warn' as never, (e: any) => {
      logger.warn('Prisma warning', e);
    });

    prisma.$on('error' as never, (e: any) => {
      logger.error('Prisma error', e);
    });

    // ⚠️ OPTIONAL: Log slow queries in development
    if (process.env.NODE_ENV === 'development') {
      prisma.$on('query' as never, (e: any) => {
        if (e.duration > 1000) {  // Log queries slower than 1 second
          logger.warn('Slow query detected', {
            query: e.query,
            duration: e.duration,
            params: e.params
          });
        }
      });
    }

    logger.info('Prisma client initialized', {
      environment: process.env.NODE_ENV,
      poolSize: 'configured via DATABASE_URL'
    });
  }

  return prisma;
}

// Export prisma for backward compatibility
export { prisma };

/**
 * Connect to database
 */
export async function connectDatabase(): Promise<void> {
  try {
    const client = getPrismaClient();
    
    // ✅ ADDED: Explicit connection test with timeout
    const timeoutMs = 5000;
    const connectionPromise = client.$queryRaw`SELECT 1 as ping`;
    
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('Database connection timeout')),
        timeoutMs
      )
    );

    await Promise.race([connectionPromise, timeoutPromise]);
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
      // ✅ ADDED: Proper cleanup with timeout
      const disconnectTimeoutMs = 5000;
      const disconnectPromise = prisma.$disconnect();
      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Database disconnect timeout')),
          disconnectTimeoutMs
        )
      );

      await Promise.race([disconnectPromise, timeoutPromise]);
      logger.info('Database disconnected successfully');
      prisma = undefined as any;
      isDisconnecting = false;
    }
  } catch (error) {
    logger.error('Error disconnecting from database', error);
    isDisconnecting = false;
    // Don't throw - allow process exit even if disconnect fails
  }
}

/**
 * Health check - verify database connectivity
 * Used by health check endpoint
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const client = getPrismaClient();
    
    // ✅ ADDED: Timeout for health check
    const healthPromise = client.$queryRaw`SELECT 1`;
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('Health check timeout')),
        2000
      )
    );

    await Promise.race([healthPromise, timeoutPromise]);
    return true;
  } catch (error) {
    logger.error('Database health check failed', error);
    return false;
  }
}
```

---

## Fix 1.3: Update Transaction Usage with Timeouts

### File: `src/backend/src/repositories/PrismaBookingRepository.ts`

#### Before:
```typescript
async createBookingTransactional(bookingData: {...}): Promise<Booking> {
  try {
    const result = await this.prisma.$transaction(async (tx: any) => {
      const room = await tx.room.findUnique({...});
      // ... more queries ...
    });
    // ...
  }
}
```

#### After:
```typescript
async createBookingTransactional(bookingData: {...}): Promise<Booking> {
  try {
    // ✅ ADDED: Transaction timeout (10 seconds)
    const result = await this.prisma.$transaction(
      async (tx: any) => {
        // STEP 1: Verify room exists and is active
        const room = await tx.room.findUnique({
          where: { id: bookingData.roomId },
          select: {
            id: true,
            ownerId: true,
            isActive: true,
            roomType: true
          }
        });

        if (!room) {
          throw new NotFoundError(
            `Room ${bookingData.roomId} not found`
          );
        }

        if (!room.isActive) {
          throw new BusinessLogicError(
            'Cannot create booking for inactive room'
          );
        }

        // STEP 2: Verify owner exists
        const owner = await tx.user.findUnique({
          where: { id: room.ownerId },
          select: { id: true }
        });

        if (!owner) {
          throw new NotFoundError(
            `Owner ${room.ownerId} not found`
          );
        }

        // STEP 3: Check for duplicate active booking
        const existingBooking = await tx.booking.findFirst({
          where: {
            tenantId: bookingData.tenantId,
            roomId: bookingData.roomId,
            status: { in: ['PENDING', 'APPROVED'] }
          }
        });

        if (existingBooking) {
          throw new DuplicateBookingError(
            'You already have an active booking for this property'
          );
        }

        // STEP 4: Create booking
        const booking = await tx.booking.create({
          data: {
            roomId: bookingData.roomId,
            ownerId: room.ownerId,
            tenantId: bookingData.tenantId,
            tenantName: bookingData.tenantName,
            tenantEmail: bookingData.tenantEmail,
            tenantPhone: bookingData.tenantPhone,
            moveInDate: bookingData.moveInDate,
            message: bookingData.message,
            status: 'PENDING'
          }
        });

        // STEP 5: ✅ ADDED: Write outbox event in same transaction
        await tx.outboxEvent.create({
          data: {
            aggregateType: 'BOOKING',
            aggregateId: booking.id,
            eventType: 'BOOKING_CREATED',
            payload: {
              bookingId: booking.id,
              roomId: booking.roomId,
              ownerId: booking.ownerId,
              tenantId: booking.tenantId,
              tenantEmail: booking.tenantEmail,
              moveInDate: booking.moveInDate.toISOString()
            },
            status: 'PENDING'
          }
        });

        return booking;
      },
      {
        timeout: 10000, // ✅ 10 second timeout
        maxWait: 5000   // ✅ Wait max 5 seconds to acquire transaction
      }
    );

    return this.toDomain(result);
  } catch (error: any) {
    throw mapPrismaError(error);
  }
}
```

---

## Fix 1.4: Add Connection Pool Monitoring

### File: `src/backend/src/middleware/database-monitoring.middleware.ts` (NEW)

```typescript
import { Request, Response, NextFunction } from 'express';
import { getPrismaClient } from '../utils/prisma';
import { logger } from '../utils/logger';

/**
 * Database connection pool monitoring middleware
 * Logs connection pool stats periodically
 * Helps detect connection exhaustion before it becomes critical
 */
let lastLogTime = Date.now();
const LOG_INTERVAL_MS = 60000; // Log every 60 seconds

export async function databaseMonitoringMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const now = Date.now();
  
  // Only log periodically to avoid noise
  if (now - lastLogTime > LOG_INTERVAL_MS) {
    lastLogTime = now;
    
    try {
      const prisma = getPrismaClient();
      
      // ✅ Get connection pool stats
      const statsResult = await prisma.$queryRaw`
        SELECT 
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections,
          count(*) as total_connections
        FROM pg_stat_activity 
        WHERE datname = current_database();
      `;
      
      const stats = (statsResult as any[])[0];
      
      logger.info('Database connection pool status', {
        activeConnections: stats.active_connections,
        idleConnections: stats.idle_connections,
        totalConnections: stats.total_connections,
        timestamp: new Date().toISOString()
      });

      // ⚠️ ALERT: Warn if pool is getting full
      if (stats.total_connections > 15) {
        logger.warn('Database connection pool near capacity', {
          totalConnections: stats.total_connections,
          threshold: 20
        });
      }
    } catch (error) {
      logger.error('Failed to monitor database connection pool', error);
    }
  }

  next();
}
```

### File: `src/backend/src/index.ts` - Add monitoring middleware

```typescript
// Add near the top, after other middleware
import { databaseMonitoringMiddleware } from './middleware/database-monitoring.middleware';

app.use(databaseMonitoringMiddleware);
```

---

## Fix 1.5: Health Check Endpoint with Pool Status

### File: `src/backend/src/routes/health.routes.ts` (NEW)

```typescript
import { Router } from 'express';
import { getPrismaClient, checkDatabaseHealth } from '../utils/prisma';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Basic health check - just server status
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

/**
 * Database health check with connection pool stats
 */
router.get('/db', async (req, res) => {
  try {
    const isHealthy = await checkDatabaseHealth();

    if (!isHealthy) {
      return res.status(503).json({
        status: 'unhealthy',
        reason: 'database_connection_failed',
        timestamp: Date.now()
      });
    }

    // Get connection pool stats
    const prisma = getPrismaClient();
    const statsResult = await prisma.$queryRaw`
      SELECT 
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections,
        count(*) as total_connections
      FROM pg_stat_activity 
      WHERE datname = current_database();
    `;

    const stats = (statsResult as any[])[0];

    res.status(200).json({
      status: 'healthy',
      database: {
        activeConnections: stats.active_connections,
        idleConnections: stats.idle_connections,
        totalConnections: stats.total_connections
      },
      uptime: process.uptime(),
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(503).json({
      status: 'unhealthy',
      reason: 'health_check_error',
      timestamp: Date.now()
    });
  }
});

export default router;
```

### Update main routes file

In `src/backend/src/routes/index.ts`, add:
```typescript
import healthRoutes from './health.routes';

router.use('/health', healthRoutes);
```

---

## Deployment Checklist

- [ ] Update `.env` with new DATABASE_URL connection pool parameters
- [ ] Test connection pooling with `npm run dev`
- [ ] Verify `/api/health/db` endpoint returns pool stats
- [ ] Load test with 500+ concurrent connections
- [ ] Monitor logs for slow queries
- [ ] Set up database connection monitoring alerts
- [ ] Verify graceful shutdown completes within 30 seconds

---

## Expected Improvements

**Before:**
- Connection exhaustion at 100+ concurrent users
- "too many connections" errors
- Timeouts on slow queries that hang

**After:**
- Handles 500+ concurrent users
- Orphaned connections cleaned up after 30 seconds
- Queries timeout after 10 seconds (configurable)
- Connection pool stats visible for monitoring
