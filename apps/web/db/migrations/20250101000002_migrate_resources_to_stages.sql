-- Migration: 20250101000002_migrate_resources_to_stages.sql
-- Description: Remove stage_resources table and move resource_id to pipeline_stages

-- ============================================
-- Step 1: Add resource_id column to pipeline_stages
-- ============================================
ALTER TABLE pipeline_stages
ADD COLUMN IF NOT EXISTS resource_id UUID REFERENCES resources(id) ON DELETE SET NULL;

-- ============================================
-- Step 2: Migrate data from stage_resources to pipeline_stages.resource_id
-- Each stage should have at most one resource, so we take the first one
-- ============================================
-- First, let's see what we're migrating (for verification, commented out)
-- SELECT ps.stage_id, sr.resource_id
-- FROM pipeline_stages ps
-- LEFT JOIN stage_resources sr ON sr.stage_id = ps.id;

-- Migrate: For each stage, set its resource_id from stage_resources
UPDATE pipeline_stages ps
SET resource_id = (
  SELECT sr.resource_id
  FROM stage_resources sr
  WHERE sr.stage_id = ps.id
  LIMIT 1
)
WHERE EXISTS (
  SELECT 1 FROM stage_resources sr
  WHERE sr.stage_id = ps.id
);

-- ============================================
-- Step 3: Remove resource_id from 'generate-code' stage
-- The 'generate-code' stage should not have any resources
-- ============================================
UPDATE pipeline_stages
SET resource_id = NULL
WHERE stage_id = 'generate-code';

-- ============================================
-- Step 4: Drop the stage_resources junction table
-- ============================================
DROP TABLE IF EXISTS stage_resources CASCADE;

-- ============================================
-- Step 5: Add unique constraint to resource_id (optional, but good for data integrity)
-- ============================================
-- Note: We use a partial index instead of UNIQUE constraint to allow multiple NULLs
CREATE UNIQUE INDEX IF NOT EXISTS idx_pipeline_stages_resource_unique
ON pipeline_stages(resource_id)
WHERE resource_id IS NOT NULL;

-- ============================================
-- Verification Query (optional, for manual verification)
-- ============================================
-- SELECT
--   ps.stage_id,
--   ps.order_index,
--   r.name as resource_name,
--   CASE
--     WHEN ps.resource_id IS NULL THEN 'No resource'
--     ELSE 'Has resource'
--   END as resource_status
-- FROM pipeline_stages ps
-- LEFT JOIN resources r ON ps.resource_id = r.id
-- ORDER BY ps.order_index;
