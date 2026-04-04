// components/home/PropertyRailSkeleton.tsx

export function PropertyRailSkeleton() {
  return (
    <div className="snap-start shrink-0 w-[78vw] xs:w-[72vw] sm:w-[320px] md:w-[340px] lg:w-[300px] xl:w-[320px] animate-pulse">
      <div className="space-y-3">
        <div className="aspect-[4/3] rounded-[24px] bg-slate-200 dark:bg-slate-800" />
        <div className="space-y-2 px-1">
          <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
}