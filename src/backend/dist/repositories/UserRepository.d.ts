import { User, Role } from '@prisma/client';
export declare class UserRepository {
    private prisma;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    create(data: {
        email: string;
        password: string;
        name: string;
        role: Role;
        phone?: string;
        city?: string;
    }): Promise<User>;
    update(id: string, data: Partial<User>): Promise<User>;
    findAll(): Promise<User[]>;
}
//# sourceMappingURL=UserRepository.d.ts.map