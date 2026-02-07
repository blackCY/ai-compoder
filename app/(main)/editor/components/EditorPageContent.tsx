"use client";

import { useRef, useState } from "react";
import { EditorLayout, EditorFloatingDock } from "./index";
import type { EditorFloatingDockRef } from "./index";
import type { PipelineId } from "lib/store/pipeline/types";

interface ContentProps {
  name?: PipelineId;
  id: string;
}

export function EditorPageContent({ name, id }: ContentProps) {
  const dockRef = useRef<EditorFloatingDockRef>(null);
  const [disabled, setDisabled] = useState(false);

  return (
    <div
      className="min-h-screen bg-[#0a0b0e] text-[#e1e3e8] font-['Syne',sans-serif] overflow-hidden"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
      }}
    >
      {/* Main Layout Grid */}
      <EditorLayout
        pipelineName={name!}
        onError={(error: Error) => {
          dockRef.current
            ?.generate(`之前的需求已经生成了代码，但运行时出现错误。请修复以下错误并重新生成可用的代码。

            错误信息：${error.message}

            请保持原有功能，只修复错误`);
        }}
        onUnsaveChange={setDisabled}
      />

      {/* Floating Dock */}
      <EditorFloatingDock
        ref={dockRef}
        disabled={disabled}
        pipelineName={name!}
        pipelineId={id}
        placeholder={disabled ? "保存代码后即可输入" : undefined}
      />
    </div>
  );
}
