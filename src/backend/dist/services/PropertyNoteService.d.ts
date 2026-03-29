import { Role } from '@prisma/client';
export interface PropertyNoteView {
    id: string;
    propertyId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    author: {
        id: string;
        name: string;
        role: string;
    };
    isDeleted?: boolean;
    deletedAt?: Date | null;
    deletedBy?: string | null;
}
export interface CreateNoteInput {
    propertyId: string;
    content: string;
    authorId: string;
    authorRole: Role;
}
export interface UpdateNoteInput {
    noteId: string;
    content: string;
    userId: string;
    userRole: Role;
}
export interface DeleteNoteInput {
    noteId: string;
    userId: string;
    userRole: Role;
}
export interface GetNotesInput {
    propertyId: string;
    userId: string;
    userRole: Role;
}
export declare class NoteValidationError extends Error {
    constructor(message: string);
}
export declare class NoteNotFoundError extends Error {
    constructor(message: string);
}
export declare class NoteAuthorizationError extends Error {
    constructor(message: string);
}
export declare class PropertyNoteService {
    constructor();
    /**
     * CHECK CREATE PERMISSION
     *
     * Who can CREATE notes:
     * - ADMIN: Always
     * - AGENT: Only if assigned to the property
     * - OWNER: Never (notes are for internal use)
     * - TENANT: Never (notes are for internal use)
     */
    private canCreateNote;
    /**
     * CHECK READ PERMISSION
     *
     * Who can READ notes:
     * - ADMIN: Always (including deleted notes)
     * - OWNER: Only for their own properties
     * - TENANT: Only if assigned to property via booking or agent assignment
     * - AGENT: Cannot read notes (they create them for others)
     */
    private canReadNotes;
    /**
     * CHECK MODIFY PERMISSION (UPDATE/DELETE)
     *
     * Who can MODIFY notes:
     * - ADMIN: Always
     * - AGENT: Only their own notes (authorId matches)
     * - OWNER: Never
     * - TENANT: Never
     */
    private canModifyNote;
    /**
     * CREATE PROPERTY NOTE
     *
     * Creates a new note for a property.
     *
     * @param input - CreateNoteInput with propertyId, content, authorId, authorRole
     * @returns Created note with author info
     *
     * AUTHORIZATION:
     * - ADMIN: Always allowed
     * - AGENT: Only if assigned to property
     * - OWNER/TENANT: Not allowed
     *
     * VALIDATION:
     * - Property must exist
     * - Content must not be empty
     */
    createPropertyNote(input: CreateNoteInput): Promise<PropertyNoteView>;
    /**
     * GET PROPERTY NOTES
     *
     * Fetches all notes for a property based on user's authorization.
     *
     * @param input - GetNotesInput with propertyId, userId, userRole
     * @returns Array of notes (filtered by visibility rules)
     *
     * VISIBILITY RULES:
     * - ADMIN: Sees all notes including deleted (with deletion metadata)
     * - OWNER: Sees only non-deleted notes for their properties
     * - TENANT: Sees only non-deleted notes for assigned properties
     * - AGENT: Cannot read notes
     *
     * SAFETY:
     * - Deleted notes NEVER exposed to non-admin users
     * - No cross-property data leakage
     */
    getPropertyNotes(input: GetNotesInput): Promise<PropertyNoteView[]>;
    /**
     * UPDATE PROPERTY NOTE
     *
     * Updates the content of an existing note.
     *
     * @param input - UpdateNoteInput with noteId, content, userId, userRole
     * @returns Updated note
     *
     * AUTHORIZATION:
     * - ADMIN: Can update any note
     * - AGENT: Can only update their own notes
     * - OWNER/TENANT: Cannot update notes
     *
     * VALIDATION:
     * - Note must exist and not be deleted
     * - Content must not be empty
     */
    updatePropertyNote(input: UpdateNoteInput): Promise<PropertyNoteView>;
    /**
     * DELETE PROPERTY NOTE (SOFT DELETE)
     *
     * Soft-deletes a note by setting isDeleted = true.
     *
     * @param input - DeleteNoteInput with noteId, userId, userRole
     * @returns Success result
     *
     * AUTHORIZATION:
     * - ADMIN: Can delete any note
     * - AGENT: Can only delete their own notes
     * - OWNER/TENANT: Cannot delete notes
     *
     * SAFETY:
     * - NO hard delete - only sets isDeleted = true
     * - Records deletedAt timestamp and deletedBy user
     * - Preserves audit trail
     * - Idempotent - returns success if already deleted
     */
    deletePropertyNote(input: DeleteNoteInput): Promise<{
        success: boolean;
        message: string;
    }>;
}
export declare const propertyNoteService: PropertyNoteService;
//# sourceMappingURL=PropertyNoteService.d.ts.map