/**
 * FileUploader Type Tests
 * Verify type definitions are correct and catch type errors at compile time
 */

import { describe, it, expect } from 'vitest';
import type { FileUploaderProps, FileState } from '../types';
import type { UploadResponse, UploadError, UploadErrorCode } from 'lib/services/upload/types';

describe('FileUploader Types', () => {
  describe('FileUploaderProps', () => {
    it('should accept all optional properties', () => {
      const props: FileUploaderProps = {
        accept: ['image/jpeg', 'image/png'],
        maxSize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
        multiple: true,
        autoUpload: true,
        disabled: false,
        showPreview: true,
        dropzoneText: 'Drop files here',
        className: 'custom-class',
      };

      expect(props).toBeDefined();
      expect(props.accept).toEqual(['image/jpeg', 'image/png']);
      expect(props.maxSize).toBe(10 * 1024 * 1024);
      expect(props.maxFiles).toBe(5);
      expect(props.multiple).toBe(true);
      expect(props.autoUpload).toBe(true);
      expect(props.disabled).toBe(false);
      expect(props.showPreview).toBe(true);
    });

    it('should accept callbacks', () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse: UploadResponse = {
        url: 'https://example.com/file.jpg',
        filename: 'stored-file.jpg',
        originalName: 'test.jpg',
        size: 1024,
        contentType: 'image/jpeg',
        uploadedAt: '2024-01-01T00:00:00Z',
      };

      const props: FileUploaderProps = {
        onUploadStart: (files) => {
          expect(Array.isArray(files)).toBe(true);
        },
        onUploadProgress: (fileId, progress) => {
          expect(typeof fileId).toBe('string');
          expect(typeof progress).toBe('number');
        },
        onUploadSuccess: (fileId, response) => {
          expect(typeof fileId).toBe('string');
          expect(response.url).toBe('https://example.com/file.jpg');
        },
        onUploadError: (fileId, error) => {
          expect(typeof fileId).toBe('string');
          expect(error.code).toBeDefined();
          expect(error.message).toBeDefined();
        },
        onFilesChange: (files) => {
          expect(Array.isArray(files)).toBe(true);
        },
      };

      // Test callbacks are callable
      props.onUploadStart?.([mockFile]);
      props.onUploadProgress?.('file-id', 50);
      props.onUploadSuccess?.('file-id', mockResponse);
      props.onUploadError?.('file-id', { code: 'UPLOAD_FAILED', message: 'Upload failed' });
      props.onFilesChange?.([]);

      expect(props.onUploadStart).toBeDefined();
      expect(props.onUploadProgress).toBeDefined();
      expect(props.onUploadSuccess).toBeDefined();
      expect(props.onUploadError).toBeDefined();
      expect(props.onFilesChange).toBeDefined();
    });

    it('should allow empty props', () => {
      const props: FileUploaderProps = {};
      expect(props).toBeDefined();
    });
  });

  describe('FileState', () => {
    it('should create a valid file state with all properties', () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse: UploadResponse = {
        url: 'https://example.com/file.jpg',
        filename: 'stored-file.jpg',
        originalName: 'test.jpg',
        size: 1024,
        contentType: 'image/jpeg',
        uploadedAt: '2024-01-01T00:00:00Z',
      };

      const fileState: FileState = {
        id: 'file-123',
        file: mockFile,
        preview: 'blob:https://example.com/preview',
        status: 'success',
        progress: 100,
        response: mockResponse,
      };

      expect(fileState.id).toBe('file-123');
      expect(fileState.file).toBe(mockFile);
      expect(fileState.preview).toBe('blob:https://example.com/preview');
      expect(fileState.status).toBe('success');
      expect(fileState.progress).toBe(100);
      expect(fileState.response).toEqual(mockResponse);
    });

    it('should create file state with error', () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const mockError: UploadError = {
        code: 'FILE_TOO_LARGE',
        message: 'File size exceeds limit',
      };

      const fileState: FileState = {
        id: 'file-456',
        file: mockFile,
        status: 'error',
        progress: 0,
        error: mockError,
      };

      expect(fileState.status).toBe('error');
      expect(fileState.error?.code).toBe('FILE_TOO_LARGE');
      expect(fileState.error?.message).toBe('File size exceeds limit');
    });

    it('should accept all status types', () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const statuses: Array<FileState['status']> = ['idle', 'uploading', 'success', 'error'];

      statuses.forEach((status) => {
        const fileState: FileState = {
          id: 'file-id',
          file: mockFile,
          status,
          progress: status === 'success' ? 100 : 0,
        };
        expect(fileState.status).toBe(status);
      });
    });
  });
});
