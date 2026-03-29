"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.get('/', async (req, res) => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        res.status(200).json({
            status: 'ok',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            storage: 'postgresql'
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            storage: 'database-disconnected'
        });
    }
});
exports.default = router;
//# sourceMappingURL=health.routes.js.map