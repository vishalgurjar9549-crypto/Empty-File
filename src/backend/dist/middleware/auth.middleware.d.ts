import { Request, RequestHandler } from 'express';
import { Role } from '@prisma/client';
/**
 * AuthRequest — used by controllers that need typed user access.
 * Kept as a re-export alias so controllers don't break.
 */
export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: Role;
    };
}
/**
 * JWT Authentication Middleware
 *
 * FIX 3: After token verification, checks user exists and isActive in DB.
 * Selects ONLY id + isActive to minimize query overhead.
 *
 * 401 = "who are you?" (authentication failure)
 * 403 = "I know who you are, but you can't do this" (authorization failure)
 *
 * Typed as RequestHandler so Express router.use() accepts it.
 */
export declare const authMiddleware: RequestHandler;
/**
 * Require ADMIN role
 * Typed as RequestHandler for router.use() compatibility.
 */
export declare const requireAdmin: RequestHandler;
/**
 * Role-based authorization
 * Returns RequestHandler for router.use() compatibility.
 */
export declare const authorizeRoles: (...allowedRoles: (Role | string)[]) => RequestHandler;
//# sourceMappingURL=auth.middleware.d.ts.map