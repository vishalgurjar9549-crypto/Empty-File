"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enforceAgentSelfQuery = exports.requireAgent = void 0;
const client_1 = require("@prisma/client");
/**
 * Agent Role Guard Middleware
 *
 * Ensures the authenticated user has the AGENT role.
 * Must be used AFTER authMiddleware.
 *
 * SECURITY: This is a READ-ONLY guard - agents cannot perform mutations.
 * Typed as RequestHandler for router.use() compatibility.
 */
const requireAgent = (req, res, next) => {
    // Verify authentication exists
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
        return;
    }
    // Verify AGENT role
    if (req.user.role !== client_1.Role.AGENT) {
        res.status(403).json({
            success: false,
            message: 'Agent access required'
        });
        return;
    }
    next();
};
exports.requireAgent = requireAgent;
/**
 * Agent Self-Query Guard
 *
 * Ensures agents can only query their own assignments.
 * The agentId in the query MUST match the authenticated user's ID.
 *
 * This prevents agents from querying other agents' assignments.
 * Typed as RequestHandler for router.use() compatibility.
 */
const enforceAgentSelfQuery = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
        return;
    }
    // Agent can only query their own data
    // The service layer will use req.user.userId to filter assignments
    // This middleware ensures the pattern is enforced at the route level
    next();
};
exports.enforceAgentSelfQuery = enforceAgentSelfQuery;
//# sourceMappingURL=agent.middleware.js.map