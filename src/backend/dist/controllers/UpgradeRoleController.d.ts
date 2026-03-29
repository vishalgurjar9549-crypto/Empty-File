import { Request, Response, NextFunction } from "express";
/**
 * POST /api/users/upgrade-role
 * Upgrades an authenticated TENANT user to OWNER role.
 * Requires: authenticated user (via authenticate middleware)
 * Body: { role: "OWNER" }
 */
export declare const upgradeRole: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=UpgradeRoleController.d.ts.map