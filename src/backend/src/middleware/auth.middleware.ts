import { Request, Response, NextFunction, RequestHandler } from "express";
import { verifyToken } from "../utils/jwt";
import { Role } from "@prisma/client";
import { getPrismaClient } from "../utils/prisma";

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
export const authMiddleware: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({
      message: "Access token required",
    });
    return;
  }
  try {
    const decoded = verifyToken(token) as {
      userId?: string;
      id?: string;
      role: Role;
    };

    const userId = decoded.userId || decoded.id;
    if (!userId) {
      res.status(401).json({
        message: "Invalid token payload",
      });
      return;
    }
    // FIX 3: Verify user still exists and is active in database
    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        isActive: true,
      },
    });
    if (!user || !user.isActive) {
      res.status(403).json({
        message: "Account not found or has been disabled",
      });
      return;
    }
    console.log("🔐 AUTH HEADER:", req.headers.authorization);
    req.user = {
      userId,
      role: decoded.role,
    };
    console.log("🔍 DECODED TOKEN:", decoded);
    console.log("🔍 FINAL req.user:", req.user);
    next();
  } catch {
    res.status(401).json({
      message: "Invalid or expired token",
    });
    return;
  }
};

export const optionalAuthMiddleware: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = verifyToken(token) as {
      userId?: string;
      id?: string;
      role: Role;
    };

    const userId = decoded.userId || decoded.id;
    if (!userId) {
      next();
      return;
    }

    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (user?.isActive) {
      req.user = {
        userId,
        role: decoded.role,
      };
    }
  } catch {
    // Ignore optional auth failures so public tracking can still work.
  }

  next();
};

/**
 * Require ADMIN role
 * Typed as RequestHandler for router.use() compatibility.
 */
export const requireAdmin: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    res.status(401).json({
      message: "Authentication required",
    });
    return;
  }
  if (req.user.role !== Role.ADMIN) {
    res.status(403).json({
      message: "Admin access required",
    });
    return;
  }
  next();
};

/**
 * Role-based authorization
 * Returns RequestHandler for router.use() compatibility.
 */
export const authorizeRoles = (
  ...allowedRoles: (Role | string)[]
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        message: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
      });
      return;
    }
    next();
  };
};
