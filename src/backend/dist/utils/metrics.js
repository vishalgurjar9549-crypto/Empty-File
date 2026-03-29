"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idempotencyMetrics = void 0;
const logger_1 = require("./logger");
class IdempotencyMetrics {
    constructor() {
        this.counters = {
            cache_hit: 0,
            db_hit: 0,
            miss: 0,
            replay: 0,
            conflict: 0,
            expired_cleanup: 0,
            store_success: 0,
            store_failure: 0
        };
        this.startTime = Date.now();
        this.logIntervalMs = 60000; // Log metrics every 60 seconds
        this.logTimer = null;
        this.startPeriodicLogging();
    }
    /** Increment a specific counter */
    increment(metric, amount = 1) {
        this.counters[metric] += amount;
    }
    /** Get current counter values */
    getCounters() {
        return {
            ...this.counters
        };
    }
    /** Calculate hit rate */
    getHitRate() {
        const total = this.counters.cache_hit + this.counters.db_hit + this.counters.miss;
        if (total === 0) {
            return {
                cacheHitRate: 0,
                dbHitRate: 0,
                missRate: 0,
                total: 0
            };
        }
        return {
            cacheHitRate: this.counters.cache_hit / total,
            dbHitRate: this.counters.db_hit / total,
            missRate: this.counters.miss / total,
            total
        };
    }
    /** Get health assessment based on metrics */
    getHealthAssessment() {
        const { total } = this.getHitRate();
        // Not enough data to assess
        if (total < 10) {
            return {
                status: 'healthy',
                details: 'Insufficient data for assessment'
            };
        }
        // Critical: Store failures are high
        if (this.counters.store_failure > total * 0.1) {
            return {
                status: 'critical',
                details: `Store failure rate ${(this.counters.store_failure / total * 100).toFixed(1)}% — DB writes may be failing`
            };
        }
        // Healthy
        return {
            status: 'healthy',
            details: `System performing well — ${total} total requests processed`
        };
    }
    /** Full metrics snapshot for /health or monitoring endpoints */
    getSnapshot() {
        const uptimeMs = Date.now() - this.startTime;
        return {
            counters: this.getCounters(),
            hitRate: this.getHitRate(),
            health: this.getHealthAssessment(),
            uptimeSeconds: Math.floor(uptimeMs / 1000)
        };
    }
    /** Reset all counters (useful for testing or periodic reset) */
    reset() {
        for (const key of Object.keys(this.counters)) {
            this.counters[key] = 0;
        }
        this.startTime = Date.now();
    }
    /** Start periodic metric logging */
    startPeriodicLogging() {
        this.logTimer = setInterval(() => {
            const snapshot = this.getSnapshot();
            const { total, cacheHitRate } = snapshot.hitRate;
            // Only log if there's activity
            if (total > 0) {
                logger_1.logger.info('Idempotency metrics snapshot', {
                    event: 'IDEMPOTENCY_METRICS',
                    ...snapshot.counters,
                    cacheHitRate: `${(cacheHitRate * 100).toFixed(1)}%`,
                    totalRequests: total,
                    healthStatus: snapshot.health.status,
                    uptimeSeconds: snapshot.uptimeSeconds
                });
            }
        }, this.logIntervalMs);
        // Don't prevent process exit
        if (this.logTimer.unref) {
            this.logTimer.unref();
        }
    }
    /** Stop periodic logging (for graceful shutdown) */
    shutdown() {
        if (this.logTimer) {
            clearInterval(this.logTimer);
            this.logTimer = null;
        }
    }
}
// Singleton instance
exports.idempotencyMetrics = new IdempotencyMetrics();
//# sourceMappingURL=metrics.js.map