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
  resources: Record<string, { description: string; api: string }> | null;
}

/**
 * Fetch all pipeline definitions
 * @returns Array of pipelines
 */
export async function fetchPipelines(): Promise<import("./types").DbPipeline[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("pipelines")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch pipelines: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch stages for a specific pipeline
 * @param pipelineId - The ID of the pipeline to fetch stages for (UUID)
 * @returns Array of stage data sorted by created_at
 * @throws Error if Supabase is not configured or query fails
 */
export async function fetchStages(pipelineId: string): Promise<StageRowWithResources[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("pipeline_stages")
    .select(`
      id,
      stage_id,
      system_prompt,
      schema,
      resource_id,
      resources (
        id,
        name,
        data
      )
    `)
    .eq("pipeline_id", pipelineId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch stages: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Transform database result to simplified format
  return (data as unknown as DbStageWithResources[]).map((stage) => ({
    stage_id: stage.stage_id,
    system_prompt: stage.system_prompt,
    schema: stage.schema,
    // Get resource data if exists, otherwise return null
    resources: stage.resources?.data ?? null,
  }));
}

export async function fetchStage(
  pipelineId: string,
  stageId: string
): Promise<StageRowWithResources | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("pipeline_stages")
    .select(`
      id,
      stage_id,
      system_prompt,
      schema,
      resource_id,
      resources (
        id,
        name,
        data
      )
    `)
    .eq("pipeline_id", pipelineId)
    .eq("stage_id", stageId)
    .limit(1);

  if (error) {
    throw new Error(`Failed to fetch stage: ${error.message}`);
  }

  const rows = (data as unknown as DbStageWithResources[]) || [];
  const row = rows[0];

  if (!row) return null;

  return {
    stage_id: row.stage_id,
    system_prompt: row.system_prompt,
    schema: row.schema,
    resources: row.resources?.data ?? null,
  };
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

/**
 * Fetch complete stage data for a specific pipeline (including id)
 * Used by configuration UI
 * @param pipelineId - The ID of the pipeline to fetch stages for (UUID)
 * @returns Array of complete stage data sorted by created_at
 * @throws Error if Supabase is not configured or query fails
 */
export async function fetchStagesFull(pipelineId: string): Promise<DbStageWithResources[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("pipeline_stages")
    .select(`
      id,
      stage_id,
      system_prompt,
      schema,
      resource_id,
      resources (
        id,
        name,
        data
      )
    `)
    .eq("pipeline_id", pipelineId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch stages: ${error.message}`);
  }

  return (data as unknown as DbStageWithResources[]) || [];
}

/**
 * Update a single stage
 * @param stageId - The ID of the stage to update
 * @param data - Partial stage data to update, may include 'resources' object
 * @returns Updated stage data
 * @throws Error if update fails
 */
export async function updateStage(
  stageId: string,
  data: Partial<Omit<import("./types").DbPipelineStage, "id" | "created_at" | "pipeline_id">> & {
    resources?: {
      id?: string;
      name?: string;
      data: Record<string, { description: string; api: string }> | null;
    } | null;
  }
) {
  const supabase = getSupabaseClient();
  const { resources, ...stageData } = data;

  // 1. If resources are provided, handle the resources table update
  if (resources !== undefined) {
    // Get current stage to find resource_id
    const { data: currentStage, error: fetchError } = await supabase
      .from("pipeline_stages")
      .select("resource_id, stage_id")
      .eq("id", stageId)
      .single();

    if (fetchError) throw new Error(`Failed to fetch current stage: ${fetchError.message}`);

    const resourceData = resources?.data;

    if (currentStage.resource_id) {
      // Update existing resource record
      const { error: resUpdateError } = await supabase
        .from("resources")
        .update({ data: resourceData || {} })
        .eq("id", currentStage.resource_id);

      if (resUpdateError) throw new Error(`Failed to update resource: ${resUpdateError.message}`);
    } else if (resourceData) {
      // Create new resource record if resources provided but no link exists
      const { data: newRes, error: resInsertError } = await supabase
        .from("resources")
        .insert({
          name: `${currentStage.stage_id}-resource`,
          data: resourceData,
        })
        .select()
        .single();

      if (resInsertError) throw new Error(`Failed to create resource: ${resInsertError.message}`);

      // Update stage data to include the new resource_id
      stageData.resource_id = newRes.id as string;
    }
  }

  // 2. Update the stage record
  const { data: updated, error } = await supabase
    .from("pipeline_stages")
    .update(stageData)
    .eq("id", stageId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update stage: ${error.message}`);
  return updated;
}



/**
 * Create a new stage
 * @param pipelineId - The ID of the pipeline to add the stage to
 * @param data - Stage data (without id, created_at, pipeline_id), may include 'resources' object
 * @returns Created stage data
 * @throws Error if creation fails
 */
export async function createStage(
  pipelineId: string,
  data: Omit<import("./types").DbPipelineStage, "id" | "created_at" | "pipeline_id"> & {
    resources?: {
      data: Record<string, { description: string; api: string }> | null;
    } | null;
  }
) {
  const supabase = getSupabaseClient();
  const { resources, ...stageData } = data;
  let resourceId = null;

  // 1. If resources are provided, handle the resources table insertion
  if (resources?.data) {
    const { data: newRes, error: resInsertError } = await supabase
      .from("resources")
      .insert({
        name: `${stageData.stage_id}-resource`,
        data: resources.data,
      })
      .select()
      .single();

    if (resInsertError) throw new Error(`Failed to create resource: ${resInsertError.message}`);
    resourceId = newRes.id;
  }

  // 2. Create the stage record with the linked resource_id
  const { data: created, error } = await supabase
    .from("pipeline_stages")
    .insert({ ...stageData, pipeline_id: pipelineId, resource_id: resourceId })
    .select()
    .single();

  if (error) throw new Error(`Failed to create stage: ${error.message}`);
  return created;
}

/**
 * Delete a stage
 * @param stageId - The ID of the stage to delete
 * @throws Error if deletion fails
 */
export async function deleteStage(stageId: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('pipeline_stages')
    .delete()
    .eq('id', stageId);
  
  if (error) throw new Error(`Failed to delete stage: ${error.message}`);
}

/**
 * Update a pipeline
 * @param pipelineId - The ID of the pipeline to update
 * @param data - Partial pipeline data to update (name and/or description)
 * @returns Updated pipeline data
 * @throws Error if update fails
 */
export async function updatePipeline(
  pipelineId: string,
  data: Partial<Pick<import("./types").DbPipeline, 'name' | 'description'>>
) {
  const supabase = getSupabaseClient();
  const { data: updated, error } = await supabase
    .from('pipelines')
    .update(data)
    .eq('id', pipelineId)
    .select()
    .single();
  
  if (error) throw new Error(`Failed to update pipeline: ${error.message}`);
  return updated;
}

/**
 * Delete a pipeline (cascades to stages due to ON DELETE CASCADE)
 * @param pipelineId - The ID of the pipeline to delete
 * @throws Error if deletion fails
 */
export async function deletePipeline(pipelineId: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('pipelines')
    .delete()
    .eq('id', pipelineId);
  
  if (error) throw new Error(`Failed to delete pipeline: ${error.message}`);
}

/**
 * Create a new pipeline
 * @param data - Pipeline data (name and description)
 * @returns Created pipeline data
 * @throws Error if creation fails
 */
export async function createPipeline(
  data: { name: string; description?: string }
) {
  const supabase = getSupabaseClient();
  const { data: created, error } = await supabase
    .from('pipelines')
    .insert(data)
    .select()
    .single();
  
  if (error) throw new Error(`Failed to create pipeline: ${error.message}`);
  return created;
}
