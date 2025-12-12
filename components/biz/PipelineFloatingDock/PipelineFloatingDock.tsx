"use client";

import { useState } from "react";
import { FloatingDock } from "@/components/biz/FloatingDock";
import { usePipeline, usePipelineState } from "@/lib/store/pipeline";
import { PipelineTerminalOutput } from "./components/PipelineTerminalOutput";
import { PipelineFloatingDockProps } from "./types";

export const PipelineFloatingDock: React.FC<PipelineFloatingDockProps> = ({
  pipelineId,
  placeholder = "例如：创建一个响应式的用户配置文件卡片组件，包含头像、姓名、邮箱和编辑功能...",
  className,
}) => {
  const { run } = usePipeline();
  const { isRunning } = usePipelineState();
  const [showTerminal, setShowTerminal] = useState(false);

  const handleGenerate = async (input: string) => {
    setShowTerminal(true);
    await run(input, pipelineId);
  };

  return (
    <FloatingDock
      onGenerate={handleGenerate}
      terminalOutput={<PipelineTerminalOutput isVisible={showTerminal} pipelineId={pipelineId} />}
      disabled={isRunning}
      placeholder={placeholder}
      className={className}
    />
  );
};
