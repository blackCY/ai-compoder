import { Card, CardContent } from "@/components/ui/card";
import { MatrixBackground } from "./matrix-background";
import { Terminal } from "lucide-react";

interface CodeDisplayProps {
  code: string;
  isGenerating: boolean;
  prompt: string;
}

export function CodeDisplay({ code, isGenerating, prompt }: CodeDisplayProps) {
  if (!code && !isGenerating) {
    return null;
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-emerald-500/20 shadow-2xl shadow-emerald-500/10 transition-all duration-300 hover:shadow-emerald-500/20 will-change-transform">
      {/* Matrix background - only when not generating for better performance */}
      {!isGenerating && (
        <div className="absolute inset-0 bg-black opacity-40">
          <MatrixBackground />
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5"></div>

      {/* Content */}
      <CardContent className="relative p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-emerald-500/20 bg-slate-900/90 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            {isGenerating && (
              <div className="flex items-center space-x-2 ml-2">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce-optimized will-change-transform"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce-optimized will-change-transform" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce-optimized will-change-transform" style={{ animationDelay: "0.2s" }}></div>
                </div>
                <span className="text-emerald-400 text-xs font-medium">Generating...</span>
              </div>
            )}
          </div>
        </div>

        {/* Code display area - Fixed height with auto-scroll */}
        <div className="relative h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500/30 scrollbar-track-transparent">
          {isGenerating && !code && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/95 z-10">
              <div className="text-center space-y-5 px-4">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse-optimized will-change-opacity"></div>
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse-optimized will-change-opacity" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse-optimized will-change-opacity" style={{ animationDelay: "0.4s" }}></div>
                </div>
                <p className="text-emerald-400 font-mono text-base font-medium">AI is crafting your code...</p>
                <p className="text-gray-400 text-sm max-w-md">"{prompt}"</p>
              </div>
            </div>
          )}

          {code && (
            <div className="p-6">
              <code className="font-mono text-sm text-emerald-300 leading-relaxed block">{code}</code>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
