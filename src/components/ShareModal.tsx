import { X, Copy, Mail, MessageCircle } from "lucide-react";
import { useAppDispatch } from '../store/hooks';
import { showToast } from '../store/slices/ui.slice';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: any;
}

export function ShareModal({ isOpen, onClose, room }: ShareModalProps) {
const dispatch = useAppDispatch();
  if (!isOpen || !room) return null;

  const shareUrl = `${window.location.origin}/rooms/${room.id}`;
  const shareText = `🏡 Check out this room in ${room.city}
₹${room.pricePerMonth.toLocaleString()}/month • ${room.roomType}

No brokerage. Direct owner contact.

👉 ${shareUrl}`;

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl);

    dispatch(showToast({
      message: 'Link copied to clipboard!',
      type: 'success'
    }));

  } catch (error) {
    dispatch(showToast({
      message: 'Failed to copy link',
      type: 'error'
    }));
  }
};

  const openLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl relative animate-in fade-in zoom-in-95">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-black dark:hover:text-white"
        >
          <X />
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold mb-4 text-navy dark:text-white">
          Share this place
        </h2>

        {/* Room Info */}
        <div className="flex gap-3 mb-6">
          <img
            src={room.images?.[0]}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div className="text-sm text-slate-600 dark:text-slate-300">
            {room.title}
            <div className="text-xs opacity-70">
              ₹{room.pricePerMonth.toLocaleString()} • {room.city}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 p-3 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Copy className="w-4 h-4" /> Copy Link
          </button>

          {/* Email */}
          <button
            onClick={() =>
              openLink(
                `mailto:?subject=${encodeURIComponent(room.title)}&body=${encodeURIComponent(shareText)}`
              )
            }
            className="flex items-center gap-2 p-3 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Mail className="w-4 h-4" /> Email
          </button>

          {/* WhatsApp */}
          <button
            onClick={() =>
              openLink(
                `https://wa.me/?text=${encodeURIComponent(shareText)}`
              )
            }
            className="flex items-center gap-2 p-3 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </button>

          {/* Twitter */}
          <button
            onClick={() =>
              openLink(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
              )
            }
            className="flex items-center gap-2 p-3 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            X / Twitter
          </button>

        </div>
      </div>
    </div>
  );
}