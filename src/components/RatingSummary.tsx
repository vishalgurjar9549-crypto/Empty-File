import { useMemo } from 'react';
import { Star } from 'lucide-react';

/**
 * ⭐ RATING SUMMARY COMPONENT
 * 
 * Displays:
 * - Average rating (stars)
 * - Total reviews count
 * - Rating distribution (1-5 stars)
 * 
 * Props:
 * - averageRating: number (0-5)
 * - totalReviews: number
 * - ratingDistribution: { 1: n, 2: n, 3: n, 4: n, 5: n }
 */
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
  ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
}: RatingSummaryProps) {
  // ✅ Memoize distribution bar rendering
  const distributionBars = useMemo(() => {
    const maxCount = Math.max(...Object.values(ratingDistribution), 1);
    return [5, 4, 3, 2, 1].map((stars) => {
      const count = ratingDistribution[stars] || 0;
      const percentage = (count / maxCount) * 100;
      return { stars, count, percentage };
    });
  }, [ratingDistribution]);

  // If no reviews, show placeholder
  if (totalReviews === 0) {
    return (
      <div className="mb-12 p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
        <div className="flex justify-center mb-4">
          <Star className="w-8 h-8 text-slate-300 dark:text-slate-600" />
        </div>
        <p className="text-slate-600 dark:text-slate-400 font-medium">
          No reviews yet. Be the first to review this property!
        </p>
      </div>
    );
  }

  return (
    <div className="mb-12 bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
      {/* Header with rating and count */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 ${
                    i < Math.round(averageRating)
                      ? 'fill-gold text-gold'
                      : 'text-slate-300 dark:text-slate-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-3xl font-bold text-navy dark:text-white">
              {averageRating.toFixed(1)}
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {/* Rating scale indicator */}
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {averageRating >= 4.5 && '⭐ Excellent'}
          {averageRating >= 4 && averageRating < 4.5 && '⭐ Very Good'}
          {averageRating >= 3 && averageRating < 4 && '⭐ Good'}
          {averageRating >= 2 && averageRating < 3 && '⭐ Fair'}
          {averageRating < 2 && '⭐ Needs Improvement'}
        </div>
      </div>

      {/* Distribution bars */}
      <div className="space-y-3">
        {distributionBars.map(({ stars, count, percentage }) => (
          <div key={stars} className="flex items-center gap-3">
            {/* Star label */}
            <div className="w-12 text-sm font-medium text-slate-600 dark:text-slate-400">
              {stars} {stars === 1 ? '⭐' : '⭐'}
            </div>

            {/* Progress bar */}
            <div className="flex-1 bg-slate-100 dark:bg-slate-700/50 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gold h-full rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* Count */}
            <div className="w-12 text-sm font-medium text-slate-600 dark:text-slate-400 text-right">
              {count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
