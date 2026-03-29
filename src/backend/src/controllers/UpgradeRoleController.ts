import { Request, Response, NextFunction } from "express";
import { getPrismaClient } from "../utils/prisma";

/**
 * POST /api/users/upgrade-role
 * Upgrades an authenticated TENANT user to OWNER role.
 * Requires: authenticated user (via authenticate middleware)
 * Body: { role: "OWNER" }
 */
export const upgradeRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = (req as any).user?.id ?? (req as any).user?.userId;
    const prisma = getPrismaClient();
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (user.role === "OWNER") {
      res
        .status(400)
        .json({ success: false, message: "User is already an Owner" });
      return;
    }

    if (user.role !== "TENANT") {
      res.status(403).json({
        success: false,
        message: "Only TENANT accounts can be upgraded to OWNER",
      });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: "OWNER" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Role upgraded to OWNER successfully",
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};
