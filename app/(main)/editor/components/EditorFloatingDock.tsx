"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { FloatingDock } from "@/components/biz/FloatingDock";
import { usePipeline, usePipelineState } from "@/lib/store/pipeline";
import { EditorTerminalOutput } from "./EditorTerminalOutput";

export interface EditorFloatingDockRef {
  generate: (input: string) => Promise<void>;
}

export interface EditorFloatingDockProps {
  disabled?: boolean;
}

export const EditorFloatingDock = forwardRef<EditorFloatingDockRef, EditorFloatingDockProps>(
  ({ disabled = false }, ref) => {
  const { run } = usePipeline("business-code-generate");
  const { isRunning } = usePipelineState("business-code-generate");
  const [showTerminal, setShowTerminal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleGenerate = async (input: string) => {
    setShowTerminal(true);
    setIsCollapsed(false); // 开始新任务时展开
    await run(input, {
      onFinal: data => {
        if (data.id === "stage-1") {
          setIsCollapsed(true);
        }
      },
    });
  };

  useImperativeHandle(ref, () => ({
    generate: handleGenerate,
  }));

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
      disabled={isRunning || disabled}
      placeholder="例如：创建一个响应式的用户配置文件卡片组件"
    />
  );
});

EditorFloatingDock.displayName = "EditorFloatingDock";
