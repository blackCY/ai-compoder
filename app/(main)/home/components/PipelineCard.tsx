"use client";

import { motion } from "framer-motion";
import { Play, Settings, Sparkles } from "lucide-react";
import { Link } from "next-view-transitions";
import { Pipeline } from "@/lib/services/pipeline/types";

interface PipelineCardProps {
  pipeline: Pipeline;
  index: number;
}

export const PipelineCard = ({ pipeline, index }: PipelineCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="group relative h-full"
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]">
        {/* Background Gradient Blob */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl transition-all duration-500 group-hover:bg-emerald-500/20" />

        {/* Icon */}
        <div className="mb-6 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 ring-1 ring-inset ring-emerald-500/20 transition-all duration-300 group-hover:scale-110 group-hover:text-emerald-300">
          <Sparkles className="h-6 w-6" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-1 flex-col">
          <h3 className="mb-3 text-xl font-bold tracking-tight text-white transition-colors">
            {pipeline.name}
          </h3>
          
          <p className="mb-8 flex-grow text-sm leading-relaxed text-gray-400 transition-colors">
            {pipeline.description}
          </p>

          {/* Tag */}
          <div className="mb-4">
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
              AI Native
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 border-t border-white/5 pt-4">
            <Link
              href={`/editor?id=${pipeline.id}&name=${pipeline.name}`}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20"
            >
              <Play className="h-4 w-4" />
              Experience
            </Link>
            
            <Link
              href={`/configuration/${pipeline.id}`}
              className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-300 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              <Settings className="h-4 w-4" />
              Configure
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
