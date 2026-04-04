import { useEffect } from "react";
import { CheckCircle, XCircle, X, Info } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const duration = type === "info" ? 4000 : 3000;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, type]);

  return (
    <div
      className="
        fixed z-[9999] pointer-events-none
        top-20 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)]
        sm:top-24 sm:right-6 sm:left-auto sm:translate-x-0 sm:w-full sm:max-w-sm
        animate-in slide-in-from-top-5 fade-in duration-300
      "
    >
      <div
        role={type === "error" ? "alert" : "status"}
        aria-live={type === "error" ? "assertive" : "polite"}
        aria-atomic="true"
        className={`
          pointer-events-auto
          flex items-start gap-3
          px-4 py-3 sm:px-5 sm:py-3.5
          rounded-xl shadow-xl border backdrop-blur-sm
          w-full
          
          ${
            type === "success"
              ? "bg-green-50 dark:bg-green-900/40 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300"
              : ""
          }
          ${
            type === "error"
              ? "bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
              : ""
          }
          ${
            type === "info"
              ? "bg-slate-50 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              : ""
          }
        `}
      >
        {/* Icon */}
        <div className="mt-0.5 flex-shrink-0" aria-hidden="true">
          {type === "success" && <CheckCircle className="w-5 h-5" />}
          {type === "error" && <XCircle className="w-5 h-5" />}
          {type === "info" && (
            <Info className="w-5 h-5 text-[#C8A45D]" />
          )}
        </div>

        {/* Message */}
        <p className="text-sm font-medium leading-snug break-words flex-1">
          {message}
        </p>

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close notification"
          className="
            ml-2 p-1 rounded-full flex-shrink-0
            hover:bg-black/5 dark:hover:bg-white/10
            transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
            focus-visible:ring-current
          "
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}