import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ContactService } from '../services/ContactService';
export declare class ContactController {
    private contactService;
    constructor(contactService: ContactService);
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
    readContact(req: AuthRequest, res: Response): Promise<void>;
    /**
     * POST /api/contacts/unlock
     * Body: { roomId: string }
     * Auth: TENANT only
     *
     * Returns owner contact ONLY after subscription + limit validation.
     */
    unlockContact(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=ContactController.d.ts.map