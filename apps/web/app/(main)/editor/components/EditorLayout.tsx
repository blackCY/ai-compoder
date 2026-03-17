"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CodeEditor } from "lib/bizComp/CodeEditor";
import { PreviewPanel } from "./PreviewPanel";
import { EditorSidebar } from "./EditorSidebar";
import { UsagePanel } from "./UsagePanel";
import { useState, useMemo, useEffect, useCallback } from "react";
import { usePipelineStage, useStageUpdate } from "lib/store/pipeline/hooks";
import type { GeneratedFileName, GenerateCodeOutput, PipelineId } from "lib/store/pipeline/types";
import type { FileMap } from "react-renderer";
import { toast } from "sonner";

/**
 * 将 GenerateCodeOutput 转换为 FileMap
 */
function toFileMap(output: GenerateCodeOutput | undefined): FileMap | undefined {
  if (!output) return undefined;

  const fileMap: FileMap = {};

  for (const [fileName, fileContent] of Object.entries(output)) {
    if (fileContent?.content) {
      fileMap[fileName] = fileContent.content;
    }
  }

  return Object.keys(fileMap).length > 0 ? fileMap : undefined;
}

export interface EditorLayoutProps {
  pipelineName: PipelineId;
  onError?: (error: Error) => void;
  onUnsaveChange?: (saveStatus: boolean) => void;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({ pipelineName, onError, onUnsaveChange }) => {
  const [selectedFileName, setSelectedFileName] = useState<GeneratedFileName | null>(null);
  const { final, snapshot, status } = usePipelineStage(pipelineName, "generate-code");

  // 使用 useStageUpdate hook
  const { updateStage } = useStageUpdate(pipelineName, "generate-code", true);

  // 编辑后的文件内容（一开始为空，changed 时存入）
  const [editedFiles, setEditedFiles] = useState<GenerateCodeOutput>({});
  // 是否有未保存更改
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const filesMap = snapshot || {};

  // 判断 generate-code 是否正在运行
  const isStageRunning = status === "running";

  // 是否显示预览面板
  const showPreview = !!final;

  // 实时追踪 snapshot 的最后一个文件
  useEffect(() => {
    if (isStageRunning && Object.keys(filesMap).length) {
      // 获取 snapshot 中存在的最后一个文件
      const existingFiles = Object.keys(filesMap) as GeneratedFileName[];
      const lastFile = existingFiles[existingFiles.length - 1];
      if (lastFile) {
        setSelectedFileName(lastFile);
      }
    }
  }, [filesMap, isStageRunning]);

  // 当前显示的文件（用于侧边栏等）
  const currentFilesMap = isStageRunning ? snapshot : final;
  const currentFile =
    selectedFileName && currentFilesMap?.[selectedFileName]
      ? { fileName: selectedFileName, ...currentFilesMap[selectedFileName] }
      : null;

  // 侧边栏显示的文件名列表
  const sidebarFileNames = final ? Object.keys(final) : Object.keys(snapshot || {});

  // 编辑器显示的代码：优先用 editedFiles，否则用 currentFile.content
  const showEditorCode =
    selectedFileName && editedFiles[selectedFileName]
      ? editedFiles[selectedFileName].content
      : currentFile?.content;

  const previewFileMap = useMemo(() => toFileMap(final), [final]);

  const handleUnSavedChanges = (isSave: boolean) => {
    setHasUnsavedChanges(isSave)
    onUnsaveChange?.(isSave)
  }

  // 处理 auto fix 前的拦截
  const handleAutoFix = useCallback((error: Error) => {
    if (hasUnsavedChanges) {
      toast.warning("请先保存更改后再进行自动修复", {
        position: "top-center",
      });
      return;
    }
    onError?.(error);
  }, [hasUnsavedChanges, onError]);

  // 处理代码变化
  const handleCodeChange = (newCode: string) => {
    if (!selectedFileName || !final || isStageRunning) return;

    setEditedFiles(prev => ({
      ...prev,
      [selectedFileName]: {
        ...final[selectedFileName],
        content: newCode,
      },
    }));
    handleUnSavedChanges(true);
  };

  // 处理保存
  const handleSave = () => {
    if (!hasUnsavedChanges || !final) return;

    // 合并 final 和 editedFiles
    const mergedFiles: GenerateCodeOutput = {
      ...final,
      ...editedFiles,
    };

    updateStage(mergedFiles);
    setEditedFiles({});
    handleUnSavedChanges(false);
  };

  return (
    <motion.div
      className="grid grid-rows-[50px_1fr] opacity-0"
      style={{
        gridTemplateColumns: showPreview ? "240px 1fr 1fr" : "240px 1fr",
        height: "calc(100vh - 120px)",
      }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <header className="col-span-full bg-emerald-950/40 border-b border-emerald-500/20 backdrop-blur-md flex items-center justify-between px-5 transition-all duration-200">
        <span className="font-bold tracking-wide bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
          AI Compoder<span className="text-emerald-400">.IDE</span>
        </span>
        {useMemo(() => <UsagePanel pipelineName={pipelineName} />, [pipelineName])}
      </header>

      {/* Sidebar */}
      <EditorSidebar
        fileNames={sidebarFileNames}
        activeFileName={selectedFileName}
        onFileSelect={name => setSelectedFileName(name as GeneratedFileName)}
        disabled={isStageRunning}
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={handleSave}
      />

      {/* Editor */}
      <CodeEditor
        code={showEditorCode}
        filename={currentFile?.fileName}
        readOnly={isStageRunning}
        onChange={handleCodeChange}
      />

      {/* Preview with slide-in animation */}
      {useMemo(
        () => (
          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <PreviewPanel
                  fileMap={previewFileMap}
                  entryFile="App.tsx"
                  className="h-full"
                  onAutoFix={handleAutoFix}
                />
              </motion.div>
            )}
          </AnimatePresence>
        ),
        [showPreview, previewFileMap, handleAutoFix]
      )}
    </motion.div>
  );
};
