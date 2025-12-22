"use client";

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CodeEditorProps } from "./types";
import { getLanguageFromFilename } from "@/components/biz/CodeEditor/utils";
import { Editor, OnMount, BeforeMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

export const CodeEditor: React.FC<CodeEditorProps> = ({
  className,
  code = "",
  language,
  filename,
  placeholder = "// Start coding...",
  autoScroll = false,
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // 优先使用 language，否则从 filename 推断
  const detectedLanguage = language || getLanguageFromFilename(filename);

  const handleEditorMount: OnMount = editorInstance => {
    editorRef.current = editorInstance;
  };

  const handleEditorBeforeMount: BeforeMount = monaco => {
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true, // 关掉类型 & 依赖解析错误
      noSyntaxValidation: false, // 保留语法错误
    });

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: monaco.languages.typescript.JsxEmit.Preserve,
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      esModuleInterop: true,
    });
  };

  // 自动滚动到底部
  useEffect(() => {
    if (autoScroll && editorRef.current && code) {
      // 使用 requestAnimationFrame 确保 DOM 更新后再滚动
      requestAnimationFrame(() => {
        if (editorRef.current) {
          const model = editorRef.current.getModel();
          if (model) {
            const lineCount = model.getLineCount();
            editorRef.current.revealLine(lineCount, 1); // 1 = ScrollType.Immediate
          }
        }
      });
    }
  }, [autoScroll, code]);

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
        path={filename || "index.ts"}
        language={detectedLanguage}
        value={code || placeholder}
        theme="vs-dark"
        onMount={handleEditorMount}
        beforeMount={handleEditorBeforeMount}
        options={{
          minimap: { enabled: false },
          lineNumbers: "on",
          automaticLayout: true,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          wordWrap: "on",
          wrappingStrategy: "advanced",
          readOnly: autoScroll, // 生成中只读,完成后可编辑
          // padding: { top: 16, bottom: 16 }, // 添加上下内边距,确保最后一行完全可见
        }}
      />
    </div>
  );
};
