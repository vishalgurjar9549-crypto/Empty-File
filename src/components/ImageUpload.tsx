import React, { useState, useRef } from "react";
import {
  ImagePlus,
  UploadCloud,
  Loader2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Images,
  Star,
} from "lucide-react";
import {
  uploadImageToCloudinary,
  resetCloudinarySignature,
} from "../api/cloudinary.api";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

interface UploadProgress {
  [key: string]: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 10,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const remainingSlots = maxImages - images.length;
  const isUploadDisabled = uploading || images.length >= maxImages;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setUploadProgress({});

    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      setError(`You can upload a maximum of ${maxImages} images.`);
      return;
    }

    const validFiles = files.filter(
      (file) =>
        file.type.startsWith("image/") && file.size <= 10 * 1024 * 1024
    );

    if (validFiles.length === 0) {
      setError("Only image files up to 10MB are allowed.");
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = validFiles.map(async (file, index) => {
        try {
          const fileId = `${file.name}-${file.size}-${index}-${Date.now()}`;

          const onProgress = (progress: number) => {
            setUploadProgress((prev) => ({
              ...prev,
              [fileId]: progress,
            }));
          };

          return await uploadImageToCloudinary(file, onProgress);
        } catch {
          return null;
        }
      });

      const uploads = (await Promise.all(uploadPromises)).filter(Boolean) as {
        url: string;
        publicId: string;
      }[];

      if (uploads.length === 0) {
        setError("Failed to upload images. Please try again.");
        return;
      }

      const uploadedUrls = uploads.map((u) => u.url);
      onImagesChange([...images, ...uploadedUrls]);
      setError(null);
      setUploadProgress({});
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
    onImagesChange(images.filter((_, i) => i !== index));
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

          {uploading ? (
            <>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Uploading your images…
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Please wait while we process your photos.
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
                or <span className="font-medium text-amber-600 dark:text-amber-400">browse files</span>
              </p>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                JPG, PNG, WEBP • up to 10MB each • {remainingSlots} slot
                {remainingSlots !== 1 ? "s" : ""} left
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
              <li>• Include bed, washroom, wardrobe, and balcony if available</li>
              <li>• Avoid blurry or dark images</li>
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

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Images className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <h5 className="text-sm font-semibold text-slate-900 dark:text-white">
              Uploaded Photos
            </h5>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((url, index) => {
              const isCover = index === 0;

              return (
                <div
                  key={`${url}-${index}`}
                  className={`group relative overflow-hidden rounded-2xl border bg-slate-100 shadow-sm transition dark:bg-slate-800 ${
                    isCover
                      ? "border-amber-400 ring-2 ring-amber-200 dark:border-amber-500 dark:ring-amber-500/20"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <div className="aspect-[4/4] overflow-hidden">
                    <img
                      src={url}
                      alt={
                        isCover
                          ? "Cover property image"
                          : `Property image ${index + 1}`
                      }
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  </div>

                  {/* Overlay */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3">
                    <div className="flex items-end justify-between">
                      {isCover ? (
                        <div className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-900">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          Cover
                        </div>
                      ) : (
                        <div className="rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white">
                          Image {index + 1}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    aria-label={`Remove image ${index + 1}`}
                    className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-red-600 shadow-md transition hover:scale-105 hover:bg-white focus:outline-none focus:ring-4 focus:ring-red-200 dark:bg-slate-900/90 dark:text-red-400 dark:hover:bg-slate-900 dark:focus:ring-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tip: The first uploaded image is used as the main cover photo.
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;