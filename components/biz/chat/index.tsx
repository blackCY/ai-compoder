"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ShineBorder } from "@/components/ui/shine-border";
import { CodeDisplay } from "./components/CodeDisplay";
import { Zap, Loader2 } from "lucide-react";
import { useCompletion } from "@ai-sdk/react";
import { useState } from "react";

interface ChatProps {
  showExamples?: boolean;
  onGenerate?: (input: string) => void;
}

export function Chat({ showExamples = true, onGenerate }: ChatProps) {
  const [prevCompletion, setPrevCompletion] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const { completion, handleSubmit, input, handleInputChange, isLoading, setInput } = useCompletion(
    {
      api: "/api/generate",
      body: {
        user: {
          // 把上一轮生成的代码给带过去
          completion: prevCompletion,
        },
      },
      onFinish(_prompt, completion) {
        setPrevCompletion(completion);
      },
    }
  );

  /** 生成代码 */
  const handleGenerate = async () => {
    if (!input.trim() || isLoading) return;

    !hasGenerated && setHasGenerated(true);
    // 执行回调函数
    onGenerate?.(input);
    // 清空输入框
    setInput("");

    handleSubmit();
  };

  /** 处理键盘快捷键 */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" && !e.shiftKey) || (e.key === "Enter" && e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* 代码展示区域 */}
      <CodeDisplay code={completion} isGenerating={isLoading} />

      {/* 输入框和按钮 */}
      <div className="relative group max-w-2xl mx-auto">
        <div className="relative">
          <Textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="例如：创建一个响应式的用户配置文件卡片组件，包含头像、姓名、邮箱和编辑功能..."
            disabled={isLoading}
            className="min-h-[120px] resize-none pr-24 text-white placeholder-gray-400 bg-slate-900/95 backdrop-blur-md border-2 border-slate-700/80 rounded-2xl focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 hover:bg-slate-900/98 hover:border-slate-600/80"
            rows={4}
          />

          {/* 动态光束效果 - 沿着输入框边框流动 */}
          {isLoading && (
            <ShineBorder
              borderWidth={2}
              duration={14}
              shineColor={["#10b981", "#3b82f6"]}
              className="rounded-2xl"
            />
          )}

          <Button
            onClick={handleGenerate}
            disabled={!input.trim() || isLoading}
            className="absolute bottom-3 right-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium px-4 py-2 rounded-lg shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform-optimized hover:scale-105 active:scale-95 min-touch-target border border-emerald-500/30"
          >
            {isLoading ? (
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
            className={`flex flex-wrap items-center justify-center gap-2 transition-all duration-500`}
          >
            <span className="text-sm text-gray-500">快速开始：</span>
            {["React 用户卡片", "数据表格组件", "自定义 Hook", "表单验证逻辑"].map(example => (
              <button
                key={example}
                onClick={() => {
                  setInput(example);
                }}
                disabled={isLoading}
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
}
