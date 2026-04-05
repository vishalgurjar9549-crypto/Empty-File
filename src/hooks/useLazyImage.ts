/**
 * useLazyImage Hook
 * 
 * Lazy loads images with Intersection Observer API
 * Only loads images when they're about to enter viewport
 * Significantly speeds up initial page load
 * 
 * Usage:
 * const { ref, src } = useLazyImage(imageUrl, placeholderUrl);
 * <img ref={ref} src={src} />
 */

import { useState, useEffect, useRef } from 'react';

interface UseLazyImageOptions {
  placeholder?: string;
  errorImage?: string;
  rootMargin?: string;
}

export function useLazyImage(
  imageSrc: string | undefined | null,
  options: UseLazyImageOptions = {}
) {
  const {
    placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3C/svg%3E',
    errorImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="16" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3EImage not found%3C/text%3E%3C/svg%3E',
    rootMargin = '50px',
  } = options;

  const [src, setSrc] = useState<string>(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imageSrc) {
      setSrc(errorImage);
      return;
    }

    const observer = new IntersectionObserver(
      async (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Start loading the image
            const img = new Image();

            img.onload = () => {
              setSrc(imageSrc);
              setIsLoaded(true);
              observer.unobserve(entry.target);
            };

            img.onerror = () => {
              setSrc(errorImage);
              setError(true);
              observer.unobserve(entry.target);
            };

            img.src = imageSrc;
          }
        });
      },
      { rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [imageSrc, errorImage, rootMargin]);

  return {
    ref,
    src,
    isLoaded,
    error,
  };
}

/**
 * useIntersectionObserver Hook
 * 
 * Generic intersection observer hook
 * Useful for lazy loading any element
 * 
 * Usage:
 * const { ref, isVisible } = useIntersectionObserver();
 * if (isVisible) { ... render expensive component ... }
 */

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  onVisible?: () => void;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    onVisible,
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            onVisible?.();
            // Don't unobserve - component might go off-screen again
          } else if (!entry.isIntersecting && isVisible) {
            setIsVisible(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, rootMargin, isVisible, onVisible]);

  return { ref, isVisible };
}
