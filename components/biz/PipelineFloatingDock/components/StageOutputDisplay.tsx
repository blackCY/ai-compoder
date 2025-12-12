"use client";

import { motion } from "framer-motion";
import { PipelineRegistry } from "@/lib/store/pipeline/types";

type StageOutput = PipelineRegistry["business-code-generate"]["stage-1"];

interface StageOutputDisplayProps {
  output: StageOutput;
}

export const StageOutputDisplay: React.FC<StageOutputDisplayProps> = ({ output }) => {
  return (
    <div className="space-y-3">
      {/* Analysis Section */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border border-emerald-500/20 rounded-lg p-3"
      >
        <div className="text-emerald-400 font-semibold text-xs mb-2 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Analysis
        </div>
        <p className="text-gray-300 text-xs leading-relaxed font-sans">{output.analysis}</p>
      </motion.div>

      {/* Selected Components Section */}

      <div className="space-y-2">
        {output.selectedComponents?.map((component, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
            className="bg-gradient-to-br from-gray-800/40 to-gray-800/20 border border-gray-700/40 rounded-lg p-3 hover:border-emerald-500/30 hover:from-gray-800/50 hover:to-gray-800/30 transition-all"
          >
            {/* Component Name */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-yellow-400 font-mono font-semibold text-sm">
                {component.name}
              </span>
            </div>

            {/* Component Description */}
            <div className="mb-2">
              <p className="text-gray-300 text-xs leading-relaxed font-sans">
                {component.description}
              </p>
            </div>

            {/* Component API */}
            <div className="bg-gray-900/60 border border-gray-700/30 rounded p-2">
              <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide">API</div>
              <pre className="text-[11px] text-green-400/90 leading-relaxed whitespace-pre-wrap break-words font-mono">
                {component.api}
              </pre>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
