import { useState, useCallback, useMemo } from 'react';
import { Star, Send, AlertCircle, MessageSquareText } from 'lucide-react';
import { Button } from './ui/Button';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createReview, selectIsCreatingReview } from '../store/slices/reviews.slice';
import { showToast } from '../store/slices/ui.slice';

interface ReviewFormProps {
  roomId: string;
  isLoggedIn: boolean;
  hasAlreadyReviewed: boolean;
  onReviewSubmitted?: () => void;
  onLoginRequired?: () => void;
}

export function ReviewForm({
  roomId,
  isLoggedIn,
  hasAlreadyReviewed,
  onReviewSubmitted,
  onLoginRequired,
}: ReviewFormProps) {
  const dispatch = useAppDispatch();
  const isCreating = useAppSelector(selectIsCreatingReview);

  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>({});

  const activeRating = hoverRating || rating;

  const canSubmit = useMemo(() => {
    return rating >= 1 && rating <= 5 && !isCreating && !hasAlreadyReviewed && isLoggedIn;
  }, [rating, isCreating, hasAlreadyReviewed, isLoggedIn]);

  const ratingLabels: Record<number, string> = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  };

  const handleRatingClick = useCallback((value: number) => {
    setRating(value);
    setErrors((prev) => ({ ...prev, rating: undefined }));
  }, []);

  const handleCommentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;

      if (value.length <= 500) {
        setComment(value);
        setErrors((prev) => ({ ...prev, comment: undefined }));
      }
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    if (rating < 1 || rating > 5) {
      setErrors({ rating: 'Please select a rating' });
      return;
    }

    if (!isLoggedIn) {
      onLoginRequired?.();
      dispatch(
        showToast({
          message: 'Please log in to review this property',
          type: 'info',
        })
      );
      return;
    }

    if (hasAlreadyReviewed) {
      dispatch(
        showToast({
          message: 'You have already reviewed this property',
          type: 'info',
        })
      );
      return;
    }

    const result = await dispatch(
      createReview({
        roomId,
        rating,
        comment: comment.trim() || undefined,
      })
    );

    if (result.meta.requestStatus === 'fulfilled') {
      setRating(0);
      setHoverRating(0);
      setComment('');
      setErrors({});
      onReviewSubmitted?.();
    }
  }, [
    rating,
    comment,
    isLoggedIn,
    hasAlreadyReviewed,
    roomId,
    dispatch,
    onLoginRequired,
    onReviewSubmitted,
  ]);

  // -----------------------------------
  // State: Already Reviewed
  // -----------------------------------
  if (hasAlreadyReviewed) {
    return (
      <div className="mb-8 rounded-2xl border border-blue-200 bg-blue-50/80 p-5 shadow-sm backdrop-blur-sm dark:border-blue-800 dark:bg-blue-950/30 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-blue-100 p-2.5 dark:bg-blue-900/40">
            <Star className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>

          <div className="min-w-0">
            <h3 className="text-base font-semibold text-blue-900 dark:text-blue-100">
              You’ve already reviewed this property
            </h3>
            <p className="mt-1 text-sm leading-6 text-blue-700 dark:text-blue-300">
              Thanks for sharing your experience. Your feedback helps future renters make
              better decisions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------
  // State: Not Logged In
  // -----------------------------------
  if (!isLoggedIn) {
    return (
      <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50/80 p-5 shadow-sm backdrop-blur-sm dark:border-amber-800 dark:bg-amber-950/30 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-amber-100 p-2.5 dark:bg-amber-900/40">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>

          <div className="min-w-0">
            <h3 className="text-base font-semibold text-amber-900 dark:text-amber-100">
              Sign in to leave a review
            </h3>
            <p className="mt-1 text-sm leading-6 text-amber-700 dark:text-amber-300">
              Share your experience and help others choose the right place with confidence.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="mb-12">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-8 sm:py-6">
          <div className="flex items-start gap-4">
            <div className="hidden rounded-2xl bg-slate-100 p-3 dark:bg-slate-800 sm:block">
              <MessageSquareText className="h-5 w-5 text-slate-700 dark:text-slate-200" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                Share your experience
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Help other renters by leaving a thoughtful and honest review.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-6 sm:px-8 sm:py-8">
          {/* Info Note */}
          <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-800/50">
            <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-white">Tip:</span>{' '}
              Reviews are most useful when they include details about cleanliness, location,
              communication, and overall stay experience.
            </p>
          </div>

          {/* Rating */}
          <div className="mb-10">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <label className="text-sm font-semibold text-slate-900 dark:text-white">
                How would you rate this property?
                <span className="ml-1 text-red-500" aria-hidden="true">
                  *
                </span>
              </label>

              <div
                className={`text-sm font-medium ${
                  activeRating
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {activeRating ? ratingLabels[activeRating] : 'Select a rating'}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {[1, 2, 3, 4, 5].map((value) => {
                const isActive = value <= activeRating;
                const isSelected = value === rating;

                return (
                  <button
                    key={value}
                    type="button"
                    disabled={isCreating}
                    onClick={() => handleRatingClick(value)}
                    onMouseEnter={() => setHoverRating(value)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-pressed={isSelected}
                    aria-label={`Rate ${value} star${value !== 1 ? 's' : ''}`}
                    className={`group flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-slate-900 sm:h-14 sm:w-14 ${
                      isActive
                        ? 'border-yellow-200 bg-yellow-50 shadow-sm dark:border-yellow-500/20 dark:bg-yellow-500/10'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 dark:hover:bg-slate-700/70'
                    }`}
                  >
                    <Star
                      className={`h-6 w-6 transition-all sm:h-7 sm:w-7 ${
                        isActive
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-slate-300 group-hover:text-slate-400 dark:text-slate-600 dark:group-hover:text-slate-500'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {errors.rating && (
              <div role="alert" aria-live="assertive" className="mt-3 flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                <p className="text-sm font-medium text-red-500">{errors.rating}</p>
              </div>
            )}
          </div>

          {/* Comment */}
          <div className="mb-8">
            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <label
                htmlFor="review-comment"
                className="text-sm font-semibold text-slate-900 dark:text-white"
              >
                Write your review
                <span className="ml-2 font-normal text-slate-500 dark:text-slate-400">
                  (Optional)
                </span>
              </label>

              <span
                className={`text-xs font-medium ${
                  comment.length > 450
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {comment.length}/500
              </span>
            </div>

            <textarea
              id="review-comment"
              value={comment}
              onChange={handleCommentChange}
              disabled={isCreating}
              rows={5}
              maxLength={500}
              aria-invalid={!!errors.comment}
              aria-describedby={errors.comment ? 'review-comment-error' : 'review-comment-help'}
              placeholder="What stood out during your stay? Mention cleanliness, amenities, location, owner communication, or anything future renters should know."
              className={`min-h-[140px] w-full resize-none rounded-2xl border px-4 py-3 text-sm leading-6 text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 dark:text-white dark:placeholder:text-slate-500 sm:px-5 sm:py-4 ${
                errors.comment
                  ? 'border-red-300 bg-red-50/40 focus:ring-red-100 dark:border-red-800 dark:bg-red-950/20 dark:focus:ring-red-900/30'
                  : 'border-slate-200 bg-slate-50/60 focus:border-slate-300 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-800/60 dark:focus:border-slate-600 dark:focus:ring-slate-700/40'
              }`}
            />

            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p
                id="review-comment-help"
                className="text-xs leading-5 text-slate-500 dark:text-slate-400"
              >
                Keep it helpful, respectful, and relevant to the property experience.
              </p>

              {errors.comment && (
                <div
                  id="review-comment-error"
                  role="alert"
                  aria-live="assertive"
                  className="flex items-center gap-1.5"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
                  <p className="text-xs font-medium text-red-500">{errors.comment}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer CTA */}
          <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
              Be honest • Be respectful • Focus on the property experience
            </p>

            <div className="w-full sm:w-auto">
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                loading={isCreating}
                variant="primary"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold sm:w-auto"
              >
                <Send className="h-4 w-4" />
                {isCreating ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}