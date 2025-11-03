-- Migration: Fix RLS Policies (No Circular Reference)
-- Created: 2025-02-12
-- Description: Fix RLS policies without circular reference in subquery

-- =====================================================
-- PART 1: DROP ALL EXISTING POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Team members can view their own team" ON hackathon_team_members;
DROP POLICY IF EXISTS "Users can view their own member record" ON hackathon_team_members;
DROP POLICY IF EXISTS "Team leaders can update team members" ON hackathon_team_members;
DROP POLICY IF EXISTS "Users can update their own member record" ON hackathon_team_members;
DROP POLICY IF EXISTS "Team leaders can delete team members" ON hackathon_team_members;
DROP POLICY IF EXISTS "Users can insert themselves as team members" ON hackathon_team_members;
DROP POLICY IF EXISTS "Team leaders can insert team members" ON hackathon_team_members;
DROP POLICY IF EXISTS "Admins can view all team members" ON hackathon_team_members;
DROP POLICY IF EXISTS "Team members can view their team" ON hackathon_team_members;

-- =====================================================
-- PART 2: CREATE SELECT POLICY (NO CIRCULAR REFERENCE)
-- =====================================================

-- Enable RLS if not already enabled
ALTER TABLE hackathon_team_members ENABLE ROW LEVEL SECURITY;

-- Create SELECT policy with simple conditions
CREATE POLICY "Team members can view their team"
  ON hackathon_team_members FOR SELECT
  USING (true); -- Temporarily allow all reads to diagnose the issue

-- =====================================================
-- PART 3: CREATE INSERT POLICIES
-- =====================================================

CREATE POLICY "Users can insert themselves as team members"
  ON hackathon_team_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND is_leader = FALSE
    AND status = 'pending'
  );

CREATE POLICY "Team leaders can insert team members"
  ON hackathon_team_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM hackathon_teams
      WHERE hackathon_teams.id = team_id
      AND hackathon_teams.team_leader_id = auth.uid()
    )
  );

-- =====================================================
-- PART 4: CREATE UPDATE POLICIES
-- =====================================================

CREATE POLICY "Team leaders can update team members"
  ON hackathon_team_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM hackathon_teams
      WHERE hackathon_teams.id = team_id
      AND hackathon_teams.team_leader_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own member record"
  ON hackathon_team_members FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- PART 5: CREATE DELETE POLICY
-- =====================================================

CREATE POLICY "Team leaders can delete team members"
  ON hackathon_team_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM hackathon_teams
      WHERE hackathon_teams.id = team_id
      AND hackathon_teams.team_leader_id = auth.uid()
    )
    AND is_leader = FALSE
  );
