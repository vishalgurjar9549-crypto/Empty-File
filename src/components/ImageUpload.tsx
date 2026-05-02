import React, { useState, useRef, useEffect } from "react";
import {
  ImagePlus,
  UploadCloud,
  Loader2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Images,
  Zap,
  Wifi,
} from "lucide-react";
import {
  uploadImageToCloudinary,
  resetCloudinarySignature,
} from "../api/cloudinary.api";
import {
  compressImage,
  formatFileSize,
  getCompressionPercentage,
  type CompressionResult,
} from "../utils/imageCompression";
import { useImageCompressionWorker } from "../hooks/useImageCompressionWorker";
import { getCardUrl } from "../utils/cloudinaryOptimizer";

import { PropertyImageGallery } from "./PropertyImageGallery";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

interface UploadProgress {
  [key: string]: number;
}

interface CompressionProgress {
  [key: string]: CompressionResult | null;
}

/**
 * Stable image state model with deterministic rendering:
 * - previewUrl: Always present (blob URL for local, then kept)
 * - finalUrl: Set only after successful upload
 * - Rendering: Always use `finalUrl ?? previewUrl`
 * - Uses stable unique IDs instead of array indices
 */
interface ImageRecord {
  previewUrl: string; // Blob URL during upload, kept until finalUrl exists
  finalUrl?: string; // Cloudinary URL set after upload (optimized)
  status: "uploading" | "completed"; // Track upload progress
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 10,
}) => {
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [compressionProgress, setCompressionProgress] =
    useState<CompressionProgress>({});
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [useWorker, setUseWorker] = useState(false);
  const imageIdsRef = useRef<string[]>([]);
  /**
   * Stable unique IDs for images (mirrors images array structure)
   * imageIds[i] contains the unique ID for images[i]
   */
  const [imageIds, setImageIds] = useState<string[]>([]);

  /**
   * Stable image records keyed by unique ID (not array index)
   * Maps ID to ImageRecord containing previewUrl + finalUrl
   */
  const [imageRecords, setImageRecords] = useState<Map<string, ImageRecord>>(
    new Map(),
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  // Refs for touch drag state (avoids stale closure issues)
  const touchDragIndex = useRef<number | null>(null);
  const touchImages = useRef<string[]>([]);
  const blobUrlsRef = useRef<Set<string>>(new Set()); // Track blob URLs for cleanup

  // Web Worker for compression
  const {
    compress,
    resultToFile,
    workerReady,
    error: workerError,
  } = useImageCompressionWorker();

  // Fallback to main thread if worker fails
  useEffect(() => {
    if (workerError) {
      console.warn(
        "Worker unavailable, falling back to main thread:",
        workerError,
      );
      setUseWorker(false);
    }
  }, [workerError]);

  useEffect(() => {
    imageIdsRef.current = imageIds;
  }, [imageIds]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((blobUrl) => {
        URL.revokeObjectURL(blobUrl);
      });
      blobUrlsRef.current.clear();
    };
  }, []);

  // ─── Validate images ↔ imageIds sync (critical for rendering) ────────────────
  // This ensures thumbnails always have a valid ID to look up records
  useEffect(() => {
    if (images.length !== imageIds.length) {
      console.warn("Image sync mismatch detected", {
        imagesLength: images.length,
        idsLength: imageIds.length,
      });
    }
  }, [images, imageIds]);

  useEffect(() => {
    // Only run when images exist but internal state is empty
    if (images.length > 0 && imageIds.length === 0) {
      const ids = images.map(() => generateImageId());

      const records = new Map<string, ImageRecord>();

      ids.forEach((id, index) => {
        records.set(id, {
          previewUrl: images[index],
          finalUrl: images[index],
          status: "completed",
        });
      });
      console.log("HYDRATED IDS:", ids);
      console.log("HYDRATED RECORDS:", records);
      setImageIds(ids);
      setImageRecords(records);
    }
  }, [images]);

  const remainingSlots = maxImages - images.length;
  const isUploadDisabled =
    uploading || compressing || images.length >= maxImages;

  // ─── Helper Functions ──────────────────────────────────────────────────────

  /**
   * Generate a stable unique ID for a new image
   */
  const generateImageId = (): string => {
    return `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  /**
   * Get the URL to display for an image (finalUrl ?? previewUrl)
   * This ensures images always show, regardless of upload state
   */
  const getDisplayUrl = (imageIndex: number): string => {
    const imageId = imageIds[imageIndex];
    if (!imageId) return "";
    const record = imageRecords.get(imageId);
    if (!record) return "";
    // Deterministic: Use finalUrl if it exists, otherwise use previewUrl
    return record.finalUrl ?? record.previewUrl;
  };

  /**
   * Check if an image is still uploading (has no finalUrl yet)
   */
  const isImageUploading = (imageIndex: number): boolean => {
    const imageId = imageIds[imageIndex];
    if (!imageId) return false;
    const record = imageRecords.get(imageId);
    return record?.status === "uploading" || !record?.finalUrl;
  };

  /**
   * Validate if URL is a proper Cloudinary URL with required structure
   */
  const isValidCloudinaryUrl = (url: string): boolean => {
    if (!url) return false;
    // Must be HTTPS Cloudinary URL with /upload/ path
    return (
      url.startsWith("https://res.cloudinary.com") && url.includes("/upload/")
    );
  };

  /**
   * Safely apply optimization to Cloudinary URL
   * Returns the URL as-is if it's not a valid Cloudinary URL
   */
  const safeGetCardUrl = (url: string): string => {
    if (!url) return "";

    // If already optimized (has transformation params), return as-is
    if (url.includes(",w_") || url.includes("width=")) {
      return url;
    }

    // Only apply optimization to valid Cloudinary URLs
    if (isValidCloudinaryUrl(url)) {
      try {
        return getCardUrl(url);
      } catch (err) {
        console.warn("Failed to optimize URL, using as-is:", url, err);
        return url;
      }
    }

    // Not a Cloudinary URL, return as-is (might be blob URL for local preview)
    return url;
  };

  /**
   * Create a blob URL for local file preview and track it for cleanup
   */
  const createBlobUrl = (file: File): string => {
    const blobUrl = URL.createObjectURL(file);
    blobUrlsRef.current.add(blobUrl);
    return blobUrl;
  };

  /**
   * Revoke and remove a blob URL
   */
  const revokeBlobUrl = (blobUrl: string) => {
    if (blobUrlsRef.current.has(blobUrl)) {
      URL.revokeObjectURL(blobUrl);
      blobUrlsRef.current.delete(blobUrl);
    }
  };

  // ─── Drag Handlers ─────────────────────────────────────────────────────────
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnter = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;

    const updatedImages = [...images];
    const draggedItem = updatedImages[draggedIndex];
    updatedImages.splice(draggedIndex, 1);
    updatedImages.splice(index, 0, draggedItem);

    // Reorder imageIds to match
    const updatedIds = [...imageIds];
    const draggedId = updatedIds[draggedIndex];
    updatedIds.splice(draggedIndex, 1);
    updatedIds.splice(index, 0, draggedId);

    setDraggedIndex(index);
    setImageIds(updatedIds);
    onImagesChange(updatedImages);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // ─── Touch drag handlers (mobile) ───────────────────────────────────────────
  const handleTouchStart = (index: number) => {
    touchDragIndex.current = index;
    touchImages.current = [...images];
    setDraggedIndex(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Prevent page scroll while dragging an image card
    e.preventDefault();

    if (touchDragIndex.current === null) return;

    const touch = e.touches[0];

    // Temporarily hide the dragged element so elementFromPoint can find the target below it
    const draggedEl = e.currentTarget as HTMLElement;
    draggedEl.style.opacity = "0";
    const elementBelow = document.elementFromPoint(
      touch.clientX,
      touch.clientY,
    );
    draggedEl.style.opacity = "";

    if (!elementBelow) return;

    // Walk up the DOM to find a card that has a data-drag-index attribute
    const targetCard = elementBelow.closest(
      "[data-drag-index]",
    ) as HTMLElement | null;
    if (!targetCard) return;

    const targetIndex = parseInt(targetCard.dataset.dragIndex ?? "-1", 10);
    if (isNaN(targetIndex) || targetIndex === touchDragIndex.current) return;

    // Reorder
    const updated = [...touchImages.current];
    const draggedItem = updated[touchDragIndex.current];
    updated.splice(touchDragIndex.current, 1);
    updated.splice(targetIndex, 0, draggedItem);
    console.log(imageRecords);
    // Reorder imageIds to match
    const updatedIds = [...imageIds];
    const draggedId = updatedIds[touchDragIndex.current];
    updatedIds.splice(touchDragIndex.current, 1);
    updatedIds.splice(targetIndex, 0, draggedId);

    touchDragIndex.current = targetIndex;
    touchImages.current = updated;
    setDraggedIndex(targetIndex);
    setImageIds(updatedIds);
    onImagesChange(updated);
  };

  const handleTouchEnd = () => {
    touchDragIndex.current = null;
    touchImages.current = [];
    setDraggedIndex(null);
  };

  // ─── File upload with compression (Web Worker or Main Thread) ────────────────
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setUploadProgress({});
    setCompressionProgress({});

    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      setError(`You can upload a maximum of ${maxImages} images.`);
      return;
    }

    const validFiles = files.filter(
      (file) => file.type.startsWith("image/") && file.size <= 10 * 1024 * 1024,
    );

    if (validFiles.length === 0) {
      setError("Only image files up to 10MB are allowed.");
      return;
    }

    // ─── Phase 1: Create image records with blob previews ────────────────────
    // CRITICAL: Build IDs and records in exact order as images array
    const newIds = [...imageIds];
    const newRecords = new Map(imageRecords);
    const previewData: Array<{
      blobUrl: string;
      imageId: string;
      file: File;
    }> = [];

    // Generate stable IDs and create records BEFORE updating images array
    validFiles.forEach((file) => {
      const imageId = generateImageId();
      const blobUrl = createBlobUrl(file);

      // Create record for this image ID
      newRecords.set(imageId, {
        previewUrl: blobUrl,
        status: "uploading",
      });

      // Track ID and preview data (MUST match order)
      newIds.push(imageId);
      previewData.push({ blobUrl, imageId, file });
    });

    // Build new images array with preview URLs (ORDER MUST MATCH newIds)
    const newImages = [...images, ...previewData.map((pd) => pd.blobUrl)];

    // CRITICAL: Update all three in exact order to maintain sync
    // 1. Update records first (they're indexed by ID, not affected by array changes)
    setImageRecords(newRecords);
    // 2. Update IDs array (mirrors images array structure)
    setImageIds(newIds);
    // 3. Finally, notify parent about images (triggers re-render)
    // When parent re-renders with new images prop, IDs and records are already set
    onImagesChange(newImages);

    // ─── Phase 2: Compression Phase ────────────────────────────────────────────
    setCompressing(true);
    const compressedResults: {
      file: File;
      result: CompressionResult;
      imageId: string;
      previewUrl: string;
    }[] = [];

    try {
      // Try using Web Worker if available, fall back to main thread
      if (useWorker && workerReady) {
        for (let i = 0; i < validFiles.length; i++) {
          const file = validFiles[i];
          const fileId = `${file.name}-${file.size}-${i}-${Date.now()}`;
          const pd = previewData[i];

          try {
            const workerResult = await compress(file, {
              maxWidth: 1200,
              maxHeight: 1200,
              targetFileSize: 300 * 1024,
              maxQuality: 0.92,
              minQuality: 0.65,
            });

            const compressedFile = resultToFile(workerResult, file.name);
            const simulatedResult: CompressionResult = {
              file: compressedFile,
              originalSize: workerResult.originalSize,
              compressedSize: workerResult.compressedSize,
              sizeSaved: workerResult.sizeSaved,
              originalFormat: workerResult.originalFormat,
              compressedFormat: workerResult.compressedFormat,
              wasResized: workerResult.wasResized,
            };

            compressedResults.push({
              file: compressedFile,
              result: simulatedResult,
              imageId: pd.imageId,
              previewUrl: pd.blobUrl,
            });

            setCompressionProgress((prev) => ({
              ...prev,
              [fileId]: simulatedResult,
            }));
          } catch (err) {
            console.error(
              `Web Worker compression error for ${file.name}:`,
              err,
            );
            // Fallback to main thread compression
            try {
              const result = await compressImage(file);
              compressedResults.push({
                file: result.file,
                result,
                imageId: pd.imageId,
                previewUrl: pd.blobUrl,
              });
              setCompressionProgress((prev) => ({
                ...prev,
                [fileId]: result,
              }));
            } catch (fallbackErr) {
              console.error(
                `Main thread compression error for ${file.name}:`,
                fallbackErr,
              );
              // Use original file if both methods fail
              compressedResults.push({
                file,
                result: {
                  file,
                  originalSize: file.size,
                  compressedSize: file.size,
                  sizeSaved: 0,
                  originalFormat: file.type.split("/")[1],
                  compressedFormat: file.type.split("/")[1],
                  wasResized: false,
                },
                imageId: pd.imageId,
                previewUrl: pd.blobUrl,
              });
            }
          }
        }
      } else {
        // Fallback: use main thread compression
        for (let i = 0; i < validFiles.length; i++) {
          const file = validFiles[i];
          const fileId = `${file.name}-${file.size}-${i}-${Date.now()}`;
          const pd = previewData[i];

          try {
            const result = await compressImage(file);
            compressedResults.push({
              file: result.file,
              result,
              imageId: pd.imageId,
              previewUrl: pd.blobUrl,
            });

            setCompressionProgress((prev) => ({
              ...prev,
              [fileId]: result,
            }));
          } catch (err) {
            console.error(`Compression error for ${file.name}:`, err);
            compressedResults.push({
              file,
              result: {
                file,
                originalSize: file.size,
                compressedSize: file.size,
                sizeSaved: 0,
                originalFormat: file.type.split("/")[1],
                compressedFormat: file.type.split("/")[1],
                wasResized: false,
              },
              imageId: pd.imageId,
              previewUrl: pd.blobUrl,
            });
          }
        }
      }
    } finally {
      setCompressing(false);
    }

    // ─── Phase 3: Upload Phase ────────────────────────────────────────────────
    setUploading(true);

    try {
      const uploadPromises = compressedResults.map(
        async ({ file, imageId, previewUrl }) => {
          try {
            const fileId = `${file.name}-${file.size}-${imageId}-${Date.now()}`;

            const onProgress = (progress: number) => {
              setUploadProgress((prev) => ({
                ...prev,
                [fileId]: progress,
              }));
            };

            const uploadResult = await uploadImageToCloudinary(
              file,
              onProgress,
            );

            // Safely apply optimization only to valid Cloudinary URLs
            const optimizedUrl = uploadResult.url;

            return { ...uploadResult, url: optimizedUrl, imageId, previewUrl };
          } catch (err) {
            console.error("Upload error:", err);
            return null;
          }
        },
      );

      const uploads = (await Promise.all(uploadPromises)).filter(Boolean) as {
        url: string;
        publicId: string;
        imageId: string;
        previewUrl: string;
      }[];

      if (uploads.length === 0) {
        setError("Failed to upload images. Please try again.");
        // Keep blob previews visible even if upload fails
        return;
      }

      // ─── Phase 4: Update records with finalUrl ────────────────────────────
      // CRITICAL: Never revoke blob URLs until finalUrl is set
      setImageRecords((prev) => {
        const updated = new Map(prev);

        uploads.forEach(({ url, imageId }) => {
          const record = updated.get(imageId);
          if (record) {
            record.finalUrl = url;
            record.status = "completed";
          }
        });

        // ✅ SAFE + ORDERED
        const finalImages = [...imageIdsRef.current].map((id) => {
          const r = updated.get(id);
          return r?.finalUrl ?? r?.previewUrl ?? "";
        });

        // ✅ IMPORTANT: filter empty
        const cleanImages = finalImages.filter(Boolean);

        onImagesChange(cleanImages);
        console.log("FINAL IMAGES:", finalImages);
        console.log("IMAGE IDS:", imageIds);
        console.log("UPDATED RECORDS:", updated);
        return updated;
      });

      // Now that finalUrl is set, revoke the blob URLs
      // uploads.forEach(({ previewUrl }) => {
      //   revokeBlobUrl(previewUrl);
      // });

      setError(null);
      setUploadProgress({});
      setCompressionProgress({});
    } finally {
      resetCloudinarySignature();
      setUploading(false);
      setIsDragging(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    console.log("DELETE CLICKED", index);

    const imageId = imageIds[index];
    if (!imageId) return;

    const record = imageRecords.get(imageId);

    // cleanup blob
    if (record?.previewUrl?.startsWith("blob:")) {
      revokeBlobUrl(record.previewUrl);
    }

    // 🔥 IMPORTANT: create NEW references
    const updatedIds = [...imageIds];
    updatedIds.splice(index, 1);

    const updatedRecords = new Map(imageRecords);
    updatedRecords.delete(imageId);

    const updatedImages = updatedIds
      .map((id) => {
        const r = updatedRecords.get(id);
        return r?.finalUrl ?? r?.previewUrl ?? "";
      })
      .filter(Boolean);

    console.log("AFTER DELETE IDS:", updatedIds);
    console.log("AFTER DELETE IMAGES:", updatedImages);

    // 🔥 FORCE UPDATE ORDER
    setImageIds([...updatedIds]);
    setImageRecords(new Map(updatedRecords));
    onImagesChange([...updatedImages]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploadDisabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isUploadDisabled) return;

    const syntheticEvent = {
      target: {
        files: e.dataTransfer.files,
      },
    } as React.ChangeEvent<HTMLInputElement>;

    handleFileSelect(syntheticEvent);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            Property Photos
          </h4>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Upload at least 3 clear photos. The first image will be used as your
            cover photo.
          </p>
        </div>

        <div className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {images.length}/{maxImages}
        </div>
      </div>

      {/* Upload Dropzone */}
      <div
        role="button"
        tabIndex={isUploadDisabled ? -1 : 0}
        aria-disabled={isUploadDisabled}
        aria-label="Upload property images"
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !isUploadDisabled) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploadDisabled && fileInputRef.current?.click()}
        className={`group relative overflow-hidden rounded-2xl border-2 border-dashed p-6 text-center transition-all sm:p-8 ${
          isUploadDisabled
            ? "cursor-not-allowed border-slate-200 bg-slate-100/80 dark:border-slate-700 dark:bg-slate-800/70"
            : isDragging
            ? "scale-[1.01] border-amber-400 bg-amber-50/70 shadow-sm dark:border-amber-500 dark:bg-amber-500/10"
            : "cursor-pointer border-slate-300 bg-slate-50 hover:border-amber-400 hover:bg-amber-50/50 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-amber-500 dark:hover:bg-amber-500/5"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={isUploadDisabled}
          className="hidden"
        />

        <div className="mx-auto flex max-w-md flex-col items-center">
          <div
            className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition ${
              isUploadDisabled
                ? "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                : "bg-white text-amber-600 shadow-sm dark:bg-slate-900 dark:text-amber-400"
            }`}
          >
            {uploading ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : isDragging ? (
              <UploadCloud className="h-7 w-7" />
            ) : (
              <ImagePlus className="h-7 w-7" />
            )}
          </div>

          {uploading || compressing ? (
            <>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {compressing
                  ? "Optimizing your images…"
                  : "Uploading your images…"}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {compressing
                  ? "Compressing and resizing photos for faster uploads."
                  : "Please wait while we process your photos."}
              </p>
            </>
          ) : isUploadDisabled ? (
            <>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Maximum images reached
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Remove an image to upload more.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Drag & drop images here
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                or{" "}
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  browse files
                </span>
              </p>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                JPG, PNG, WEBP • up to 10MB each • {remainingSlots} slot
                {remainingSlots !== 1 ? "s" : ""} left
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                <Zap className="h-3.5 w-3.5" />
                Upload high-quality photos Our smart optimization automatically
                faster uploads while maintaining great visual quality.
                {useWorker && workerReady && (
                  <>
                    {" "}
                    <span className="text-emerald-500 dark:text-emerald-300">
                      •
                    </span>{" "}
                    <Wifi className="h-3 w-3" /> Multi-threaded processing
                  </>
                )}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Listing tips */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Better listings get more attention
            </p>
            <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
              <li>• Add a bright front/room overview photo first</li>
              <li>
                • Include bed, washroom, wardrobe, and balcony if available
              </li>
              <li>• Avoid blurry or dark images</li>
              <li>
                • Images are automatically optimized (resized & compressed) for
                faster uploads
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {/* Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/70">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-amber-600 dark:text-amber-400" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Upload Progress
            </p>
          </div>

          <div className="space-y-3">
            {Object.entries(uploadProgress).map(([id, progress], index) => (
              <div key={id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                  <span>Image {index + 1}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gallery Preview */}
      {images.length > 0 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Images className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <h5 className="text-sm font-semibold text-slate-900 dark:text-white">
                Property Gallery Preview
              </h5>
            </div>
          </div>

          {/* Gallery View */}
          <PropertyImageGallery images={images} title="Property Images" />

          {/* Reorder / Remove Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {imageIds.map((id, index) => {
              const isCover = index === 0;
              const imageUrl = images[index];
              // Get display URL using deterministic rule: finalUrl ?? previewUrl
              let displayUrl = getDisplayUrl(index);
              // FALLBACK: If ID lookup failed (sync issue), use URL directly as last resort
              if (!displayUrl && imageUrl) {
                displayUrl = imageUrl;
              }
              const uploading = isImageUploading(index);

              return (
                <div
                  key={imageIds[index]} // ── data attribute for touch hit-testing ──
                  data-drag-index={index}
                  // ── Mouse / HTML5 drag ──
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  // ── Touch drag (mobile) ──
                  onTouchStart={() => handleTouchStart(index)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className={`relative group rounded-xl overflow-hidden border transition-all cursor-grab active:cursor-grabbing touch-none
                    ${
                      isCover
                        ? "border-amber-400 ring-2 ring-amber-200 dark:ring-amber-500/20"
                        : "border-slate-200 dark:border-slate-700"
                    }
                    ${draggedIndex === index ? "opacity-50 scale-95" : ""}
                  `}
                >
                  {/* Loading overlay for uploading images */}
                  {uploading && (
                    <div className="absolute inset-0 bg-slate-100 dark:bg-slate-700 animate-pulse" />
                  )}

                  <img
                    src={displayUrl}
                    alt={`Image ${index + 1}`}
                    className="h-28 w-full object-cover pointer-events-none select-none"
                    draggable={false}
                    onError={(e) => {
                      console.warn(
                        `Failed to load image at index ${index}:`,
                        displayUrl,
                      );

                      const imageId = imageIds[index];
                      const record = imageId
                        ? imageRecords.get(imageId)
                        : undefined;

                      // ✅ ALWAYS fallback if preview exists
                      if (
                        record?.previewUrl &&
                        e.currentTarget.src !== record.previewUrl
                      ) {
                        e.currentTarget.src = record.previewUrl;
                      }
                    }}
                  />

                  {/* Upload status badge */}
                  {uploading && (
                    <div className="absolute top-2 right-2 bg-amber-500/90 dark:bg-amber-600/90 text-white rounded-full p-1.5 shadow">
                      <Loader2 className="h-3 w-3 animate-spin" />
                    </div>
                  )}

                  {/* Cover Badge - only show for completed uploads */}
                  {isCover && !uploading && (
                    <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-slate-900/90 text-xs font-semibold px-2 py-1 rounded-full shadow">
                      Cover
                    </div>
                  )}

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => {
                      console.log("DELETE CLICKED", index);
                      handleRemoveImage(index);
                    }}
                    className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 text-red-500 rounded-full p-2 shadow hover:scale-105 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tip: Drag to reorder — first image becomes the cover photo.
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
