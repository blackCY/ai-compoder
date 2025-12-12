"use client";

import { motion } from "framer-motion";
import { CodeEditor } from "@/components/biz/CodeEditor";
import { PreviewPanel } from "@/components/biz/PreviewPanel";
import { EditorSidebar } from "./EditorSidebar";

export const EditorLayout: React.FC = () => {
  return (
    <motion.div
      className="grid grid-rows-[50px_1fr] grid-cols-[240px_1fr_1fr] h-screen opacity-0"
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <header className="col-span-full bg-[#111216] border-b border-[#23252b] flex items-center px-5 font-bold tracking-wide">
        NEXUS<span className="text-[#ffbe0b]">.IDE</span>
      </header>

      {/* Sidebar */}
      <EditorSidebar />

      {/* Editor */}
      <CodeEditor />

      {/* Preview */}
      <PreviewPanel />
    </motion.div>
  );
};
