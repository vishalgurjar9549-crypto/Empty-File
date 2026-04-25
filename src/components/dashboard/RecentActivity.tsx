import { Eye, KeyRound, MessageSquare } from "lucide-react";
import { OwnerActivityItem } from "../../types/api.types";
import { ListItemSkeleton } from "../ui/Skeletons";

type RecentActivityProps = {
  activity: OwnerActivityItem[];
  loading: boolean;
};

const getActivityMeta = (type: OwnerActivityItem["type"]) => {
  switch (type) {
    case "PROPERTY_VIEW":
      return {
        icon: <Eye className="w-4 h-4" />,
        label: "Property viewed",
      };
    case "CONTACT_UNLOCK":
      return {
        icon: <KeyRound className="w-4 h-4" />,
        label: "Contact unlocked",
      };
    case "CONTACT_ACCESS":
      return {
        icon: <MessageSquare className="w-4 h-4" />,
        label: "Contact accessed",
      };
    default:
      return {
        icon: <MessageSquare className="w-4 h-4" />,
        label: "Activity",
      };
  }
};

const formatActivityTime = (createdAt: string) => {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

export function RecentActivity({ activity, loading }: RecentActivityProps) {
  return (
    <section
      className="section-card mb-3 md:mb-4"
      aria-label="Recent activity"
    >
      <div className="px-4 py-3 md:py-4 border-b border-[var(--color-gold-border)] flex items-center justify-between gap-3">
        <div>
          <h3 className="m-0 text-heading text-[var(--color-text-primary)]">
            Recent Activity
          </h3>
          <p className="m-0 mt-1 text-xs text-[var(--color-text-secondary)]">
            Latest engagement across your listings
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-3">
          {[1, 2, 3].map((item) => (
            <ListItemSkeleton key={item} />
          ))}
        </div>
      ) : activity.length === 0 ? (
        <div className="py-8 px-6 text-center text-[var(--color-text-secondary)] text-sm">
          No recent activity
        </div>
      ) : (
        <div className="recent-activity-list p-3 max-h-none md:max-h-[180px] md:overflow-y-auto">
          {activity.map((item) => {
            const meta = getActivityMeta(item.type);

            return (
              <div
                key={item.id}
                className="flex items-center gap-3 py-2 px-2 border-b border-[var(--color-gold-border)] last:border-b-0"
              >
                <div className="activity-icon flex-shrink-0">
                  {meta.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="m-0 text-sm font-medium text-[var(--color-text-primary)]">
                    {meta.label}
                  </p>
                  <p className="m-0 mt-0.5 text-xs text-[var(--color-text-secondary)]">
                    {formatActivityTime(item.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
