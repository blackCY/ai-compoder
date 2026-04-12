import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FileUploader } from '../FileUploader';
import type { FileUploaderProps } from '../types';

// Create a query client for the test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

// Helper component to wrap FileUploader with QueryClientProvider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('FileUploader', () => {
  const defaultProps: FileUploaderProps = {
    accept: ['image/jpeg', 'image/png'],
    maxSize: 5 * 1024 * 1024,
    maxFiles: 5,
    multiple: true,
    autoUpload: false,
    disabled: false,
    showPreview: true,
    className: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders DropZone component', () => {
    render(
      <TestWrapper>
        <FileUploader {...defaultProps} />
      </TestWrapper>
    );
    // DropZone should render with Chinese text
    expect(screen.getByText('拖拽文件到此处')).toBeInTheDocument();
    expect(screen.getByText('或点击选择文件')).toBeInTheDocument();
  });

  it('applies custom className to container', () => {
    render(
      <TestWrapper>
        <FileUploader {...defaultProps} className="custom-test-class" />
      </TestWrapper>
    );

    const container = document.querySelector('.custom-test-class');
    expect(container).toBeInTheDocument();
  });
});