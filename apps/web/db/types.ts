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
  pipeline_id: string;
  stage_id: string;
  system_prompt: string;
  schema: JsonSchema | null;
  resource_id: string | null;
  created_at: string;
}

/**
 * Pipeline definition
 */
export interface DbPipeline {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

// ============================================
// Query Result Types (with relations)
// ============================================

/**
 * Stage with its resource (query result, with resource joined)
 * Result of querying pipeline_stages with resources
 */
export interface DbStageWithResources {
  id: string;
  stage_id: string;
  system_prompt: string;
  schema: JsonSchema | null;
  resource_id: string | null;
  resources: DbResource | null;
}

// ============================================
// Insert Types
// ============================================

export type DbResourceInsert = Omit<DbResource, 'id' | 'created_at'>;
export type DbPipelineStageInsert = Omit<DbPipelineStage, 'id' | 'created_at'>;
