'use client';

import { type FC } from 'react';
import { cn } from '../../../../utils';
import { FilePreview } from './FilePreview';
import type { FileState } from '../types';

export interface FileListProps {
  /** Array of file states to display */
  files: FileState[];
  /** Callback when remove button is clicked */
  onRemove?: (id: string) => void;
  /** Callback when retry button is clicked */
  onRetry?: (id: string) => void;
}

export const FileList: FC<FileListProps> = ({
  files,
  onRemove,
  onRetry
}) => {
  // Handle empty array - return null
  if (files.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'glass-morphism rounded-lg p-4',
        'flex flex-col gap-3',
        'transition-all duration-300 ease-in-out'
      )}
    >
      {files.map((file) => (
        <FilePreview
          key={file.id}
          file={file}
          onRemove={onRemove}
          onRetry={onRetry}
        />
      ))}
    </div>
  );
};
