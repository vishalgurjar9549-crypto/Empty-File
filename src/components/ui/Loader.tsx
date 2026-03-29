

interface FullscreenLoaderProps {
  message?: string;
}

export default function FullscreenLoader({
  message = "Submitting your property...",
}: FullscreenLoaderProps) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/55 backdrop-blur-sm px-4"
      role="alertdialog"
      aria-modal="true"
      aria-live="assertive"
      aria-busy="true"
      aria-label={message}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 flex flex-col items-center text-center">
        <div className="relative flex items-center justify-center mb-5">
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full border-4 border-slate-200 dark:border-slate-700" />
          <div className="absolute h-14 w-14 sm:h-16 sm:w-16 rounded-full border-4 border-transparent border-t-navy dark:border-t-white animate-spin" />
        </div>

        <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
          Please wait
        </h2>

        <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}