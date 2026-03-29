"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UpgradeRoleController_1 = require("../controllers/UpgradeRoleController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
/**
 * POST /api/users/upgrade-role
 * Upgrades authenticated TENANT to OWNER role.
 */
router.post('/upgrade-role', auth_middleware_1.authMiddleware, UpgradeRoleController_1.upgradeRole);
exports.default = router;
//# sourceMappingURL=upgrade-role.routes.js.map