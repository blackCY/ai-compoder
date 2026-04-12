/**
 * UploadProgress Component Tests
 * Testing progress display and status indicators for file uploads
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UploadProgress } from '../../components/UploadProgress';

describe('UploadProgress Component', () => {
  describe('Rendering', () => {
    it('should render progress percentage', () => {
      const { container } = render(
        <UploadProgress
          progress={45}
          status="uploading"
          fileName="test.jpg"
        />
      );
      expect(container.textContent).toContain('45%');
    });

    it('should render file name', () => {
      const { container } = render(
        <UploadProgress
          progress={0}
          status="idle"
          fileName="example.pdf"
        />
      );
      expect(container.textContent).toContain('example.pdf');
    });

    it('should render 0% progress', () => {
      const { container } = render(
        <UploadProgress
          progress={0}
          status="idle"
          fileName="test.jpg"
        />
      );
      expect(container.textContent).toContain('0%');
    });

    it('should render 100% progress', () => {
      const { container } = render(
        <UploadProgress
          progress={100}
          status="success"
          fileName="test.jpg"
        />
      );
      expect(container.textContent).toContain('100%');
    });
  });

  describe('Status States', () => {
    it('should show idle state without progress bar', () => {
      const { container } = render(
        <UploadProgress
          progress={0}
          status="idle"
          fileName="test.jpg"
        />
      );

      // Should not have progress bar in idle state
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).not.toBeInTheDocument();
    });

    it('should show uploading state with animated progress bar', () => {
      const { container } = render(
        <UploadProgress
          progress={50}
          status="uploading"
          fileName="test.jpg"
        />
      );

      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveStyle({ width: '50%' });
    });

    it('should show success state with checkmark', () => {
      const { container } = render(
        <UploadProgress
          progress={100}
          status="success"
          fileName="test.jpg"
        />
      );

      // Should have a success indicator
      const successIcon = container.querySelector('[data-testid="success-icon"]');
      expect(successIcon).toBeInTheDocument();
    });

    it('should show error state with error indicator', () => {
      const { container } = render(
        <UploadProgress
          progress={75}
          status="error"
          fileName="test.jpg"
        />
      );

      // Should have an error indicator
      const errorIcon = container.querySelector('[data-testid="error-icon"]');
      expect(errorIcon).toBeInTheDocument();
    });
  });

  describe('Progress Bar Styling', () => {
    it('should apply glass morphism effect', () => {
      const { container } = render(
        <UploadProgress
          progress={50}
          status="uploading"
          fileName="test.jpg"
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('glass-morphism');
    });

    it('should have smooth transitions', () => {
      const { container } = render(
        <UploadProgress
          progress={50}
          status="uploading"
          fileName="test.jpg"
        />
      );

      const progressBar = container.querySelector('[role="progressbar"]') as HTMLElement;
      expect(progressBar).toHaveClass('transition-all');
    });
  });

  describe('Edge Cases', () => {
    it('should handle progress values at boundaries', () => {
      const { container: container0 } = render(
        <UploadProgress
          progress={0}
          status="uploading"
          fileName="test.jpg"
        />
      );
      const progressBar0 = container0.querySelector('[role="progressbar"]');
      expect(progressBar0).toHaveStyle({ width: '0%' });

      const { container: container100 } = render(
        <UploadProgress
          progress={100}
          status="uploading"
          fileName="test.jpg"
        />
      );
      const progressBar100 = container100.querySelector('[role="progressbar"]');
      expect(progressBar100).toHaveStyle({ width: '100%' });
    });

    it('should handle long file names', () => {
      const { container } = render(
        <UploadProgress
          progress={50}
          status="uploading"
          fileName="very-long-file-name-that-exceeds-normal-width.jpg"
        />
      );
      expect(container.textContent).toContain('very-long-file-name-that-exceeds-normal-width.jpg');
    });
  });
});
