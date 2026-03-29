import { Response } from 'express';
import { OwnerService } from '../services/OwnerService';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class OwnerController {
    private ownerService;
    constructor(ownerService: OwnerService);
    /**
     * Get owner dashboard summary
     * GET /api/owners/me/summary
     */
    getSummary(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Get owner's rooms/properties
     * GET /api/owners/me/rooms
     */
    getMyRooms(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Get owner's bookings
     * GET /api/owners/me/bookings
     */
    getMyBookings(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=OwnerController.d.ts.map