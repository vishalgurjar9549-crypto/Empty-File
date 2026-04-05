/**
 * OptimizedImage Component
 * 
 * Production-ready image component with:
 * - Lazy loading
 * - Responsive layout
 * - Placeholder support
 * - Error handling
 * - Accessibility
 */

import { useLazyImage } from '../hooks/useLazyImage';

interface OptimizedImageProps {
  src: string | undefined | null;
  alt: string;
  width?: number | string;
  height?: number | string;
  aspectRatio?: string;
  placeholder?: string;
  errorImage?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * ✅ OptimizedImage Component
 * 
 * Features:
 * - Lazy loads images with Intersection Observer
 * - Shows placeholder while loading
 * - Handles errors gracefully
 * - Responsive and accessible
 * - Optimized for web performance
 * 
 * USAGE:
 * 
 * <OptimizedImage
 *   src={room.images[0]}
 *   alt={room.title}
 *   width="100%"
 *   aspectRatio="16/9"
 *   placeholder="/low-res.jpg"
 *   className="rounded-lg"
 * />
 */
export function OptimizedImage({
  src,
  alt,
  width = '100%',
  height = 'auto',
  aspectRatio,
  placeholder,
  errorImage,
  className = '',
  onLoad,
  onError,
}: OptimizedImageProps) {
  const { ref, src: lazyLoadedSrc, isLoaded, error } = useLazyImage(src, {
    placeholder,
    errorImage,
  });

  return (
    <div
      className={`relative overflow-hidden bg-slate-200 dark:bg-slate-800 ${className}`}
      style={{
        width,
        height,
        aspectRatio,
      }}
    >
      <img
        ref={ref}
        src={lazyLoadedSrc}
        alt={alt}
        loading="lazy"
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => {
          onLoad?.();
        }}
        onError={() => {
          onError?.();
        }}
      />

      {/* Loading skeleton */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-center p-4">
          <p className="text-sm">Image not available</p>
        </div>
      )}
    </div>
  );
}

/**
 * ✅ ResponsiveImage Component
 * 
 * Advanced version with srcset and responsive images
 * Automatically serves optimal image size based on device
 */

interface ResponsiveImageProps extends OptimizedImageProps {
  srcSet?: string; // e.g., "image-400.jpg 400w, image-800.jpg 800w"
  sizes?: string; // e.g., "(max-width: 640px) 100vw, 50vw"
}

export function ResponsiveImage({
  src,
  srcSet,
  sizes,
  alt,
  ...props
}: ResponsiveImageProps) {
  const { ref, src: lazyLoadedSrc, isLoaded, error } = useLazyImage(src, {
    placeholder: props.placeholder,
    errorImage: props.errorImage,
  });

  return (
    <picture>
      {/* WebP format for modern browsers */}
      {src && (
        <source
          srcSet={src.replace(/\.(jpg|jpeg|png)$/i, '.webp')}
          type="image/webp"
        />
      )}

      {/* Responsive srcset if provided */}
      {srcSet && (
        <source
          srcSet={srcSet}
          sizes={sizes}
          media="(min-width: 640px)"
        />
      )}

      {/* Fallback */}
      <div
        className={`relative overflow-hidden bg-slate-200 dark:bg-slate-800 ${props.className}`}
        style={{
          width: props.width,
          height: props.height,
          aspectRatio: props.aspectRatio,
        }}
      >
        <img
          ref={ref}
          src={lazyLoadedSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          loading="lazy"
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={props.onLoad}
          onError={props.onError}
        />

        {/* Loading skeleton */}
        {!isLoaded && !error && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-center p-4">
            <p className="text-sm">Image not available</p>
          </div>
        )}
      </div>
    </picture>
  );
}

/**
 * ✅ USAGE IN RoomCard
 * 
 * Before (optimized):
 * <img src={image} alt={title} loading="lazy" />
 * 
 * After (fully optimized):
 * <OptimizedImage
 *   src={image}
 *   alt={title}
 *   aspectRatio="4/3"
 *   className="rounded-xl"
 *   placeholder={PLACEHOLDER_BLUR_IMAGE}
 * />
 * 
 * Or with responsive sizes:
 * <ResponsiveImage
 *   src={image}
 *   alt={title}
 *   srcSet="image-400.jpg 400w, image-800.jpg 800w, image-1200.jpg 1200w"
 *   sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
 *   aspectRatio="4/3"
 *   className="rounded-xl"
 * />
 */
