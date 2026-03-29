"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.idempotencyMiddleware = idempotencyMiddleware;
exports.cleanupExpiredIdempotencyRecords = cleanupExpiredIdempotencyRecords;
exports.getIdempotencyMetrics = getIdempotencyMetrics;
const client_1 = require("@prisma/client");
const hash_1 = require("../utils/hash");
const metrics_1 = require("../utils/metrics");
const logger_1 = __importDefault(require("../utils/logger"));
const prisma_1 = require("../utils/prisma");
// FIX: Initialize prisma client — was imported but never called.
// Every prisma.idempotencyRecord.* call was throwing ReferenceError.
// Matches pattern used in OutboxWorker.ts and NotificationService.ts.
const prisma = (0, prisma_1.getPrismaClient)();
// =============================================================================
// CONFIGURATION
// =============================================================================
const DB_TTL_HOURS = 24; // 24 hours
/**
 * LOCAL CACHE (L0) — Hot Key Protection
 *
 * Tiny in-memory LRU cache with very short TTL.
 * - Capacity: 200 entries (covers concurrent hot keys)
 * - TTL: 5 seconds (just absorbs burst, doesn't serve stale data long)
 * - On hit: return cached response instantly (no DB)
 * - On miss: proceed to DB → process
 */
const LOCAL_CACHE_MAX_SIZE = 200;
const LOCAL_CACHE_TTL_MS = 5000;
class LocalLRUCache {
    constructor(maxSize, ttlMs) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.ttlMs = ttlMs;
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        // Check TTL
        if (Date.now() - entry.cachedAt > this.ttlMs) {
            this.cache.delete(key);
            return null;
        }
        // LRU: move to end (most recently used)
        this.cache.delete(key);
        this.cache.set(key, entry);
        return entry;
    }
    set(key, entry) {
        // Evict oldest if at capacity
        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey)
                this.cache.delete(oldestKey);
        }
        this.cache.set(key, {
            ...entry,
            cachedAt: Date.now()
        });
    }
    delete(key) {
        this.cache.delete(key);
    }
    get size() {
        return this.cache.size;
    }
}
const localCache = new LocalLRUCache(LOCAL_CACHE_MAX_SIZE, LOCAL_CACHE_TTL_MS);
// =============================================================================
// MAIN MIDDLEWARE
// =============================================================================
function idempotencyMiddleware() {
    return async (req, res, next) => {
        const idempotencyKey = req.headers['idempotency-key'];
        // ── Step 1: Validate header presence and format ──
        if (!idempotencyKey) {
            logger_1.default.warn('Idempotency: Missing Idempotency-Key header', {
                event: 'IDEMPOTENCY_MISSING_KEY',
                userId: req.user?.userId,
                endpoint: req.originalUrl,
                method: req.method
            });
            res.status(400).json({
                success: false,
                message: 'Idempotency-Key header is required for booking creation. Send a UUID v4.',
                error: 'MISSING_IDEMPOTENCY_KEY'
            });
            return;
        }
        if (!(0, hash_1.isValidUUID)(idempotencyKey)) {
            logger_1.default.warn('Idempotency: Invalid key format', {
                event: 'IDEMPOTENCY_INVALID_KEY',
                userId: req.user?.userId,
                keyPrefix: idempotencyKey.substring(0, 8)
            });
            res.status(400).json({
                success: false,
                message: 'Idempotency-Key must be a valid UUID v4.',
                error: 'INVALID_IDEMPOTENCY_KEY'
            });
            return;
        }
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
            return;
        }
        // ── Step 2: Hash request body ──
        const requestHash = (0, hash_1.hashRequestBody)(req.body);
        const keyPrefix = idempotencyKey.substring(0, 8) + '...';
        logger_1.default.info('Idempotency: Processing request', {
            event: 'IDEMPOTENCY_KEY_RECEIVED',
            userId,
            keyPrefix,
            endpoint: req.originalUrl
        });
        try {
            // ════════════════════════════════════════════════════════════════════
            // LAYER 0: LOCAL IN-MEMORY CACHE (Hot Key Protection)
            // ════════════════════════════════════════════════════════════════════
            const localEntry = localCache.get(idempotencyKey);
            if (localEntry) {
                if (localEntry.userId !== userId) {
                    res.status(403).json({
                        success: false,
                        message: 'This idempotency key belongs to a different user.',
                        error: 'IDEMPOTENCY_KEY_OWNERSHIP'
                    });
                    return;
                }
                if (localEntry.requestHash !== requestHash) {
                    metrics_1.idempotencyMetrics.increment('conflict');
                    res.status(409).json({
                        success: false,
                        message: 'Idempotency key has already been used with a different request payload.',
                        error: 'IDEMPOTENCY_PAYLOAD_MISMATCH'
                    });
                    return;
                }
                // L0 HIT — replay from memory (sub-microsecond)
                logger_1.default.info('Idempotency: L0 local cache hit', {
                    event: 'IDEMPOTENCY_L0_HIT',
                    userId,
                    keyPrefix
                });
                metrics_1.idempotencyMetrics.increment('cache_hit');
                metrics_1.idempotencyMetrics.increment('replay');
                res.status(localEntry.statusCode).json(localEntry.responseBody);
                return;
            }
            // ════════════════════════════════════════════════════════════════════
            // LAYER 1: DATABASE LOOKUP
            // ════════════════════════════════════════════════════════════════════
            const existingRecord = await prisma.idempotencyRecord.findUnique({
                where: {
                    key: idempotencyKey
                }
            });
            if (existingRecord) {
                // Check if expired
                if (existingRecord.expiresAt < new Date()) {
                    logger_1.default.info('Idempotency: Expired key in DB, proceeding as new', {
                        event: 'IDEMPOTENCY_KEY_EXPIRED',
                        userId,
                        keyPrefix
                    });
                    await prisma.idempotencyRecord.delete({
                        where: {
                            key: idempotencyKey
                        }
                    });
                    // Fall through to "new request" path
                }
                // Validate ownership
                else if (existingRecord.userId !== userId) {
                    logger_1.default.warn('Idempotency: Cross-user key reuse attempt', {
                        event: 'IDEMPOTENCY_CROSS_USER',
                        requestingUserId: userId,
                        keyPrefix
                    });
                    res.status(403).json({
                        success: false,
                        message: 'This idempotency key belongs to a different user.',
                        error: 'IDEMPOTENCY_KEY_OWNERSHIP'
                    });
                    return;
                }
                // Validate payload hash
                else if (existingRecord.requestHash !== requestHash) {
                    metrics_1.idempotencyMetrics.increment('conflict');
                    logger_1.default.warn('Idempotency: Payload mismatch (DB)', {
                        event: 'IDEMPOTENCY_PAYLOAD_MISMATCH',
                        userId,
                        keyPrefix
                    });
                    res.status(409).json({
                        success: false,
                        message: 'Idempotency key has already been used with a different request payload.',
                        error: 'IDEMPOTENCY_PAYLOAD_MISMATCH'
                    });
                    return;
                }
                // DB HIT — replay
                else {
                    logger_1.default.info('Idempotency: DB hit — replaying', {
                        event: 'IDEMPOTENCY_DB_HIT',
                        userId,
                        keyPrefix,
                        originalStatusCode: existingRecord.statusCode
                    });
                    metrics_1.idempotencyMetrics.increment('db_hit');
                    metrics_1.idempotencyMetrics.increment('replay');
                    // Populate L0 for hot key protection
                    localCache.set(idempotencyKey, {
                        statusCode: existingRecord.statusCode,
                        responseBody: existingRecord.responseBody,
                        requestHash: existingRecord.requestHash,
                        userId: existingRecord.userId
                    });
                    res.status(existingRecord.statusCode).json(existingRecord.responseBody);
                    return;
                }
            }
            // ════════════════════════════════════════════════════════════════════
            // NO CACHE HIT — NEW REQUEST
            // ════════════════════════════════════════════════════════════════════
            metrics_1.idempotencyMetrics.increment('miss');
            // ── Attach context and intercept response ──
            req.idempotencyKey = idempotencyKey;
            req.idempotencyHash = requestHash;
            const originalJson = res.json.bind(res);
            let responseCaptured = false;
            res.json = function (body) {
                if (!responseCaptured && req.idempotencyKey) {
                    responseCaptured = true;
                    const statusCode = res.statusCode;
                    // Store successful responses (< 500) in DB
                    if (statusCode < 500) {
                        storeIdempotencyResult(idempotencyKey, userId, requestHash, body, statusCode).catch((err) => {
                            logger_1.default.error('Idempotency: Failed to store result', {
                                event: 'IDEMPOTENCY_STORE_FAILED',
                                userId,
                                keyPrefix,
                                error: err.message
                            });
                            metrics_1.idempotencyMetrics.increment('store_failure');
                        });
                    }
                }
                return originalJson(body);
            };
            next();
        }
        catch (error) {
            logger_1.default.error('Idempotency: Middleware error — degrading gracefully', {
                event: 'IDEMPOTENCY_MIDDLEWARE_ERROR',
                userId,
                keyPrefix: idempotencyKey.substring(0, 8) + '...',
                error: error.message,
                stack: error.stack
            });
            // CRITICAL: Never block a booking due to idempotency infrastructure failure.
            // The booking's own unique constraints still protect against duplicates.
            next();
        }
    };
}
// =============================================================================
// STORE RESULT — Write to L0 cache + DB
// =============================================================================
async function storeIdempotencyResult(key, userId, requestHash, responseBody, statusCode) {
    const keyPrefix = key.substring(0, 8) + '...';
    // ── Populate L0 cache ──
    localCache.set(key, {
        statusCode,
        responseBody,
        requestHash,
        userId
    });
    // ── Write to DB — Source of truth ──
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + DB_TTL_HOURS);
    try {
        await prisma.idempotencyRecord.create({
            data: {
                key,
                userId,
                requestHash,
                responseBody,
                statusCode,
                expiresAt
            }
        });
        metrics_1.idempotencyMetrics.increment('store_success');
        logger_1.default.info('Idempotency: Result stored (DB)', {
            event: 'IDEMPOTENCY_STORED',
            userId,
            keyPrefix,
            statusCode,
            dbExpiresAt: expiresAt.toISOString()
        });
    }
    catch (error) {
        // P2002 = unique constraint violation → race condition resolved
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            logger_1.default.info('Idempotency: Race condition resolved — DB record exists', {
                event: 'IDEMPOTENCY_RACE_RESOLVED',
                userId,
                keyPrefix
            });
            metrics_1.idempotencyMetrics.increment('store_success');
            return;
        }
        metrics_1.idempotencyMetrics.increment('store_failure');
        throw error;
    }
}
// =============================================================================
// TTL CLEANUP
// =============================================================================
/**
 * Cleanup expired idempotency records from PostgreSQL.
 * Call from scheduled job (e.g., setInterval every hour).
 * Uses the expiresAt B-tree index for O(log n) range scan.
 */
async function cleanupExpiredIdempotencyRecords() {
    const result = await prisma.idempotencyRecord.deleteMany({
        where: {
            expiresAt: {
                lt: new Date()
            }
        }
    });
    if (result.count > 0) {
        metrics_1.idempotencyMetrics.increment('expired_cleanup', result.count);
        logger_1.default.info('Idempotency: Cleaned up expired DB records', {
            event: 'IDEMPOTENCY_CLEANUP',
            deletedCount: result.count
        });
    }
    return result.count;
}
// =============================================================================
// METRICS EXPORT — For /health endpoint
// =============================================================================
function getIdempotencyMetrics() {
    return metrics_1.idempotencyMetrics.getSnapshot();
}
//# sourceMappingURL=idempotency.middleware.js.map