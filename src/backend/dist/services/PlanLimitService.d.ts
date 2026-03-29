import { PrismaClient } from '@prisma/client';
export declare class PlanLimitService {
    private prisma;
    constructor(prismaClient?: PrismaClient);
    /**
     * Get the effective contact limit for a plan in a city.
     *
     * @param plan - Effective plan name (e.g., 'FREE', 'GOLD', 'PLATINUM')
     * @param city - City name for city-specific override lookup
     * @returns number (limit) or null (unlimited)
     */
    getEffectiveLimit(plan: string, city: string): Promise<number | null>;
}
//# sourceMappingURL=PlanLimitService.d.ts.map