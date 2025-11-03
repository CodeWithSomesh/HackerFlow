-- =====================================================
-- COMBINED MIGRATION: Apply All Team Management Fixes
-- Created: 2025-02-16
-- Description: Single migration to apply all fixes at once
-- =====================================================

-- =====================================================
-- FIX 1: ADD RLS POLICIES FOR HACKATHON_TEAMS TABLE
-- This fixes the Teams Seeking tab not showing other teams
-- =====================================================

-- Enable RLS on hackathon_teams
ALTER TABLE hackathon_teams ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view hackathon teams" ON hackathon_teams;
DROP POLICY IF EXISTS "Users can view hackathon teams" ON hackathon_teams;
DROP POLICY IF EXISTS "Team leaders can update their teams" ON hackathon_teams;
DROP POLICY IF EXISTS "Team leaders can delete their teams" ON hackathon_teams;
DROP POLICY IF EXISTS "Authenticated users can create teams" ON hackathon_teams;

-- CREATE SELECT POLICY - Allows all authenticated users to view all teams
CREATE POLICY "Users can view hackathon teams"
  ON hackathon_teams FOR SELECT
  USING (true);

-- CREATE INSERT POLICY - Allows users to create teams where they are the leader
CREATE POLICY "Authenticated users can create teams"
  ON hackathon_teams FOR INSERT
  WITH CHECK (
    auth.uid() = team_leader_id
  );

-- CREATE UPDATE POLICY - Allows team leaders to update their own teams
CREATE POLICY "Team leaders can update their teams"
  ON hackathon_teams FOR UPDATE
  USING (
    auth.uid() = team_leader_id
  );

-- CREATE DELETE POLICY - Allows team leaders to delete their own teams
CREATE POLICY "Team leaders can delete their teams"
  ON hackathon_teams FOR DELETE
  USING (
    auth.uid() = team_leader_id
  );

-- Add comments for documentation
COMMENT ON POLICY "Users can view hackathon teams" ON hackathon_teams
  IS 'Allows all authenticated users to view hackathon teams for discovery and joining';

COMMENT ON POLICY "Authenticated users can create teams" ON hackathon_teams
  IS 'Allows authenticated users to create teams where they are the leader';

COMMENT ON POLICY "Team leaders can update their teams" ON hackathon_teams
  IS 'Allows team leaders to update their own teams';

COMMENT ON POLICY "Team leaders can delete their teams" ON hackathon_teams
  IS 'Allows team leaders to delete their own teams';

-- =====================================================
-- FIX 2: ADD TEAM COMPLETION FIELDS
-- This enables the Complete Team button feature
-- =====================================================

-- Add completion columns
ALTER TABLE hackathon_teams
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_hackathon_teams_is_completed
  ON hackathon_teams(is_completed);

-- Add comments for documentation
COMMENT ON COLUMN hackathon_teams.is_completed
  IS 'Indicates if the team has been marked as complete by the team leader';

COMMENT ON COLUMN hackathon_teams.completed_at
  IS 'Timestamp when the team was marked as complete';

-- =====================================================
-- FIX 3: ALLOW TEAM LEADERS TO VIEW AND DELETE MEMBER REGISTRATIONS
-- This fixes team leaders not being able to remove member registrations
-- =====================================================

-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view their own registrations" ON hackathon_registrations;

-- Create new SELECT policy that allows:
-- 1. Users to view their own registrations
-- 2. Team leaders to view their team members' registrations
CREATE POLICY "Users and team leaders can view registrations"
  ON hackathon_registrations
  FOR SELECT
  USING (
    -- User can view their own registration
    auth.uid() = user_id
    OR
    -- Team leader can view their team members' registrations
    (
      team_id IN (
        SELECT id FROM hackathon_teams
        WHERE team_leader_id = auth.uid()
      )
    )
  );

-- Drop the existing restrictive DELETE policy
DROP POLICY IF EXISTS "Users can delete their own registrations" ON hackathon_registrations;

-- Create new DELETE policy that allows:
-- 1. Users to delete their own registrations
-- 2. Team leaders to delete their team members' registrations
CREATE POLICY "Users and team leaders can delete registrations"
  ON hackathon_registrations
  FOR DELETE
  USING (
    -- User can delete their own registration
    auth.uid() = user_id
    OR
    -- Team leader can delete their team members' registrations
    (
      team_id IN (
        SELECT id FROM hackathon_teams
        WHERE team_leader_id = auth.uid()
      )
    )
  );

-- Add comments for documentation
COMMENT ON POLICY "Users and team leaders can view registrations" ON hackathon_registrations
  IS 'Allows users to view their own registrations and team leaders to view their team members registrations';

COMMENT ON POLICY "Users and team leaders can delete registrations" ON hackathon_registrations
  IS 'Allows users to delete their own registrations and team leaders to delete their team members registrations';

-- =====================================================
-- VERIFICATION QUERIES
-- Run these after migration to verify everything works
-- =====================================================

-- Check if RLS is enabled on hackathon_teams
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'hackathon_teams';

-- View all policies on hackathon_teams
-- SELECT * FROM pg_policies WHERE tablename = 'hackathon_teams';

-- Check if completion columns were added
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'hackathon_teams'
-- AND column_name IN ('is_completed', 'completed_at');

-- View RLS policies on hackathon_registrations
-- SELECT * FROM pg_policies WHERE tablename = 'hackathon_registrations';
