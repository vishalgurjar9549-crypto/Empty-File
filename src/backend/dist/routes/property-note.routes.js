"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notesRouter = exports.propertyNotesRouter = void 0;
const express_1 = require("express");
const PropertyNoteController_1 = require("../controllers/PropertyNoteController");
const auth_middleware_1 = require("../middleware/auth.middleware");
/**
 * Property Notes Routes
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ENDPOINT STRUCTURE:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Property-scoped endpoints (for create/read):
 *   POST   /api/properties/:propertyId/notes  → Create note
 *   GET    /api/properties/:propertyId/notes  → List notes for property
 *
 * Note-scoped endpoints (for update/delete):
 *   PATCH  /api/notes/:noteId                 → Update note
 *   DELETE /api/notes/:noteId                 → Soft delete note
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * AUTHORIZATION MATRIX:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ┌─────────┬───────┬─────────────────┬─────────────────┬──────────────────┐
 * │ Action  │ ADMIN │ AGENT (assigned)│ OWNER (property)│ TENANT (assigned)│
 * ├─────────┼───────┼─────────────────┼─────────────────┼──────────────────┤
 * │ CREATE  │  ✅   │       ✅        │       ❌        │        ❌        │
 * │ READ    │  ✅   │       ❌        │       ✅        │        ✅        │
 * │ UPDATE  │  ✅   │  ✅ (own only)  │       ❌        │        ❌        │
 * │ DELETE  │  ✅   │  ✅ (own only)  │       ❌        │        ❌        │
 * └─────────┴───────┴─────────────────┴─────────────────┴──────────────────┘
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * SAFETY GUARANTEES:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ✅ All routes require JWT authentication
 * ✅ Authorization enforced at service layer (role + ownership checks)
 * ✅ Soft delete only (isDeleted = true, never hard delete)
 * ✅ Full audit trail (authorId, deletedBy, timestamps)
 * ✅ Deleted notes hidden from non-admin users
 *
 * ❌ NO access to bookings
 * ❌ NO access to payments
 * ❌ NO access to subscriptions
 * ❌ NO cross-role data leakage
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WHY NOTES DO NOT AFFECT BOOKINGS/PAYMENTS:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 1. DATA ISOLATION:
 *    - PropertyNote model has NO relations to Booking or Payment tables
 *    - Notes are linked only to Room (property) and User (author/deleter)
 *    - Service layer queries ONLY PropertyNote, Room, User, and Assignment tables
 *
 * 2. NO MUTATION SIDE EFFECTS:
 *    - Creating/updating/deleting notes does NOT trigger any booking logic
 *    - No cascading updates to payment or subscription records
 *    - Notes are purely informational metadata
 *
 * 3. QUERY ISOLATION:
 *    - Read queries filter by propertyId and authorization only
 *    - No JOINs or includes on Booking/Payment tables
 *    - Tenant access verified via separate assignment check (not booking mutation)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */
const router = (0, express_1.Router)();
// ============================================================================
// PROPERTY-SCOPED ROUTES
// These are mounted at /api/properties/:propertyId/notes
// ============================================================================
/**
 * Property Notes Sub-Router
 *
 * Handles:
 * - POST /api/properties/:propertyId/notes
 * - GET  /api/properties/:propertyId/notes
 */
exports.propertyNotesRouter = (0, express_1.Router)({
    mergeParams: true
});
// All routes require authentication
exports.propertyNotesRouter.use(auth_middleware_1.authMiddleware);
// POST /api/properties/:propertyId/notes - Create a note
exports.propertyNotesRouter.post('/', (req, res, next) => PropertyNoteController_1.propertyNoteController.createNote(req, res));
// GET /api/properties/:propertyId/notes - Get all notes for a property
exports.propertyNotesRouter.get('/', (req, res, next) => PropertyNoteController_1.propertyNoteController.getNotes(req, res));
// ============================================================================
// NOTE-SCOPED ROUTES
// These are mounted at /api/notes
// ============================================================================
/**
 * Notes Router
 *
 * Handles:
 * - PATCH  /api/notes/:noteId
 * - DELETE /api/notes/:noteId
 */
exports.notesRouter = (0, express_1.Router)();
// All routes require authentication
exports.notesRouter.use(auth_middleware_1.authMiddleware);
// PATCH /api/notes/:noteId - Update a note
exports.notesRouter.patch('/:noteId', (req, res, next) => PropertyNoteController_1.propertyNoteController.updateNote(req, res));
// DELETE /api/notes/:noteId - Soft delete a note
exports.notesRouter.delete('/:noteId', (req, res, next) => PropertyNoteController_1.propertyNoteController.deleteNote(req, res));
// Default export for backward compatibility
exports.default = router;
//# sourceMappingURL=property-note.routes.js.map