import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import {
  AMENITIES_LIST,
  CATEGORY_LABELS,
  AMENITY_CATEGORIES,
  type AmenityCategoryKey,
} from "../constants/amenities.config";

// ✅ Get amenity details
const getAmenityDetails = (amenityId: string) => {
  return AMENITIES_LIST.find((a) => a.id === amenityId);
};

// ✅ Map icons
import { Wifi, Wind, Zap, Shield, Check, Coffee, Car, Tv } from "lucide-react";

const getIconForAmenity = (iconName?: string) => {
  const iconMap: Record<string, any> = {
    Wifi,
    Wind,
    Zap,
    Shield,
    Check,
    Coffee,
    Car,
    Tv,
  };

  return iconMap[iconName || "Check"] || Check;
};

// ✅ Group amenities
const groupAmenitiesByCategory = (
  amenityIds: string[]
): Record<AmenityCategoryKey, string[]> => {
  const grouped: Record<AmenityCategoryKey, string[]> = {
    [AMENITY_CATEGORIES.ESSENTIALS]: [],
    [AMENITY_CATEGORIES.ROOM_FEATURES]: [],
    [AMENITY_CATEGORIES.KITCHEN]: [],
    [AMENITY_CATEGORIES.SAFETY]: [],
    [AMENITY_CATEGORIES.CONVENIENCE]: [],
  };

  amenityIds.forEach((id) => {
    const amenity = getAmenityDetails(id);
    if (amenity && grouped[amenity.category]) {
      grouped[amenity.category].push(id);
    }
  });

  return grouped;
};

export function AmenitiesModal({
  isOpen,
  onClose,
  amenities,
}: {
  isOpen: boolean;
  onClose: () => void;
  amenities: string[];
}) {
  const modalRef = useRef<HTMLDivElement>(null);

  

  // ✅ Scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ✅ ESC close
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handle);
      modalRef.current?.focus();
    }

    return () => document.removeEventListener("keydown", handle);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const grouped = groupAmenitiesByCategory(amenities);

  const categoryOrder: AmenityCategoryKey[] = [
    AMENITY_CATEGORIES.ESSENTIALS,
    AMENITY_CATEGORIES.ROOM_FEATURES,
    AMENITY_CATEGORIES.KITCHEN,
    AMENITY_CATEGORIES.SAFETY,
    AMENITY_CATEGORIES.CONVENIENCE,
  ];

  return (
  <div
  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
  role="dialog"
  aria-modal="true"
>
  {/* Overlay */}
  <div className="absolute inset-0" onClick={onClose} />

  {/* Modal */}
  <div
    ref={modalRef}
    tabIndex={-1}
    className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl shadow-xl outline-none 
    bg-white dark:bg-[#0d0b06]"
  >
    {/* Header */}
    <div className="sticky top-0 flex justify-between items-center px-6 py-4 border-b 
    border-gray-200 dark:border-[rgba(212,175,55,0.2)] 
    bg-white dark:bg-[#0d0b06]">
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          All Amenities
        </h3>
        <p className="text-sm text-gray-500 dark:text-white/60">
          {amenities.length} amenities available
        </p>
      </div>

      <button
        onClick={onClose}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition"
      >
        <X className="w-5 h-5 text-gray-500 dark:text-white/60" />
      </button>
    </div>

    {/* Content */}
    <div className="p-6 space-y-6">
      {categoryOrder.map((categoryKey) => {
        const ids = grouped[categoryKey];
        if (!ids.length) return null;

        return (
          <div key={categoryKey} className="space-y-3">
            {/* Category Title */}
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                {CATEGORY_LABELS[categoryKey]}
              </h4>
              <span className="text-xs px-2 py-0.5 rounded-full 
                bg-gray-100 text-gray-600 
                dark:bg-[rgba(212,175,55,0.12)] 
                dark:text-[rgba(212,175,55,0.9)]">
                {ids.length}
              </span>
            </div>

            {/* Grid */}
            <div className="grid sm:grid-cols-2 gap-3">
              {ids.map((id, i) => {
                const amenity = getAmenityDetails(id);
                if (!amenity) return null;

                const Icon = getIconForAmenity(amenity.icon);

                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-4 rounded-xl border 
                    border-gray-200 bg-gray-50 hover:bg-gray-100
                    dark:border-[rgba(212,175,55,0.2)] 
                    dark:bg-[rgba(212,175,55,0.12)] 
                    dark:hover:bg-[rgba(212,175,55,0.18)]
                    transition"
                  >
                    <div className="p-2 rounded-lg 
                      bg-white border border-gray-200
                      dark:bg-[#0d0b06] dark:border-[rgba(212,175,55,0.2)]">
                      
                      <Icon className="w-4 h-4 
                        text-yellow-600 
                        dark:text-[rgba(212,175,55,0.9)]" />
                    </div>

                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">
                        {amenity.label}
                      </p>
                      {amenity.description && (
                        <p className="text-xs text-gray-500 dark:text-white/60 mt-1">
                          {amenity.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>

    {/* Footer */}
    <div className="sticky bottom-0 px-6 py-4 border-t 
  border-gray-200 dark:border-[rgba(212,175,55,0.2)] 
  bg-white dark:bg-[#0d0b06]">

  <button
    onClick={onClose}
    className="
      w-full py-3 rounded-xl font-semibold text-sm
      bg-[rgba(212,175,55,0.9)] text-black
      hover:bg-[rgba(212,175,55,1)]
      active:scale-[0.98]
      transition-all duration-200
      shadow-sm hover:shadow-md
      focus:outline-none focus:ring-2 focus:ring-[rgba(212,175,55,0.4)]
    "
  >
    Close
  </button>
</div>
  </div>
</div>
  );
}