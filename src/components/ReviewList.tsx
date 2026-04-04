import { useMemo, useCallback } from 'react';
import {
  Star,
  Calendar,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  MessageSquareText,
} from 'lucide-react';
import { ReviewSkeleton } from './ui/Skeletons';
import { ErrorState } from './ui/ErrorState';
import { ReviewDTO } from '../api/reviews.api';

interface ReviewListProps {
  reviews: ReviewDTO[];
  total: number;
  page: number;
  pages: number;
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
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
  error,
  onRetry,
  sort = 'latest',
  onPageChange,
  onSortChange,
}: ReviewListProps) {
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffMs / 604800000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffWeeks < 4) return `${diffWeeks}w ago`;

    return date.toLocaleDateString();
  }, []);

  const getSortLabel = useCallback((sortValue: string) => {
    switch (sortValue) {
      case 'highest':
        return 'Highest Rated';
      case 'lowest':
        return 'Lowest Rated';
      default:
        return 'Newest First';
    }
  }, []);

  const paginationItems = useMemo(() => {
    const items: (number | 'ellipsis')[] = [];

    for (let i = 1; i <= pages; i++) {
      const isVisible =
        i === 1 || i === pages || Math.abs(i - page) <= 1;

      if (isVisible) {
        items.push(i);
      } else {
        const prev = items[items.length - 1];
        if (prev !== 'ellipsis') {
          items.push('ellipsis');
        }
      }
    }

    return items;
  }, [page, pages]);

  const renderedReviews = useMemo(() => {
    return reviews.map((review) => (
      <article
        key={review.id}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* Left */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                  {review.userMeta?.name || 'Anonymous'}
                </h4>

                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {review.rating}.0
                  </span>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(review.createdAt)}
              </div>
            </div>

            <div className="mt-4">
              {review.comment ? (
                <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">
                  {review.comment}
                </p>
              ) : (
                <p className="text-sm italic text-slate-500 dark:text-slate-400">
                  No additional comment provided.
                </p>
              )}
            </div>
          </div>
        </div>
      </article>
    ));
  }, [reviews, formatDate]);

  // -----------------------------------
  // Error State
  // -----------------------------------
  if (error) {
    return (
      <ErrorState
        title="Unable to load reviews"
        message="We’re having trouble fetching reviews right now. Please try again."
        onRetry={onRetry}
        retryLabel="Refresh Reviews"
      />
    );
  }

  // -----------------------------------
  // Loading State
  // -----------------------------------
  if (loading && reviews.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-5">
        {[...Array(3)].map((_, i) => (
          <ReviewSkeleton key={i} />
        ))}
      </div>
    );
  }

  // -----------------------------------
  // Empty State
  // -----------------------------------
  if (reviews.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-10 text-center dark:border-slate-800 dark:from-slate-900 dark:to-slate-800/70 sm:px-8 sm:py-12">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-slate-800">
          <MessageSquareText className="h-7 w-7 text-slate-400 dark:text-slate-500" />
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          No reviews yet
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
          Be the first to share your experience and help future renters make better decisions.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Guest Reviews
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {total} review{total !== 1 ? 's' : ''} from verified experiences
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Sort by</span>
          </div>

          <select
            value={sort}
            onChange={(e) => onSortChange?.(e.target.value as 'latest' | 'highest' | 'lowest')}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition-all focus:border-slate-300 focus:ring-4 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-slate-600 dark:focus:ring-slate-700/40"
          >
            <option value="latest">Newest First</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>
      </div>

      {/* Active Sort Note */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sorted by <span className="font-medium text-slate-700 dark:text-slate-300">{getSortLabel(sort)}</span>
        </p>
      </div>

      {/* Reviews */}
      <div className="space-y-4 sm:space-y-5">{renderedReviews}</div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Range */}
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Showing{' '}
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {Math.min((page - 1) * 10 + 1, total)}–{Math.min(page * 10, total)}
              </span>{' '}
              of{' '}
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {total}
              </span>
            </p>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onPageChange?.(page - 1)}
                disabled={page === 1 || loading}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>

              <div className="flex items-center gap-1">
                {paginationItems.map((item, index) =>
                  item === 'ellipsis' ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-2 text-slate-400 dark:text-slate-500"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => onPageChange?.(item)}
                      disabled={loading}
                      className={`h-10 min-w-[40px] rounded-xl px-3 text-sm font-medium transition-all ${
                        item === page
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() => onPageChange?.(page + 1)}
                disabled={page === pages || loading}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}