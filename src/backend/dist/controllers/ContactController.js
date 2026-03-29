"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactController = void 0;
const AppErrors_1 = require("../errors/AppErrors");
const logger_1 = require("../utils/logger");
class ContactController {
    constructor(contactService) {
        this.contactService = contactService;
        this.unlockContact = this.unlockContact.bind(this);
        this.readContact = this.readContact.bind(this);
    }
    /**
     * GET /api/contacts/:roomId
     * Auth: TENANT only
     *
     * Pure READ path — no writes, no transactions, no counting.
     * Returns owner contact if:
     *   1. PropertyView exists (previously unlocked), OR
     *   2. Paid subscription active for room's city
     * Otherwise: 403 CONTACT_LOCKED
     */
    async readContact(req, res) {
        try {
            const tenantId = req.user?.userId;
            if (!tenantId) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }
            const { roomId } = req.params;
            if (!roomId || typeof roomId !== 'string') {
                res.status(400).json({
                    success: false,
                    message: 'roomId is required'
                });
                return;
            }
            const result = await this.contactService.readContact(tenantId, roomId);
            res.status(200).json({
                success: true,
                data: {
                    ownerName: result.ownerName,
                    ownerPhone: result.ownerPhone,
                    ownerEmail: result.ownerEmail,
                    alreadyUnlocked: result.alreadyUnlocked
                }
            });
        }
        catch (error) {
            if (error instanceof AppErrors_1.AppError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    code: error.code
                });
                return;
            }
            logger_1.logger.error('Unexpected error in readContact', {
                error: error.message,
                stack: error.stack
            });
            res.status(500).json({
                success: false,
                message: 'Failed to read contact'
            });
        }
    }
    /**
     * POST /api/contacts/unlock
     * Body: { roomId: string }
     * Auth: TENANT only
     *
     * Returns owner contact ONLY after subscription + limit validation.
     */
    async unlockContact(req, res) {
        try {
            const tenantId = req.user?.userId;
            if (!tenantId) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }
            const { roomId } = req.body;
            if (!roomId || typeof roomId !== 'string') {
                res.status(400).json({
                    success: false,
                    message: 'roomId is required and must be a string'
                });
                return;
            }
            const result = await this.contactService.unlockContact(tenantId, roomId);
            res.status(200).json({
                success: true,
                data: {
                    ownerName: result.ownerName,
                    ownerPhone: result.ownerPhone,
                    ownerEmail: result.ownerEmail
                },
                meta: {
                    alreadyUnlocked: result.alreadyUnlocked
                }
            });
        }
        catch (error) {
            if (error instanceof AppErrors_1.AppError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    code: error.code
                });
                return;
            }
            logger_1.logger.error('Unexpected error in unlockContact', {
                error: error.message,
                stack: error.stack
            });
            res.status(500).json({
                success: false,
                message: 'Failed to unlock contact'
            });
        }
    }
}
exports.ContactController = ContactController;
//# sourceMappingURL=ContactController.js.map