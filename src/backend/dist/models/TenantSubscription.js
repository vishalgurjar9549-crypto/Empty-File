"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpgradeSubscriptionSchema = exports.CityPricingSchema = exports.CreateSubscriptionSchema = exports.SubscriptionStatus = exports.PlanName = void 0;
const zod_1 = require("zod");
exports.PlanName = zod_1.z.enum(['FREE', 'GOLD', 'PLATINUM']);
exports.SubscriptionStatus = zod_1.z.enum(['ACTIVE', 'EXPIRED', 'CANCELLED']);
exports.CreateSubscriptionSchema = zod_1.z.object({
    plan: exports.PlanName,
    city: zod_1.z.string().min(1, 'City is required')
});
exports.CityPricingSchema = zod_1.z.object({
    city: zod_1.z.string().min(1, 'City is required'),
    plan: exports.PlanName,
    price: zod_1.z.number().min(0, 'Price must be positive')
});
exports.UpgradeSubscriptionSchema = zod_1.z.object({
    plan: zod_1.z.enum(['GOLD', 'PLATINUM']),
    city: zod_1.z.string().min(1, 'City is required')
});
//# sourceMappingURL=TenantSubscription.js.map