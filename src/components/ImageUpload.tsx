import React, { useState, useRef, Component } from 'react';
import { uploadImageToCloudinary, resetCloudinarySignature } from '../api/cloudinary.api';
/**
 * ImageUpload Component
 *
 * Correct & stable Cloudinary upload flow:
 * - Uploads multiple images in parallel
 * - Tracks progress per file
 * - Shows error ONLY if all uploads fail
 * - Never shows false error on success
 */
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
  maxImages = 10
}) => {
  console.log('ImageUpload');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setUploadProgress({});
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }
    const validFiles = files.filter((file) => file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024);
    if (validFiles.length === 0) {
      setError('Invalid file type or size');
      return;
    }
    setUploading(true);
    try {
      const uploadPromises = validFiles.map(async (file) => {
        try {
          const fileId = `${file.name}-${Date.now()}`;
          const onProgress = (progress: number) => {
            setUploadProgress((prev) => ({
              ...prev,
              [fileId]: progress
            }));
          };
          return await uploadImageToCloudinary(file, onProgress);
        } catch {
          return null; // never throw
        }
      });
      const uploads = (await Promise.all(uploadPromises)).filter(Boolean) as {
        url: string;
        publicId: string;
      }[];
      // ❗ FAIL ONLY IF NOTHING SUCCEEDED
      if (uploads.length === 0) {
        setError('Failed to upload images. Please try again.');
        return;
      }
      const uploadedUrls = uploads.map((u) => u.url);
      onImagesChange([...images, ...uploadedUrls]);
      setError(null);
      setUploadProgress({});
    } finally {
      resetCloudinarySignature();
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  const handleRemoveImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const syntheticEvent = {
      target: {
        files: e.dataTransfer.files
      }
    } as React.ChangeEvent<HTMLInputElement>;
    handleFileSelect(syntheticEvent);
  };
  const isUploadDisabled = uploading || images.length >= maxImages;
  return <div className="space-y-4">
      {/* Upload Area */}
      <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isUploadDisabled ? 'border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 cursor-not-allowed' : 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 hover:border-blue-400 dark:hover:border-blue-600 cursor-pointer'}`} onDragOver={handleDragOver} onDrop={handleDrop} onClick={() => !isUploadDisabled && fileInputRef.current?.click()}>

        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} disabled={isUploadDisabled} className="hidden" />

        {uploading ? <p className="text-sm text-gray-600 dark:text-slate-300">
            Uploading images…
          </p> : <>
            <p className="text-sm text-gray-600 dark:text-slate-300">
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                Click to upload
              </span>{' '}
              or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              PNG, JPG, GIF up to 10MB ({images.length}/{maxImages})
            </p>
          </>}
      </div>

      {/* Error */}
      {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          {error}
        </div>}

      {/* Progress */}
      {Object.keys(uploadProgress).length > 0 && <div className="space-y-2">
          {Object.entries(uploadProgress).map(([id, progress]) => <div key={id}>
              <div className="flex justify-between text-sm dark:text-slate-300">
                <span>Uploading…</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 h-2 rounded">
                <div className="bg-blue-600 h-2 rounded" style={{
            width: `${progress}%`
          }} />

              </div>
            </div>)}
        </div>}

      {/* Preview */}
      {images.length > 0 && <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((url, index) => <div key={index} className="relative aspect-square overflow-hidden border dark:border-slate-700 rounded">

              <img src={url} alt={`Property ${index + 1}`} className="w-full h-full object-cover" />

              <button onClick={() => handleRemoveImage(index)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">

                ✕
              </button>
            </div>)}
        </div>}
    </div>;
};
export default ImageUpload;