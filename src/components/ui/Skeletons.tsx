/**
 * CARD SKELETON - Loading state for room cards, booking cards, etc.
 */
export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-800" />

      {/* Content skeleton */}
      <div className="p-5 space-y-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
        <div className="space-y-2">
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
        </div>

        {/* Amenities skeleton */}
        <div className="flex gap-2">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-16" />
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-16" />
        </div>

        {/* Button skeleton */}
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg mt-4" />
      </div>
    </div>
  );
}

/**
 * LIST SKELETON - Loading state for lists of items
 */
export function ListItemSkeleton() {
  return (
    <div className="p-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
        </div>
      </div>
    </div>
  );
}

/**
 * TEXT SKELETON - Loading state for text content
 */
export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-slate-200 dark:bg-slate-800 rounded"
          style={{ width: i === lines - 1 ? '80%' : '100%' }}
        />
      ))}
    </div>
  );
}

/**
 * DASHBOARD STAT SKELETON
 */
export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-2" />
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
    </div>
  );
}

/**
 * REVIEW SKELETON
 */
export function ReviewSkeleton() {
  return (
    <div className="pb-6 border-b border-slate-200 dark:border-slate-700 last:border-b-0 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32 mb-2" />
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
            ))}
          </div>
        </div>
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-20" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
      </div>
    </div>
  );
}

/**
 * GRID SKELETON - For grids of cards
 */
export function GridSkeleton({ count = 6, columns = 3 }: { count?: number; columns?: number }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
