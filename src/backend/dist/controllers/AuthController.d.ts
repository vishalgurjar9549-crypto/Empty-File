import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AuthService } from '../services/AuthService';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    getCurrentUser(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    register(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    login(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    verifyEmail(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    resendVerification(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    checkPhone(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    claimAccount(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    loginPhone(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    sendEmailOTP(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    verifyEmailOTP(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    requestEmailLoginOTP(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    verifyEmailLoginOTP(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=AuthController.d.ts.map