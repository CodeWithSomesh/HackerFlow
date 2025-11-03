-- Migration: Add RLS Policies for Hackathon Teams
-- Created: 2025-02-14
-- Description: Add RLS policies to allow users to view hackathon teams

-- =====================================================
-- 1. ENABLE RLS ON HACKATHON_TEAMS
-- =====================================================

ALTER TABLE hackathon_teams ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. DROP EXISTING POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view hackathon teams" ON hackathon_teams;
DROP POLICY IF EXISTS "Users can view hackathon teams" ON hackathon_teams;
DROP POLICY IF EXISTS "Team leaders can update their teams" ON hackathon_teams;
DROP POLICY IF EXISTS "Team leaders can delete their teams" ON hackathon_teams;
DROP POLICY IF EXISTS "Authenticated users can create teams" ON hackathon_teams;

-- =====================================================
-- 3. CREATE SELECT POLICY (ALLOW ALL TO VIEW TEAMS)
-- =====================================================

-- Allow anyone (authenticated users) to view all teams
CREATE POLICY "Users can view hackathon teams"
  ON hackathon_teams FOR SELECT
  USING (true);

-- =====================================================
-- 4. CREATE INSERT POLICY
-- =====================================================

-- Allow authenticated users to create teams
CREATE POLICY "Authenticated users can create teams"
  ON hackathon_teams FOR INSERT
  WITH CHECK (
    auth.uid() = team_leader_id
  );

-- =====================================================
-- 5. CREATE UPDATE POLICY
-- =====================================================

-- Team leaders can update their own teams
CREATE POLICY "Team leaders can update their teams"
  ON hackathon_teams FOR UPDATE
  USING (
    auth.uid() = team_leader_id
  );

-- =====================================================
-- 6. CREATE DELETE POLICY
-- =====================================================

-- Team leaders can delete their own teams
CREATE POLICY "Team leaders can delete their teams"
  ON hackathon_teams FOR DELETE
  USING (
    auth.uid() = team_leader_id
  );

-- =====================================================
-- 7. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON POLICY "Users can view hackathon teams" ON hackathon_teams
  IS 'Allows all authenticated users to view hackathon teams for discovery and joining';

COMMENT ON POLICY "Authenticated users can create teams" ON hackathon_teams
  IS 'Allows authenticated users to create teams where they are the leader';

COMMENT ON POLICY "Team leaders can update their teams" ON hackathon_teams
  IS 'Allows team leaders to update their own teams';

COMMENT ON POLICY "Team leaders can delete their teams" ON hackathon_teams
  IS 'Allows team leaders to delete their own teams';
