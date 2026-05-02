import { Inbox } from "lucide-react";
import { Booking, Room } from "../../types/api.types";
import { BookingCard } from "../../components/owner/BookingCard";
import { ListItemSkeleton } from "../../components/ui/Skeletons";

interface BookingManagerProps {
  bookings: Booking[];
  rooms: Room[];
  loading: boolean;
  onApprove: (booking: Booking) => void;
  onReject: (booking: Booking) => void;
}

export function BookingManager({
  bookings,
  rooms,
  loading,
  onApprove,
  onReject,
}: BookingManagerProps) {
  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 bg-slate-50/50 dark:bg-slate-900/20 min-h-[400px]">
        {[1, 2, 3].map((i) => (
          <ListItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="p-16 text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Inbox className="w-10 h-10 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-xl font-bold text-navy dark:text-white mb-2 font-playfair">
          No booking requests yet
        </h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm">
          When tenants book your properties, they will appear here.
        </p>
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl max-w-sm mx-auto border border-blue-100 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <span className="font-bold">Pro Tip:</span> Verified properties get
            3x more bookings. Make sure your listings are complete!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 bg-slate-50/50 dark:bg-slate-900/20 min-h-[400px]">
      {bookings.map((booking) => {
        const room = rooms.find((r) => r.id === booking.roomId);
        return (
          <BookingCard
            key={booking.id}
            booking={booking}
            propertyTitle={room?.title || "Unknown Property"}
            onApprove={() => onApprove(booking)}
            onReject={() => onReject(booking)}
          />
        );
      })}
    </div>
  );
}
