"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upgradeRole = void 0;
const prisma_1 = require("../utils/prisma");
/**
 * POST /api/users/upgrade-role
 * Upgrades an authenticated TENANT user to OWNER role.
 * Requires: authenticated user (via authenticate middleware)
 * Body: { role: "OWNER" }
 */
const upgradeRole = async (req, res, next) => {
    try {
        const userId = req.user?.id ?? req.user?.userId;
        const prisma = (0, prisma_1.getPrismaClient)();
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
    }
    catch (error) {
        next(error);
    }
};
exports.upgradeRole = upgradeRole;
//# sourceMappingURL=UpgradeRoleController.js.map