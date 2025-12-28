/**
 * Database Type Definitions
 * Types matching the Supabase database schema
 */

import { JsonSchema } from "json-schema-to-zod";

// ============================================
// Table Row Types
// ============================================

/**
 * Resources table row
 * Stores large resource data (e.g., private-component.json)
 */
export interface DbResource {
  id: string;
  name: string;
  data: Record<string, { description: string; api: string }>;
  created_at: string;
}

/**
 * Pipeline stages table row
 * Stores individual stage configurations
 */
export interface DbPipelineStage {
  id: string;
  stage_id: string;
  order_index: number;
  system_prompt: string;
  schema: JsonSchema | null;
  created_at: string;
}

/**
 * Stage resources junction table row
 * Links stages to their resources
 */
export interface DbStageResource {
  id: string;
  stage_id: string; // References pipeline_stages.id
  resource_id: string; // References resources.id
}

// ============================================
// Query Result Types (with relations)
// ============================================

/**
 * Stage with its resources (query result, selected fields only)
 * Result of querying pipeline_stages with stage_resources and resources
 */
export interface DbStageWithResources {
  id: string;
  stage_id: string;
  order_index: number;
  system_prompt: string;
  schema: JsonSchema | null;
  stage_resources: Array<{
    resource_id: string;
    resources: DbResource | null;
  }>;
}

// ============================================
// Insert Types
// ============================================

export type DbResourceInsert = Omit<DbResource, 'id' | 'created_at'>;
export type DbPipelineStageInsert = Omit<DbPipelineStage, 'id' | 'created_at'>;
export type DbStageResourceInsert = Omit<DbStageResource, 'id'>;
