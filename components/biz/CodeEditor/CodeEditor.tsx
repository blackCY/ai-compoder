"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { CodeEditorProps } from "./types";
import { getLanguageFromFilename } from "@/components/biz/CodeEditor/utils";
import { Editor } from "@/components/biz/CodeEditor/components/MonacoEditor";

export const CodeEditor: React.FC<CodeEditorProps> = ({
  className,
  code = "",
  language,
  filename,
  placeholder = "// Start coding...",
}) => {
  // 优先使用 language，否则从 filename 推断
  const detectedLanguage = language || getLanguageFromFilename(filename);

  return (
    <div
      className={cn(
        "glass-morphism rounded-lg overflow-hidden border border-slate-700",
        "bg-slate-900/50 backdrop-blur-sm",
        "transition-all duration-300 ease-in-out",
        className
      )}
    >
      <div className="text-slate-400 px-4 py-2 text-xs border-b border-slate-700/50 bg-slate-900/30">
        {filename || detectedLanguage}
      </div>

      <Editor
        height="100%"
        language={detectedLanguage}
        value={code || placeholder}
        theme="github-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          fontFamily: "var(--font-geist-mono), monospace",
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          renderLineHighlight: "all",
          wordWrap: "on", // 启用自动换行
          wrappingStrategy: "advanced", // 高级换行策略
          scrollbar: {
            vertical: "auto",
            horizontal: "auto",
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
        }}
      />
    </div>
  );
};
