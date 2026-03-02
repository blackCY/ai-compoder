import { type JsonSchema, ModelMessage } from "ai";

export interface PipelineStreamParams {
  messages: ModelMessage[];
  pipelineId: string;
}

export interface Pipeline {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Stage {
  id: string;
  pipeline_id: string;
  stage_id: string;
  system_prompt: string;
  schema: JsonSchema | null;
  resource_id: string | null;
  created_at: string;
  resources?: {
    id: string;
    name: string;
    data: Record<string, { description: string; api: string }> | null;
  } | null;
}
