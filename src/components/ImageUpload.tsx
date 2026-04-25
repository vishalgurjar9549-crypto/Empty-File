// import React, { useState, useRef } from "react";
// import {
//   ImagePlus,
//   UploadCloud,
//   Loader2,
//   Trash2,
//   CheckCircle2,
//   AlertCircle,
//   Images,
// } from "lucide-react";
// import {
//   uploadImageToCloudinary,
//   resetCloudinarySignature,
// } from "../api/cloudinary.api";

// import { PropertyImageGallery } from "./PropertyImageGallery";

// interface ImageUploadProps {
//   images: string[];
//   onImagesChange: (images: string[]) => void;
//   maxImages?: number;
// }

// interface UploadProgress {
//   [key: string]: number;
// }

// const ImageUpload: React.FC<ImageUploadProps> = ({
//   images,
//   onImagesChange,
//   maxImages = 10,
// }) => {
//   const [uploading, setUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
//   const [error, setError] = useState<string | null>(null);
//   const [isDragging, setIsDragging] = useState(false);
//   const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const remainingSlots = maxImages - images.length;
//   const isUploadDisabled = uploading || images.length >= maxImages;



//   const handleDragStart = (index: number) => {
//   setDraggedIndex(index);
// };

// const handleDragEnter = (index: number) => {
//   if (draggedIndex === null || draggedIndex === index) return;

//   const updatedImages = [...images];
//   const draggedItem = updatedImages[draggedIndex];

//   // remove dragged
//   updatedImages.splice(draggedIndex, 1);

//   // insert at new position
//   updatedImages.splice(index, 0, draggedItem);

//   setDraggedIndex(index);
//   onImagesChange(updatedImages);
// };

// const handleDragEnd = () => {
//   setDraggedIndex(null);
// };


//   const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     setError(null);
//     setUploadProgress({});

//     const files = Array.from(e.target.files || []);
//     if (files.length === 0) return;

//     if (images.length + files.length > maxImages) {
//       setError(`You can upload a maximum of ${maxImages} images.`);
//       return;
//     }

//     const validFiles = files.filter(
//       (file) =>
//         file.type.startsWith("image/") && file.size <= 10 * 1024 * 1024
//     );

//     if (validFiles.length === 0) {
//       setError("Only image files up to 10MB are allowed.");
//       return;
//     }

//     setUploading(true);

//     try {
//       const uploadPromises = validFiles.map(async (file, index) => {
//         try {
//           const fileId = `${file.name}-${file.size}-${index}-${Date.now()}`;

//           const onProgress = (progress: number) => {
//             setUploadProgress((prev) => ({
//               ...prev,
//               [fileId]: progress,
//             }));
//           };

//           return await uploadImageToCloudinary(file, onProgress);
//         } catch {
//           return null;
//         }
//       });

//       const uploads = (await Promise.all(uploadPromises)).filter(Boolean) as {
//         url: string;
//         publicId: string;
//       }[];

//       if (uploads.length === 0) {
//         setError("Failed to upload images. Please try again.");
//         return;
//       }

//       const uploadedUrls = uploads.map((u) => u.url);
//       onImagesChange([...images, ...uploadedUrls]);
//       setError(null);
//       setUploadProgress({});
//     } finally {
//       resetCloudinarySignature();
//       setUploading(false);
//       setIsDragging(false);

//       if (fileInputRef.current) {
//         fileInputRef.current.value = "";
//       }
//     }
//   };

//   const handleRemoveImage = (index: number) => {
//     onImagesChange(images.filter((_, i) => i !== index));
//   };

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (!isUploadDisabled) setIsDragging(true);
//   };

//   const handleDragLeave = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragging(false);
//   };

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragging(false);

//     if (isUploadDisabled) return;

//     const syntheticEvent = {
//       target: {
//         files: e.dataTransfer.files,
//       },
//     } as React.ChangeEvent<HTMLInputElement>;

//     handleFileSelect(syntheticEvent);
//   };

//   return (
//     <div className="space-y-5">
//       {/* Header */}
//       <div className="flex items-start justify-between gap-4">
//         <div>
//           <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
//             Property Photos
//           </h4>
//           <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
//             Upload at least 3 clear photos. The first image will be used as your
//             cover photo.
//           </p>
//         </div>

//         <div className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
//           {images.length}/{maxImages}
//         </div>
//       </div>

