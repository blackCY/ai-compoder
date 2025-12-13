"use client";

import { motion } from "framer-motion";
import { CodeEditor } from "@/components/biz/CodeEditor";
import { PreviewPanel } from "@/components/biz/PreviewPanel";
import { EditorSidebar } from "./EditorSidebar";
import { useState, useMemo, useEffect } from "react";
import { useStage } from "@/lib/store/pipeline/hooks";

export const EditorLayout: React.FC = () => {
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const { final, snapshot } = useStage("business-code-generate", "stage-2");

  const files = snapshot?.files || [];

  // Derive currentFile from selectedFileName - automatically syncs with streaming updates
  const currentFile = useMemo(() => {
    if (!selectedFileName || files.length === 0) return files[0] || null;

    return files.find(f => f.fileName === selectedFileName) || files[0];
  }, [files, selectedFileName]);

  // Auto-select first file when files are loaded
  useEffect(() => {
    if (!selectedFileName && currentFile) {
      setSelectedFileName(currentFile.fileName)
    }
  }, [currentFile, selectedFileName]);

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
        fileNames={files.map(file => file.fileName)}
        currentFileName={selectedFileName}
        onFileSelect={setSelectedFileName}
      />

      {/* Editor */}
      <CodeEditor code={currentFile?.content} filename={currentFile?.fileName} />

      {/* Preview */}
      {previewContent}
    </motion.div>
  );
};
