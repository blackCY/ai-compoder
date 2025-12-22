"use client";

import { motion } from "framer-motion";
import { CodeEditor } from "@/components/biz/CodeEditor";
import { PreviewPanel } from "@/components/biz/PreviewPanel";
import { EditorSidebar } from "./EditorSidebar";
import { useState, useMemo, useEffect } from "react";
import { usePipelineStage } from "@/lib/store/pipeline/hooks";
import type { GeneratedFileName } from "@/lib/store/pipeline/types";

export const EditorLayout: React.FC = () => {
  const [selectedFileName, setSelectedFileName] = useState<GeneratedFileName | null>(null);
  const { final, snapshot, status } = usePipelineStage("business-code-generate", "stage-2");

  const filesMap = snapshot || {};

  // 判断 stage-2 是否正在运行
  const isStageRunning = status === "running";

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

  // 当前显示的文件
  const currentFilesMap = isStageRunning ? snapshot : final;
  const currentFile =
    selectedFileName && currentFilesMap?.[selectedFileName]
      ? { fileName: selectedFileName, ...currentFilesMap[selectedFileName] }
      : null;

  // 侧边栏显示的文件名列表
  const sidebarFileNames = final
    ? Object.keys(final)
    : Object.keys(snapshot || {});

  const previewContent = useMemo(() => {
    if (!final) return null;
    return <PreviewPanel />;
  }, [final]);

  return (
    <motion.div
      className="grid grid-rows-[50px_1fr] grid-cols-[240px_1fr_1fr] h-screen opacity-0"
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <header className="col-span-full bg-[#111216] border-b border-[#23252b] flex items-center px-5 font-bold tracking-wide">
        AI Compoder<span className="text-[#ffbe0b]">.IDE</span>
      </header>

      {/* Sidebar */}
      <EditorSidebar
        fileNames={sidebarFileNames}
        activeFileName={selectedFileName}
        onFileSelect={name => setSelectedFileName(name as GeneratedFileName)}
        disabled={isStageRunning}
      />

      {/* Editor */}
      <CodeEditor
        code={currentFile?.content}
        filename={currentFile?.fileName}
        autoScroll={isStageRunning}
      />

      {/* Preview */}
      {previewContent}
    </motion.div>
  );
};
