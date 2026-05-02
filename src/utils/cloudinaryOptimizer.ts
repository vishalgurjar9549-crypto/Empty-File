/**
 * Cloudinary URL Optimizer
 *
 * Generates optimized Cloudinary URLs with:
 * - Responsive sizing (w_auto)
 * - Automatic quality (q_auto)
 * - Modern format support (f_auto)
 * - Device Pixel Ratio support
 * - Different sizing for different contexts
 */

export interface ResponsiveImageSizes {
  thumbnail: string; // 150px - listing thumbnails
  card: string; // 400px - property cards
  detail: string; // 800px - detail view
  hero: string; // 1200px - hero sections
  full: string; // Original with optimizations
}

export interface CloudinaryOptimizationOptions {
  quality?: "auto" | "best" | "good" | "eco" | number; // q_auto or specific quality
  format?: "auto" | "webp" | "avif" | "jpeg"; // f_auto or specific format
  dpr?: boolean; // Include device pixel ratio
  progressive?: boolean; // Progressive JPEG
  gravity?: string; // Focus point (e.g., "face", "auto")
}

const DEFAULT_OPTIONS: CloudinaryOptimizationOptions = {
  quality: "auto",
  format: "auto",
  dpr: true,
  progressive: true,
  gravity: "auto",
};

/**
 * Build Cloudinary transformation URL
 * @param baseUrl - The base Cloudinary URL
 * @param width - Image width in pixels
 * @param options - Optimization options
 * @returns Optimized Cloudinary URL
 */
export function buildCloudinaryUrl(
  baseUrl: string,
  width: number,
  options: Partial<CloudinaryOptimizationOptions> = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (!baseUrl) return "";

  // Parse the URL to insert transformation
  // Format: https://res.cloudinary.com/CLOUD_NAME/image/upload/TRANSFORMATIONS/PUBLIC_ID.EXTENSION
  const urlParts = baseUrl.split("/upload/");
  if (urlParts.length !== 2) {
    // If URL structure is not standard, return as is
    return baseUrl;
  }

  const [baseUploadUrl] = urlParts;
  const [publicIdAndExtension] = urlParts[1].split("?");

  // Build transformation string
  const transformations: string[] = [];

  // Responsive width with device pixel ratio
  if (opts.dpr) {
    transformations.push(`w_${width},dpr_auto`);
  } else {
    transformations.push(`w_${width}`);
  }

  // Quality setting
  if (opts.quality === "auto") {
    transformations.push("q_auto");
  } else if (typeof opts.quality === "number") {
    transformations.push(`q_${Math.min(100, Math.max(1, opts.quality))}`);
  }

  // Format
  if (opts.format === "auto") {
    // f_auto with quality gives best results across browsers
    transformations.push("f_auto");
  } else {
    transformations.push(`f_${opts.format}`);
  }

  // Progressive JPEG for better perceived performance
  if (opts.progressive && opts.format !== "avif") {
    transformations.push("fl_progressive:steep");
  }

  // Gravity for focus point (helps with cropping)
  if (opts.gravity) {
    transformations.push(`g_${opts.gravity}`);
  }

  const transformationString = transformations.join(",");
  return `${baseUploadUrl}/upload/${transformationString}/${publicIdAndExtension}`;
}

/**
 * Generate all responsive image sizes for a single image
 * @param baseUrl - The base Cloudinary URL
 * @param options - Optimization options
 * @returns Object with URLs for different contexts
 */
export function getResponsiveImageSizes(
  baseUrl: string,
  options: Partial<CloudinaryOptimizationOptions> = {}
): ResponsiveImageSizes {
  return {
    thumbnail: buildCloudinaryUrl(baseUrl, 150, options),
    card: buildCloudinaryUrl(baseUrl, 400, options),
    detail: buildCloudinaryUrl(baseUrl, 800, options),
    hero: buildCloudinaryUrl(baseUrl, 1200, options),
    full: buildCloudinaryUrl(baseUrl, 1920, options),
  };
}

/**
 * Get srcset string for responsive images
 * @param baseUrl - The base Cloudinary URL
 * @param options - Optimization options
 * @returns srcset attribute value
 */
