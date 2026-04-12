'use client';

import { useState, useCallback, useEffect } from 'react';
import { cn } from '../../../utils';
import { DropZone } from './components/DropZone';
import { FileList } from './components/FileList';
import type { FileUploaderProps, FileState } from './types';
import { useFileUpload } from '../../../server-store/useFileUpload';
import { generateFileId, getFilePreview } from './utils';
import type { UploadErrorCode } from 'lib/services/upload/types';

/**
 * FileUploader - Main orchestrating component for file upload functionality
 * Combines DropZone, FileList, and useFileUpload hook
 */
export const FileUploader: React.FC<FileUploaderProps> = ({
  accept = [],
  maxSize,
  maxFiles = Number.MAX_SAFE_INTEGER,
  multiple = true,
  autoUpload = false,
  disabled = false,
  onUploadStart,
  onUploadProgress,
  onUploadSuccess,
  onUploadError,
  onFilesChange,
  showPreview = true,
  dropzoneText,
  className,
}) => {
  const [files, setFiles] = useState<FileState[]>([]);
  const { uploadFile, uploadMultiple, cancelUpload, retryUpload, progress } = useFileUpload();

  // Validate a single file
  const validateFile = useCallback(
    (file: File): { valid: boolean; error?: { code: UploadErrorCode; message: string } } => {
      // Check file type
      if (accept.length > 0) {
        const acceptSet = new Set(accept);
        if (!acceptSet.has(file.type)) {
          return { valid: false, error: { code: 'INVALID_FILE_TYPE', message: `File type ${file.type} is not accepted` } };
        }
      }

      // Check file size
      if (maxSize && file.size > maxSize) {
        return { valid: false, error: { code: 'FILE_TOO_LARGE', message: `File size exceeds ${maxSize} bytes` } };
      }

      return { valid: true };
    },
    [accept, maxSize]
  );

  // Add files to state
  const addFiles = useCallback(
    (newFiles: File[]) => {
      setFiles((prevFiles) => {
        const existingCount = prevFiles.length;
        const remainingSlots = maxFiles - existingCount;

        if (remainingSlots <= 0) {
          return prevFiles;
        }

        const filesToAdd = multiple ? newFiles : newFiles.slice(0, 1);
        const limitedFiles = filesToAdd.slice(0, remainingSlots);

        const validatedFiles: FileState[] = [];

        for (const file of limitedFiles) {
          const validation = validateFile(file);
          if (!validation.valid) {
            // Call error callback for invalid file
            const fileId = generateFileId(file);
            const errorCode: UploadErrorCode = validation.error?.code || 'UPLOAD_FAILED';
            const errorMessage = validation.error?.message || (typeof validation.error === 'string' ? validation.error : 'Invalid file');
            onUploadError?.(fileId, { code: errorCode, message: errorMessage });
            continue;
          }

          const fileId = generateFileId(file);
          const fileState: FileState = {
            id: fileId,
            file,
            preview: showPreview ? getFilePreview(file) : undefined,
            status: 'idle',
            progress: 0,
          };

          validatedFiles.push(fileState);
        }

        const updatedFiles = [...prevFiles, ...validatedFiles];
        onFilesChange?.(updatedFiles);
        return updatedFiles;
      });
    },
    [multiple, maxFiles, validateFile, showPreview, onFilesChange, onUploadError]
  );

  // Handle file drop from DropZone
  const handleDrop = useCallback(
    (droppedFiles: File[]) => {
      addFiles(droppedFiles);
    },
    [addFiles]
  );

  // Handle file removal
  const handleRemove = useCallback(
    (fileId: string) => {
      setFiles((prevFiles) => {
        const fileToRemove = prevFiles.find((f) => f.id === fileId);
        if (fileToRemove?.status === 'uploading') {
          cancelUpload(fileId);
        }

        const updatedFiles = prevFiles.filter((f) => f.id !== fileId);
        onFilesChange?.(updatedFiles);
        return updatedFiles;
      });
    },
    [cancelUpload, onFilesChange]
  );

  // Handle retry upload
  const handleRetry = useCallback(
    async (fileId: string) => {
      const fileState = files.find((f) => f.id === fileId);
      if (!fileState) return;

      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.id === fileId ? { ...f, status: 'uploading' as const, error: undefined } : f
        )
      );

      try {
        const response = await uploadFile(fileState.file);
        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.id === fileId ? { ...f, status: 'success' as const, response } : f
          )
        );
        onUploadSuccess?.(fileId, response);
      } catch (error) {
        const uploadError = error as { code?: UploadErrorCode; message?: string };
        const errorCode: UploadErrorCode = uploadError.code || 'UPLOAD_FAILED';
        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.id === fileId
              ? { ...f, status: 'error' as const, error: { code: errorCode, message: uploadError.message || 'Upload failed' } }
              : f
          )
        );
        onUploadError?.(fileId, { code: errorCode, message: uploadError.message || 'Upload failed' });
      }
    },
    [files, uploadFile, onUploadSuccess, onUploadError]
  );

  // Auto-upload when autoUpload is true and files are added
  useEffect(() => {
    if (!autoUpload) return;

    const idleFiles = files.filter((f) => f.status === 'idle');
    if (idleFiles.length === 0) return;

    const uploadFiles = async () => {
      const filesToUpload = idleFiles.map((f) => f.file);
      onUploadStart?.(filesToUpload);

      // Mark as uploading
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          idleFiles.some((idle) => idle.id === f.id)
            ? { ...f, status: 'uploading' as const }
            : f
        )
      );

      try {
        const responses = await uploadMultiple(filesToUpload);

        setFiles((prevFiles) =>
          prevFiles.map((f) => {
            if (idleFiles.some((idle) => idle.id === f.id)) {
              const index = idleFiles.findIndex((idle) => idle.id === f.id);
              return { ...f, status: 'success' as const, response: responses[index] };
            }
            return f;
          })
        );

        idleFiles.forEach((f, index) => {
          onUploadSuccess?.(f.id, responses[index]);
        });
      } catch (error) {
        const uploadError = error as { code?: UploadErrorCode; message?: string };
        const errorCode: UploadErrorCode = uploadError.code || 'UPLOAD_FAILED';

        setFiles((prevFiles) =>
          prevFiles.map((f) => {
            if (idleFiles.some((idle) => idle.id === f.id)) {
              return {
                ...f,
                status: 'error' as const,
                error: { code: errorCode, message: uploadError.message || 'Upload failed' },
              };
            }
            return f;
          })
        );

        idleFiles.forEach((f) => {
          onUploadError?.(f.id, { code: errorCode, message: uploadError.message || 'Upload failed' });
        });
      }
    };

    uploadFiles();
  }, [autoUpload, files, uploadMultiple, onUploadStart, onUploadSuccess, onUploadError]);

  // Update progress from useFileUpload hook
  useEffect(() => {
    if (Object.keys(progress).length === 0) return;

    setFiles((prevFiles) => {
      let hasChanges = false;
      const updatedFiles = prevFiles.map((f) => {
        const fileProgress = progress[f.id];
        if (fileProgress !== undefined && fileProgress !== f.progress) {
          hasChanges = true;
          onUploadProgress?.(f.id, fileProgress);
          return { ...f, progress: fileProgress };
        }
        return f;
      });

      return hasChanges ? updatedFiles : prevFiles;
    });
  }, [progress, onUploadProgress]);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <DropZone
        onDrop={handleDrop}
        accept={accept}
        disabled={disabled}
        className="w-full"
      />

      <FileList
        files={files}
        onRemove={handleRemove}
        onRetry={handleRetry}
      />
    </div>
  );
};

export type { FileUploaderProps, FileState } from './types';