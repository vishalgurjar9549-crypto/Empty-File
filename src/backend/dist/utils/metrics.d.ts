interface MetricCounters {
    cache_hit: number;
    db_hit: number;
    miss: number;
    replay: number;
    conflict: number;
    expired_cleanup: number;
    store_success: number;
    store_failure: number;
}
declare class IdempotencyMetrics {
    private counters;
    private startTime;
    private logIntervalMs;
    private logTimer;
    constructor();
    /** Increment a specific counter */
    increment(metric: keyof MetricCounters, amount?: number): void;
    /** Get current counter values */
    getCounters(): Readonly<MetricCounters>;
    /** Calculate hit rate */
    getHitRate(): {
        cacheHitRate: number;
        dbHitRate: number;
        missRate: number;
        total: number;
    };
    /** Get health assessment based on metrics */
    getHealthAssessment(): {
        status: 'healthy' | 'warning' | 'critical';
        details: string;
    };
    /** Full metrics snapshot for /health or monitoring endpoints */
    getSnapshot(): {
        counters: Readonly<MetricCounters>;
        hitRate: {
            cacheHitRate: number;
            dbHitRate: number;
            missRate: number;
            total: number;
        };
        health: {
            status: "healthy" | "warning" | "critical";
            details: string;
        };
        uptimeSeconds: number;
    };
    /** Reset all counters (useful for testing or periodic reset) */
    reset(): void;
    /** Start periodic metric logging */
    private startPeriodicLogging;
    /** Stop periodic logging (for graceful shutdown) */
    shutdown(): void;
}
export declare const idempotencyMetrics: IdempotencyMetrics;
export {};
//# sourceMappingURL=metrics.d.ts.map