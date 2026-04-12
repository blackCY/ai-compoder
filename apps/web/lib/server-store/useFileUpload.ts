/**
 * useFileUpload Hook
 * Server-Store layer hook for file uploads with TanStack Query
 */

import { useState, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upload } from '../services/upload/uploadService';
import type { UploadOptions, UploadResponse } from '../services/upload/types';

export interface UseFileUploadResult {
  /** Upload a single file */
  uploadFile: (file: File, options?: UploadOptions) => Promise<UploadResponse>;
  /** Upload multiple files in parallel */
  uploadMultiple: (files: File[], options?: UploadOptions) => Promise<UploadResponse[]>;
  /** Cancel an ongoing upload */
  cancelUpload: (fileId: string) => void;
  /** Retry a failed upload */
  retryUpload: (fileId: string) => Promise<UploadResponse>;
  /** Array of upload query results */
  uploads: any[];
  /** Whether any upload is in progress */
  isUploading: boolean;
  /** Upload progress for each file (fileId -> progress) */
  progress: Record<string, number>;
}

// Store for tracking uploads and their abort controllers
const uploadRegistry = new Map<string, {
  file: File;
  options?: UploadOptions;
  abortController: AbortController;
}>();

/**
 * Generate a unique file ID for tracking uploads
 */
function generateFileId(file: File): string {
  return `${file.name}-${file.size}-${Date.now()}`;
}

export function useFileUpload(): UseFileUploadResult {
  const [progress, setProgress] = useState<Record<string, number>>({});
  const queryClient = useQueryClient();

  // Mutation for single file upload
  const uploadMutation = useMutation({
    mutationFn: async ({ file, options, fileId }: {
      file: File;
      options?: UploadOptions;
      fileId: string;
    }) => {
      // Create abort controller for this upload
      const abortController = new AbortController();

      // Store upload info for potential cancellation/retry
      uploadRegistry.set(fileId, {
        file,
        options,
        abortController,
      });

      // Create wrapped options with progress tracking
      const wrappedOptions: UploadOptions = {
        ...options,
        signal: abortController.signal,
        onProgress: (progressValue) => {
          setProgress((prev) => ({
            ...prev,
            [fileId]: progressValue,
          }));
          options?.onProgress?.(progressValue);
        },
      };

      try {
        const response = await upload(file, wrappedOptions);
        return response;
      } finally {
        // Clean up on completion/error
        uploadRegistry.delete(fileId);
      }
    },
    onSuccess: () => {
      // Invalidate related queries if needed
      queryClient.invalidateQueries({ queryKey: ['uploads'] });
    },
  });

  const uploadFile = useCallback(
    async (file: File, options?: UploadOptions): Promise<UploadResponse> => {
      const fileId = generateFileId(file);
      return uploadMutation.mutateAsync({ file, options, fileId });
    },
    [uploadMutation]
  );

  const uploadMultiple = useCallback(
    async (
      files: File[],
      options?: UploadOptions
    ): Promise<UploadResponse[]> => {
      const promises = files.map((file) => {
        const fileId = generateFileId(file);
        return uploadMutation.mutateAsync({ file, options, fileId });
      });
      return Promise.all(promises);
    },
    [uploadMutation]
  );

  const cancelUpload = useCallback((fileId: string): void => {
    const uploadInfo = uploadRegistry.get(fileId);
    if (uploadInfo?.abortController) {
      uploadInfo.abortController.abort();
      uploadRegistry.delete(fileId);
      setProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[fileId];
        return newProgress;
      });
    }
  }, []);

  const retryUpload = useCallback(
    async (fileId: string): Promise<UploadResponse> => {
      const uploadInfo = uploadRegistry.get(fileId);
      if (!uploadInfo) {
        throw new Error(`No upload found for file ID: ${fileId}`);
      }

      // Retry the upload with the same file and options
      return uploadFile(uploadInfo.file, uploadInfo.options);
    },
    [uploadFile]
  );

  return {
    uploadFile,
    uploadMultiple,
    cancelUpload,
    retryUpload,
    uploads: [],
    isUploading: uploadMutation.isPending,
    progress,
  };
}
