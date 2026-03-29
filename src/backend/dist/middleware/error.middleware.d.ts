import { Response, NextFunction } from 'express';
import { Request } from 'express';
export declare class AppError extends Error {
    statusCode: number;
    message: string;
    isOperational: boolean;
    constructor(statusCode: number, message: string, isOperational?: boolean);
}
export declare function errorHandler(err: Error | AppError, req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=error.middleware.d.ts.map