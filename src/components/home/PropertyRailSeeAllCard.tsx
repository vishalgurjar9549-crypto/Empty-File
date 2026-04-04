// components/home/PropertyRailSeeAllCard.tsx

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

type PropertyRailSeeAllCardProps = {
  title?: string;
  to: string;
  previewImages?: string[];
};

export function PropertyRailSeeAllCard({
  title = "See all",
  to,
  previewImages = [],
}: PropertyRailSeeAllCardProps) {
  const goldBorder = "rgba(212,175,55,0.2)";

  return (
    <Link
      to={to}
      className="group block snap-start shrink-0 w-[78vw] xs:w-[72vw] sm:w-[320px] md:w-[340px] lg:w-[300px] xl:w-[320px]"
    >
      <div className="space-y-3">
        {/* IMAGE AREA (match PropertyRailCard) */}
        <div className="relative overflow-hidden rounded-[24px] aspect-[4/3] bg-slate-100 dark:bg-slate-900 shadow-sm">
          
          {/* Preview stacked images */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-[140px] h-[140px]">
              
              {previewImages[2] && (
                <img
                  src={previewImages[2]}
                  alt="preview"
                  className="absolute top-0 left-10 w-20 h-20 rounded-xl object-cover rotate-[10deg] border-2 border-white dark:border-[#0d0b06] shadow-md"
                />
              )}

              {previewImages[1] && (
                <img
                  src={previewImages[1]}
                  alt="preview"
                  className="absolute top-6 left-0 w-20 h-20 rounded-xl object-cover -rotate-[10deg] border-2 border-white dark:border-[#0d0b06] shadow-md"
                />
              )}

              {previewImages[0] && (
                <img
                  src={previewImages[0]}
                  alt="preview"
                  className="absolute top-10 left-6 w-20 h-20 rounded-xl object-cover rotate-[2deg] border-2 border-white dark:border-[#0d0b06] shadow-lg"
                />
              )}
            </div>
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

          {/* CTA */}
          <div
            className="absolute bottom-3 left-3 right-3 rounded-xl px-4 py-3 backdrop-blur-md border flex items-center justify-between"
            style={{
              background: "rgba(0,0,0,0.55)",
              borderColor: goldBorder,
            }}
          >
            <span className="text-white font-semibold text-sm">
              {title}
            </span>

            <ArrowRight className="h-4 w-4 text-white group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Keep spacing consistent with other cards */}
        <div className="px-1">
          <div className="h-[18px]" />
          <div className="h-[14px]" />
        </div>
      </div>
    </Link>
  );
}