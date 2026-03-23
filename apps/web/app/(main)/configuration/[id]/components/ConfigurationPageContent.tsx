"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ReactFlowProvider } from "@xyflow/react";
import { Settings, Play, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "lib/ui/tooltip";

import { usePipeline, useStages, useUpdateStage, useCreateStage } from "lib/serverStore";
import { Stage } from "lib/services/pipeline/types";
import { BackgroundElements } from "../../../home/components/BackgroundElements";
import { ConfigurationHeader } from "./ConfigurationHeader";
import { StageFlowCanvas } from "./StageFlowCanvas";
import { StageDetailPanel } from "./StageDetailPanel";

interface ContentProps {
  pipelineId: string;
}

// 骨架屏：Header 区域
function HeaderSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-white/5 rounded" />
      <div className="h-4 w-96 bg-white/5 rounded" />
    </div>
  );
}

// 骨架屏：Canvas 区域
function CanvasSkeleton() {
  return (
    <div className="h-[600px] rounded-2xl border border-emerald-500/10 bg-emerald-950/20 backdrop-blur-sm flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500/50" />
        <p className="text-sm text-gray-500">Loading stages...</p>
      </div>
    </div>
  );
}

// Header 区域：独立的数据获取
function PageHeader({ pipelineId }: { pipelineId: string }) {
  const { data: pipeline } = usePipeline(pipelineId);

  if (!pipeline) {
    return <HeaderSkeleton />;
  }

  return <ConfigurationHeader pipeline={pipeline} />;
}

// Canvas 区域：独立的数据获取
function StagesCanvas({
  pipelineId,
  onStageClick,
  onAddStage,
}: {
  pipelineId: string;
  onStageClick: (stage: Stage) => void;
  onAddStage: () => void;
}) {
  const { data: stages } = useStages(pipelineId);

  if (!stages) {
    return <CanvasSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            阶段
          </h2>
          <div className="text-sm text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            ({stages.length})
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5">
                <div className="h-5 px-1.5 flex items-center justify-center rounded bg-blue-500/10 text-[10px] font-medium text-blue-400 ring-1 ring-blue-500/20">resource</div>
                <span>资源</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>上传的私有资源，例如私有组件库</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5">
                <div className="h-5 px-1.5 flex items-center justify-center rounded bg-purple-500/10 text-[10px] font-medium text-purple-400 ring-1 ring-purple-500/20">schema</div>
                <span>输出结构</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>定义 AI 输出什么结构，例如输出的代码是什么样</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5">
                <div className="h-5 w-5 flex items-center justify-center rounded bg-white/5 text-gray-300 ring-1 ring-white/10">
                  <Settings className="h-3 w-3" />
                </div>
                <span>查看配置</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>查看和编辑阶段配置</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5">
                <div className="h-5 w-5 flex items-center justify-center rounded bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                  <Play className="h-3 w-3" />
                </div>
                <span>运行</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>运行当前阶段</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Canvas 容器 */}
      <div className="h-[600px] rounded-2xl border border-emerald-500/10 overflow-hidden bg-emerald-950/20 backdrop-blur-sm shadow-xl shadow-emerald-500/5">
        <ReactFlowProvider>
          <StageFlowCanvas
            stages={stages}
            pipelineId={pipelineId}
            onStageClick={onStageClick}
            onAddStage={onAddStage}
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
}

export function ConfigurationPageContent({ pipelineId }: ContentProps) {
  const router = useRouter();
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      {/* 背景元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <BackgroundElements />
      </div>

      {/* 内容容器 */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 py-12 space-y-6">
        {/* Header：独立的 Suspense 边界，优先渲染 */}
        <Suspense fallback={<HeaderSkeleton />}>
          <PageHeader pipelineId={pipelineId} />
        </Suspense>

        <div className="h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent" />

        {/* Canvas：独立的 Suspense 边界，流式渲染 */}
        <Suspense fallback={<CanvasSkeleton />}>
          <StagesCanvas
            pipelineId={pipelineId}
            onStageClick={handleStageClick}
            onAddStage={handleAddStage}
          />
        </Suspense>
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