//       {/* Upload Dropzone */}
//       <div
//         role="button"
//         tabIndex={isUploadDisabled ? -1 : 0}
//         aria-disabled={isUploadDisabled}
//         aria-label="Upload property images"
//         onKeyDown={(e) => {
//           if ((e.key === "Enter" || e.key === " ") && !isUploadDisabled) {
//             e.preventDefault();
//             fileInputRef.current?.click();
//           }
//         }}
//         onDragOver={handleDragOver}
//         onDragLeave={handleDragLeave}
//         onDrop={handleDrop}
//         onClick={() => !isUploadDisabled && fileInputRef.current?.click()}
//         className={`group relative overflow-hidden rounded-2xl border-2 border-dashed p-6 text-center transition-all sm:p-8 ${
//           isUploadDisabled
//             ? "cursor-not-allowed border-slate-200 bg-slate-100/80 dark:border-slate-700 dark:bg-slate-800/70"
//             : isDragging
//             ? "scale-[1.01] border-amber-400 bg-amber-50/70 shadow-sm dark:border-amber-500 dark:bg-amber-500/10"
//             : "cursor-pointer border-slate-300 bg-slate-50 hover:border-amber-400 hover:bg-amber-50/50 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-amber-500 dark:hover:bg-amber-500/5"
//         }`}
//       >
//         <input
//           ref={fileInputRef}
//           type="file"
//           accept="image/*"
//           multiple
//           onChange={handleFileSelect}
//           disabled={isUploadDisabled}
//           className="hidden"
//         />

//         <div className="mx-auto flex max-w-md flex-col items-center">
//           <div
//             className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition ${
//               isUploadDisabled
//                 ? "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
//                 : "bg-white text-amber-600 shadow-sm dark:bg-slate-900 dark:text-amber-400"
//             }`}
//           >
//             {uploading ? (
//               <Loader2 className="h-7 w-7 animate-spin" />
//             ) : isDragging ? (
//               <UploadCloud className="h-7 w-7" />
//             ) : (
//               <ImagePlus className="h-7 w-7" />
//             )}
//           </div>

//           {uploading ? (
//             <>
//               <p className="text-sm font-semibold text-slate-900 dark:text-white">
//                 Uploading your images…
//               </p>
//               <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
//                 Please wait while we process your photos.
//               </p>
//             </>
//           ) : isUploadDisabled ? (
//             <>
//               <p className="text-sm font-semibold text-slate-900 dark:text-white">
//                 Maximum images reached
//               </p>
//               <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
//                 Remove an image to upload more.
//               </p>
//             </>
//           ) : (
//             <>
//               <p className="text-sm font-semibold text-slate-900 dark:text-white">
//                 Drag & drop images here
//               </p>
//               <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
//                 or <span className="font-medium text-amber-600 dark:text-amber-400">browse files</span>
//               </p>
//               <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
//                 JPG, PNG, WEBP • up to 10MB each • {remainingSlots} slot
//                 {remainingSlots !== 1 ? "s" : ""} left
//               </p>
//             </>
//           )}
//         </div>
//       </div>

//       {/* Listing tips */}
//       <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
//         <div className="flex items-start gap-3">
//           <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
//           <div>
//             <p className="text-sm font-semibold text-slate-900 dark:text-white">
//               Better listings get more attention
//             </p>
//             <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
//               <li>• Add a bright front/room overview photo first</li>
//               <li>• Include bed, washroom, wardrobe, and balcony if available</li>
//               <li>• Avoid blurry or dark images</li>
//             </ul>
//           </div>
//         </div>
//       </div>

//       {/* Error */}
//       {error && (
//         <div
//           role="alert"
//           className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300"
//         >
//           <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
//           <span>{error}</span>
//         </div>
//       )}

//       {/* Progress */}
//       {Object.keys(uploadProgress).length > 0 && (
//         <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/70">
//           <div className="flex items-center gap-2">
//             <Loader2 className="h-4 w-4 animate-spin text-amber-600 dark:text-amber-400" />
//             <p className="text-sm font-semibold text-slate-900 dark:text-white">
//               Upload Progress
//             </p>
//           </div>

//           <div className="space-y-3">
//             {Object.entries(uploadProgress).map(([id, progress], index) => (
//               <div key={id} className="space-y-1.5">
//                 <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
//                   <span>Image {index + 1}</span>
//                   <span>{progress}%</span>
//                 </div>
//                 <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
//                   <div
//                     className="h-full rounded-full bg-amber-500 transition-all"
//                     style={{ width: `${progress}%` }}
//                   />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Preview Grid */}
//      {/* Gallery Preview (Upgraded UX) */}
// {images.length > 0 && (
//   <div className="space-y-5">
//     <div className="flex items-center justify-between">
//       <div className="flex items-center gap-2">
//         <Images className="h-4 w-4 text-slate-500 dark:text-slate-400" />
//         <h5 className="text-sm font-semibold text-slate-900 dark:text-white">
//           Property Gallery Preview
//         </h5>
//       </div>
//     </div>

