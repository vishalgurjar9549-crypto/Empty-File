import { OutboxAggregateType, OutboxEventType, OutboxEventPayloadMap } from './OutboxEventTypes';
/**
 * Write an outbox event within an existing Prisma transaction.
 *
 * CRITICAL: The `tx` parameter MUST be a Prisma transaction client.
 * Calling this outside a transaction defeats the entire purpose.
 *
 * @param tx - Prisma transaction client (from $transaction callback)
 * @param params - Event parameters
 * @returns The created outbox event record
 *
 * @example
 * ```typescript
 * await prisma.$transaction(async (tx) => {
 *   const booking = await tx.booking.create({ data: {...} });
 *   await writeOutboxEvent(tx, {
 *     aggregateType: OutboxAggregateType.BOOKING,
 *     aggregateId: booking.id,
 *     eventType: OutboxEventType.BOOKING_CREATED,
 *     payload: { bookingId: booking.id, ... },
 *   });
 * });
 * ```
 */
export declare function writeOutboxEvent<T extends OutboxEventType>(tx: any, params: {
    aggregateType: OutboxAggregateType;
    aggregateId: string;
    eventType: T;
    payload: OutboxEventPayloadMap[T];
}): Promise<any>;
//# sourceMappingURL=OutboxWriter.d.ts.map