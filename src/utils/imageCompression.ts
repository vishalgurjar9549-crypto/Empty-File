/**
 * Image Compression Utility
 * 
 * Optimizes images before upload by:
 * - Resizing to max 1200px width
 * - Converting large PNGs to JPEG/WebP
 * - Targeting file size under 300KB
 * - Maintaining visual quality
 * 
 * Uses Canvas API for compression (no external dependencies)
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  targetFileSize?: number; // bytes
  maxQuality?: number; // 0-1
  minQuality?: number; // 0-1
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  sizeSaved: number;
  originalFormat: string;
  compressedFormat: string;
  wasResized: boolean;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  targetFileSize: 300 * 1024, // 300KB
  maxQuality: 0.92,
  minQuality: 0.65,
};

/**
 * Get image dimensions from a File or Blob
 */
function getImageDimensions(file: File | Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Calculate new dimensions maintaining aspect ratio
 */
function calculateNewDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number; ratio: number } {
  const widthRatio = maxWidth / originalWidth;
  const heightRatio = maxHeight / originalHeight;
  const ratio = Math.min(widthRatio, heightRatio, 1); // Never upscale

  return {
    width: Math.round(originalWidth * ratio),
    height: Math.round(originalHeight * ratio),
    ratio,
  };
}

/**
 * Compress image to target file size with quality adjustment
 */
async function compressToTargetSize(
  canvas: HTMLCanvasElement,
  targetFileSize: number,
  maxQuality: number,
  minQuality: number,
  format: "image/jpeg" | "image/webp" = "image/jpeg"
): Promise<{ blob: Blob; quality: number }> {
  let quality = maxQuality;
  let blob: Blob | null = null;
  const step = 0.05;

  // Binary search for optimal quality
  while (quality >= minQuality) {
    blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), format, quality);
    });

    if (blob.size <= targetFileSize) {
      break;
    }
    quality -= step;
  }

  return { blob: blob!, quality };
}

/**
 * Determine if format conversion would be beneficial
 */
function shouldConvertFormat(file: File, originalSize: number): "image/jpeg" | "image/webp" | null {
  const isPNG = file.type === "image/png";
  const isLarge = originalSize > 200 * 1024; // > 200KB

  // Convert large PNGs to JPEG for better compression
  if (isPNG && isLarge) {
    return "image/jpeg";
  }

  return null;
}

/**
 * Main compression function
 */
export async function compressImage(
  file: File,
  options: Partial<CompressionOptions> = {}
): Promise<CompressionResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Validate input
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  const originalSize = file.size;
  const originalFormat = file.type.split("/")[1];

  try {
    // Get image dimensions
    const { width: originalWidth, height: originalHeight } = await getImageDimensions(file);

    // Calculate new dimensions
    const { width, height, ratio } = calculateNewDimensions(
      originalWidth,
      originalHeight,
      opts.maxWidth!,
      opts.maxHeight!
    );

    const wasResized = ratio < 1;

    // Create canvas and draw image
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }

    // Load and draw the image
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Failed to load image"));
        image.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

    // High-quality drawing with better rendering
    ctx.drawImage(img, 0, 0, width, height);

    // Determine target format and compression settings
    const targetFormat = shouldConvertFormat(file, originalSize);
    const format = targetFormat || (file.type as "image/jpeg" | "image/webp");

    // Compress to target file size
    const { blob } = await compressToTargetSize(
      canvas,
      opts.targetFileSize!,
      opts.maxQuality!,
      opts.minQuality!,
      format
    );

    const compressedSize = blob.size;
    const compressedFormat = format.split("/")[1];

    // Create new File object
    const compressedFile = new File([blob], file.name, {
      type: format,
      lastModified: Date.now(),
    });

    return {
      file: compressedFile,
      originalSize,
      compressedSize,
      sizeSaved: originalSize - compressedSize,
      originalFormat,
      compressedFormat,
      wasResized,
    };
  } catch (error) {
    console.error("Image compression error:", error);
    // Return original file if compression fails
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      sizeSaved: 0,
      originalFormat,
      compressedFormat: originalFormat,
      wasResized: false,
    };
  }
}

/**
 * Compress multiple images
 */
export async function compressImages(
  files: File[],
  options: Partial<CompressionOptions> = {},
  onProgress?: (current: number, total: number) => void
): Promise<CompressionResult[]> {
  const results: CompressionResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const result = await compressImage(files[i], options);
    results.push(result);
    onProgress?.(i + 1, files.length);
  }

  return results;
}

/**
 * Format bytes to human-readable size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Calculate compression percentage
 */
export function getCompressionPercentage(original: number, compressed: number): number {
  if (original === 0) return 0;
  return Math.round(((original - compressed) / original) * 100);
}
