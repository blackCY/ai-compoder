"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { usePipelineStage } from "@/lib/store/pipeline";
import { HomeStageOutputDisplay } from "./HomeStageOutputDisplay";

interface HomeTerminalOutputProps {
  isVisible: boolean;
}

export const HomeTerminalOutput: React.FC<HomeTerminalOutputProps> = ({ isVisible }) => {
  const stage = usePipelineStage("business-code-generate", "stage-1");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when content changes with smooth animation
  useEffect(() => {
    const container = scrollContainerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const scrollToBottom = () => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    };

    // Initial scroll
    scrollToBottom();

    // Watch for content changes
    const observer = new MutationObserver(scrollToBottom);
    observer.observe(content, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [stage.snapshot, stage.final]);

  if (!isVisible) return null;

  return (
    <div
      ref={scrollContainerRef}
      className="w-full bg-gray-900/90 backdrop-blur-md border border-gray-800/50 rounded-t-2xl border-b-0 font-mono text-sm min-h-[120px] max-h-[400px] overflow-y-auto scrollbar-hide"
    >
      <div ref={contentRef} className="p-4">
        {/* Stage Status Header */}
        <div className="mb-3 pb-2 border-b border-gray-700/30 flex items-center sticky top-0 bg-gray-900/90 backdrop-blur-md z-10 -mx-4 px-4">
          {stage.status === "running" && (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400 mr-2" />
              <span className="text-emerald-400 font-semibold text-xs">
                Analyzing Requirements...
              </span>
            </>
          )}
          {stage.status === "done" && (
            <>
              <svg
                className="w-3.5 h-3.5 text-green-400 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-green-400 font-semibold text-xs">Analysis Complete</span>
            </>
          )}
          {stage.status === "error" && (
            <>
              <svg
                className="w-3.5 h-3.5 text-red-400 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-red-400 font-semibold text-xs">Analysis Failed</span>
            </>
          )}
          {stage.status === "idle" && (
            <span className="text-gray-400 font-semibold text-xs">Ready</span>
          )}
        </div>

        {/* Error Display */}
        {stage.error ? (
          <div className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-3">
            <div className="font-semibold text-xs mb-1.5 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Error
            </div>
            <div className="text-xs font-sans">{stage.error}</div>
          </div>
        ) : null}

        {/* Output Display - show snapshot while running, final when done */}
        {(stage.final || stage.snapshot) && (
          <HomeStageOutputDisplay output={stage.final || stage.snapshot || ''} />
        )}

        {/* Idle State */}
        {stage.status === "idle" && (
          <div className="text-gray-400 text-center py-8">
            <svg
              className="w-10 h-10 mx-auto mb-2 opacity-40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div className="text-xs font-sans">Waiting for command...</div>
          </div>
        )}
      </div>
    </div>
  );
};
