import { ModelMessage } from "ai";

export interface PipelineStreamParams {
  messages: ModelMessage[];
  typeId: string;
}
