-- Migration: Fix Team Member Insert Policy for Invite Links
-- Created: 2025-02-06
-- Description: Adds RLS policy to allow authenticated users to insert team member records when joining via invite links

-- =====================================================
-- 1. ADD POLICY FOR USERS TO INSERT THEMSELVES
-- =====================================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can insert themselves as team members" ON hackathon_team_members;

-- Create policy that allows authenticated users to insert records for themselves
CREATE POLICY "Users can insert themselves as team members"
  ON hackathon_team_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND is_leader = FALSE
    AND status = 'pending'
  );

-- =====================================================
-- 2. ADD POLICY FOR TEAM LEADERS TO INSERT MEMBERS
-- =====================================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Team leaders can insert team members" ON hackathon_team_members;

-- Create policy that allows team leaders to add members to their teams
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
-- 3. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON POLICY "Users can insert themselves as team members" ON hackathon_team_members
  IS 'Allows authenticated users to join teams via invite links by inserting their own member record with pending status';

COMMENT ON POLICY "Team leaders can insert team members" ON hackathon_team_members
  IS 'Allows team leaders to add members to their teams via the invite email feature';
