"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ReactFlowProvider } from "@xyflow/react";
import { toast } from "sonner";

import { usePipeline, useStages } from "@/lib/server-store";
import { Stage } from "@/lib/services/pipeline/types";
import { ConfigurationHeader } from "./components/ConfigurationHeader";
import { StageFlowCanvas } from "./components/StageFlowCanvas";
import { StageDetailPanel } from "./components/StageDetailPanel";

interface PageProps {
  searchParams: Promise<{ id: string }>;
}

export default function ConfigurationPage({ searchParams }: PageProps) {
  const { id } = use(searchParams);
  const router = useRouter();
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const { data: pipeline, isLoading: isPipelineLoading, error: pipelineError } = usePipeline(id);
  const { data: stages, isLoading: isStagesLoading, error: stagesError } = useStages(id);

  const handleStageClick = (stage: any) => {
    setSelectedStage(stage);
    setIsPanelOpen(true);
  };

  const handlePanelClose = () => {
    setIsPanelOpen(false);
    setSelectedStage(null);
  };

  const handleSuccess = () => {
    router.refresh();
  };

  const handleError = (error: string) => {
    toast.error(error);
  };

  const handleAddStage = () => {
    setSelectedStage({
      stage_id: `new-stage-${Date.now()}`,
      system_prompt: '',
      schema: null,
    } as Stage);
    setIsPanelOpen(true);
  };

  if (isPipelineLoading || isStagesLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-6">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-t-2 border-emerald-500 animate-spin" />
          <div className="absolute inset-0 h-16 w-16 rounded-full border-2 border-emerald-500/20" />
        </div>
        <div className="text-xl font-medium animate-pulse text-emerald-400">
          Loading configuration...
        </div>
      </div>
    );
  }

  if (pipelineError || stagesError || !pipeline) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-red-400 gap-6 p-8 text-center">
        <div className="h-20 w-20 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-2">
          <span className="text-4xl text-red-500">!</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Error loading configuration</h2>
          <p className="text-gray-400 max-w-md">
            We encountered an issue while fetching the pipeline details. Please try refreshing the page.
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <ConfigurationHeader pipeline={pipeline} />

        <div className="h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent" />

        {/* Stages Canvas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Stages</h2>
            <div className="text-sm text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
              {stages?.length || 0} Stages
            </div>
          </div>
          <div className="h-[600px] rounded-2xl border border-white/5 overflow-hidden bg-black/40 backdrop-blur-sm">
            <ReactFlowProvider>
              <StageFlowCanvas
                stages={stages || []}
                pipelineId={pipeline.id}
                onStageClick={handleStageClick}
                onAddStage={handleAddStage}
              />
            </ReactFlowProvider>
          </div>
        </div>
      </div>

      {/* Stage Detail Panel */}
      {isPanelOpen && (
        <StageDetailPanel
          stage={selectedStage}
          pipelineId={pipeline.id}
          onClose={handlePanelClose}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )}
    </div>
  );
}
