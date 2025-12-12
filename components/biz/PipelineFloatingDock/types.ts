import { PipelineTypeId, SchemaStageIds } from "@/lib/store/pipeline/types";

export interface PipelineFloatingDockProps {
  pipelineId: PipelineTypeId;
  placeholder?: string;
  className?: string;
}

export interface PipelineTerminalOutputProps {
  isVisible: boolean;
  pipelineId: PipelineTypeId;
  stageId: SchemaStageIds<PipelineTypeId>;
}
