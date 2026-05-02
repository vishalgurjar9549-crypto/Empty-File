/**
 * Image Compression Web Worker
 *
 * This worker runs in a separate thread to avoid blocking the main UI thread
 * during image compression operations.
 *
 * Messages received:
 * - {type: 'compress', file: ArrayBuffer, name: string, mimeType: string, index: number, options?: Object}
 *
 * Messages sent:
 * - {type: 'progress', index: number, progress: number}
 * - {type: 'complete', index: number, result: CompressionResult}
 * - {type: 'error', index: number, error: string}
 */

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  targetFileSize?: number;
  maxQuality?: number;
  minQuality?: number;
}

interface CompressionResult {
  buffer: ArrayBuffer;
  mimeType: string;
  originalSize: number;
  compressedSize: number;
  sizeSaved: number;
  originalFormat: string;
  compressedFormat: string;
  wasResized: boolean;
}

interface CompressionMessage {
  type: "compress";
  file: ArrayBuffer;
  name: string;
  mimeType: string;
  index: number;
  options?: Partial<CompressionOptions>;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  targetFileSize: 300 * 1024, // 300KB
  maxQuality: 0.92,
  minQuality: 0.65,
};

/**
 * Get image dimensions from an ArrayBuffer
 */
async function getImageDimensions(
  arrayBuffer: ArrayBuffer
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([arrayBuffer]);
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
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
 * Determine if format conversion would be beneficial
 */
function shouldConvertFormat(
  mimeType: string,
  originalSize: number
): "image/jpeg" | "image/webp" | null {
  const isPNG = mimeType === "image/png";
  const isLarge = originalSize > 200 * 1024; // > 200KB

  // Convert large PNGs to JPEG for better compression
  if (isPNG && isLarge) {
    return "image/jpeg";
  }

  return null;
}

/**
 * Compress image to target file size with quality adjustment
 */
async function compressToTargetSize(
  canvas: OffscreenCanvas,
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
    blob = await canvas.convertToBlob({ type: format, quality });

    if (blob.size <= targetFileSize) {
      break;
    }
    quality -= step;
  }

  return { blob: blob!, quality };
}

/**
 * Main compression function
 */
async function compressImage(
  arrayBuffer: ArrayBuffer,
  fileName: string,
  mimeType: string,
  options: Partial<CompressionOptions> = {}
): Promise<CompressionResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const originalSize = arrayBuffer.byteLength;
  const originalFormat = mimeType.split("/")[1];

  try {
    // Get image dimensions
    const { width: originalWidth, height: originalHeight } =
      await getImageDimensions(arrayBuffer);

    // Calculate new dimensions
    const { width, height, ratio } = calculateNewDimensions(
      originalWidth,
      originalHeight,
      opts.maxWidth!,
      opts.maxHeight!
    );

    const wasResized = ratio < 1;

    // Create OffscreenCanvas for worker thread
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }

    // Load and draw the image
    const blob = new Blob([arrayBuffer], { type: mimeType });
    const bitmapUrl = URL.createObjectURL(blob);

    const imageBitmap = await createImageBitmap(
      new Image().src === bitmapUrl ? blob : bitmapUrl
    ).catch(async () => {
      // Fallback: create image bitmap from blob
      return createImageBitmap(blob);
    });

    ctx.drawImage(imageBitmap, 0, 0, width, height);
    imageBitmap.close();
    URL.revokeObjectURL(bitmapUrl);

    // Determine target format
    const targetFormat = shouldConvertFormat(mimeType, originalSize);
    const format = (targetFormat || mimeType) as
      | "image/jpeg"
      | "image/webp";

    // Compress to target file size
    const { blob: compressedBlob } = await compressToTargetSize(
      canvas,
      opts.targetFileSize!,
      opts.maxQuality!,
      opts.minQuality!,
      format
    );

    const compressedSize = compressedBlob.size;
    const compressedFormat = format.split("/")[1];

    // Convert blob to ArrayBuffer
    const compressedArrayBuffer = await compressedBlob.arrayBuffer();

    return {
      buffer: compressedArrayBuffer,
      mimeType: format,
      originalSize,
      compressedSize,
      sizeSaved: originalSize - compressedSize,
      originalFormat,
      compressedFormat,
      wasResized,
    };
  } catch (error) {
    console.error("Worker compression error:", error);
    throw error;
  }
}

/**
 * Message handler
 */
async function handleMessage(
  event: MessageEvent<CompressionMessage>
) {
  const { type, file, name, mimeType, index, options } = event.data;

  if (type !== "compress") {
    return;
  }

  try {
    // Send progress update
    postMessage({
      type: "progress",
      index,
      progress: 0,
    });

    const result = await compressImage(file, name, mimeType, options);

    // Send completion
    postMessage(
      {
        type: "complete",
        index,
        result: {
          buffer: result.buffer,
          mimeType: result.mimeType,
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
          sizeSaved: result.sizeSaved,
          originalFormat: result.originalFormat,
          compressedFormat: result.compressedFormat,
          wasResized: result.wasResized,
        },
      },
      [result.buffer]
    ); // Transfer buffer for efficiency
  } catch (error) {
    postMessage({
      type: "error",
      index,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// Attach message listener
self.addEventListener("message", handleMessage);

// Export for TypeScript
export {};
