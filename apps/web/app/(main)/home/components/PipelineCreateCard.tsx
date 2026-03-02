"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { PipelineCreateDialog } from "./PipelineCreateDialog";

interface PipelineCreateCardProps {
  index: number;
}

export const PipelineCreateCard = ({ index }: PipelineCreateCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        whileHover={{ y: -5 }}
        className="group relative h-full cursor-pointer"
        onClick={() => setIsDialogOpen(true)}
      >
        <div className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-white/10 bg-white/5 p-8 transition-all duration-300 hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.2)]">
          {/* Background Gradient Blob */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* Icon */}
          <div className="mb-6 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-gray-400 ring-1 ring-inset ring-white/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 group-hover:ring-emerald-500/20">
            <Plus className="h-8 w-8" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center">
            <h3 className="mb-2 text-xl font-bold tracking-tight text-white transition-colors group-hover:text-emerald-400">
              创建新 pipeline
            </h3>
            <p className="text-center text-sm leading-relaxed text-gray-500 transition-colors group-hover:text-emerald-400/70">
              定义新的 AI 生成流程与能力
            </p>
          </div>
        </div>
      </motion.div>

      <PipelineCreateDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
    </>
  );
};
