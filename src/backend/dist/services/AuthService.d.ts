import { PrismaUserRepository } from "../repositories/PrismaUserRepository";
import { Role } from "@prisma/client";
export declare class AuthService {
    private userRepository;
    private identityLinking;
    constructor(userRepository: PrismaUserRepository);
    register(email: string, password: string, name: string, role: Role, phone?: string | null): Promise<{
        user: {
            city: string | null;
            id: string;
            email: string;
            phone: string | null;
            googleId: string | null;
            emailVerifyToken: string | null;
            name: string;
            phoneVerified: boolean;
            phoneVerifiedAt: Date | null;
            emailVerified: boolean;
            emailVerifiedAt: Date | null;
            emailVerifyExpiry: Date | null;
            role: import(".prisma/client").$Enums.Role;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        token: string;
    }>;
    login(email: string, password: string): Promise<{
        user: {
            city: string | null;
            id: string;
            email: string;
            phone: string | null;
            googleId: string | null;
            emailVerifyToken: string | null;
            name: string;
            phoneVerified: boolean;
            phoneVerifiedAt: Date | null;
            emailVerified: boolean;
            emailVerifiedAt: Date | null;
            emailVerifyExpiry: Date | null;
            role: import(".prisma/client").$Enums.Role;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        token: string;
    }>;
    getUserById(userId: string): Promise<{
        city: string | null;
        id: string;
        email: string;
        phone: string | null;
        googleId: string | null;
        emailVerifyToken: string | null;
        name: string;
        phoneVerified: boolean;
        phoneVerifiedAt: Date | null;
        emailVerified: boolean;
        emailVerifiedAt: Date | null;
        emailVerifyExpiry: Date | null;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    checkPhone(phone: string): Promise<{
        exists: boolean;
        isTemp: boolean;
    }>;
    claimAccount(phone: string, email: string, password: string): Promise<{
        user: {
            city: string | null;
            id: string;
            email: string;
            phone: string | null;
            googleId: string | null;
            emailVerifyToken: string | null;
            name: string;
            phoneVerified: boolean;
            phoneVerifiedAt: Date | null;
            emailVerified: boolean;
            emailVerifiedAt: Date | null;
            emailVerifyExpiry: Date | null;
            role: import(".prisma/client").$Enums.Role;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        token: string;
    }>;
    loginPhone(phone: string): Promise<{
        user: {
            city: string | null;
            id: string;
            email: string;
            phone: string | null;
            googleId: string | null;
            emailVerifyToken: string | null;
            name: string;
            phoneVerified: boolean;
            phoneVerifiedAt: Date | null;
            emailVerified: boolean;
            emailVerifiedAt: Date | null;
            emailVerifyExpiry: Date | null;
            role: import(".prisma/client").$Enums.Role;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        token: string;
    }>;
    sendEmailOTP(userId: string, email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyEmailOTP(userId: string, email: string, otp: string): Promise<{
        success: boolean;
        code?: string;
        message: string;
        user?: any;
        token?: string;
    }>;
    requestEmailLoginOTP(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyEmailLoginOTP(email: string, otp: string): Promise<{
        success: boolean;
        code?: string;
        message: string;
        user?: any;
        token?: string;
    }>;
}
//# sourceMappingURL=AuthService.d.ts.map