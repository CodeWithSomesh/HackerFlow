-- Migration: Fix Team Member Select Policy
-- Created: 2025-02-07
-- Description: Adds RLS policy to allow team members to view other members of their own team

-- =====================================================
-- 1. ADD COMPREHENSIVE POLICY FOR TEAM MEMBER VISIBILITY
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Team members can view their own team" ON hackathon_team_members;
DROP POLICY IF EXISTS "Users can view their own member record" ON hackathon_team_members;

-- Create a single comprehensive policy that covers both cases
CREATE POLICY "Team members can view their team"
  ON hackathon_team_members FOR SELECT
  USING (
    -- Users can view their own records
    auth.uid() = user_id
    OR
    -- Users can view members of teams they belong to
    team_id IN (
      SELECT team_id
      FROM hackathon_team_members
      WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- 3. ADD POLICY FOR TEAM LEADERS TO UPDATE MEMBERS
-- =====================================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Team leaders can update team members" ON hackathon_team_members;

-- Create policy that allows team leaders to update their team members
CREATE POLICY "Team leaders can update team members"
  ON hackathon_team_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM hackathon_teams
      WHERE hackathon_teams.id = team_id
      AND hackathon_teams.team_leader_id = auth.uid()
    )
  );

-- =====================================================
-- 4. ADD POLICY FOR USERS TO UPDATE OWN RECORD
-- =====================================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can update their own member record" ON hackathon_team_members;

-- Create policy for users to update their own records
CREATE POLICY "Users can update their own member record"
  ON hackathon_team_members FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- 5. ADD POLICY FOR TEAM LEADERS TO DELETE MEMBERS
-- =====================================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Team leaders can delete team members" ON hackathon_team_members;

-- Create policy that allows team leaders to delete their team members (except themselves)
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

-- =====================================================
-- 6. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON POLICY "Team members can view their team" ON hackathon_team_members
  IS 'Allows team members to view all members of teams they belong to, or their own records across all teams';

COMMENT ON POLICY "Team leaders can update team members" ON hackathon_team_members
  IS 'Allows team leaders to update details of their team members';

COMMENT ON POLICY "Users can update their own member record" ON hackathon_team_members
  IS 'Allows users to update their own team member records';

COMMENT ON POLICY "Team leaders can delete team members" ON hackathon_team_members
  IS 'Allows team leaders to remove non-leader members from their teams';
