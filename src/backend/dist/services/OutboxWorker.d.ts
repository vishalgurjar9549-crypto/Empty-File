interface OutboxMetrics {
    eventsProcessed: number;
    eventsDelivered: number;
    eventsFailed: number;
    eventsDeadLettered: number;
    pollCycles: number;
    emptyPolls: number;
    processingErrors: number;
    lastPollAt: string | null;
    lastEventAt: string | null;
}
/**
 * Start the outbox worker polling loop.
 * Call once on server startup.
 */
export declare function startOutboxWorker(): void;
/**
 * Stop the outbox worker gracefully.
 * Call on SIGTERM/SIGINT.
 */
export declare function stopOutboxWorker(): void;
/**
 * Clean up delivered outbox events older than retentionDays.
 * Call from a scheduled job (e.g., daily cron).
 *
 * WHY keep delivered events at all:
 * - Debugging: "Did the notification for booking X actually fire?"
 * - Audit trail: Compliance requires event history
 * - 7 days is enough for debugging; archive to S3 for long-term audit
 */
export declare function cleanupDeliveredOutboxEvents(retentionDays?: number): Promise<number>;
export declare function getOutboxMetrics(): OutboxMetrics & {
    pendingCount?: number;
    deadLetterCount?: number;
};
/**
 * Get detailed outbox stats (includes DB counts).
 * Use for /health/detailed endpoint.
 */
export declare function getOutboxDetailedStats(): Promise<{
    pendingCount: number;
    processingCount: number;
    deadLetterCount: number;
    deliveredToday: number;
    isRunning: boolean;
    pollIntervalMs: number;
    batchSize: number;
    eventsProcessed: number;
    eventsDelivered: number;
    eventsFailed: number;
    eventsDeadLettered: number;
    pollCycles: number;
    emptyPolls: number;
    processingErrors: number;
    lastPollAt: string | null;
    lastEventAt: string | null;
} | {
    error: any;
    eventsProcessed: number;
    eventsDelivered: number;
    eventsFailed: number;
    eventsDeadLettered: number;
    pollCycles: number;
    emptyPolls: number;
    processingErrors: number;
    lastPollAt: string | null;
    lastEventAt: string | null;
}>;
export {};
//# sourceMappingURL=OutboxWorker.d.ts.map