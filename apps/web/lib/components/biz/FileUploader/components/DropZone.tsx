'use client';

import { useState, useRef } from 'react';
import { cn } from '../../../../utils';

export interface DropZoneProps {
  /** Callback when files are dropped */
  onDrop: (files: File[]) => void;
  /** Accepted file MIME types (e.g., ['image/jpeg', 'image/png']) */
  accept?: string[];
  /** Disable the dropzone */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onDrop,
  accept,
  disabled = false,
  className
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onDrop(files);
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onDrop(files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const acceptString = accept?.join(',') || '';

  return (
    <div
      className={cn(
        'glass-morphism rounded-lg border-2 border-dashed',
        'transition-all duration-300 ease-in-out',
        'flex flex-col items-center justify-center',
        'min-h-[200px] p-8 cursor-pointer',
        {
          'border-slate-600 hover:border-slate-500': !isDragging && !disabled,
          'border-emerald-500 bg-emerald-500/10': isDragging && !disabled,
          'opacity-50 cursor-not-allowed': disabled,
        },
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={acceptString}
        onChange={handleFileInputChange}
        multiple
        disabled={disabled}
      />

      <div className="flex flex-col items-center gap-4 text-center">
        <div className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center',
          'transition-all duration-300',
          {
            'bg-slate-700/50': !isDragging,
            'bg-emerald-500/20': isDragging,
          }
        )}>
          <svg
            className={cn(
              'w-8 h-8 transition-all duration-300',
              {
                'text-slate-400': !isDragging,
                'text-emerald-400': isDragging,
              }
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        <div className="space-y-2">
          <p className={cn(
            'text-lg font-medium transition-colors',
            {
              'text-slate-300': !isDragging,
              'text-emerald-300': isDragging,
            }
          )}>
            拖拽文件到此处
          </p>
          <p className="text-sm text-slate-500">
            或点击选择文件
          </p>
        </div>
      </div>
    </div>
  );
};
