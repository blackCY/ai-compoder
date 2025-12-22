"use client";

import { useState, useEffect } from "react";
import { FloatingDock } from "@/components/biz/FloatingDock";
import { usePipeline, usePipelineState } from "@/lib/store/pipeline";
import { EditorTerminalOutput } from "./EditorTerminalOutput";

export const EditorFloatingDock: React.FC = () => {
  const { run } = usePipeline("business-code-generate");
  const { currentStage, isRunning } = usePipelineState("business-code-generate");
  const [showTerminal, setShowTerminal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 当 currentStage 不是 stage-1 时，自动收起
  useEffect(() => {
    if (currentStage && currentStage !== "stage-1") {
      setIsCollapsed(true);
    }
  }, [currentStage]);

  const handleGenerate = async (input: string) => {
    setShowTerminal(true);
    setIsCollapsed(false); // 开始新任务时展开
    await run(input);
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <FloatingDock
      onGenerate={handleGenerate}
      terminalOutput={
        <EditorTerminalOutput
          isVisible={showTerminal}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      }
      disabled={isRunning}
      placeholder="例如：创建一个响应式的用户配置文件卡片组件，包含头像、姓名、邮箱和编辑功能..."
    />
  );
};
