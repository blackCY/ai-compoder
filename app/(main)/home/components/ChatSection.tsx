"use client";

import { useState } from "react";
import { useTransitionRouter } from "next-view-transitions";
import { toast } from "sonner";
import { FloatingDock } from "@/components/biz/FloatingDock";
import { usePipeline, usePipelineMeta } from "@/lib/store/pipeline";
import { HomeTerminalOutput } from "./HomeTerminalOutput";

export const ChatSection = () => {
  const router = useTransitionRouter();
  const { run } = usePipeline("business-code-generate");
  const { isRunning } = usePipelineMeta("business-code-generate");
  const [showTerminal, setShowTerminal] = useState(false);

  const handleGenerate = async (input: string) => {
    setShowTerminal(true);
    await run(input, {
      onFinal: data => {
        if (data.id === "stage-1") {
          toast.success("完成组件设计，即将开始生成组件...", {
            position: "top-center",
          });
          setTimeout(() => {
            router.push("/editor");
          }, 1000);
        }
      },
    });
  };

  return (
    <section id="chat" className="py-24 pb-32 relative min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-32">
          <h2
            className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-emerald-400 mb-6 animate-fade-in-scale opacity-0"
            style={{ animationDelay: "0.6s" }}
          >
            开始体验
          </h2>
        </div>

        <div className="animate-fade-in-scale opacity-0 relative" style={{ animationDelay: "1s" }}>
          <div className="relative z-10">
            <FloatingDock
              onGenerate={handleGenerate}
              terminalOutput={<HomeTerminalOutput isVisible={showTerminal} />}
              disabled={isRunning}
              placeholder="例如：创建一个用户登录表单，包含邮箱、密码输入框和记住我选项..."
              className="!static !bottom-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