export function getSrcSet(
  baseUrl: string,
  options: Partial<CloudinaryOptimizationOptions> = {}
): string {
  const sizes = [150, 300, 400, 600, 800, 1200, 1600, 1920];
  return sizes
    .map((width) => `${buildCloudinaryUrl(baseUrl, width, options)} ${width}w`)
    .join(", ");
}

/**
 * Get sizes attribute for responsive images
 * Helps browser choose correct image size based on viewport
 */
export function getSizesAttribute(): string {
  return [
    "(max-width: 480px) 100vw",
    "(max-width: 768px) 90vw",
    "(max-width: 1024px) 80vw",
    "(max-width: 1440px) 70vw",
    "60vw",
  ].join(", ");
}

/**
 * Optimize image URL for thumbnail display
 */
export function getThumbnailUrl(
  baseUrl: string,
  options: Partial<CloudinaryOptimizationOptions> = {}
): string {
  return buildCloudinaryUrl(baseUrl, 150, {
    ...options,
    gravity: "face,auto", // Prioritize face detection
  });
}

/**
 * Optimize image URL for card display (property listings)
 */
export function getCardUrl(
  baseUrl: string,
  options: Partial<CloudinaryOptimizationOptions> = {}
): string {
  return buildCloudinaryUrl(baseUrl, 400, {
    ...options,
    gravity: "auto",
  });
}

/**
 * Optimize image URL for detail view
 */
export function getDetailUrl(
  baseUrl: string,
  options: Partial<CloudinaryOptimizationOptions> = {}
): string {
  return buildCloudinaryUrl(baseUrl, 800, {
    ...options,
    gravity: "auto",
  });
}

/**
 * Optimize image URL for hero/hero image
 */
export function getHeroUrl(
  baseUrl: string,
  options: Partial<CloudinaryOptimizationOptions> = {}
): string {
  return buildCloudinaryUrl(baseUrl, 1200, {
    ...options,
    gravity: "auto",
  });
}

/**
 * Create picture element HTML for maximum browser support
 * @param baseUrl - The base Cloudinary URL
 * @param altText - Alt text for accessibility
 * @returns Picture element HTML string
 */
export function createPictureElement(
  baseUrl: string,
  altText: string,
  options: Partial<CloudinaryOptimizationOptions> = {}
): string {
  const sizes = getResponsiveImageSizes(baseUrl, options);
  const srcSet = getSrcSet(baseUrl, options);
  const sizesAttr = getSizesAttribute();

  return `
    <picture>
      <!-- AVIF with highest quality (fallback to JPEG) -->
      <source
        srcset="${buildCloudinaryUrl(baseUrl, 400, { ...options, format: "avif" })} 400w,
                ${buildCloudinaryUrl(baseUrl, 800, { ...options, format: "avif" })} 800w,
                ${buildCloudinaryUrl(baseUrl, 1200, { ...options, format: "avif" })} 1200w"
        type="image/avif"
        sizes="${sizesAttr}"
      />
      <!-- WebP fallback -->
      <source
        srcset="${buildCloudinaryUrl(baseUrl, 400, { ...options, format: "webp" })} 400w,
                ${buildCloudinaryUrl(baseUrl, 800, { ...options, format: "webp" })} 800w,
                ${buildCloudinaryUrl(baseUrl, 1200, { ...options, format: "webp" })} 1200w"
        type="image/webp"
        sizes="${sizesAttr}"
      />
      <!-- JPEG fallback for old browsers -->
      <img
        src="${sizes.card}"
        srcset="${srcSet}"
        sizes="${sizesAttr}"
        alt="${altText}"
        loading="lazy"
        decoding="async"
      />
    </picture>
  `.trim();
}

/**
 * Get CSS background-image URL with optimization
 */
export function getBackgroundImageUrl(
  baseUrl: string,
  options: Partial<CloudinaryOptimizationOptions> = {}
): string {
  const url = buildCloudinaryUrl(baseUrl, 800, options);
  return `url('${url}')`;
}
