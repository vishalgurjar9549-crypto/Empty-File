import { useMemo } from "react";
import { Star } from "lucide-react";

interface RatingSummaryProps {
  averageRating: number;
  totalReviews: number;
  ratingDistribution?: {
    [key: number]: number;
  };
}

export function RatingSummary({
  averageRating,
  totalReviews,
  ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
}: RatingSummaryProps) {
  const distributionBars = useMemo(() => {
    const max = Math.max(...Object.values(ratingDistribution), 1);

    return [5, 4, 3, 2, 1].map((stars) => {
      const count = ratingDistribution[stars] || 0;
      return {
        stars,
        count,
        percent: (count / max) * 100,
      };
    });
  }, [ratingDistribution]);

  if (totalReviews === 0) {
    return (
      <div className="text-center py-10">
        <Star className="w-8 h-8 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-500">
          No reviews yet. Be the first to review.
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 items-center">
      {/* LEFT */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-slate-900 dark:text-white">
            {averageRating.toFixed(1)}
          </span>

          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.round(averageRating)
                    ? "fill-gold text-gold"
                    : "text-slate-300 dark:text-slate-600"
                }`}
              />
            ))}
          </div>
        </div>

        <p className="text-sm text-slate-500">
          {totalReviews} review{totalReviews !== 1 ? "s" : ""}
        </p>
      </div>

      {/* RIGHT */}
      <div className="space-y-2">
        {distributionBars.map(({ stars, count, percent }) => (
          <div key={stars} className="flex items-center gap-3 text-sm">
            <span className="w-8 text-slate-500">{stars}★</span>

            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gold rounded-full"
                style={{ width: `${percent}%` }}
              />
            </div>

            <span className="w-8 text-right text-slate-500">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}