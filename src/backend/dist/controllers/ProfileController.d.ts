import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class ProfileController {
    constructor();
    getProfile(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateProfile(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * ✅ NEW: Update phone number (replaces OTP verification)
     * Simple phone capture - no OTP required
     */
    updatePhone(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=ProfileController.d.ts.map