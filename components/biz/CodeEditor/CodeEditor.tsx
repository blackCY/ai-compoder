'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { CodeEditorProps } from './types';

export const CodeEditor: React.FC<CodeEditorProps> = ({
  className,
  code,
  language = 'javascript',
  placeholder = '// Ready for system interaction...'
}) => {
  const displayCode = code || placeholder;

  const highlightSyntax = (code: string) => {
    // Simple syntax highlighting for demonstration
    return code
      .replace(/\b(const|let|var|function|return|if|else|for|while)\b/g, '<span class="text-pink-400">$1</span>')
      .replace(/\b(true|false|null|undefined)\b/g, '<span class="text-yellow-400">$1</span>')
      .replace(/(['"`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="text-green-400">$1$2$1</span>')
      .replace(/\/\/.*$/gm, '<span class="text-gray-500">$&</span>');
  };

  return (
    <div
      className={cn(
        'glass-morphism rounded-lg p-4 overflow-y-auto font-mono text-sm border border-slate-700',
        'bg-slate-900/50 backdrop-blur-sm',
        'transition-all duration-300 ease-in-out',
        className
      )}
    >
      <div className="text-slate-400 mb-2 text-xs">
        {language}
      </div>
      <div
        className="leading-relaxed whitespace-pre text-slate-300"
        dangerouslySetInnerHTML={{
          __html: highlightSyntax(displayCode)
        }}
      />
    </div>
  );
};