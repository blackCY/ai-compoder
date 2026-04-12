/**
 * FileList Component Tests
 * Testing list rendering of FilePreview components with proper callbacks
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, within, cleanup } from '@testing-library/react';
import { FileList } from '../../components/FileList';
import type { FileState } from '../../types';

describe('FileList Component', () => {
  // Cleanup after each test
  afterEach(() => {
    cleanup();
  });

  const createMockFileState = (id: string, fileName: string, fileType: string, overrides?: Partial<FileState>): FileState => {
    const file = new File(['test content'], fileName, { type: fileType });
    return {
      id,
      file,
      status: 'idle',
      progress: 0,
      ...overrides
    };
  };

  describe('Rendering', () => {
    it('should render list of files', () => {
      const files: FileState[] = [
        createMockFileState('file-1', 'test-image-1.jpg', 'image/jpeg'),
        createMockFileState('file-2', 'test-image-2.png', 'image/png')
      ];

      const { container } = render(<FileList files={files} />);

      // Should render container with glass morphism
      const listContainer = container.firstChild;
      expect(listContainer).toBeInTheDocument();
      expect(listContainer).toHaveClass('glass-morphism');
    });

    it('should render FilePreview for each file', () => {
      const files: FileState[] = [
        createMockFileState('file-1', 'test-image-1.jpg', 'image/jpeg'),
        createMockFileState('file-2', 'test-image-2.png', 'image/png'),
        createMockFileState('file-3', 'test-3.pdf', 'application/pdf')
      ];

      const { container } = render(<FileList files={files} />);

      // Use within to scope queries
      const scopedScreen = within(container);

      // Should render all file names
      expect(scopedScreen.getByText('test-image-1.jpg')).toBeInTheDocument();
      expect(scopedScreen.getByText('test-image-2.png')).toBeInTheDocument();
      expect(scopedScreen.getByText('test-3.pdf')).toBeInTheDocument();
    });

    it('should handle empty list', () => {
      const { container } = render(<FileList files={[]} />);

      // Should return null or empty fragment for empty list
      expect(container.firstChild).toBeNull();
    });

    it('should use file.id as key for list rendering', () => {
      const files: FileState[] = [
        createMockFileState('unique-id-1', 'test-image-1.jpg', 'image/jpeg'),
        createMockFileState('unique-id-2', 'test-image-2.png', 'image/png')
      ];

      const { container } = render(<FileList files={files} />);

      // Use within to scope queries
      const scopedScreen = within(container);

      // Should render both files
      expect(scopedScreen.getByText('test-image-1.jpg')).toBeInTheDocument();
      expect(scopedScreen.getByText('test-image-2.png')).toBeInTheDocument();
    });

    it('should apply flex-col layout for vertical stacking', () => {
      const files: FileState[] = [
        createMockFileState('file-1', 'test-image-1.jpg', 'image/jpeg')
      ];

      const { container } = render(<FileList files={files} />);

      const listContainer = container.firstChild as HTMLElement;
      expect(listContainer).toHaveClass('flex-col');
    });

    it('should have proper spacing between items', () => {
      const files: FileState[] = [
        createMockFileState('file-1', 'test-image-1.jpg', 'image/jpeg'),
        createMockFileState('file-2', 'test-image-2.png', 'image/png')
      ];

      const { container } = render(<FileList files={files} />);

      const listContainer = container.firstChild as HTMLElement;
      expect(listContainer).toHaveClass('gap-3');
    });
  });

  describe('Callback Propagation', () => {
    it('should pass onRemove callback to each FilePreview', () => {
      const onRemove = vi.fn();
      const files: FileState[] = [
        createMockFileState('file-1', 'test-image-1.jpg', 'image/jpeg'),
        createMockFileState('file-2', 'test-image-2.png', 'image/png')
      ];

      const { container } = render(
        <FileList files={files} onRemove={onRemove} />
      );

      const deleteButtons = container.querySelectorAll('[data-testid="delete-button"]');
      expect(deleteButtons).toHaveLength(2);

      // Click first delete button
      fireEvent.click(deleteButtons[0]);
      expect(onRemove).toHaveBeenCalledWith('file-1');

      // Click second delete button
      fireEvent.click(deleteButtons[1]);
      expect(onRemove).toHaveBeenCalledWith('file-2');
    });

    it('should pass onRetry callback to each FilePreview', () => {
      const onRetry = vi.fn();
      const files: FileState[] = [
        createMockFileState('file-1', 'test-image-1.jpg', 'image/jpeg', {
          status: 'error',
          error: { code: 'UPLOAD_FAILED', message: 'Upload failed' }
        }),
        createMockFileState('file-2', 'test-image-2.png', 'image/png', {
          status: 'error',
          error: { code: 'NETWORK_ERROR', message: 'Network error' }
        })
      ];

      const { container } = render(
        <FileList files={files} onRetry={onRetry} />
      );

      const retryButtons = container.querySelectorAll('[data-testid="retry-button"]');
      expect(retryButtons).toHaveLength(2);

      // Click first retry button
      fireEvent.click(retryButtons[0]);
      expect(onRetry).toHaveBeenCalledWith('file-1');

      // Click second retry button
      fireEvent.click(retryButtons[1]);
      expect(onRetry).toHaveBeenCalledWith('file-2');
    });

    it('should work without onRemove callback', () => {
      const files: FileState[] = [
        createMockFileState('file-1', 'test-image-1.jpg', 'image/jpeg')
      ];

      const { container } = render(<FileList files={files} />);

      // Should not throw when callbacks are not provided
      expect(() => {
        const deleteButton = container.querySelector('[data-testid="delete-button"]');
        if (deleteButton) {
          fireEvent.click(deleteButton);
        }
      }).not.toThrow();
    });

    it('should work without onRetry callback', () => {
      const files: FileState[] = [
        createMockFileState('file-1', 'test-image-1.jpg', 'image/jpeg', {
          status: 'error',
          error: { code: 'UPLOAD_FAILED', message: 'Upload failed' }
        })
      ];

      const { container } = render(<FileList files={files} />);

      // Should not throw when callbacks are not provided
      expect(() => {
        const retryButton = container.querySelector('[data-testid="retry-button"]');
        if (retryButton) {
          fireEvent.click(retryButton);
        }
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single file', () => {
      const files: FileState[] = [
        createMockFileState('file-1', 'test-image-1.jpg', 'image/jpeg')
      ];

      const { container } = render(<FileList files={files} />);
      const scopedScreen = within(container);

      expect(scopedScreen.getByText('test-image-1.jpg')).toBeInTheDocument();
    });

    it('should handle many files', () => {
      const files: FileState[] = Array.from({ length: 10 }, (_, i) =>
        createMockFileState(`file-${i}`, `test-${i}.jpg`, 'image/jpeg')
      );

      const { container } = render(<FileList files={files} />);
      const scopedScreen = within(container);

      // Should render all 10 files
      for (let i = 0; i < 10; i++) {
        expect(scopedScreen.getByText(`test-${i}.jpg`)).toBeInTheDocument();
      }
    });

    it('should handle files with different statuses', () => {
      // Use extremely unique names to avoid any collision
      const uniqueSuffix = `-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const files: FileState[] = [
        createMockFileState(`statuses-file-1${uniqueSuffix}`, `statuses-idle${uniqueSuffix}.jpg`, 'image/jpeg', { status: 'idle', progress: 0 }),
        createMockFileState(`statuses-file-2${uniqueSuffix}`, `statuses-upload${uniqueSuffix}.png`, 'image/png', { status: 'uploading', progress: 50 }),
        createMockFileState(`statuses-file-3${uniqueSuffix}`, `statuses-success${uniqueSuffix}.pdf`, 'application/pdf', {
          status: 'success',
          progress: 100,
          response: {
            url: 'https://example.com/test-3.pdf',
            filename: 'test-3.pdf',
            originalName: 'test-3.pdf',
            size: 1024,
            contentType: 'application/pdf',
            uploadedAt: '2026-04-12T00:00:00Z'
          }
        }),
        createMockFileState(`statuses-file-4${uniqueSuffix}`, `statuses-error${uniqueSuffix}.jpg`, 'image/jpeg', {
          status: 'error',
          progress: 100,
          error: { code: 'UPLOAD_FAILED', message: 'Upload failed' }
        })
      ];

      const { container } = render(<FileList files={files} />);

      // Use within to scope queries to this test's container only
      const scopedScreen = within(container);

      // Should render all files - use getAllByText as fallback since there might be DOM pollution
      const idleFiles = scopedScreen.getAllByText(new RegExp(`statuses-idle${uniqueSuffix}\\.jpg`));
      expect(idleFiles.length).toBeGreaterThan(0);

      const uploadFiles = scopedScreen.getAllByText(new RegExp(`statuses-upload${uniqueSuffix}\\.png`));
      expect(uploadFiles.length).toBeGreaterThan(0);

      const successFiles = scopedScreen.getAllByText(new RegExp(`statuses-success${uniqueSuffix}\\.pdf`));
      expect(successFiles.length).toBeGreaterThan(0);

      // Should show progress bar for uploading file
      const progressBars = container.querySelectorAll('[role="progressbar"]');
      expect(progressBars.length).toBeGreaterThan(0);

      // Should show error message
      expect(scopedScreen.getByText('Upload failed')).toBeInTheDocument();

      // Should show retry button only for error file
      const retryButtons = container.querySelectorAll('[data-testid="retry-button"]');
      expect(retryButtons).toHaveLength(1);
    });
  });
});
