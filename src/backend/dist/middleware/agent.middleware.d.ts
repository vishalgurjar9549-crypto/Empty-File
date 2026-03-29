import { RequestHandler } from 'express';
/**
 * Agent Role Guard Middleware
 *
 * Ensures the authenticated user has the AGENT role.
 * Must be used AFTER authMiddleware.
 *
 * SECURITY: This is a READ-ONLY guard - agents cannot perform mutations.
 * Typed as RequestHandler for router.use() compatibility.
 */
export declare const requireAgent: RequestHandler;
/**
 * Agent Self-Query Guard
 *
 * Ensures agents can only query their own assignments.
 * The agentId in the query MUST match the authenticated user's ID.
 *
 * This prevents agents from querying other agents' assignments.
 * Typed as RequestHandler for router.use() compatibility.
 */
export declare const enforceAgentSelfQuery: RequestHandler;
//# sourceMappingURL=agent.middleware.d.ts.map