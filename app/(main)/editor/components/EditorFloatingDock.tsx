"use client";

import { PipelineFloatingDock } from "@/components/biz/PipelineFloatingDock";

export const EditorFloatingDock: React.FC = () => {
  return (
    <PipelineFloatingDock
      pipelineId="business-code-generate"
      placeholder="例如：创建一个响应式的用户配置文件卡片组件，包含头像、姓名、邮箱和编辑功能..."
    />
  );
};
