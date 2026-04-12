import type { UploadResponse, UploadError } from 'lib/services/upload/types';

export interface FileUploaderProps {
  /** Accepted file MIME types (e.g., ['image/jpeg', 'image/png']) */
  accept?: string[];
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Maximum number of files allowed */
  maxFiles?: number;
  /** Allow multiple file selection */
  multiple?: boolean;
  /** Automatically upload files after selection */
  autoUpload?: boolean;
  /** Disable the uploader */
  disabled?: boolean;
  /** Callback when upload starts */
  onUploadStart?: (files: File[]) => void;
  /** Callback when upload progress updates */
  onUploadProgress?: (fileId: string, progress: number) => void;
  /** Callback when upload succeeds */
  onUploadSuccess?: (fileId: string, response: UploadResponse) => void;
  /** Callback when upload fails */
  onUploadError?: (fileId: string, error: UploadError) => void;
  /** Callback when file list changes */
  onFilesChange?: (files: FileState[]) => void;
  /** Show file preview thumbnails */
  showPreview?: boolean;
  /** Custom text for dropzone area */
  dropzoneText?: string;
  /** Additional CSS classes */
  className?: string;
}

export interface FileState {
  /** Unique identifier for the file */
  id: string;
  /** The File object */
  file: File;
  /** Preview URL for image files */
  preview?: string;
  /** Current upload status */
  status: 'idle' | 'uploading' | 'success' | 'error';
  /** Upload progress percentage (0-100) */
  progress: number;
  /** Server response after successful upload */
  response?: UploadResponse;
  /** Error details if upload failed */
  error?: UploadError;
}

export interface FilePreviewProps {
  /** File state to preview */
  file: FileState;
  /** Callback when remove button is clicked */
  onRemove?: (id: string) => void;
  /** Callback when retry button is clicked */
  onRetry?: (id: string) => void;
}