//     {/* Gallery View */}
//     <PropertyImageGallery
//       images={images}
//       title="Property Images"
//     />

//     {/* Remove Images (Better UX control) */}
//    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
//   {images.map((url, index) => {
//     const isCover = index === 0;

//     return (
//       <div
//         key={`${url}-${index}`}
//         draggable
//         onDragStart={() => handleDragStart(index)}
//         onDragEnter={() => handleDragEnter(index)}
//         onDragEnd={handleDragEnd}
//         className={`relative group rounded-xl overflow-hidden border transition-all
//           ${isCover 
//             ? "border-amber-400 ring-2 ring-amber-200 dark:ring-amber-500/20" 
//             : "border-slate-200 dark:border-slate-700"}
//           ${draggedIndex === index ? "opacity-50 scale-95" : ""}
//         `}
//       >
//         <img
//           src={url}
//           alt={`Uploaded ${index + 1}`}
//           className="h-28 w-full object-cover"
//         />

//         {/* Cover Badge */}
//         {isCover && (
//           <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-slate-900/90 text-xs font-semibold px-2 py-1 rounded-full shadow">
//             Cover
//           </div>
//         )}

//         {/* Remove */}
//         <button
//           type="button"
//           onClick={() => handleRemoveImage(index)}
//           className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 text-red-500 rounded-full p-2 shadow hover:scale-105 transition"
//         >
//           <Trash2 className="h-4 w-4" />
//         </button>
//       </div>
//     );
//   })}
// </div>

//     <p className="text-xs text-slate-500 dark:text-slate-400">
//       Tip: First image will be used as cover photo.
//     </p>
//   </div>
// )}
//     </div>
//   );
// };

// export default ImageUpload;



import React, { useState, useRef } from "react";
import {
  ImagePlus,
  UploadCloud,
  Loader2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Images,
} from "lucide-react";
import {
  uploadImageToCloudinary,
  resetCloudinarySignature,
} from "../api/cloudinary.api";

import { PropertyImageGallery } from "./PropertyImageGallery";

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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  // Refs for touch drag state (avoids stale closure issues)
  const touchDragIndex = useRef<number | null>(null);
  const touchImages = useRef<string[]>([]);

  const remainingSlots = maxImages - images.length;
  const isUploadDisabled = uploading || images.length >= maxImages;

  // ─── Mouse / HTML5 drag handlers ────────────────────────────────────────────
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnter = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;

    const updatedImages = [...images];
    const draggedItem = updatedImages[draggedIndex];
    updatedImages.splice(draggedIndex, 1);
    updatedImages.splice(index, 0, draggedItem);

    setDraggedIndex(index);
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
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    draggedEl.style.opacity = "";

    if (!elementBelow) return;

    // Walk up the DOM to find a card that has a data-drag-index attribute
    const targetCard = elementBelow.closest("[data-drag-index]") as HTMLElement | null;
    if (!targetCard) return;

    const targetIndex = parseInt(targetCard.dataset.dragIndex ?? "-1", 10);
    if (
      isNaN(targetIndex) ||
      targetIndex === touchDragIndex.current
    ) return;

    // Reorder
    const updated = [...touchImages.current];
    const draggedItem = updated[touchDragIndex.current];
    updated.splice(touchDragIndex.current, 1);
    updated.splice(targetIndex, 0, draggedItem);

    touchDragIndex.current = targetIndex;
    touchImages.current = updated;
    setDraggedIndex(targetIndex);
    onImagesChange(updated);
  };

  const handleTouchEnd = () => {
    touchDragIndex.current = null;
    touchImages.current = [];
    setDraggedIndex(null);
  };

  // ─── File upload ─────────────────────────────────────────────────────────────
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
                or{" "}
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  browse files
                </span>
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
            {images.map((url, index) => {
              const isCover = index === 0;

              return (
                <div
                  key={`${url}-${index}`}
                  // ── data attribute for touch hit-testing ──
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
                  <img
                    src={url}
                    alt={`Uploaded ${index + 1}`}
                    className="h-28 w-full object-cover pointer-events-none select-none"
                    draggable={false}
                  />

                  {/* Cover Badge */}
                  {isCover && (
                    <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-slate-900/90 text-xs font-semibold px-2 py-1 rounded-full shadow">
                      Cover
                    </div>
                  )}

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
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