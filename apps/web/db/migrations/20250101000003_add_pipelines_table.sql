-- Migration: 20250101000003_add_pipelines_table.sql
-- Description: Add pipelines table and link stages to it

-- 1. Create pipelines table
CREATE TABLE IF NOT EXISTS pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,      -- pipeline name, e.g., "private-component-codegen"
  description TEXT,               -- pipeline description
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE pipelines IS 'Stores pipeline definitions';

-- 2. Add pipeline_id to pipeline_stages
ALTER TABLE pipeline_stages ADD COLUMN IF NOT EXISTS pipeline_id UUID REFERENCES pipelines(id) ON DELETE CASCADE;

-- 3. Insert specific pipeline
INSERT INTO pipelines (name, description)
VALUES ('private-component-codegen', 'Generator for private components')
ON CONFLICT (name) DO NOTHING;

-- 4. Backfill data (associate existing stages with the new pipeline)
UPDATE pipeline_stages
SET pipeline_id = (SELECT id FROM pipelines WHERE name = 'private-component-codegen')
WHERE pipeline_id IS NULL;

-- 5. Set Not Null constraint
ALTER TABLE pipeline_stages ALTER COLUMN pipeline_id SET NOT NULL;

-- 6. Update Constraints
-- Drop old unique constraint
ALTER TABLE pipeline_stages DROP CONSTRAINT IF EXISTS pipeline_stages_stage_id_key;
-- Add new composite unique constraint
ALTER TABLE pipeline_stages ADD CONSTRAINT unique_pipeline_stage UNIQUE (pipeline_id, stage_id);
