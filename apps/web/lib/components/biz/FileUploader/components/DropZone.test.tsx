/**
 * DropZone Component Tests
 * Testing drag-and-drop functionality for file selection
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DropZone } from './DropZone';

describe('DropZone Component', () => {
  const mockOnDrop = vi.fn();

  beforeEach(() => {
    mockOnDrop.mockClear();
  });

  describe('Rendering', () => {
    it('should render dropzone with default text', () => {
      render(<DropZone onDrop={mockOnDrop} />);
      expect(screen.getByText('拖拽文件到此处')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const { container } = render(
        <DropZone onDrop={mockOnDrop} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should render with disabled state', () => {
      const { container } = render(<DropZone onDrop={mockOnDrop} disabled />);
      expect(container.firstChild).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('should have hidden file input', () => {
      const { container } = render(<DropZone onDrop={mockOnDrop} />);
      const input = container.querySelector('input[type="file"]');
      expect(input).toBeInTheDocument();
      expect(input).toHaveClass('hidden');
    });
  });

  describe('Drag Events', () => {
    it('should add drag-over class on drag enter', () => {
      const { container } = render(<DropZone onDrop={mockOnDrop} />);
      const dropzone = container.firstChild as HTMLElement;

      const dragEnterEvent = new Event('dragenter', { bubbles: true });
      Object.defineProperty(dragEnterEvent, 'preventDefault', { value: vi.fn() });

      fireEvent(dropzone, dragEnterEvent);

      expect(dropzone).toHaveClass('border-emerald-500');
    });

    it('should remove drag-over class on drag leave', () => {
      const { container } = render(<DropZone onDrop={mockOnDrop} />);
      const dropzone = container.firstChild as HTMLElement;

      // First enter
      const dragEnterEvent = new Event('dragenter', { bubbles: true });
      fireEvent(dropzone, dragEnterEvent);

      // Then leave
      const dragLeaveEvent = new Event('dragleave', { bubbles: true });
      Object.defineProperty(dragLeaveEvent, 'preventDefault', { value: vi.fn() });
      fireEvent(dropzone, dragLeaveEvent);

      expect(dropzone).not.toHaveClass('border-emerald-500');
    });

    it('should prevent default on drag over', () => {
      const { container } = render(<DropZone onDrop={mockOnDrop} />);
      const dropzone = container.firstChild as HTMLElement;

      const dragOverEvent = new Event('dragover', { bubbles: true, cancelable: true });
      const preventDefault = vi.fn();
      Object.defineProperty(dragOverEvent, 'preventDefault', { value: preventDefault });

      fireEvent(dropzone, dragOverEvent);

      expect(preventDefault).toHaveBeenCalled();
    });
  });

  describe('Drop Events', () => {
    it('should handle file drop and call onDrop callback', async () => {
      const { container } = render(<DropZone onDrop={mockOnDrop} />);
      const dropzone = container.firstChild as HTMLElement;

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const dropEvent = new Event('drop', { bubbles: true, cancelable: true });
      const preventDefault = vi.fn();
      Object.defineProperty(dropEvent, 'preventDefault', { value: preventDefault });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: {
          files: [file],
          items: [{ kind: 'file', getAsFile: () => file }],
        },
        configurable: true,
      });

      fireEvent(dropzone, dropEvent);

      await waitFor(() => {
        expect(preventDefault).toHaveBeenCalled();
        expect(mockOnDrop).toHaveBeenCalledWith([file]);
      });
    });

    it('should prevent default on drop', () => {
      const { container } = render(<DropZone onDrop={mockOnDrop} />);
      const dropzone = container.firstChild as HTMLElement;

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const dropEvent = new Event('drop', { bubbles: true, cancelable: true });
      const preventDefault = vi.fn();
      Object.defineProperty(dropEvent, 'preventDefault', { value: preventDefault });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: {
          files: [file],
          items: [{ kind: 'file', getAsFile: () => file }],
        },
        configurable: true,
      });

      fireEvent(dropzone, dropEvent);

      expect(preventDefault).toHaveBeenCalled();
    });

    it('should remove drag-over styling after drop', async () => {
      const { container } = render(<DropZone onDrop={mockOnDrop} />);
      const dropzone = container.firstChild as HTMLElement;

      // First enter
      const dragEnterEvent = new Event('dragenter', { bubbles: true });
      fireEvent(dropzone, dragEnterEvent);

      // Then drop
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const dropEvent = new Event('drop', { bubbles: true, cancelable: true });
      Object.defineProperty(dropEvent, 'preventDefault', { value: vi.fn() });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: {
          files: [file],
          items: [{ kind: 'file', getAsFile: () => file }],
        },
        configurable: true,
      });

      fireEvent(dropzone, dropEvent);

      await waitFor(() => {
        expect(dropzone).not.toHaveClass('border-emerald-500');
      });
    });
  });

  describe('File Input', () => {
    it('should trigger file input click on dropzone click', () => {
      const { container } = render(<DropZone onDrop={mockOnDrop} />);
      const dropzone = container.firstChild as HTMLElement;
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      const clickSpy = vi.spyOn(input, 'click');

      fireEvent.click(dropzone);

      expect(clickSpy).toHaveBeenCalled();
    });

    it('should handle file input change and call onDrop', () => {
      const { container } = render(<DropZone onDrop={mockOnDrop} />);
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const files = [file];

      Object.defineProperty(input, 'files', {
        value: files,
        writable: false,
      });

      fireEvent.change(input);

      expect(mockOnDrop).toHaveBeenCalledWith([file]);
    });
  });

  describe('Disabled State', () => {
    it('should not handle drop when disabled', async () => {
      const { container } = render(<DropZone onDrop={mockOnDrop} disabled />);
      const dropzone = container.firstChild as HTMLElement;

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const dropEvent = new Event('drop', { bubbles: true, cancelable: true });
      Object.defineProperty(dropEvent, 'preventDefault', { value: vi.fn() });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: {
          files: [file],
          items: [{ kind: 'file', getAsFile: () => file }],
        },
        configurable: true,
      });

      fireEvent(dropzone, dropEvent);

      await waitFor(() => {
        expect(mockOnDrop).not.toHaveBeenCalled();
      });
    });

    it('should not trigger file input click when disabled', () => {
      const { container } = render(<DropZone onDrop={mockOnDrop} disabled />);
      const dropzone = container.firstChild as HTMLElement;
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      const clickSpy = vi.spyOn(input, 'click');

      fireEvent.click(dropzone);

      expect(clickSpy).not.toHaveBeenCalled();
    });
  });

  describe('Accept Prop', () => {
    it('should pass accept prop to file input', () => {
      const accept = ['image/jpeg', 'image/png'];
      const { container } = render(<DropZone onDrop={mockOnDrop} accept={accept} />);
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      expect(input.getAttribute('accept')).toBe('image/jpeg,image/png');
    });
  });
});
