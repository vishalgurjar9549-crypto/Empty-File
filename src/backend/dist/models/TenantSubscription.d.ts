import { z } from 'zod';
export declare const PlanName: z.ZodEnum<["FREE", "GOLD", "PLATINUM"]>;
export type PlanName = z.infer<typeof PlanName>;
export declare const SubscriptionStatus: z.ZodEnum<["ACTIVE", "EXPIRED", "CANCELLED"]>;
export type SubscriptionStatus = z.infer<typeof SubscriptionStatus>;
export interface TenantSubscription {
    id: string;
    tenantId: string;
    plan: PlanName;
    city: string;
    startedAt: string;
    expiresAt?: string;
    isActive: boolean;
}
export interface CityPricing {
    id: string;
    city: string;
    plan: PlanName;
    price: number;
    createdAt: string;
}
export declare const CreateSubscriptionSchema: z.ZodObject<{
    plan: z.ZodEnum<["FREE", "GOLD", "PLATINUM"]>;
    city: z.ZodString;
}, "strip", z.ZodTypeAny, {
    city: string;
    plan: "FREE" | "GOLD" | "PLATINUM";
}, {
    city: string;
    plan: "FREE" | "GOLD" | "PLATINUM";
}>;
export declare const CityPricingSchema: z.ZodObject<{
    city: z.ZodString;
    plan: z.ZodEnum<["FREE", "GOLD", "PLATINUM"]>;
    price: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    city: string;
    plan: "FREE" | "GOLD" | "PLATINUM";
    price: number;
}, {
    city: string;
    plan: "FREE" | "GOLD" | "PLATINUM";
    price: number;
}>;
export type CreateSubscriptionInput = z.infer<typeof CreateSubscriptionSchema>;
export type CityPricingInput = z.infer<typeof CityPricingSchema>;
export interface VisibilityResponse {
    canViewContact: boolean;
    canViewMap: boolean;
    plan: PlanName;
    message?: string;
    viewCount?: number;
    viewLimit?: number;
}
export interface CurrentSubscriptionResponse {
    plan: PlanName;
    city: string | null;
    canViewContact: boolean;
    canViewMap: boolean;
    price: number;
    expiresAt?: string;
    viewCount?: number;
    viewLimit?: number;
}
export declare const UpgradeSubscriptionSchema: z.ZodObject<{
    plan: z.ZodEnum<["GOLD", "PLATINUM"]>;
    city: z.ZodString;
}, "strip", z.ZodTypeAny, {
    city: string;
    plan: "GOLD" | "PLATINUM";
}, {
    city: string;
    plan: "GOLD" | "PLATINUM";
}>;
export type UpgradeSubscriptionInput = z.infer<typeof UpgradeSubscriptionSchema>;
//# sourceMappingURL=TenantSubscription.d.ts.map