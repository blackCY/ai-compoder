"use server";

import { JsonSchema } from "json-schema-to-zod";
import { StageConfig } from "./types";

export const getStages = async (pipelineId: string): Promise<StageConfig[]> => {
  try {
    // Try to fetch from database first
    const { fetchStages } = await import("@/db/queries");

    // Use pipelineId directly to fetch stages
    const dbStages = await fetchStages(pipelineId);

    // Transform database rows to StageConfig format
    return dbStages.map((stage) => ({
      stageId: stage.stage_id,
      systemPrompt: stage.system_prompt,
      schema: stage.schema === null ? undefined : (stage.schema as JsonSchema),
      resources: stage.resources ?? undefined,
    }));
  } catch (error) {
    // Graceful degradation: fall back to hardcoded stages
    console.warn("Failed to fetch stages from database, using fallback:", error instanceof Error ? error.message : error);
    return []
  }
};

/**
 * Fetch single stage by pipelineId and stageId
 * @returns StageConfig or null if not found
 */
export const getStage = async (pipelineId: string, stageId: string): Promise<StageConfig | null> => {
  try {
    const { fetchStage } = await import("@/db/queries");
    const s = await fetchStage(pipelineId, stageId);
    if (!s) return null;
    return {
      stageId: s.stage_id,
      systemPrompt: s.system_prompt,
      schema: s.schema === null ? undefined : (s.schema as JsonSchema),
      resources: s.resources ?? undefined,
    };
  } catch (error) {
    console.warn(
      "Failed to fetch stage from database:",
      error instanceof Error ? error.message : error
    );
    return null;
  }
};
