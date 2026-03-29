import { Role } from '@prisma/client';
export interface JwtPayload {
    userId: string;
    email: string;
    role: Role;
}
export declare function generateToken(payload: JwtPayload): string;
export declare function verifyToken(token: string): JwtPayload;
//# sourceMappingURL=jwt.d.ts.map