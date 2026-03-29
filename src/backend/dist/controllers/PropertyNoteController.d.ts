import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
/**
 * PropertyNoteController - Property Notes API Endpoints
 *
 * CRITICAL SAFETY RULES:
 * ═══════════════════════════════════════════════════════════════════════════
 * ✅ All routes require authentication (enforced at route level)
 * ✅ Role-based authorization enforced in service layer
 * ✅ Soft delete only (no hard deletes)
 * ✅ Full audit trail maintained
 * ❌ NO booking access
 * ❌ NO payment access
 * ❌ NO subscription access
 * ❌ NO cross-role data leakage
 *
 * ENDPOINTS:
 * ─────────────────────────────────────────────────────────────────────────────
 * POST   /api/properties/:propertyId/notes  → Create note (ADMIN, AGENT assigned)
 * GET    /api/properties/:propertyId/notes  → List notes (ADMIN, OWNER, TENANT assigned)
 * PATCH  /api/notes/:noteId                 → Update note (ADMIN, AGENT author)
 * DELETE /api/notes/:noteId                 → Soft delete (ADMIN, AGENT author)
 * ─────────────────────────────────────────────────────────────────────────────
 */
export declare class PropertyNoteController {
    constructor();
    /**
     * POST /api/properties/:propertyId/notes
     *
     * Create a new note for a property.
     *
     * Path Params:
     * - propertyId: Room ID
     *
     * Body:
     * - content: Note content (required)
     *
     * Authorization:
     * - ADMIN: Always allowed
     * - AGENT: Only if assigned to property
     * - OWNER/TENANT: Not allowed
     *
     * Response:
     * - 201: Note created successfully
     * - 400: Validation error (empty content)
     * - 401: Authentication required
     * - 403: Authorization denied
     * - 404: Property not found
     * - 500: Server error
     */
    createNote(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/properties/:propertyId/notes
     *
     * Get all notes for a property.
     *
     * Path Params:
     * - propertyId: Room ID
     *
     * Authorization:
     * - ADMIN: Sees all notes including deleted
     * - OWNER: Sees non-deleted notes for their properties
     * - TENANT: Sees non-deleted notes for assigned properties
     * - AGENT: Not allowed (they create notes, not read them)
     *
     * Response:
     * - 200: Notes retrieved successfully
     * - 401: Authentication required
     * - 403: Authorization denied
     * - 404: Property not found
     * - 500: Server error
     */
    getNotes(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * PATCH /api/notes/:noteId
     *
     * Update an existing note.
     *
     * Path Params:
     * - noteId: PropertyNote ID
     *
     * Body:
     * - content: New note content (required)
     *
     * Authorization:
     * - ADMIN: Can update any note
     * - AGENT: Can only update their own notes
     * - OWNER/TENANT: Not allowed
     *
     * Response:
     * - 200: Note updated successfully
     * - 400: Validation error (empty content)
     * - 401: Authentication required
     * - 403: Authorization denied
     * - 404: Note not found
     * - 500: Server error
     */
    updateNote(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * DELETE /api/notes/:noteId
     *
     * Soft-delete a note.
     *
     * Path Params:
     * - noteId: PropertyNote ID
     *
     * Authorization:
     * - ADMIN: Can delete any note
     * - AGENT: Can only delete their own notes
     * - OWNER/TENANT: Not allowed
     *
     * Response:
     * - 200: Note deleted successfully
     * - 401: Authentication required
     * - 403: Authorization denied
     * - 404: Note not found
     * - 500: Server error
     *
     * SAFETY:
     * - This is a SOFT DELETE (isDeleted = true)
     * - NO hard delete - data is preserved for audit
     * - Idempotent - returns success if already deleted
     */
    deleteNote(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Centralized error handler for consistent API responses.
     *
     * Maps service-layer errors to appropriate HTTP status codes:
     * - NoteValidationError → 400 Bad Request
     * - NoteAuthorizationError → 403 Forbidden
     * - NoteNotFoundError → 404 Not Found
     * - Unknown errors → 500 Internal Server Error
     */
    private handleError;
}
export declare const propertyNoteController: PropertyNoteController;
//# sourceMappingURL=PropertyNoteController.d.ts.map