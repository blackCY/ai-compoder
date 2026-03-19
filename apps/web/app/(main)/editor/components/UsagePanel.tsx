"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, X } from "lucide-react";
import { usePipelineState } from "lib/store/pipeline/hooks";
import { useOnClickOutside } from "lib/hooks/useOnClickOutside";
import { PipelineId } from "lib/store/pipeline/types";

// LocalStorage key for hint dismissal
const HINT_DISMISSED_KEY = "usage-panel-hint-dismissed";

/** 格式化数字：超过 1000 显示为 k 单位，保留 2 位小数以提高精度 */
function formatNumber(num: number | undefined): string {
  if (num === undefined || num === 0) return "0";
  if (num < 1000) return num.toString();
  return `${(num / 1000).toFixed(2)}k`;
}

export function UsagePanel({ pipelineName }: { pipelineName: PipelineId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { usages = {}, isRunning } = usePipelineState(pipelineName);

  // 检查用户是否已关闭过提示
  useEffect(() => {
    const hasDismissed = localStorage.getItem(HINT_DISMISSED_KEY);
    if (!hasDismissed) {
      setShowHint(true);
    }
  }, []);

  // 关闭提示并记住用户选择
  const dismissHint = () => {
    setShowHint(false);
    localStorage.setItem(HINT_DISMISSED_KEY, "true");
  };

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
    <div ref={panelRef} className="relative flex items-center">
      {/* 气泡提示 */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.9 }}
            animate={{
              opacity: 1,
              x: [0, -5, 0],
              scale: 1,
            }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            transition={{
              opacity: { duration: 0.2, ease: "easeOut" },
              x: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              },
              scale: { duration: 0.2, ease: "easeOut" },
            }}
            className="absolute right-full mr-2 px-3 py-1.5 bg-[#1a1b1e] border border-amber-400/60 rounded-md shadow-[0_0_12px_rgba(251,191,36,0.4),inset_0_0_12px_rgba(251,191,36,0.1)] z-[1002] flex items-center gap-2 whitespace-nowrap"
          >
            <span className="text-xs text-[#c1c2c5]">查看 Token 消耗统计</span>
            <button
              onClick={dismissHint}
              className="p-0.5 rounded hover:bg-[#2a2d33] transition-colors text-[#6b6d74] hover:text-[#8b8d94] flex-shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
            {/* 小三角指向右侧 */}
            <div className="absolute top-1/2 -right-1 w-2 h-2 bg-[#1a1b1e] border-r border-t border-amber-400/60 shadow-[2px_-2px_6px_rgba(251,191,36,0.3)] transform -translate-y-1/2 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

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
            className="absolute right-0 top-full mt-2 w-80 bg-[#1a1b1e] border border-[#23252b] rounded-lg p-4 shadow-xl z-[1001]"
          >
            <h3 className="text-sm font-medium mb-3 text-[#c1c2c5]">Token 用量消耗</h3>

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
                          <span>└ 子阶段 #{i + 1}</span>
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
                <span className="text-[#8b8d94]">总计</span>
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
