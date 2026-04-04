import { EventType } from "@prisma/client";
import { getPrismaClient } from "../utils/prisma";
import { logger } from "../utils/logger";

const NUDGE_HOUR = 9;

export class OwnerDailyNudgeService {
  private timer: NodeJS.Timeout | null = null;

  start(): void {
    this.scheduleNextRun();
  }

  stop(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private scheduleNextRun(): void {
    const now = new Date();
    const nextRun = new Date();
    nextRun.setHours(NUDGE_HOUR, 0, 0, 0);

    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    const delay = nextRun.getTime() - now.getTime();

    this.timer = setTimeout(async () => {
      await this.run();
      this.scheduleNextRun();
    }, delay);

    if (this.timer.unref) {
      this.timer.unref();
    }
  }

  async run(): Promise<void> {
    const prisma = getPrismaClient();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const events = await prisma.event.findMany({
      where: {
        createdAt: {
          gte: since,
        },
        type: {
          in: [EventType.PROPERTY_VIEW, EventType.CONTACT_UNLOCK, EventType.CONTACT_ACCESS],
        },
      },
      include: {
        property: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    const byOwner = new Map<
      string,
      {
        views: number;
        contacts: number;
      }
    >();

    events.forEach((event) => {
      if (!event.property?.ownerId) {
        return;
      }

      const ownerId = event.property.ownerId;
      const current = byOwner.get(ownerId) || { views: 0, contacts: 0 };

      if (event.type === EventType.PROPERTY_VIEW) {
        current.views += 1;
      } else {
        current.contacts += 1;
      }

      byOwner.set(ownerId, current);
    });

    byOwner.forEach((counts, ownerId) => {
      const totalInterest = counts.views + counts.contacts;
      if (totalInterest <= 0) {
        return;
      }

      logger.info("Owner daily engagement nudge", {
        event: "OWNER_DAILY_NUDGE",
        ownerId,
        views: counts.views,
        contacts: counts.contacts,
        message: `🔥 ${totalInterest} people showed interest in your property today`,
      });
    });
  }
}
