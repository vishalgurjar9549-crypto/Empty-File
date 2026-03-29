import { useState, useCallback, useMemo } from 'react';
import { Star, Send, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createReview, selectIsCreatingReview } from '../store/slices/reviews.slice';
import { showToast } from '../store/slices/ui.slice';

/**
 * 📝 REVIEW FORM COMPONENT
 *
 * Features:
 * - Star rating selector (1-5)
 * - Comment textarea (max 500 chars)
 * - Character count
 * - Validation
 * - Loading state
 * - Accessible keyboard controls
 *
 * Props:
 * - roomId: Room ID for review
 * - isLoggedIn: Whether user is logged in
 * - hasAlreadyReviewed: Whether user already reviewed this room
 * - onReviewSubmitted: Callback after successful submission
 * - onLoginRequired: Callback if login required
 */
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
  onLoginRequired
}: ReviewFormProps) {
  const dispatch = useAppDispatch();
  const isCreating = useAppSelector(selectIsCreatingReview);

  // Local state
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>({});

  // Validation
  const canSubmit = useMemo(() => {
    return rating >= 1 && rating <= 5 && !isCreating && !hasAlreadyReviewed && isLoggedIn;
  }, [rating, isCreating, hasAlreadyReviewed, isLoggedIn]);

  // ✅ Handle rating change (keyboard and mouse support)
  const handleRatingClick = useCallback((value: number) => {
    setRating(value);
    setErrors((prev) => ({ ...prev, rating: undefined }));
  }, []);

  // ✅ Handle comment change
  const handleCommentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 500) {
      setComment(value);
      setErrors((prev) => ({ ...prev, comment: undefined }));
    }
  }, []);

  // ✅ Handle form submission
  const handleSubmit = useCallback(async () => {
    // Validation
    if (rating < 1 || rating > 5) {
      setErrors({ rating: 'Please select a rating' });
      return;
    }

    if (!isLoggedIn) {
      onLoginRequired?.();
      dispatch(showToast({
        message: 'Please log in to review this property',
        type: 'info'
      }));
      return;
    }

    if (hasAlreadyReviewed) {
      dispatch(showToast({
        message: 'You have already reviewed this property',
        type: 'info'
      }));
      return;
    }

    // Submit review
    const result = await dispatch(
      createReview({
        roomId,
        rating,
        comment: comment.trim() || undefined
      })
    );

    if (result.meta.requestStatus === 'fulfilled') {
      // Reset form
      setRating(0);
      setComment('');
      setErrors({});
      onReviewSubmitted?.();
    }
  }, [rating, comment, isLoggedIn, hasAlreadyReviewed, roomId, dispatch, onLoginRequired, onReviewSubmitted]);

  // ✅ If already reviewed, show message
  if (hasAlreadyReviewed) {
    return (
      <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
        <div className="flex gap-3">
          <Star className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-blue-900 dark:text-blue-200 mb-1">
              You've already reviewed this property
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Thank you for sharing your experience. Your review helps other renters.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ If not logged in, show login prompt
  if (!isLoggedIn) {
    return (
      <div className="mb-8 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-900 dark:text-amber-200 mb-1">
              Sign in to leave a review
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Your feedback helps the community. Log in to share your experience.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12 bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
      <h3 className="text-xl font-bold text-navy dark:text-white mb-2">
        Share Your Experience
      </h3>
      
      {/* Business Rule Note */}
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
        💡 <span className="font-medium">Pro tip:</span> Unlock the owner's contact information first to leave a review that helps other renters.
      </p>

      {/* Star Rating Selector */}
      <div className="mb-8">
        <label className="block text-sm font-bold text-navy dark:text-white mb-4">
          How would you rate this property?
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => handleRatingClick(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 rounded transition-transform hover:scale-110"
              aria-label={`Rate ${value} stars`}
              disabled={isCreating}
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  value <= (hoverRating || rating)
                    ? 'fill-gold text-gold'
                    : 'text-slate-300 dark:text-slate-600'
                }`}
              />
            </button>
          ))}
        </div>
        {errors.rating && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-2">{errors.rating}</p>
        )}
      </div>

      {/* Comment Textarea */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-navy dark:text-white mb-2">
          Comment (Optional)
        </label>
        <textarea
          value={comment}
          onChange={handleCommentChange}
          placeholder="Share details about your experience... What did you like? Any suggestions?"
          className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-navy dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-gold focus:border-transparent disabled:opacity-50"
          rows={4}
          maxLength={500}
          disabled={isCreating}
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {comment.length}/500 characters
          </p>
          {errors.comment && (
            <p className="text-red-600 dark:text-red-400 text-xs">{errors.comment}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!canSubmit}
        loading={isCreating}
        variant="primary"
        fullWidth
        className="flex items-center justify-center gap-2"
      >
        <Send className="w-4 h-4" />
        {isCreating ? 'Submitting...' : 'Submit Review'}
      </Button>

      {/* Helper text */}
      <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4">
        ✓ Be honest • ✓ Be respectful • ✓ Focus on the property
      </p>
    </div>
  );
}
