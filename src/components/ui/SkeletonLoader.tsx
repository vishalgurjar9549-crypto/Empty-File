/**
 * Skeleton Loaders for Homepage
 * Fast visual feedback while data loads
 */

export function RoomCardSkeleton() {
  return (
    <div className="block h-full animate-pulse">
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm h-full flex flex-col">
        {/* Image Skeleton */}
        <div className="relative aspect-[4/3] bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700" />

        {/* Content Skeleton */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Location + Rating */}
          <div className="flex justify-between items-start mb-4">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-32" />
            <div className="h-6 w-12 bg-slate-200 dark:bg-slate-700 rounded-md" />
          </div>

          {/* Title */}
          <div className="space-y-2 mb-4">
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
          </div>

          {/* Description */}
          <div className="space-y-2 mb-4 flex-1">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
          </div>

          {/* Demand Signal */}
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-4 w-full" />

          {/* Divider */}
          <div className="h-px bg-slate-100 dark:bg-slate-800 mb-4" />

          {/* Amenities */}
          <div className="flex gap-2 mb-4">
            <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>

          {/* Button */}
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function CityPillSkeleton() {
  return (
    <div className="shrink-0 animate-pulse">
      <div className="w-[132px] sm:w-[148px] md:w-[160px]">
        {/* Image Skeleton */}
        <div className="h-[176px] w-[132px] sm:h-[196px] sm:w-[148px] md:h-[210px] md:w-[160px] mx-auto rounded-[999px] bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600" />

        {/* Text Skeleton */}
        <div className="mt-3 text-center space-y-2">
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mx-auto" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto" />
        </div>
      </div>
    </div>
  );
}

export function WhatsNewCardSkeleton() {
  return (
    <div className="shrink-0 animate-pulse">
      {/* Image */}
      <div className="w-full h-48 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-lg" />
      {/* Text */}
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
      </div>
    </div>
  );
}

export function PropertyRailSkeletonLoader() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Section Header Skeleton */}
        <div className="mb-6 animate-pulse">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
          <div className="h-8 w-1/3 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
          <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <RoomCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
