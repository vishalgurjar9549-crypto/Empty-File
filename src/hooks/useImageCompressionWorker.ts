/**
 * Hook for managing image compression via Web Worker
 *
 * Provides a simple interface for compressing images without blocking the UI
 */

import { useEffect, useRef, useCallback, useState } from "react";
import type { CompressionResult } from "../utils/imageCompression";

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  targetFileSize?: number;
  maxQuality?: number;
  minQuality?: number;
}

interface WorkerCompressionResult {
  buffer: ArrayBuffer;
  mimeType: string;
  originalSize: number;
  compressedSize: number;
  sizeSaved: number;
  originalFormat: string;
  compressedFormat: string;
  wasResized: boolean;
}

type CompressionCallback = (
  result: WorkerCompressionResult
) => void;
type ErrorCallback = (error: string) => void;
type ProgressCallback = (progress: number) => void;

interface PendingTask {
  id: string;
  onComplete?: CompressionCallback;
  onError?: ErrorCallback;
  onProgress?: ProgressCallback;
}

/**
 * Hook for Web Worker-based image compression
 *
 * Usage:
 * ```tsx
 * const { compress } = useImageCompressionWorker();
 *
 * const handleCompress = async (file: File) => {
 *   const result = await compress(
 *     file,
 *     { maxWidth: 1200 },
 *     (progress) => console.log(`Progress: ${progress}%`)
 *   );
 *   console.log(`Saved: ${result.sizeSaved} bytes`);
 * };
 * ```
 */
export function useImageCompressionWorker() {
  const workerRef = useRef<Worker | null>(null);
  const tasksRef = useRef<Map<string, PendingTask>>(new Map());
  const [workerReady, setWorkerReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Web Worker
  useEffect(() => {
    try {
      // Dynamically import worker
      const worker = new Worker(
        new URL("../workers/compression.worker.ts", import.meta.url),
        { type: "module" }
      );

      worker.onmessage = (event: MessageEvent) => {
        const { type, index, result, error: workerError, progress } = event.data;

        // Get pending task
        const task = tasksRef.current.get(String(index));
        if (!task) return;

        switch (type) {
          case "progress":
            task.onProgress?.(progress);
            break;

          case "complete":
            // Convert ArrayBuffer back to File
            if (result && task.onComplete) {
              task.onComplete(result);
            }
            tasksRef.current.delete(String(index));
            break;

          case "error":
            if (task.onError) {
              task.onError(workerError || "Unknown error");
            }
            tasksRef.current.delete(String(index));
            break;
        }
      };

      worker.onerror = (err) => {
        console.error("Worker error:", err);
        setError(err.message);
      };

      workerRef.current = worker;
      setWorkerReady(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to initialize worker";
      console.error("Worker initialization error:", message);
      setError(message);
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  /**
   * Compress a single image file
   */
  const compress = useCallback(
    (
      file: File,
      options?: Partial<CompressionOptions>,
      onProgress?: ProgressCallback,
      onError?: ErrorCallback
    ): Promise<WorkerCompressionResult> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current || !workerReady) {
          const err = "Worker not initialized";
          setError(err);
          reject(new Error(err));
          return;
        }

        const taskId = `${file.name}-${Date.now()}-${Math.random()}`;

        // Register task
        tasksRef.current.set(taskId, {
          id: taskId,
          onComplete: resolve,
          onError: (err) => {
            onError?.(err);
            reject(new Error(err));
          },
          onProgress,
        });

        // Read file as ArrayBuffer
        const reader = new FileReader();
        reader.onload = (event) => {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          if (!arrayBuffer) {
            reject(new Error("Failed to read file"));
            return;
          }

          // Send to worker
          try {
            workerRef.current!.postMessage(
              {
                type: "compress",
                file: arrayBuffer,
                name: file.name,
                mimeType: file.type,
                index: taskId,
                options,
              },
              [arrayBuffer] // Transfer for efficiency
            );
          } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to send to worker";
            reject(new Error(message));
            tasksRef.current.delete(taskId);
          }
        };

        reader.onerror = () => {
          reject(new Error("Failed to read file"));
          tasksRef.current.delete(taskId);
        };

        reader.readAsArrayBuffer(file);
      });
    },
    [workerReady]
  );

  /**
   * Compress multiple files
   */
  const compressMultiple = useCallback(
    async (
      files: File[],
      options?: Partial<CompressionOptions>,
      onProgress?: (current: number, total: number) => void
    ): Promise<(WorkerCompressionResult | null)[]> => {
      const results: (WorkerCompressionResult | null)[] = [];

      for (let i = 0; i < files.length; i++) {
        try {
          const result = await compress(files[i], options);
          results.push(result);
        } catch (err) {
          console.error(`Failed to compress file ${i}:`, err);
          results.push(null);
        }
        onProgress?.(i + 1, files.length);
      }

      return results;
    },
    [compress]
  );

  /**
   * Convert compressed result back to File
   */
  const resultToFile = useCallback(
    (result: WorkerCompressionResult, originalName: string): File => {
      const blob = new Blob([result.buffer], { type: result.mimeType });
      const ext = result.compressedFormat;
      const baseName = originalName.replace(/\.[^.]+$/, "");
      return new File([blob], `${baseName}.${ext}`, {
        type: result.mimeType,
        lastModified: Date.now(),
      });
    },
    []
  );

  return {
    compress,
    compressMultiple,
    resultToFile,
    workerReady,
    error,
  };
}

export type { WorkerCompressionResult };
