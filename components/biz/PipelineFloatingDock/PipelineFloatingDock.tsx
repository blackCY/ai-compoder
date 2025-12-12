"use client";

import { useState } from "react";
import { FloatingDock } from "@/components/biz/FloatingDock";
import { usePipeline, usePipelineMeta } from "@/lib/store/pipeline";
import { PipelineTerminalOutput } from "./components/PipelineTerminalOutput";
import { PipelineFloatingDockProps } from "./types";

export const PipelineFloatingDock: React.FC<PipelineFloatingDockProps> = ({
  pipelineId,
  placeholder = "例如：创建一个响应式的用户配置文件卡片组件，包含头像、姓名、邮箱和编辑功能...",
  className,
}) => {
  const { run } = usePipeline(pipelineId);
  const { isRunning } = usePipelineMeta(pipelineId);
  const [showTerminal, setShowTerminal] = useState(false);

  const handleGenerate = async (input: string) => {
    setShowTerminal(true);
    await run(input);
  };

  return (
    <FloatingDock
      onGenerate={handleGenerate}
      terminalOutput={
        <PipelineTerminalOutput
          isVisible={showTerminal}
          pipelineId={pipelineId}
          stageId="stage-1"
        />
      }
      disabled={isRunning}
      placeholder={placeholder}
      className={className}
    />
  );
};
