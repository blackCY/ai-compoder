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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Stage Resources Junction Table
-- Links stages to their resources (many-to-many)
-- ============================================
CREATE TABLE IF NOT EXISTS stage_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID REFERENCES pipeline_stages(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  UNIQUE(stage_id, resource_id)
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_stages_order ON pipeline_stages(order_index);

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE resources IS 'Stores resource data such as component libraries';
COMMENT ON TABLE pipeline_stages IS 'Stores pipeline stage configurations';
COMMENT ON TABLE stage_resources IS 'Junction table linking stages to resources';
COMMENT ON COLUMN resources.data IS 'JSONB data containing resource information';
COMMENT ON COLUMN pipeline_stages.schema IS 'JSON Schema for structured output validation';
