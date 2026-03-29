import { Response, NextFunction } from 'express';
import { Request } from 'express';
declare global {
    namespace Express {
        interface Request {
            idempotencyKey?: string;
            idempotencyHash?: string;
        }
    }
}
export declare function idempotencyMiddleware(): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Cleanup expired idempotency records from PostgreSQL.
 * Call from scheduled job (e.g., setInterval every hour).
 * Uses the expiresAt B-tree index for O(log n) range scan.
 */
export declare function cleanupExpiredIdempotencyRecords(): Promise<number>;
export declare function getIdempotencyMetrics(): any;
//# sourceMappingURL=idempotency.middleware.d.ts.map