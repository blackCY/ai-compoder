-- Pipeline Stages Database Schema
-- Migration: 20250101000001_create_tables.sql
-- Description: Create tables for pipeline stages and resources

-- ============================================
-- Resources Table
-- Stores large resource data (e.g., private-component.json)
-- ============================================
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Pipeline Stages Table
-- Stores individual stage configurations
-- ============================================
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id TEXT UNIQUE NOT NULL,
  order_index INTEGER NOT NULL,
  system_prompt TEXT NOT NULL,
  schema JSONB,
  resource_id UUID REFERENCES resources(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_resource UNIQUE (resource_id)
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_stages_order ON pipeline_stages(order_index);
CREATE INDEX IF NOT EXISTS idx_stages_resource ON pipeline_stages(resource_id) WHERE resource_id IS NOT NULL;

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE resources IS 'Stores resource data such as component libraries';
COMMENT ON TABLE pipeline_stages IS 'Stores pipeline stage configurations';
COMMENT ON COLUMN resources.data IS 'JSONB data containing resource information';
COMMENT ON COLUMN pipeline_stages.schema IS 'JSON Schema for structured output validation';
COMMENT ON COLUMN pipeline_stages.resource_id IS 'Optional reference to a resource (e.g., component library)';
