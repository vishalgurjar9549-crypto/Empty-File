import { useMemo, useCallback } from 'react';
import { Star, MessageCircle, Calendar, ArrowDown } from 'lucide-react';
import { ReviewDTO } from '../api/reviews.api';

/**
 * 📋 REVIEW LIST COMPONENT
 *
 * Displays reviews in a scrollable list with:
 * - User name
 * - Rating (stars)
 * - Comment text
 * - Relative date (e.g., "2 weeks ago")
 * - Pagination controls
 * - Sorting dropdown (latest, highest, lowest)
 *
 * Props:
 * - reviews: Array of ReviewDTO
 * - total: Total number of reviews
 * - page: Current page
 * - pages: Total pages
 * - loading: Whether loading reviews
 * - sort: Current sort order ('latest' | 'highest' | 'lowest')
 * - onPageChange: Callback for pagination
 * - onSortChange: Callback for sort changes
 */
interface ReviewListProps {
  reviews: ReviewDTO[];
  total: number;
  page: number;
  pages: number;
  loading: boolean;
  sort?: 'latest' | 'highest' | 'lowest';
  onPageChange?: (page: number) => void;
  onSortChange?: (sort: 'latest' | 'highest' | 'lowest') => void;
}

export function ReviewList({
  reviews,
  total,
  page,
  pages,
  loading,
  sort = 'latest',
  onPageChange,
  onSortChange
}: ReviewListProps) {
  // ✅ Format relative date
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffMs / 604800000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffWeeks < 4) return `${diffWeeks}w ago`;
    return date.toLocaleDateString();
  }, []);

  // ✅ Get sort label
  const getSortLabel = useCallback((sortValue: string) => {
    switch (sortValue) {
      case 'highest': return '⭐ Highest Rated';
      case 'lowest': return '⭐ Lowest Rated';
      default: return '📅 Newest First';
    }
  }, []);

  // ✅ Memoize rendered reviews
  const renderedReviews = useMemo(() => {
    return reviews.map((review) => (
      <div
        key={review.id}
        className="pb-6 border-b border-slate-200 dark:border-slate-700 last:border-b-0"
      >
        {/* User info and date */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-bold text-navy dark:text-white">
              {review.userMeta?.name || 'Anonymous'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {/* Rating stars */}
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? 'fill-gold text-gold'
                        : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-navy dark:text-white">
                {review.rating}
              </span>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(review.createdAt)}
          </div>
        </div>

        {/* Comment */}
        {review.comment ? (
          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-3">
            {review.comment}
          </p>
        ) : (
          <p className="text-slate-500 dark:text-slate-400 text-sm italic">
            No additional comment
          </p>
        )}

        {/* Helpful counter (future enhancement) */}
        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors">
          <MessageCircle className="w-3.5 h-3.5" />
          Helpful?
        </div>
      </div>
    ));
  }, [reviews, formatDate]);

  // Show loading state
  if (loading && reviews.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-3" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
          </div>
        ))}
      </div>
    );
  }

  // Show empty state with enhanced messaging
  if (reviews.length === 0) {
    return (
      <div className="p-8 text-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700">
        <Star className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p className="text-slate-700 dark:text-slate-300 font-semibold text-lg">
          Be the first to review this property! ⭐
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          Share your honest experience to help other travelers make the right choice
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Sorting controls */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {total} Review{total !== 1 ? 's' : ''}
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => onSortChange?.(e.target.value as 'latest' | 'highest' | 'lowest')}
            disabled={loading}
            className="appearance-none px-3 py-1.5 pr-8 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-navy dark:text-white cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-gold/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <option value="latest">📅 Newest First</option>
            <option value="highest">⭐ Highest Rated</option>
            <option value="lowest">⭐ Lowest Rated</option>
          </select>
          <ArrowDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-6">
        {renderedReviews}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10 pt-8 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={() => onPageChange?.(page - 1)}
            disabled={page === 1 || loading}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-navy dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>

          {/* Page numbers */}
          <div className="flex gap-1">
            {[...Array(pages)].map((_, i) => {
              const pageNum = i + 1;
              const isActive = pageNum === page;
              const isVisible = Math.abs(pageNum - page) <= 1 || pageNum === 1 || pageNum === pages;

              if (!isVisible) {
                if (pageNum === 2 || pageNum === pages - 1) {
                  return <span key={i} className="px-2 text-slate-500">•••</span>;
                }
                return null;
              }

              return (
                <button
                  key={i}
                  onClick={() => onPageChange?.(pageNum)}
                  disabled={loading}
                  className={`w-8 h-8 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gold text-white font-bold'
                      : 'border border-slate-200 dark:border-slate-700 text-navy dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onPageChange?.(page + 1)}
            disabled={page === pages || loading}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-navy dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {/* Review count info */}
      <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
        Showing reviews {Math.min((page - 1) * 10 + 1, total)} – {Math.min(page * 10, total)} of {total}
      </p>
    </div>
  );
}
