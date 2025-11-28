import { Card, CardContent } from "@/components/ui/card";
import { MatrixBackground } from "./MatrixBackground";
import { useEffect, useRef, useState } from "react";

interface CodeDisplayProps {
  code: string;
  isGenerating: boolean;
}

export function CodeDisplay({ code, isGenerating }: CodeDisplayProps) {
  const [autoScroll, setAutoScroll] = useState(false);
  const codeRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (autoScroll && codeRef.current) {
      codeRef.current.scrollTop = codeRef.current.scrollHeight;
    }
  }, [code, autoScroll]);

  // 开始生成时启用自动滚动
  useEffect(() => {
    if (isGenerating) {
      setAutoScroll(true);
    }
  }, [isGenerating]);

  // 生成完成后停止自动滚动
  useEffect(() => {
    if (!isGenerating && autoScroll) {
      // 生成完成后稍等一下再停止自动滚动
      const timer = setTimeout(() => setAutoScroll(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isGenerating, autoScroll]);

  if (!code && !isGenerating) {
    return null;
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-emerald-500/20 shadow-2xl shadow-emerald-500/10 transition-all duration-700 hover:shadow-emerald-500/20 will-change-transform w-[80%] max-w-2xl mx-auto animate-slide-up will-change-transform">
      {/* Matrix background - only when not generating for better performance */}

      <div className="absolute inset-0 bg-black opacity-40">
        <MatrixBackground />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5"></div>

      {/* Content */}
      <CardContent className="relative p-0">
        {/* Code display area - Reduced height with auto-scroll */}
        <div ref={codeRef} className="relative h-[280px] overflow-y-auto scrollbar-hide">
          {isGenerating && !code && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center space-y-5 px-4">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse-optimized will-change-opacity"></div>
                  <div
                    className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse-optimized will-change-opacity"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse-optimized will-change-opacity"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>

                <p className="text-emerald-400 font-mono text-base font-medium">
                  AI is crafting your code...
                </p>
              </div>
            </div>
          )}

          {code && (
            <div className="p-6">
              <code className="font-mono text-sm text-emerald-300 leading-relaxed block">
                {code}
              </code>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
