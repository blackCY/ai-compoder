'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { PreviewPanelProps } from './types';
import { getPreviewText } from './utils';

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  className,
  children
}) => {
  return (
    <section
      className={cn(
        // 基础样式 - glass morphism 效果
        'glass-morphism rounded-lg border border-border/50',
        // 暗色主题背景
        'bg-background/80 backdrop-blur-sm',
        // 布局
        'flex justify-center items-center relative min-h-[200px]',
        // 动画效果
        'transition-all duration-300 ease-in-out',
        className
      )}
    >
      {/* Preview 标签 */}
      <div className={cn(
        'absolute top-3 right-3',
        'bg-muted/80 text-muted-foreground',
        'px-2 py-1 rounded-md text-xs font-medium',
        'backdrop-blur-sm border border-border/50'
      )}>
        Preview
      </div>

      {/* 预览内容 */}
      <div className={cn(
        'preview-mock-content text-center',
        'text-muted-foreground/60',
        'px-4 py-2'
      )}>
        {children || getPreviewText()}
      </div>
    </section>
  );
};