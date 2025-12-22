"use client";

import { motion } from "framer-motion";
import { PipelineRegistry } from "@/lib/store/pipeline/types";

type StageOutput = PipelineRegistry["business-code-generate"]["stage-1"];

interface StageOutputDisplayProps {
  output: StageOutput;
}

export const StageOutputDisplay: React.FC<StageOutputDisplayProps> = ({ output }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border border-emerald-500/20 rounded-lg p-4"
    >
      <div className="text-emerald-400 font-semibold text-xs mb-3 flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        开始设计组件：
      </div>
      <div className="text-gray-300 text-xs leading-relaxed font-sans whitespace-pre-wrap">
        {output}
      </div>
    </motion.div>
  );
};
