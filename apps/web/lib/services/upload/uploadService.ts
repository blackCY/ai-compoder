/**
 * Upload Service
 * API service layer for file uploads
 * Provides pure functions for uploading files with progress tracking
 */

import type {
  UploadOptions,
  UploadConstraints,
  ValidationResult,
  UploadResponse,
  UploadError,
  UploadErrorCode,
} from './types';

/**
 * Uploads a single file to the server
 * @param file - The file to upload
 * @param options - Upload options including progress callback and abort signal
 * @returns Promise resolving to UploadResponse on success
 * @throws UploadError on failure
 */
export function upload(
  file: File,
  options?: UploadOptions
): Promise<UploadResponse> {
  return new Promise<UploadResponse>((resolve, reject) => {
    // Create FormData
    const formData = new FormData();
    formData.append('file', file);

    // Create XMLHttpRequest
    const xhr = new XMLHttpRequest();

    // Set up progress tracking
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && options?.onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        options.onProgress(progress);
      }
    });

    // Set up abort handler
    if (options?.signal) {
      options.signal.addEventListener('abort', () => {
        xhr.abort();
        const error: UploadError = {
          code: 'UPLOAD_CANCELLED',
          message: '上传已取消',
        };
        reject(error);
      });
    }

    // Set up load handler
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.success && response.data) {
            resolve(response.data as UploadResponse);
          } else {
            const error: UploadError = response.error || {
              code: 'UPLOAD_FAILED',
              message: '上传失败',
            };
            reject(error);
          }
        } catch (error) {
          const uploadError: UploadError = {
            code: 'SERVER_ERROR',
            message: '服务器错误，请稍后重试',
          };
          reject(uploadError);
        }
      } else {
        // Handle error responses
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.error) {
            reject(response.error as UploadError);
          } else {
            const error: UploadError = {
              code: getErrorCodeFromStatus(xhr.status),
              message: getStatusMessage(xhr.status),
            };
            reject(error);
          }
        } catch {
          const error: UploadError = {
            code: getErrorCodeFromStatus(xhr.status),
            message: getStatusMessage(xhr.status),
          };
          reject(error);
        }
      }
    });

    // Set up error handler
    xhr.addEventListener('error', () => {
      const error: UploadError = {
        code: 'NETWORK_ERROR',
        message: '网络错误，请检查网络连接',
      };
      reject(error);
    });

    // Set up abort handler (when xhr.abort() is called)
    xhr.addEventListener('abort', () => {
      const error: UploadError = {
        code: 'UPLOAD_CANCELLED',
        message: '上传已取消',
      };
      reject(error);
    });

    // Open and send request
    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  });
}

/**
 * Uploads multiple files in parallel
 * @param files - Array of files to upload
 * @param options - Upload options applied to all uploads
 * @returns Promise resolving to array of successful UploadResponses
 */
export async function uploadMultiple(
  files: File[],
  options?: UploadOptions
): Promise<UploadResponse[]> {
  // Upload all files in parallel using Promise.allSettled
  const results = await Promise.allSettled(
    files.map((file) => upload(file, options))
  );

  // Filter out successful uploads and return their responses
  const responses: UploadResponse[] = [];
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      responses.push(result.value);
    }
    // Silently ignore failures - caller can track progress via onProgress
  });

  return responses;
}

/**
 * Validates a file against upload constraints
 * @param file - The file to validate
 * @param constraints - Validation constraints
 * @returns Validation result with error details if invalid
 */
export function validateFile(
  file: File,
  constraints: UploadConstraints
): ValidationResult {
  // Check if file is empty (size === 0)
  if (file.size === 0) {
    return {
      valid: false,
      error: {
        code: 'EMPTY_FILE',
        message: '不能上传空文件',
      },
    };
  }

  // Check file size if maxSize constraint is provided
  if (constraints.maxSize !== undefined && file.size > constraints.maxSize) {
    return {
      valid: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: '文件大小超过限制',
      },
    };
  }

  // Check file type if accept constraint is provided
  if (constraints.accept && constraints.accept.length > 0) {
    if (!constraints.accept.includes(file.type)) {
      return {
        valid: false,
        error: {
          code: 'INVALID_FILE_TYPE',
          message: '不支持的文件类型',
        },
      };
    }
  }

  // All validations passed
  return {
    valid: true,
  };
}

/**
 * Maps HTTP status code to UploadErrorCode
 * @param status - HTTP status code
 * @returns Corresponding UploadErrorCode
 */
function getErrorCodeFromStatus(status: number): UploadErrorCode {
  if (status >= 500) {
    return 'SERVER_ERROR';
  }
  if (status === 400) {
    return 'UPLOAD_FAILED';
  }
  return 'NETWORK_ERROR';
}

/**
 * Gets user-friendly message for HTTP status code
 * @param status - HTTP status code
 * @returns User-friendly error message
 */
function getStatusMessage(status: number): string {
  if (status >= 500) {
    return '服务器错误，请稍后重试';
  }
  if (status === 400) {
    return '请求参数错误';
  }
  if (status === 401) {
    return '未授权，请重新登录';
  }
  if (status === 403) {
    return '没有权限访问';
  }
  if (status === 404) {
    return '请求的资源不存在';
  }
  return '网络错误，请检查网络连接';
}
