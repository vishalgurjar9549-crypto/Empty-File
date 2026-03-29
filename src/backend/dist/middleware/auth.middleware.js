"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.requireAdmin = exports.authMiddleware = void 0;
const jwt_1 = require("../utils/jwt");
const client_1 = require("@prisma/client");
const prisma_1 = require("../utils/prisma");
console.log("AUTH MIDDLEWARE HIT");
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
const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(401).json({
            message: 'Access token required'
        });
        return;
    }
    try {
        const decoded = (0, jwt_1.verifyToken)(token);
        console.log("decoded.userId:", decoded.userId);
        console.log("decoded:", decoded);
        // FIX 3: Verify user still exists and is active in database
        const prisma = (0, prisma_1.getPrismaClient)();
        const user = await prisma.user.findUnique({
            where: {
                id: decoded.userId
            },
            select: {
                id: true,
                isActive: true
            }
        });
        if (!user || !user.isActive) {
            res.status(403).json({
                message: 'Account not found or has been disabled'
            });
            return;
        }
        req.user = decoded;
        next();
    }
    catch {
        res.status(401).json({
            message: 'Invalid or expired token'
        });
        return;
    }
};
exports.authMiddleware = authMiddleware;
/**
 * Require ADMIN role
 * Typed as RequestHandler for router.use() compatibility.
 */
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            message: 'Authentication required'
        });
        return;
    }
    if (req.user.role !== client_1.Role.ADMIN) {
        res.status(403).json({
            message: 'Admin access required'
        });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
/**
 * Role-based authorization
 * Returns RequestHandler for router.use() compatibility.
 */
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                message: 'Authentication required'
            });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
            });
            return;
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
//# sourceMappingURL=auth.middleware.js.map