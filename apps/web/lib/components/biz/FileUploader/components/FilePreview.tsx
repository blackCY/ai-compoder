'use client';

import { X, RefreshCw } from 'lucide-react';
import { cn } from '../../../../utils';
import { UploadProgress } from './UploadProgress';
import type { FilePreviewProps } from '../types';

export const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  onRemove,
  onRetry
}) => {
  const handleRemove = () => {
    onRemove?.(file.id);
  };

  const handleRetry = () => {
    onRetry?.(file.id);
  };

  return (
    <div
      className={cn(
        'glass-morphism rounded-lg p-4',
        'transition-all duration-300 ease-in-out',
        'relative'
      )}
    >
      {/* File Content */}
      <div className="flex items-start gap-4">
        {/* Image Preview */}
        {file.preview && (
          <div className="flex-shrink-0">
            <img
              src={file.preview}
              alt={file.file.name}
              className="w-16 h-16 object-cover rounded-md"
            />
          </div>
        )}

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'text-sm font-medium truncate',
              'text-slate-200'
            )}
            title={file.file.name}
          >
            {file.file.name}
          </p>

          {/* Upload Progress when uploading */}
          {file.status === 'uploading' && (
            <UploadProgress
              progress={file.progress}
              status={file.status}
              fileName={file.file.name}
            />
          )}

          {/* Error Message */}
          {file.status === 'error' && file.error && (
            <p className="text-sm text-red-400 mt-1">
              {file.error.message}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Retry Button - Only show when error */}
          {file.status === 'error' && (
            <button
              data-testid="retry-button"
              onClick={handleRetry}
              aria-label="重试上传"
              className={cn(
                'p-2 rounded-md',
                'bg-blue-500/20 text-blue-400',
                'hover:bg-blue-500/30',
                'transition-colors duration-200',
                'flex-shrink-0'
              )}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          {/* Delete Button - Always show */}
          <button
            data-testid="delete-button"
            onClick={handleRemove}
            aria-label="删除文件"
            className={cn(
              'p-2 rounded-md',
              'bg-red-500/20 text-red-400',
              'hover:bg-red-500/30',
              'transition-colors duration-200',
              'flex-shrink-0'
            )}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
