"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { FloatingDock } from "lib/bizComp/FloatingDock";
import { usePipeline, usePipelineState } from "lib/store/pipeline";
import { PipelineId } from "lib/store/pipeline/types";
import { EditorTerminalOutput } from "./EditorTerminalOutput";

export interface EditorFloatingDockRef {
  generate: (input: string) => Promise<void>;
}

export interface EditorFloatingDockProps {
  pipelineName: PipelineId;
  pipelineId: string;
  disabled?: boolean;
  placeholder?: string;
}

export const EditorFloatingDock = forwardRef<EditorFloatingDockRef, EditorFloatingDockProps>(
  ({ pipelineId, pipelineName, disabled = false, placeholder = "输入需求，例如“创建一个登录页面组件“" }, ref) => {
    const { run } = usePipeline(pipelineName, pipelineId);
    const { isRunning } = usePipelineState(pipelineName);
    const [showTerminal, setShowTerminal] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleGenerate = async (input: string) => {
      setShowTerminal(true);
      setIsCollapsed(false); // 开始新任务时展开
      await run(input, {
        onFinal: data => {
          if (data.id === "design-code") {
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
            pipelineName={pipelineName}
          />
        }
        disabled={isRunning || disabled}
        placeholder={placeholder}
      />
    );
  }
);

EditorFloatingDock.displayName = "EditorFloatingDock";
