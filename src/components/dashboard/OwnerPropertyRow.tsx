
// ─── components/dashboard/OwnerPropertyRow.tsx ───────────────
import { AlertCircle, Edit, MessageSquare, Power } from "lucide-react";
import { Room } from "../../types/api.types";
 
type OwnerPropertyRowProps = {
  room: Room;
  statusBadge: React.ReactNode;
  onEdit: (room: Room) => void;
  onToggleStatus: (id: string) => void;
  onViewFeedback: (room: Room) => void;
  isToggling: boolean;
};

const CSS = `
  .property-row {
    @apply flex items-center gap-4 px-4 py-4 md:px-6 md:py-5 border-b border-[var(--color-gold-border)];
    transition: background-color var(--transition-normal);
  }

  .property-row.needs-correction {
    background-color: rgba(249, 115, 22, 0.03);
  }

  .property-row:hover {
    background-color: var(--color-surface-hover);
  }

  .property-image {
    @apply w-14 h-14 md:w-16 md:h-16 rounded-lg object-cover border border-[var(--color-gold-border)] flex-shrink-0 block;
  }

  .property-info {
    @apply flex-1 min-w-0;
  }

  .property-title {
    @apply font-semibold text-sm md:text-base text-[var(--color-text-primary)] truncate;
  }

  .property-meta {
    @apply text-xs md:text-sm text-[var(--color-text-secondary)] mt-1;
  }

  .property-price {
    @apply font-bold text-base md:text-lg text-[var(--color-text-primary)] whitespace-nowrap;
  }

  .property-price-unit {
    @apply text-xs md:text-sm font-normal text-[var(--color-text-secondary)];
  }

  .property-actions {
    @apply flex items-center gap-2 flex-shrink-0;
  }

  .btn-feedback {
    @apply btn-primary !text-xs md:text-sm;
    gap: var(--space-2);
  }

  .btn-edit {
    @apply btn-icon;
  }

  .btn-toggle {
    @apply btn-icon;
    transition: all var(--transition-normal);
  }

  .btn-toggle:disabled {
    @apply opacity-65 cursor-not-allowed;
  }

  .btn-toggle.active {
    border-color: rgba(16, 185, 129, 0.3);
    background-color: rgba(16, 185, 129, 0.08);
    color: var(--color-status-approved);
  }

  .btn-toggle.inactive {
    border-color: rgba(239, 68, 68, 0.3);
    background-color: rgba(239, 68, 68, 0.08);
    color: var(--color-status-rejected);
  }
`;

let styleInjected = false;

function injectStyles() {
  if (styleInjected || typeof document === 'undefined') return;
  const el = document.createElement('style');
  el.dataset.id = 'property-row-styles';
  el.textContent = CSS;
  document.head.appendChild(el);
  styleInjected = true;
}
 
export function OwnerPropertyRow({ room, statusBadge, onEdit, onToggleStatus, onViewFeedback, isToggling }: OwnerPropertyRowProps) {
  injectStyles();
  const needsCorrection = room.reviewStatus?.toUpperCase() === "NEEDS_CORRECTION";
  
  return (
    <div className={`property-row ${needsCorrection ? 'needs-correction' : ''}`}>
      {/* Image */}
      <div className="relative flex-shrink-0">
        <img
          src={room.images?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=400"}
          alt={room.title}
          className="property-image"
        />
        {needsCorrection && (
          <div className="absolute top-[-8px] right-[-8px] w-5 h-5 bg-[var(--color-status-needs-correction)] rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
 
      {/* Info */}
      <div className="property-info">
        <div className="property-title">{room.title}</div>
        <div className="property-meta">
          {room.roomType} · {room.location}
        </div>
      </div>
 
      {/* Price */}
      <div className="property-price whitespace-nowrap text-sm md:text-base">
        ₹{room.pricePerMonth.toLocaleString()}
        <span className="property-price-unit"> /mo</span>
      </div>
 
      {/* Status */}
      <div className="flex-shrink-0">
        {statusBadge}
      </div>
 
      {/* Actions */}
      <div className="property-actions">
        {needsCorrection ? (
          <button
            onClick={() => onViewFeedback(room)}
            className="btn-feedback flex items-center"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Feedback</span>
          </button>
        ) : (
          <>
            <button
              onClick={() => onEdit(room)}
              className="btn-edit"
              title="Edit property"
              aria-label="Edit property"
            >
              <Edit className="w-5 h-5" />
            </button>
 
            <button
              onClick={() => !isToggling && onToggleStatus(room.id)}
              disabled={isToggling}
              className={`btn-toggle ${room.isActive ? 'active' : 'inactive'}`}
              title={isToggling ? "Updating status..." : room.isActive ? "Deactivate property" : "Activate property"}
              aria-label={isToggling ? "Updating property status" : room.isActive ? "Deactivate property" : "Activate property"}
            >
              <Power className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
        borderRadius: 12,
        border: `1px solid ${
          room.isActive
            ? "rgba(16,185,129,0.35)"
            : "rgba(239,68,68,0.35)"
        }`,
        animation: "ds-pulse-ring 1.2s ease-in-out infinite",
        pointerEvents: "none",
      }}
    />
  )}
</button>
          </>
        )}
      </div>
    </div>
  );
}
 