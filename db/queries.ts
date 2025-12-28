/**
 * Database Query Functions
 * Pure functions for querying Supabase database
 */

import type { DbStageWithResources } from "./types";
import { getSupabaseClient, isSupabaseConfigured } from "./client";

/**
 * Raw stage data from database with resources merged
 */
export interface StageRowWithResources {
  stage_id: string;
  system_prompt: string;
  schema: unknown;
  resources: Record<string, { description: string; api: string }>;
}

/**
 * Fetch all pipeline stages with their resources
 * @returns Array of stage data sorted by order_index
 * @throws Error if Supabase is not configured or query fails
 */
export async function fetchAllStages(): Promise<StageRowWithResources[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("pipeline_stages")
    .select(`
      id,
      stage_id,
      order_index,
      system_prompt,
      schema,
      stage_resources (
        resource_id,
        resources (
          id,
          name,
          data
        )
      )
    `)
    .order("order_index", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch stages: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error("No stages found in database");
  }

  // Transform database result to simplified format
  return (data as unknown as DbStageWithResources[]).map((stage) => ({
    stage_id: stage.stage_id,
    system_prompt: stage.system_prompt,
    schema: stage.schema,
    // Merge all resources into a single Resource object
    resources: (stage.stage_resources ?? []).reduce(
      (acc, sr) => ({
        ...acc,
        ...(sr.resources?.data ?? {}),
      }),
      {} as Record<string, { description: string; api: string }>
    ),
  }));
}

/**
 * Check if database is available and has stages
 * @returns true if database is configured and has stages
 */
export async function isDatabaseAvailable(): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    const supabase = getSupabaseClient();
    const { count, error } = await supabase
      .from("pipeline_stages")
      .select("*", { count: "exact", head: true });

    return !error && count !== null && count > 0;
  } catch {
    return false;
  }
}
