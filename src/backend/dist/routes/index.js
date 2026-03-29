"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const room_routes_1 = __importDefault(require("./room.routes"));
const booking_routes_1 = __importDefault(require("./booking.routes"));
const profile_routes_1 = __importDefault(require("./profile.routes"));
const owner_routes_1 = __importDefault(require("./owner.routes"));
const admin_routes_1 = __importDefault(require("./admin.routes"));
const agent_routes_1 = __importDefault(require("./agent.routes"));
const payment_routes_1 = __importDefault(require("./payment.routes"));
const tenant_subscription_routes_1 = __importDefault(require("./tenant-subscription.routes"));
const health_routes_1 = __importDefault(require("./health.routes"));
const metadata_routes_1 = __importDefault(require("./metadata.routes"));
const cloudinary_routes_1 = __importDefault(require("./cloudinary.routes"));
const property_note_routes_1 = require("./property-note.routes");
const notification_routes_1 = __importDefault(require("./notification.routes"));
const tenant_dashboard_routes_1 = __importDefault(require("./tenant-dashboard.routes"));
const contact_routes_1 = __importDefault(require("./contact.routes"));
const reviews_routes_1 = __importDefault(require("./reviews.routes"));
const favorites_routes_1 = __importDefault(require("./favorites.routes"));
const router = (0, express_1.Router)();
router.use('/auth', auth_routes_1.default);
router.use('/rooms', room_routes_1.default);
router.use('/bookings', booking_routes_1.default);
router.use('/profile', profile_routes_1.default);
router.use('/owners', owner_routes_1.default);
router.use('/admin', admin_routes_1.default);
router.use('/agent', agent_routes_1.default);
router.use('/payments', payment_routes_1.default);
router.use('/tenant-subscriptions', tenant_subscription_routes_1.default);
router.use('/tenant', tenant_dashboard_routes_1.default);
router.use('/health', health_routes_1.default);
router.use('/metadata', metadata_routes_1.default);
router.use('/cloudinary', cloudinary_routes_1.default);
router.use('/contacts', contact_routes_1.default);
router.use('/reviews', reviews_routes_1.default);
router.use('/favorites', favorites_routes_1.default);
// Property Notes Routes
// POST/GET /api/properties/:propertyId/notes
router.use('/properties/:propertyId/notes', property_note_routes_1.propertyNotesRouter);
// Note-specific Routes
// PATCH/DELETE /api/notes/:noteId
router.use('/notes', property_note_routes_1.notesRouter);
// Notification Routes
// GET/PATCH /api/notifications
router.use('/notifications', notification_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map