import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Grid2x2,
  CheckCircle2,
} from "lucide-react";

interface PropertyImageGalleryProps {
  images: string[];
  title: string;
  isVerified?: boolean;
}

export function PropertyImageGallery({
  images,
  title,
  isVerified = false,
}: PropertyImageGalleryProps) {
  const safeImages = useMemo(
    () =>
      Array.isArray(images) && images.length
        ? images
        : ["/placeholder-room.jpg"],
    [images]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const previewImages = safeImages.slice(0, 5);

  const openViewer = (index = 0) => {
    setActiveIndex(index);
    setIsViewerOpen(true);
  };

  const closeViewer = () => setIsViewerOpen(false);

  const goPrev = () => {
    setActiveIndex((prev) =>
      prev === 0 ? safeImages.length - 1 : prev - 1
    );
  };

  const goNext = () => {
    setActiveIndex((prev) =>
      prev === safeImages.length - 1 ? 0 : prev + 1
    );
  };

  useEffect(() => {
    if (!isViewerOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", onKeyDown);

    // Lock scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isViewerOpen]);

  if (!safeImages.length) return null;

  return (
    <>
      {/* GRID VIEW */}
      <section className="mb-8 md:mb-10">
        <div className="relative">
          <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-3 h-[420px] lg:h-[520px] rounded-[28px] overflow-hidden">
            {/* Main image */}
            <button
              type="button"
              onClick={() => openViewer(0)}
              className="relative col-span-2 row-span-2 group overflow-hidden bg-slate-100 dark:bg-slate-800"
            >
              <img
                src={previewImages[0]}
                alt={`${title} image 1`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />

              {isVerified && (
                <div className="absolute top-4 left-4 z-10 inline-flex items-center gap-2 rounded-full bg-white/90 dark:bg-slate-900/90 px-3 py-1.5 shadow-md">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-bold uppercase">
                    Verified
                  </span>
                </div>
              )}
            </button>

            {/* Side images */}
            {Array.from({ length: 4 }).map((_, idx) => {
              const image = previewImages[idx + 1];
              const actualIndex = idx + 1;

              return (
                <button
                  key={actualIndex}
                  onClick={() => image && openViewer(actualIndex)}
                  className="relative group overflow-hidden bg-slate-100 dark:bg-slate-800"
                >
                  {image && (
                    <>
                      <img
                        src={image}
                        alt={`${title} image ${actualIndex + 1}`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />

                      {idx === 3 && safeImages.length > 5 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-semibold">
                          +{safeImages.length - 5} more
                        </div>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {/* MOBILE */}
          <div className="md:hidden">
            <button
              onClick={() => openViewer(activeIndex)}
              className="relative w-full h-[260px] rounded-[24px] overflow-hidden"
            >
              <img
                src={safeImages[activeIndex]}
                className="w-full h-full object-cover"
              />

              <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
                {activeIndex + 1} / {safeImages.length}
              </div>
            </button>
          </div>

          {/* CTA */}
          <button
  onClick={() => openViewer(activeIndex)}
  className="absolute bottom-4 right-4 hidden md:inline-flex items-center gap-2
             rounded-xl px-4 py-2.5 text-sm font-semibold shadow-lg backdrop-blur-md
             
             bg-white/95 text-slate-900 border border-slate-200
             hover:bg-white hover:shadow-xl
             
             dark:bg-slate-900/95 dark:text-white dark:border-slate-700
             dark:hover:bg-slate-900
             
             transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
>
  <Grid2x2 className="h-4 w-4" />
  Show all photos
</button>
        </div>
      </section>

      {/* ✅ PORTAL VIEWER */}
      {isViewerOpen &&
        createPortal(
          <div className="fixed inset-0 z-[999999] bg-black/95">
            {/* Close */}
            <button
              onClick={closeViewer}
              className="absolute top-4 right-4 z-20 bg-white/10 text-white p-3 rounded-full"
            >
              <X />
            </button>

            {/* Counter */}
            <div className="absolute top-5 left-5 text-white">
              {activeIndex + 1} / {safeImages.length}
            </div>

            {/* Prev */}
            {safeImages.length > 1 && (
              <button
                onClick={goPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white"
              >
                <ChevronLeft size={32} />
              </button>
            )}

            {/* Next */}
            {safeImages.length > 1 && (
              <button
                onClick={goNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
              >
                <ChevronRight size={32} />
              </button>
            )}

            {/* Image */}
            <div className="flex h-full items-center justify-center px-4 pt-20 pb-28">
              <img
                src={safeImages[activeIndex]}
                className="max-h-full max-w-full object-contain rounded-xl"
              />
            </div>

            {/* Thumbnails */}
            {safeImages.length > 1 && (
              <div className="absolute bottom-0 w-full flex gap-2 overflow-x-auto p-4 bg-black/50">
                {safeImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`h-20 w-28 rounded overflow-hidden ${
                      activeIndex === idx
                        ? "ring-2 ring-white"
                        : "opacity-60"
                    }`}
                  >
                    <img
                      src={img}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
}