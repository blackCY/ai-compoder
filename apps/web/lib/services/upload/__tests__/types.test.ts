/**
 * Upload Service Type Tests
 * Verify service type definitions are correct
 */

import { describe, it, expect } from 'vitest';
import type {
  UploadOptions,
  ValidationResult,
  UploadConstraints,
  UploadResponse,
  UploadError,
  UploadErrorCode,
} from '../types';

describe('Upload Service Types', () => {
  describe('UploadOptions', () => {
    it('should accept onProgress callback', () => {
      const options: UploadOptions = {
        onProgress: (progress) => {
          expect(progress).toBeGreaterThanOrEqual(0);
          expect(progress).toBeLessThanOrEqual(100);
        },
      };

      options.onProgress?.(50);
      expect(options.onProgress).toBeDefined();
    });

    it('should accept AbortSignal', () => {
      const controller = new AbortController();
      const options: UploadOptions = {
        signal: controller.signal,
      };

      expect(options.signal).toBe(controller.signal);
    });

    it('should accept both options', () => {
      const controller = new AbortController();
      const options: UploadOptions = {
        onProgress: (progress) => progress,
        signal: controller.signal,
      };

      expect(options.onProgress).toBeDefined();
      expect(options.signal).toBeDefined();
    });

    it('should accept empty options', () => {
      const options: UploadOptions = {};
      expect(options).toBeDefined();
    });
  });

  describe('ValidationResult', () => {
    it('should create valid result', () => {
      const result: ValidationResult = {
        valid: true,
      };

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should create invalid result with error', () => {
      const error: UploadError = {
        code: 'FILE_TOO_LARGE',
        message: 'File exceeds size limit',
      };

      const result: ValidationResult = {
        valid: false,
        error,
      };

      expect(result.valid).toBe(false);
      expect(result.error).toEqual(error);
    });
  });

  describe('UploadConstraints', () => {
    it('should accept all constraints', () => {
      const constraints: UploadConstraints = {
        accept: ['image/jpeg', 'image/png'],
        maxSize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
      };

      expect(constraints.accept).toEqual(['image/jpeg', 'image/png']);
      expect(constraints.maxSize).toBe(10 * 1024 * 1024);
      expect(constraints.maxFiles).toBe(5);
    });

    it('should accept partial constraints', () => {
      const constraints1: UploadConstraints = {
        accept: ['image/jpeg'],
      };

      const constraints2: UploadConstraints = {
        maxSize: 5 * 1024 * 1024,
      };

      const constraints3: UploadConstraints = {
        maxFiles: 3,
      };

      expect(constraints1.accept).toBeDefined();
      expect(constraints2.maxSize).toBeDefined();
      expect(constraints3.maxFiles).toBeDefined();
    });

    it('should accept empty constraints', () => {
      const constraints: UploadConstraints = {};
      expect(constraints).toBeDefined();
    });
  });

  describe('UploadResponse', () => {
    it('should create valid response with all fields', () => {
      const response: UploadResponse = {
        url: 'https://example.com/uploads/file.jpg',
        filename: 'stored-file-123.jpg',
        originalName: 'my-photo.jpg',
        size: 1024 * 512, // 512KB
        contentType: 'image/jpeg',
        uploadedAt: '2024-01-15T10:30:00.000Z',
      };

      expect(response.url).toBe('https://example.com/uploads/file.jpg');
      expect(response.filename).toBe('stored-file-123.jpg');
      expect(response.originalName).toBe('my-photo.jpg');
      expect(response.size).toBe(1024 * 512);
      expect(response.contentType).toBe('image/jpeg');
      expect(response.uploadedAt).toBe('2024-01-15T10:30:00.000Z');
    });

    it('should handle various content types', () => {
      const types = [
        'image/jpeg',
        'image/png',
        'application/pdf',
        'text/plain',
        'video/mp4',
      ];

      types.forEach((type) => {
        const response: UploadResponse = {
          url: 'https://example.com/file',
          filename: 'file',
          originalName: 'file',
          size: 1024,
          contentType: type,
          uploadedAt: new Date().toISOString(),
        };

        expect(response.contentType).toBe(type);
      });
    });
  });

  describe('UploadError', () => {
    it('should create valid error with all error codes', () => {
      const errorCodes: UploadErrorCode[] = [
        'FILE_TOO_LARGE',
        'INVALID_FILE_TYPE',
        'TOO_MANY_FILES',
        'EMPTY_FILE',
        'UPLOAD_FAILED',
        'NETWORK_ERROR',
        'SERVER_ERROR',
        'UPLOAD_CANCELLED',
      ];

      errorCodes.forEach((code) => {
        const error: UploadError = {
          code,
          message: `Error: ${code}`,
        };

        expect(error.code).toBe(code);
        expect(error.message).toBeDefined();
      });
    });

    it('should provide descriptive messages', () => {
      const errors: UploadError[] = [
        {
          code: 'FILE_TOO_LARGE',
          message: 'File size exceeds 10MB limit',
        },
        {
          code: 'INVALID_FILE_TYPE',
          message: 'Only JPEG and PNG files are allowed',
        },
        {
          code: 'TOO_MANY_FILES',
          message: 'Maximum 5 files allowed',
        },
        {
          code: 'EMPTY_FILE',
          message: 'File is empty',
        },
        {
          code: 'UPLOAD_FAILED',
          message: 'Upload operation failed',
        },
        {
          code: 'NETWORK_ERROR',
          message: 'Network connection lost',
        },
        {
          code: 'SERVER_ERROR',
          message: 'Server returned error 500',
        },
        {
          code: 'UPLOAD_CANCELLED',
          message: 'Upload was cancelled by user',
        },
      ];

      errors.forEach((error) => {
        expect(error.code).toBeDefined();
        expect(error.message).toBeTruthy();
        expect(error.message.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Type Compatibility', () => {
    it('should allow UploadError in ValidationResult', () => {
      const result: ValidationResult = {
        valid: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'Too large',
        },
      };

      expect(result.error?.code).toBe('FILE_TOO_LARGE');
    });

    it('should work with union types', () => {
      const handleErrorCode = (code: UploadErrorCode): string => {
        return `Error code: ${code}`;
      };

      expect(handleErrorCode('FILE_TOO_LARGE')).toBe('Error code: FILE_TOO_LARGE');
      expect(handleErrorCode('UPLOAD_CANCELLED')).toBe('Error code: UPLOAD_CANCELLED');
    });
  });
});
