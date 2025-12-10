"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ShineBorder } from "@/components/ui/shine-border";
import { CodeDisplay } from "./components/CodeDisplay";
import { ChatInterfaceProps } from "./types";
import { generateExamplePrompts } from "./utils";
import { usePipeline, usePipelineState } from "@/lib/store/pipeline";
import { Zap, Loader2 } from "lucide-react";

type PipelineTypeId = 'pipeline_a' | 'pipeline_b' | 'pipeline_c';

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  className,
  showExamples = true,
  onGenerate,
  ...props
}) => {
  const { run } = usePipeline();
  // 只关注运行状态，不再直接订阅 completion，交给子组件处理
  const { isRunning } = usePipelineState();

  const [hasGenerated, setHasGenerated] = useState(false);
  const [input, setInput] = useState("");

  const handleGenerateCode = async () => {
    if (!input.trim()) return;

    if (!hasGenerated) {
      setHasGenerated(true);
    }

    onGenerate?.(input);
    setInput("");

    // 运行业务代码生成 pipeline
    await run(input, "business-code-generate");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" && !e.shiftKey) || (e.key === "Enter" && e.ctrlKey)) {
      e.preventDefault();
      handleGenerateCode();
    }
  };

  return (
    <div className={cn("w-full max-w-5xl mx-auto space-y-6", className)} {...props}>
      {/* 代码展示区域 */}
      <CodeDisplay />

      {/* 输入框和按钮 */}
      <div className="relative group max-w-2xl mx-auto">
        <div className="relative">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="例如：创建一个响应式的用户配置文件卡片组件，包含头像、姓名、邮箱和编辑功能..."
            disabled={isRunning}
            className="min-h-[120px] resize-none pr-24 text-white placeholder-gray-400 bg-slate-900/95 backdrop-blur-md border-2 border-slate-700/80 rounded-2xl focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 hover:bg-slate-900/98 hover:border-slate-600/80"
            rows={4}
          />

          {/* 动态光束效果 - 沿着输入框边框流动 */}
          {isRunning && (
            <ShineBorder
              borderWidth={2}
              duration={14}
              shineColor={["#10b981", "#3b82f6"]}
              className="rounded-2xl"
            />
          )}

          <Button
            onClick={handleGenerateCode}
            disabled={isRunning}
            className="absolute bottom-3 right-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium px-4 py-2 rounded-lg shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform-optimized hover:scale-105 active:scale-95 min-touch-target border border-emerald-500/30"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                生成中
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                生成代码
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 示例提示 */}
      {showExamples && !hasGenerated && (
        <div className="max-w-2xl mx-auto">
          <div
            className={cn(
              "flex flex-wrap items-center justify-center gap-2 transition-all duration-500"
            )}
          >
            <span className="text-sm text-gray-500">快速开始：</span>
            {generateExamplePrompts().map(example => (
              <button
                key={example}
                onClick={() => setInput(example)}
                disabled={isRunning}
                className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-gray-400 hover:bg-slate-700/50 hover:text-white hover:border-emerald-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform-optimized hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/20 min-touch-target"
              >
                {example}
              </button>
            ))}
          </div>

          {/* 快捷键提示 */}
          <div className="mt-5 text-center">
            <span className="text-xs text-gray-500">
              按{" "}
              <kbd className="px-2 py-1 bg-slate-800/50 border border-slate-700/50 rounded text-gray-400 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                Ctrl + Enter
              </kbd>{" "}
              快速生成
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

ChatInterface.displayName = "ChatInterface";
