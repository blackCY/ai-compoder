/**
 * FilePreview Component Tests
 * Testing file preview display with image thumbnails, progress, and error handling
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilePreview } from '../../components/FilePreview';
import type { FileState } from '../../types';

describe('FilePreview Component', () => {
  const mockFile = new File(['test content'], 'test-image.jpg', {
    type: 'image/jpeg'
  });

  const createMockFileState = (overrides?: Partial<FileState>): FileState => ({
    id: 'file-1',
    file: mockFile,
    status: 'idle',
    progress: 0,
    ...overrides
  });

  describe('Rendering', () => {
    it('should render file name', () => {
      const fileState = createMockFileState();
      render(<FilePreview file={fileState} />);

      expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
    });

    it('should render image preview when available', () => {
      const fileState = createMockFileState({
        preview: 'data:image/jpeg;base64,/9j/4AAQSkZJRg'
      });

      const { container } = render(<FilePreview file={fileState} />);
      const img = container.querySelector('img');

      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'data:image/jpeg;base64,/9j/4AAQSkZJRg');
      expect(img).toHaveAttribute('alt', 'test-image.jpg');
    });

    it('should not render image preview when not available', () => {
      const fileState = createMockFileState();
      const { container } = render(<FilePreview file={fileState} />);

      const img = container.querySelector('img');
      expect(img).not.toBeInTheDocument();
    });

    it('should show progress bar when uploading', () => {
      const fileState = createMockFileState({
        status: 'uploading',
        progress: 45
      });

      const { container } = render(<FilePreview file={fileState} />);
      const progressBar = container.querySelector('[role="progressbar"]');

      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveStyle({ width: '45%' });
    });

    it('should show error message when failed', () => {
      const fileState = createMockFileState({
        status: 'error',
        progress: 100,
        error: {
          code: 'UPLOAD_FAILED',
          message: 'Network connection lost'
        }
      });

      render(<FilePreview file={fileState} />);

      expect(screen.getByText('Network connection lost')).toBeInTheDocument();
    });

    it('should apply glass morphism styling', () => {
      const fileState = createMockFileState();
      const { container } = render(<FilePreview file={fileState} />);

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('glass-morphism');
    });
  });

  describe('User Interactions', () => {
    it('should call onRemove when delete clicked', () => {
      const onRemove = vi.fn();
      const fileState = createMockFileState();

      const { container } = render(
        <FilePreview file={fileState} onRemove={onRemove} />
      );

      const deleteButton = container.querySelector('[data-testid="delete-button"]');
      expect(deleteButton).toBeInTheDocument();

      if (deleteButton) {
        fireEvent.click(deleteButton);
        expect(onRemove).toHaveBeenCalledTimes(1);
        expect(onRemove).toHaveBeenCalledWith('file-1');
      }
    });

    it('should call onRetry when retry clicked', () => {
      const onRetry = vi.fn();
      const fileState = createMockFileState({
        status: 'error',
        error: {
          code: 'UPLOAD_FAILED',
          message: 'Upload failed'
        }
      });

      const { container } = render(
        <FilePreview file={fileState} onRetry={onRetry} />
      );

      const retryButton = container.querySelector('[data-testid="retry-button"]');
      expect(retryButton).toBeInTheDocument();

      if (retryButton) {
        fireEvent.click(retryButton);
        expect(onRetry).toHaveBeenCalledTimes(1);
        expect(onRetry).toHaveBeenCalledWith('file-1');
      }
    });

    it('should not show retry button when not in error state', () => {
      const fileState = createMockFileState({
        status: 'success',
        progress: 100
      });

      const { container } = render(<FilePreview file={fileState} />);

      const retryButton = container.querySelector('[data-testid="retry-button"]');
      expect(retryButton).not.toBeInTheDocument();
    });

    it('should show retry button only when status is error', () => {
      const fileState = createMockFileState({
        status: 'error',
        error: {
          code: 'UPLOAD_FAILED',
          message: 'Upload failed'
        }
      });

      const { container } = render(<FilePreview file={fileState} />);

      const retryButton = container.querySelector('[data-testid="retry-button"]');
      expect(retryButton).toBeInTheDocument();
    });

    it('should always show delete button regardless of state', () => {
      const states: Array<'idle' | 'uploading' | 'success' | 'error'> = [
        'idle',
        'uploading',
        'success',
        'error'
      ];

      states.forEach((status) => {
        const fileState = createMockFileState({ status });
        const { container } = render(<FilePreview file={fileState} />);

        const deleteButton = container.querySelector('[data-testid="delete-button"]');
        expect(deleteButton).toBeInTheDocument();
      });
    });
  });

  describe('Status States', () => {
    it('should display idle state correctly', () => {
      const fileState = createMockFileState({ status: 'idle' });
      const { container } = render(<FilePreview file={fileState} />);

      const retryButton = container.querySelector('[data-testid="retry-button"]');
      expect(retryButton).not.toBeInTheDocument();
    });

    it('should display uploading state with progress', () => {
      const fileState = createMockFileState({
        status: 'uploading',
        progress: 67
      });

      const { container } = render(<FilePreview file={fileState} />);
      const progressBar = container.querySelector('[role="progressbar"]');

      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveStyle({ width: '67%' });
    });

    it('should display success state', () => {
      const fileState = createMockFileState({
        status: 'success',
        progress: 100,
        response: {
          url: 'https://example.com/files/test.jpg',
          filename: 'test-uploaded.jpg',
          originalName: 'test-image.jpg',
          size: 1024,
          contentType: 'image/jpeg',
          uploadedAt: '2026-04-12T00:00:00Z'
        }
      });

      const { container } = render(<FilePreview file={fileState} />);

      // Should not show retry button in success state
      const retryButton = container.querySelector('[data-testid="retry-button"]');
      expect(retryButton).not.toBeInTheDocument();

      // Should show delete button
      const deleteButton = container.querySelector('[data-testid="delete-button"]');
      expect(deleteButton).toBeInTheDocument();
    });

    it('should display error state with error message', () => {
      const fileState = createMockFileState({
        status: 'error',
        progress: 100,
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'File size exceeds 10MB limit'
        }
      });

      render(<FilePreview file={fileState} />);

      expect(screen.getByText('File size exceeds 10MB limit')).toBeInTheDocument();

      // Should show retry button
      const { container } = render(<FilePreview file={fileState} />);
      const retryButton = container.querySelector('[data-testid="retry-button"]');
      expect(retryButton).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle file without preview', () => {
      const fileState = createMockFileState({ preview: undefined });
      const { container } = render(<FilePreview file={fileState} />);

      const img = container.querySelector('img');
      expect(img).not.toBeInTheDocument();
    });

    it('should handle long file names', () => {
      const longFileName = new File(
        ['content'],
        'very-long-file-name-that-exceeds-normal-width-and-should-be-truncated.jpg',
        { type: 'image/jpeg' }
      );

      const fileState = createMockFileState({ file: longFileName });
      render(<FilePreview file={fileState} />);

      const fileName = screen.getByText(
        'very-long-file-name-that-exceeds-normal-width-and-should-be-truncated.jpg'
      );
      expect(fileName).toBeInTheDocument();
    });

    it('should handle missing onRemove callback', () => {
      const fileState = createMockFileState();
      const { container } = render(<FilePreview file={fileState} />);

      const deleteButton = container.querySelector('[data-testid="delete-button"]');
      expect(deleteButton).toBeInTheDocument();

      // Should not throw when clicked without callback
      if (deleteButton) {
        expect(() => fireEvent.click(deleteButton)).not.toThrow();
      }
    });

    it('should handle missing onRetry callback', () => {
      const fileState = createMockFileState({
        status: 'error',
        error: {
          code: 'UPLOAD_FAILED',
          message: 'Upload failed'
        }
      });

      const { container } = render(<FilePreview file={fileState} />);

      const retryButton = container.querySelector('[data-testid="retry-button"]');
      expect(retryButton).toBeInTheDocument();

      // Should not throw when clicked without callback
      if (retryButton) {
        expect(() => fireEvent.click(retryButton)).not.toThrow();
      }
    });

    it('should handle progress at boundaries (0 and 100)', () => {
      const { container: container0 } = render(
        <FilePreview
          file={createMockFileState({ status: 'uploading', progress: 0 })}
        />
      );
      const progressBar0 = container0.querySelector('[role="progressbar"]');
      expect(progressBar0).toHaveStyle({ width: '0%' });

      const { container: container100 } = render(
        <FilePreview
          file={createMockFileState({ status: 'uploading', progress: 100 })}
        />
      );
      const progressBar100 = container100.querySelector('[role="progressbar"]');
      expect(progressBar100).toHaveStyle({ width: '100%' });
    });
  });

  describe('Accessibility', () => {
    it('should have proper alt text for preview image', () => {
      const fileState = createMockFileState({
        preview: 'data:image/jpeg;base64,/9j/4AAQSkZJRg'
      });

      const { container } = render(<FilePreview file={fileState} />);
      const img = container.querySelector('img') as HTMLImageElement;

      expect(img).toHaveAttribute('alt', 'test-image.jpg');
    });

    it('should have accessible button labels', () => {
      const fileState = createMockFileState({
        status: 'error',
        error: {
          code: 'UPLOAD_FAILED',
          message: 'Upload failed'
        }
      });

      const { container } = render(<FilePreview file={fileState} />);

      const deleteButton = container.querySelector('[data-testid="delete-button"]');
      const retryButton = container.querySelector('[data-testid="retry-button"]');

      expect(deleteButton).toHaveAttribute('aria-label', '删除文件');
      expect(retryButton).toHaveAttribute('aria-label', '重试上传');
    });
  });
});
