'use client';

import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../../../../utils';

export interface UploadProgressProps {
  /** Upload progress percentage (0-100) */
  progress: number;
  /** Current upload status */
  status: 'idle' | 'uploading' | 'success' | 'error';
  /** Name of the file being uploaded */
  fileName: string;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  progress,
  status,
  fileName
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return (
          <CheckCircle2
            data-testid="success-icon"
            className="w-5 h-5 text-emerald-400"
          />
        );
      case 'error':
        return (
          <AlertCircle
            data-testid="error-icon"
            className="w-5 h-5 text-red-400"
          />
        );
      case 'uploading':
        return (
          <Loader2
            data-testid="uploading-icon"
            className="w-5 h-5 text-blue-400 animate-spin"
          />
        );
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'success':
        return '上传成功';
      case 'error':
        return '上传失败';
      case 'uploading':
        return '上传中...';
      default:
        return '等待上传';
    }
  };

  return (
    <div
      className={cn(
        'glass-morphism rounded-lg p-4',
        'transition-all duration-300 ease-in-out',
        'flex items-center gap-4'
      )}
    >
      {/* Status Icon */}
      <div className="flex-shrink-0">
        {getStatusIcon()}
      </div>

      {/* File Info and Progress */}
      <div className="flex-1 min-w-0">
        {/* File Name */}
        <div className="flex items-center justify-between gap-4 mb-2">
          <p
            className={cn(
              'text-sm font-medium truncate',
              'text-slate-200'
            )}
            title={fileName}
          >
            {fileName}
          </p>
          <span className="text-sm font-semibold text-slate-300 flex-shrink-0">
            {progress}%
          </span>
        </div>

        {/* Status Text */}
        <p className="text-xs text-slate-400 mb-2">
          {getStatusText()}
        </p>

        {/* Progress Bar */}
        {status !== 'idle' && (
          <div
            className={cn(
              'w-full h-2 rounded-full',
              'bg-slate-700/50 overflow-hidden'
            )}
          >
            <div
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              className={cn(
                'h-full rounded-full transition-all duration-300 ease-out',
                {
                  'bg-gradient-to-r from-blue-500 to-blue-400': status === 'uploading',
                  'bg-gradient-to-r from-emerald-500 to-emerald-400': status === 'success',
                  'bg-gradient-to-r from-red-500 to-red-400': status === 'error',
                }
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
