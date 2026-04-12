export interface UploadOptions {
  /** Callback for upload progress updates (0-100) */
  onProgress?: (progress: number) => void;
  /** AbortSignal to cancel the upload */
  signal?: AbortSignal;
}

export interface ValidationResult {
  /** Whether the file passes validation */
  valid: boolean;
  /** Error details if validation fails */
  error?: UploadError;
}

export interface UploadConstraints {
  /** Accepted file MIME types */
  accept?: string[];
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Maximum number of files allowed */
  maxFiles?: number;
}

export interface UploadResponse {
  /** URL to access the uploaded file */
  url: string;
  /** Stored filename (may differ from original) */
  filename: string;
  /** Original filename provided by user */
  originalName: string;
  /** File size in bytes */
  size: number;
  /** MIME content type */
  contentType: string;
  /** ISO timestamp of upload */
  uploadedAt: string;
}

export interface UploadError {
  /** Error code indicating the type of failure */
  code: UploadErrorCode;
  /** Human-readable error message */
  message: string;
}

export type UploadErrorCode =
  | 'FILE_TOO_LARGE'
  | 'INVALID_FILE_TYPE'
  | 'TOO_MANY_FILES'
  | 'EMPTY_FILE'
  | 'UPLOAD_FAILED'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'UPLOAD_CANCELLED';
