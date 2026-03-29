import { PrismaClient, User } from "@prisma/client";
export declare class PrismaUserRepository {
    private prisma;
    constructor(prismaClient?: PrismaClient);
    create(data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByPhone(phone: string): Promise<User | null>;
    findAll(): Promise<User[]>;
    update(id: string, data: Partial<User>): Promise<User>;
    delete(id: string): Promise<User>;
}
//# sourceMappingURL=PrismaUserRepository.d.ts.map