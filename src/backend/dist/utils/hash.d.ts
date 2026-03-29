/**
 * Computes a deterministic SHA256 hash of a request body.
 *
 * WHY HASH, NOT RAW PAYLOAD:
 * 1. Privacy: No PII (names, emails, payment info) stored in idempotency table
 * 2. Storage: Fixed 64-char hex string vs. arbitrary-size JSON blob
 * 3. Tamper detection: Hash comparison is constant-time and collision-resistant
 * 4. Determinism: Sorted keys ensure {a:1,b:2} and {b:2,a:1} produce same hash
 *
 * @param body - The request body object to hash
 * @returns 64-character hex SHA256 digest
 */
export declare function hashRequestBody(body: unknown): string;
/**
 * Validates that a string is a valid UUID v4 format.
 * Used to validate Idempotency-Key header values.
 */
export declare function isValidUUID(str: string): boolean;
//# sourceMappingURL=hash.d.ts.map