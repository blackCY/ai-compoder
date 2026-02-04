"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CodeEditorProps } from "./types";
import { getLanguageFromFilename } from "@/components/biz/CodeEditor/utils";
import { BaseCodeEditor } from "./components/MonacoEditor";
import type { OnMount, BeforeMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

const DEFAULT_PLACEHOLDER = "// Start coding...";

export const CodeEditor: React.FC<CodeEditorProps> = ({
  className,
  code = "",
  language,
  filename,
  placeholder = DEFAULT_PLACEHOLDER,
  readOnly = false,
  onChange,
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // 优先使用 language，否则从 filename 推断
  const detectedLanguage = language || getLanguageFromFilename(filename);

  // 处理编辑器内容变化
  const handleEditorChange = (value: string | undefined) => {
    if (readOnly || !value || value === DEFAULT_PLACEHOLDER) return;
    onChange?.(value);
  };

  const handleEditorMount: OnMount = editorInstance => {
    editorRef.current = editorInstance;
  };

  const handleEditorBeforeMount: BeforeMount = monaco => {
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    });

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: monaco.languages.typescript.JsxEmit.Preserve,
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      esModuleInterop: true,
    });
  };

  // 自动滚动到底部（仅在 readOnly 模式下）
  useEffect(() => {
    if (readOnly && editorRef.current && code) {
      requestAnimationFrame(() => {
        if (editorRef.current) {
          const model = editorRef.current.getModel();
          if (model) {
            const lineCount = model.getLineCount();
            editorRef.current.revealLine(lineCount, 1);
          }
        }
      });
    }
  }, [readOnly, code]);

  return (
    <div
      className={cn(
        "relative glass-morphism rounded-lg overflow-hidden border border-slate-700",
        "bg-slate-900/50 backdrop-blur-sm",
        "transition-all duration-300 ease-in-out",
        className
      )}
    >
      <div className="text-slate-400 px-4 py-2 text-xs border-b border-slate-700/50 bg-slate-900/30">
        {filename || detectedLanguage}
      </div>

      <BaseCodeEditor
        height="100%"
        path={filename || "index.js"}
        language={detectedLanguage}
        value={code || placeholder}
        theme="vs-dark"
        onMount={handleEditorMount}
        beforeMount={handleEditorBeforeMount}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          lineNumbers: "on",
          automaticLayout: true,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          wordWrap: "on",
          wrappingStrategy: "advanced",
          readOnly,
        }}
      />
    </div>
  );
};
