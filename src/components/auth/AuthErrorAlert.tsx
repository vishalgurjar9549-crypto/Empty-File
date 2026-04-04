import  { RefObject } from "react";

interface AuthErrorAlertProps {
  error: string;
  title?: string;
  errorRef?: RefObject<HTMLDivElement | null>;
}

export function AuthErrorAlert({
  error,
  title = "Something went wrong",
  errorRef,
}: AuthErrorAlertProps) {
  return (
    <div
      ref={errorRef}
      tabIndex={-1}
      role="alert"
      aria-live="assertive"
      className="mb-6 rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-700 dark:text-red-300 outline-none"
    >
      <div className="flex items-start gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mt-0.5 h-5 w-5 shrink-0"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>

        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1">{error}</p>
        </div>
      </div>
    </div>
  );
}