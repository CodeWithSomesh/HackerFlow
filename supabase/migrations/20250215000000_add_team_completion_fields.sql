-- Migration: Add Team Completion Fields
-- Created: 2025-02-15
-- Description: Add is_completed and completed_at columns to hackathon_teams table

-- =====================================================
-- 1. ADD COMPLETION COLUMNS
-- =====================================================

ALTER TABLE hackathon_teams
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- =====================================================
-- 2. CREATE INDEX FOR EFFICIENT QUERIES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_hackathon_teams_is_completed
  ON hackathon_teams(is_completed);

-- =====================================================
-- 3. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN hackathon_teams.is_completed
  IS 'Indicates if the team has been marked as complete by the team leader';

COMMENT ON COLUMN hackathon_teams.completed_at
  IS 'Timestamp when the team was marked as complete';
