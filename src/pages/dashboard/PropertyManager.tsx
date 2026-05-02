import { useState, useCallback } from "react";
import { Edit, Power, AlertCircle, MessageSquare, Home, ChevronRight } from "lucide-react";
import { Room } from "../../types/api.types";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { PropertyNotesSection } from "../../components/owner/PropertyNotesSection";
import { ListItemSkeleton } from "../../components/ui/Skeletons";

interface PropertyManagerProps {
  rooms: Room[];
  loading: boolean;
  onEdit: (room: Room) => void;
  onToggleStatus: (roomId: string) => void;
  onViewFeedback: (room: Room) => void;
  showActivityFeed?: React.ReactNode;
}

export function PropertyManager({
  rooms,
  loading,
  onEdit,
  onToggleStatus,
  onViewFeedback,
  showActivityFeed,
}: PropertyManagerProps) {
  const getStatusBadge = (room: Room) => {
    const status = (room.reviewStatus ?? "PENDING").toUpperCase();
    const dotIcon = <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'currentColor' }}></span>;

    switch (status) {
      case "APPROVED":
        return (
          <StatusBadge variant="success" icon={dotIcon}>
            Approved
          </StatusBadge>
        );
      case "NEEDS_CORRECTION":
        return (
          <StatusBadge variant="warning" icon={dotIcon} animated>
            Needs Correction
          </StatusBadge>
        );
      case "REJECTED":
        return (
          <StatusBadge variant="error" icon={dotIcon}>
            Rejected
          </StatusBadge>
        );
      case "DRAFT":
        return (
          <StatusBadge variant="neutral" icon={dotIcon}>
            Draft
          </StatusBadge>
        );
      case "SUSPENDED":
        return (
          <StatusBadge variant="error" icon={dotIcon}>
            Suspended
          </StatusBadge>
        );
      case "PENDING":
      default:
        return (
          <StatusBadge variant="pending" icon={dotIcon} animateIcon>
            Under Review
          </StatusBadge>
        );
    }
  };

  if (loading) {
    return (
      <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 sm:p-5 min-h-[80px] sm:min-h-[100px]">
            <ListItemSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="p-16 text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Home className="w-10 h-10 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-xl font-bold text-navy dark:text-white mb-2 font-playfair">
          No properties yet
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto text-sm">
          Start by adding your first rental listing. It only takes a few minutes!
        </p>
      </div>
    );
  }

  return (
    <>
      {showActivityFeed}

      <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
        {rooms.map((room) => {
          const needsCorrection =
            room.reviewStatus?.toUpperCase() === "NEEDS_CORRECTION";
          return (
            <div
              key={room.id}
              className={needsCorrection ? "bg-orange-50/40 dark:bg-orange-900/10" : ""}
            >
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-700/20 transition-colors">
                {/* Image & Title */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="relative flex-shrink-0">
                    <img
                      src={
                        room.images[0] ||
                        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1600"
                      }
                      alt=""
                      loading="lazy"
                      className="w-16 h-16 sm:w-14 sm:h-14 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-700"
                    />

                    {needsCorrection && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center shadow-sm">
                        <AlertCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-navy dark:text-white truncate text-sm">
                      {room.title}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {room.roomType} · {room.location}
                    </p>
                    {room.demand && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        👀 {Math.max(1, room.demand.weeklyViews || 0)} views
                        {" • "}
                        🔥 {Math.max(1, room.demand.weeklyContacts || 0)} contacts
                      </p>
                    )}
                  </div>
                </div>

                {/* Price & Status */}
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 w-full sm:w-auto">
                  <div className="font-semibold text-navy dark:text-white text-sm">
                    ₹{room.pricePerMonth.toLocaleString()}
                    <span className="text-xs font-normal text-slate-400">
                      /mo
                    </span>
                  </div>
                  <div>{getStatusBadge(room)}</div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 justify-start sm:justify-end">
                  {needsCorrection ? (
                    <button
                      onClick={() => onViewFeedback(room)}
                      className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2.5 sm:py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-sm shadow-orange-200 dark:shadow-orange-900/30 min-h-[40px] sm:min-h-[36px]"
                    >
                      <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="hidden sm:inline">Feedback</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => onEdit(room)}
                        className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-navy dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="Edit property"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onToggleStatus(room.id)}
                        className={`p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border transition-all duration-200 ${
                          room.isActive
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-800"
                            : "bg-red-50 text-red-600 border-red-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 dark:hover:border-emerald-800"
                        }`}
                        title={
                          room.isActive
                            ? "Deactivate property"
                            : "Activate property"
                        }
                        aria-label={
                          room.isActive
                            ? "Deactivate property"
                            : "Activate property"
                        }
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <PropertyNotesSection
                propertyId={room.id}
                propertyTitle={room.title}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
