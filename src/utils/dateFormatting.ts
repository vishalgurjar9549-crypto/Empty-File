/**
 * Format relative time from a date
 * Returns: "2 hours ago", "3 days ago", "Never", etc.
 */
export const getRelativeTime = (dateString?: string | null): string => {
  if (!dateString) {
    return 'Never';
  }

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    if (diffMs < 0) {
      return 'Just now';
    }

    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffWeeks < 4) return `${diffWeeks}w ago`;
    if (diffMonths < 12) return `${diffMonths}mo ago`;

    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    } as any);
  } catch (error) {
    return 'Unknown';
  }
};

/**
 * Format date for display with time
 */
export const formatDateTime = (dateString?: string | null): string => {
  if (!dateString) {
    return '—';
  }

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    } as any);
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Get a tooltip with absolute and relative time
 */
export const getTimeTooltip = (dateString?: string | null): string => {
  if (!dateString) {
    return 'Never contacted';
  }
  return `${formatDateTime(dateString)} (${getRelativeTime(dateString)})`;
};
