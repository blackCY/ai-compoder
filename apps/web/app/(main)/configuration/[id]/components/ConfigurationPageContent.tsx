"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ReactFlowProvider } from "@xyflow/react";
import { Settings, Play } from "lucide-react";
import { toast } from "sonner";

import { usePipeline, useStages, useUpdateStage, useCreateStage } from "lib/serverStore";
import { Stage } from "lib/services/pipeline/types";
import { BackgroundElements } from "../../../home/components/BackgroundElements";
import { ConfigurationHeader } from "./ConfigurationHeader";
import { StageFlowCanvas } from "./StageFlowCanvas";
import { StageDetailPanel } from "./StageDetailPanel";

interface ContentProps {
  pipelineId: string;
}

export function ConfigurationPageContent({ pipelineId }: ContentProps) {
  const router = useRouter();
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { data: pipeline, error: pipelineError } = usePipeline(pipelineId);
  const { data: stages, error: stagesError } = useStages(pipelineId);
  const { mutateAsync: updateStage, isPending: isUpdating } = useUpdateStage(pipelineId);
  const { mutateAsync: createStage, isPending: isCreating } = useCreateStage(pipelineId);

  const handleStageClick = (stage: Stage) => {
    setSelectedStage(stage);
  };

  const handlePanelClose = () => {
    setSelectedStage(null);
  };

  const handleAddStage = () => {
    setSelectedStage({
      stage_id: `new-stage-${Date.now()}`,
      system_prompt: "",
      schema: null,
    } as Stage);
  };

  const handleStageSave = async (data: Partial<Stage>) => {
    setIsSaving(true);
    try {
      const isNew = !data?.id;
      if (isNew) {
        await createStage(data);
        toast.success("Stage created successfully");
      } else {
        await updateStage({
          stageId: data.id!,
          data,
        });
        toast.success("Stage updated successfully");
      }

      router.refresh();
      setSelectedStage(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save stage";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Suspense 模式下，loading 状态会被 Suspense 边界捕获，这里只需处理真正的错误
  if (pipelineError || stagesError) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-red-400 gap-6 p-8 text-center">
        <div className="h-20 w-20 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-2">
          <span className="text-4xl text-red-500">!</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Error loading configuration</h2>
          <p className="text-gray-400 max-w-md">
            {pipelineError?.message || stagesError?.message || "An unexpected error occurred"}
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all font-semibold text-white shadow-xl"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  // Suspense 确保 pipeline 和 stages 在渲染时已定义
  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      {/* 背景元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <BackgroundElements />
      </div>

      {/* 内容容器 */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 py-12 space-y-6">
        <ConfigurationHeader pipeline={pipeline!} />

        <div className="h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent" />

        {/* Stages Canvas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                阶段
              </h2>
              <div className="text-sm text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                ({stages?.length || 0})
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="h-5 px-1.5 flex items-center justify-center rounded bg-blue-500/10 text-[10px] font-medium text-blue-400 ring-1 ring-blue-500/20">resource</div>
                <span>资源</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-5 px-1.5 flex items-center justify-center rounded bg-purple-500/10 text-[10px] font-medium text-purple-400 ring-1 ring-purple-500/20">schema</div>
                <span>输出结构</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-5 w-5 flex items-center justify-center rounded bg-white/5 text-gray-300 ring-1 ring-white/10">
                  <Settings className="h-3 w-3" />
                </div>
                <span>查看配置</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-5 w-5 flex items-center justify-center rounded bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                  <Play className="h-3 w-3" />
                </div>
                <span>运行</span>
              </div>
            </div>
          </div>
          <div className="h-[600px] rounded-2xl border border-emerald-500/10 overflow-hidden bg-emerald-950/20 backdrop-blur-sm shadow-xl shadow-emerald-500/5">
            <ReactFlowProvider>
              <StageFlowCanvas
                stages={stages || []}
                pipelineId={pipelineId}
                onStageClick={handleStageClick}
                onAddStage={handleAddStage}
              />
            </ReactFlowProvider>
          </div>
        </div>
      </div>

      {/* Stage Detail Panel */}
      {!!selectedStage && (
        <StageDetailPanel
          stage={selectedStage}
          isSaving={isSaving || isUpdating || isCreating}
          onClose={handlePanelClose}
          onSave={handleStageSave}
        />
      )}
    </div>
  );
}
