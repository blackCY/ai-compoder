"use client";

import * as React from "react";
import * as antd from "antd";
import { cn } from "@/lib/utils";
import type { FileMap } from "react-renderer";
import dynamic from "next/dynamic";
import { AlertTriangle, Wand2 } from "lucide-react";

const CodeRenderer = dynamic(() => import("react-renderer").then(mod => mod.CodeRenderer), {
  ssr: false,
});

export interface PreviewPanelProps {
  className?: string;
  code?: string;
  fileMap?: FileMap;
  entryFile?: string;
  onAutoFix?: (error: Error) => void;
}

const PRESET_DEPENDENCIES: Record<string, unknown> = {
  "@private-component": antd,
};

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  code,
  fileMap,
  entryFile = "App.tsx",
  className,
  onAutoFix,
}) => {
  return (
    <section
      className={cn(
        "glass-morphism rounded-lg border border-border/50",
        "bg-white backdrop-blur-sm",
        "relative min-h-[200px]",
        "transition-all duration-300 ease-in-out",
        className
      )}
    >
      <CodeRenderer
        code={code}
        fileMap={fileMap}
        entryFile={entryFile}
        dependencies={PRESET_DEPENDENCIES}
        className="bg-white"
        renderError={error => (
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-6 p-8",
              "min-h-[300px] h-full",
              "bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5",
              "backdrop-blur-sm"
            )}
          >
            {/* Error Icon */}
            <div
              className={cn(
                "flex items-center justify-center",
                "w-16 h-16 rounded-full",
                "bg-red-500/10 border border-red-500/20"
              )}
            >
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>

            {/* Error Title */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-400 mb-2">Runtime Error</h3>
              <p className="text-sm text-muted-foreground">组件渲染时发生错误</p>
            </div>

            {/* Error Message */}
            <div
              className={cn(
                "w-full max-w-md p-4 rounded-lg",
                "bg-[#1a1b1e]/80 border border-red-500/20",
                "backdrop-blur-sm"
              )}
            >
              <pre
                className={cn(
                  "text-xs font-mono text-red-300/90",
                  "whitespace-pre-wrap break-words",
                  "max-h-[200px] overflow-auto",
                  "scrollbar-thin scrollbar-thumb-red-500/20"
                )}
              >
                {error.message}
              </pre>
            </div>

            {/* Auto Fix Button */}
            {onAutoFix && (
              <button
                onClick={() => onAutoFix(error)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-lg",
                  "bg-gradient-to-r from-emerald-500/20 to-blue-500/20",
                  "border border-emerald-500/30",
                  "text-emerald-400 font-medium text-sm",
                  "hover:from-emerald-500/30 hover:to-blue-500/30",
                  "hover:border-emerald-500/50",
                  "transition-all duration-300",
                  "shadow-lg shadow-emerald-500/10",
                  "hover:shadow-emerald-500/20"
                )}
              >
                <Wand2 className="w-4 h-4" />
                Auto Fix
              </button>
            )}
          </div>
        )}
      />
    </section>
  );
};
