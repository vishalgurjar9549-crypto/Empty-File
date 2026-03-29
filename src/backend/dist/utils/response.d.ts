export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    meta?: any;
    error?: string;
    details?: any;
}
export declare function successResponse<T>(data: T, message?: string, meta?: any): ApiResponse<T>;
export declare function errorResponse(message: string, details?: any): ApiResponse;
//# sourceMappingURL=response.d.ts.map