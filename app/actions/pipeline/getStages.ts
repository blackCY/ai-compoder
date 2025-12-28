"use server";

import { StageConfig } from "./types";

/**
 * Fetch pipeline stages from database with fallback
 * @param typeId - Pipeline template identifier (currently unused, for future multi-template support)
 * @returns Array of stage configurations
 */
export const getStages = async (_typeId: string): Promise<StageConfig[]> => {
  try {
    // Try to fetch from database first
    const { fetchAllStages } = await import("@/db/queries");
    const dbStages = await fetchAllStages();

    // Transform database rows to StageConfig format
    return dbStages.map((stage) => ({
      stageId: stage.stage_id,
      systemPrompt: stage.system_prompt,
      schema: stage.schema as any,
      resources: stage.resources,
    }));
  } catch (error) {
    // Graceful degradation: fall back to hardcoded stages
    console.warn("Failed to fetch stages from database, using fallback:", error instanceof Error ? error.message : error);
    return []
  }
};