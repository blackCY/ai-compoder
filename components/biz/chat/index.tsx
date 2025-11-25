"use client";

import { Button } from "@/components/ui/button";
import { CodeDisplay } from "./code-display";
import { Terminal, Zap, Loader2 } from "lucide-react";
import { useCompletion } from "@ai-sdk/react";
import { useState } from "react";

export function ChatComponent() {
  const [prevCompletion, setPrevCompletion] = useState("");
  const { completion, handleSubmit, input, handleInputChange, isLoading, setInput } = useCompletion({
    api: "/api/generate",
    body: {
      user: {
        // 把上一轮生成的代码给带过去
        completion: prevCompletion,
      },
    },
    onFinish(prompt, completion) {
      setPrevCompletion(completion);
    },
  });

  /** 生成代码 */
  const handleGenerate = async () => {
    if (!input.trim() || isLoading) return;

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
      <CodeDisplay code={completion} isGenerating={isLoading} prompt={input} />

      {/* 输入区域 */}
      {!completion && !isLoading && (
        <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl transition-all duration-300 hover:border-emerald-500/30 transform-optimized">
          {/* 背景装饰 - 情境感知动画 */}
          <div className={`absolute inset-0 transition-opacity duration-1000`}>
            <div className={`absolute top-0 left-1/4 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl transition-all duration-2000 will-change-transform animate-breathing`}></div>
            <div className={`absolute bottom-0 right-1/4 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl transition-all duration-2000 will-change-transform animate-breathing`} style={{ animationDelay: "3s" }}></div>
          </div>

          {/* 顶部光晕 */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>

          <div className="relative p-6 sm:p-8 lg:p-12">
            <div className={`text-center mb-12 transition-all duration-700`}>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl mb-6 shadow-lg shadow-emerald-500/30 transform-optimized hover:scale-105">
                <Terminal className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">AI 代码生成器</h3>
              <p className="text-gray-400 text-base">描述你的需求，让 AI 为你生成专业代码</p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="relative group focus-within:ring-2 focus-within:ring-emerald-500/50 focus-within:rounded-xl transition-all duration-200">
                <textarea
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="例如：创建一个响应式的用户配置文件卡片组件，包含头像、姓名、邮箱和编辑功能..."
                  disabled={isLoading}
                  className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200 resize-none text-base leading-relaxed backdrop-blur-sm hover:bg-slate-800/70 focus:outline-none"
                  rows={4}
                  aria-label="代码生成描述"
                  aria-describedby="input-description"
                />

                <Button onClick={handleGenerate} disabled={!input.trim() || isLoading} className="absolute bottom-3 right-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium px-6 py-2.5 rounded-lg shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform-optimized hover:scale-105 active:scale-95 min-touch-target">
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

              {/* 示例提示 */}
              <div className={`mt-6 flex flex-wrap items-center justify-center gap-2 transition-all duration-500`}>
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
              <div className="mt-5 text-center" id="input-description">
                <span className="text-xs text-gray-500">
                  按 <kbd className="px-2 py-1 bg-slate-800/50 border border-slate-700/50 rounded text-gray-400 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50">Ctrl + Enter</kbd> 快速生成
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
