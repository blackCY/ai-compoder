"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins } from "lucide-react";
import { usePipelineState } from "lib/store/pipeline/hooks";
import { useOnClickOutside } from "lib/hooks/useOnClickOutside";
import { PipelineId } from "lib/store/pipeline/types";

/** 格式化数字：超过 1000 显示为 k 单位，保留 2 位小数以提高精度 */
function formatNumber(num: number | undefined): string {
  if (num === undefined || num === 0) return "0";
  if (num < 1000) return num.toString();
  return `${(num / 1000).toFixed(2)}k`;
}

export function UsagePanel({ pipelineName }: { pipelineName: PipelineId }) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { usages = {}, isRunning } = usePipelineState(pipelineName);

  const total = useMemo(() => {
    return Object.values(usages).reduce(
      (acc, usage) => ({
        inputTokens: (acc.inputTokens ?? 0) + (usage?.inputTokens ?? 0),
        outputTokens: (acc.outputTokens ?? 0) + (usage?.outputTokens ?? 0),
        totalTokens: (acc.totalTokens ?? 0) + (usage?.totalTokens ?? 0),
      }),
      { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
    );
  }, [usages]);

  // 点击外部关闭
  useOnClickOutside(panelRef, () => setIsOpen(false), isOpen);

  // 新一轮开始时自动收起
  useEffect(() => {
    if (isRunning) {
      setIsOpen(false);
    }
  }, [isRunning]);

  // 任务未完成时默认隐藏
  const hasData = !isRunning && Object.keys(usages).length > 0;
  if (!hasData) return null;

  return (
    <div ref={panelRef} className="relative">
      {/* 图标 + 徽章按钮 */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1a1b1e] hover:bg-[#23252b] transition-colors"
      >
        <Coins className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-medium text-[#8b8d94]">
          {formatNumber(total.totalTokens)}
        </span>
      </motion.button>

      {/* 浮窗 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-[#1a1b1e] border border-[#23252b] rounded-lg p-4 shadow-xl z-50"
          >
            <h3 className="text-sm font-medium mb-3 text-[#c1c2c5]">Token Usage</h3>

            {/* 各阶段详情 */}
            {Object.entries(usages).map(([stageId, usage]) => (
              <div key={stageId} className="mb-3 text-xs">
                {/* Stage 名称 + 总计 */}
                <div className="flex justify-between items-center text-[#c1c2c5] mb-1">
                  <span className="font-medium">{stageId} Stage</span>
                  <span className="text-amber-400 font-semibold">
                    {formatNumber(usage.totalTokens)}
                  </span>
                </div>
                {/* Stage 的输入输出详情 */}
                <div className="ml-2 text-[#6b6d74] mb-1">
                  <div className="flex justify-between">
                    <span>Input:</span>
                    <span>{formatNumber(usage.inputTokens)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Output:</span>
                    <span>{formatNumber(usage.outputTokens)}</span>
                  </div>
                </div>
                {/* Sub-calls 详情 */}
                {usage.childrenUsages && usage.childrenUsages.length > 0 && (
                  <div className="ml-3 mt-1">
                    {usage.childrenUsages.map((child, i) => (
                      <div key={i} className="text-[#6b6d74] mb-1">
                        <div className="flex justify-between items-center">
                          <span>└ sub-call #{i + 1}</span>
                          <span className="text-[#8b8d94]">{formatNumber(child.totalTokens)}</span>
                        </div>
                        <div className="ml-4 flex justify-between">
                          <span>Input:</span>
                          <span>{formatNumber(child.inputTokens)}</span>
                        </div>
                        <div className="ml-4 flex justify-between">
                          <span>Output:</span>
                          <span>{formatNumber(child.outputTokens)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* 总计 */}
            <div className="border-t border-[#23252b] pt-3 mt-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#8b8d94]">Total</span>
                <span className="text-emerald-400 font-medium">
                  {formatNumber(total.totalTokens)}
                </span>
              </div>
              <div className="text-xs text-[#6b6d74] mt-1 flex justify-between">
                <span>Input: {formatNumber(total.inputTokens)}</span>
                <span>Output: {formatNumber(total.outputTokens)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
