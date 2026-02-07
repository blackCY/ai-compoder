"use client";

import { useEffect, useRef } from "react";
import { cn } from "lib/utils";
import { Loader2, Terminal } from "lucide-react";

export interface TextResultViewerProps {
  content: string;
  isLoading?: boolean;
}

export function TextResultViewer({ content, isLoading = false }: TextResultViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [content]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        "h-full w-full overflow-auto",
        "bg-[#050508]",
        "p-5 font-mono text-sm"
      )}
    >
      {content ? (
        <pre className="whitespace-pre-wrap break-words text-gray-100 leading-relaxed">
          <code>{content}</code>
        </pre>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-4">
          <div className="relative">
            <Loader2 className="h-10 w-10 animate-spin text-cyan-500/40" />
            <div className="absolute inset-0 blur-xl bg-cyan-500/20 animate-pulse" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm text-cyan-500/60 font-mono">EXECUTING STAGE</span>
            <span className="text-xs text-gray-700">Waiting for output stream...</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-4">
          <div className="relative">
            <Terminal className="h-14 w-14 opacity-10" />
            <div className="absolute inset-0 blur-xl bg-cyan-500/5" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-mono">NO OUTPUT</span>
            <span className="text-xs text-gray-700">Enter input and run to see results</span>
          </div>
        </div>
      )}
    </div>
  );
}
