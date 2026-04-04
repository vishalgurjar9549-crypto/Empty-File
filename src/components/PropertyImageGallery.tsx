import { useEffect, useMemo, useState } from "react";
import { X, ChevronLeft, ChevronRight, Grid2x2, CheckCircle2 } from "lucide-react";

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
    () => (Array.isArray(images) && images.length ? images : ["/placeholder-room.jpg"]),
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
    setActiveIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (!isViewerOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isViewerOpen]);

  if (!safeImages.length) return null;

  return (
    <>
      {/* DESKTOP / TABLET AIRBNB STYLE GRID */}
      <section className="mb-8 md:mb-10">
        <div className="relative">
          <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-3 h-[420px] lg:h-[520px] rounded-[28px] overflow-hidden">
            {/* Main large image */}
            <button
              type="button"
              onClick={() => openViewer(0)}
              className="relative col-span-2 row-span-2 group overflow-hidden bg-slate-100 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-gold"
              aria-label="Open main property image"
            >
              <img
                src={previewImages[0]}
                alt={`${title} image 1`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="eager"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

              {isVerified && (
                <div className="absolute top-4 left-4 z-10 inline-flex items-center gap-2 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 shadow-md">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-bold tracking-wide text-slate-900 dark:text-white uppercase">
                    Verified
                  </span>
                </div>
              )}
            </button>

            {/* Right-side images */}
            {Array.from({ length: 4 }).map((_, idx) => {
              const image = previewImages[idx + 1];
              const actualIndex = idx + 1;

              return (
                <button
                  key={actualIndex}
                  type="button"
                  onClick={() => image && openViewer(actualIndex)}
                  disabled={!image}
                  className={`relative group overflow-hidden bg-slate-100 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-gold ${
                    !image ? "cursor-default opacity-0 pointer-events-none" : ""
                  }`}
                  aria-label={image ? `Open property image ${actualIndex + 1}` : undefined}
                >
                  {image && (
                    <>
                      <img
                        src={image}
                        alt={`${title} image ${actualIndex + 1}`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                      {/* Show all photos overlay */}
                      {idx === 3 && safeImages.length > 5 && (
                        <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                          <div className="rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 text-sm font-semibold text-slate-900 dark:text-white shadow-lg">
                            +{safeImages.length - 5} more
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {/* MOBILE HERO */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => openViewer(activeIndex)}
              className="relative block w-full h-[260px] sm:h-[320px] rounded-[24px] overflow-hidden bg-slate-100 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-gold"
              aria-label="Open property gallery"
            >
              <img
                src={safeImages[activeIndex]}
                alt={`${title} image ${activeIndex + 1}`}
                className="w-full h-full object-cover"
                loading="eager"
              />

              {isVerified && (
                <div className="absolute top-4 left-4 z-10 inline-flex items-center gap-2 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 shadow-md">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-bold tracking-wide text-slate-900 dark:text-white uppercase">
                    Verified
                  </span>
                </div>
              )}

              <div className="absolute bottom-4 right-4 rounded-full bg-black/60 text-white text-xs font-semibold px-3 py-1.5 backdrop-blur-md">
                {activeIndex + 1} / {safeImages.length}
              </div>
            </button>

            {/* Mobile thumbnails */}
            {safeImages.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                {safeImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-2xl border transition-all ${
                      activeIndex === idx
                        ? "border-gold ring-2 ring-gold/20"
                        : "border-slate-200 dark:border-slate-700 opacity-80 hover:opacity-100"
                    }`}
                    aria-label={`View thumbnail ${idx + 1}`}
                  >
                    <img
                      src={img}
                      alt={`${title} thumbnail ${idx + 1}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Show all photos CTA */}
          <button
            type="button"
            onClick={() => openViewer(activeIndex)}
            className="absolute bottom-4 right-4 hidden md:inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white shadow-lg backdrop-blur-md hover:shadow-xl transition-all"
          >
            <Grid2x2 className="h-4 w-4" />
            Show all photos
          </button>
        </div>
      </section>

      {/* FULLSCREEN VIEWER */}
      {isViewerOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Property image viewer"
        >
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <button
              type="button"
              onClick={closeViewer}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Close gallery"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Counter */}
          <div className="absolute top-5 left-5 z-20 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
            {activeIndex + 1} / {safeImages.length}
          </div>

          {/* Prev */}
          {safeImages.length > 1 && (
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-4 top-1/2 z-20 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Next */}
          {safeImages.length > 1 && (
            <button
              type="button"
              onClick={goNext}
              className="absolute right-4 top-1/2 z-20 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Main image */}
          <div className="flex h-full w-full items-center justify-center px-4 md:px-10 pt-20 pb-28">
            <img
              src={safeImages[activeIndex]}
              alt={`${title} full image ${activeIndex + 1}`}
              className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
            />
          </div>

          {/* Bottom thumbnails */}
          {safeImages.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/50 px-4 py-4 backdrop-blur-md">
              <div className="mx-auto flex max-w-6xl gap-3 overflow-x-auto no-scrollbar">
                {safeImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`h-20 w-28 flex-shrink-0 overflow-hidden rounded-xl border transition-all ${
                      activeIndex === idx
                        ? "border-white ring-2 ring-white/30"
                        : "border-white/10 opacity-70 hover:opacity-100"
                    }`}
                    aria-label={`Open image ${idx + 1}`}
                  >
                    <img
                      src={img}
                      alt={`${title} preview ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}