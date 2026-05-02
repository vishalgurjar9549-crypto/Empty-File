import { X, Copy, Mail, MessageCircle } from "lucide-react";
import { useEffect, useRef, KeyboardEvent } from "react";
import { useAppDispatch } from '../store/hooks';
import { showToast } from '../store/slices/ui.slice';

const PUBLIC_SITE_URL = "https://homilivo.com";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: any;
}

export function ShareModal({ isOpen, onClose, room }: ShareModalProps) {
  const dispatch = useAppDispatch();

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  const shareUrl = room ? `${PUBLIC_SITE_URL}/og/property/${room.id}` : "";

  // Use Unicode escape sequences for emoji to ensure UTF-8 compatibility
  const shareText = room
    ? `\u{1F3E1} Check out this room in ${room.city}
₹${room.pricePerMonth.toLocaleString()}/month \u{2022} ${room.roomType}

No brokerage. Direct owner contact.

\u{1F449} ${shareUrl}`
    : "";

  useEffect(() => {
    if (!isOpen) return;

    // Save last focused element
    lastFocusedElementRef.current = document.activeElement as HTMLElement;

    // Lock background scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move focus into modal
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);

    const handleKeyDown = (e: KeyboardEvent | KeyboardEventInit | any) => {
      if (e.key === "Escape") {
        onClose();
      }

      // Focus trap
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<
          HTMLButtonElement | HTMLAnchorElement | HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (!firstElement || !lastElement) return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown as any);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown as any);

      // Restore focus to previously focused element
      lastFocusedElementRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen || !room) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);

      dispatch(
        showToast({
          message: "Link copied to clipboard!",
          type: "success",
        })
      );
    } catch (error) {
      dispatch(
        showToast({
          message: "Failed to copy link",
          type: "error",
        })
      );
    }
  };

  const openLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      aria-describedby="share-modal-description"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl relative animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto"
      >
        {/* Close */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close share modal"
          className="absolute top-4 right-4 text-slate-500 hover:text-black dark:hover:text-white p-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2
          id="share-modal-title"
          className="text-xl font-bold mb-2 text-navy dark:text-white"
        >
          Share this place
        </h2>

        <p
          id="share-modal-description"
          className="text-sm text-slate-600 dark:text-slate-400 mb-6"
        >
          Share this property with friends or family using one of the options below.
        </p>

        {/* Room Info */}
        <div className="flex gap-3 mb-6 items-start">
          <img
            src={room.images?.[0]}
            alt={room.title || "Room preview"}
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
          />
          <div className="text-sm text-slate-600 dark:text-slate-300">
            <p className="font-semibold text-navy dark:text-white">{room.title}</p>
            <div className="text-xs opacity-70 mt-1">
              ₹{room.pricePerMonth.toLocaleString()} • {room.city}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Copy */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          >
            <Copy className="w-4 h-4" />
            <span>Copy Link</span>
          </button>

          {/* Email */}
          <button
            onClick={() =>
              openLink(
                `mailto:?subject=${encodeURIComponent(room.title)}&body=${encodeURIComponent(shareText)}`
              )
            }
            className="flex items-center gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          >
            <Mail className="w-4 h-4" />
            <span>Email</span>
          </button>

          {/* WhatsApp */}
          <button
            onClick={() =>
              openLink(`https://wa.me/?text=${encodeURIComponent(shareText)}`)
            }
            className="flex items-center gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          {/* Twitter */}
          <button
            onClick={() =>
              openLink(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
              )
            }
            className="flex items-center gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          >
            <span className="font-medium">X / Twitter</span>
          </button>
        </div>
      </div>
    </div>
  );
}
