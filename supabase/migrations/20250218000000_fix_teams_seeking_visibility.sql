-- =====================================================
-- FIX: Allow viewing team members for teams seeking members
-- Created: 2025-02-18
-- Description: Updates hackathon_team_members SELECT policy to allow
--              anyone to view members of teams that are seeking teammates
-- =====================================================

-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Team members can view their team" ON hackathon_team_members;

-- Create new SELECT policy that allows:
-- 1. Users to view their own records
-- 2. Users to view members of their own teams
-- 3. ANYONE to view members of teams that are seeking teammates (for discovery)
-- 4. Admins to view all
CREATE POLICY "Team members can view their team"
  ON hackathon_team_members FOR SELECT
  USING (
    -- Users can view their own records
    auth.uid() = user_id
    OR
    -- Users can view members of their own teams
    is_team_member(auth.uid(), team_id)
    OR
    -- Anyone can view members of teams seeking teammates (for team discovery)
    EXISTS (
      SELECT 1 FROM hackathon_teams
      WHERE hackathon_teams.id = team_id
      AND hackathon_teams.looking_for_teammates = true
      AND hackathon_teams.is_completed = false
      LIMIT 1
    )
    OR
    -- Admins can view all
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN ('admin', 'superadmin')
      LIMIT 1
    )
  );

-- Add comment for documentation
COMMENT ON POLICY "Team members can view their team" ON hackathon_team_members
  IS 'Allows team members to view all members of teams they belong to, anyone to view members of teams seeking teammates (for discovery), or their own records. Admins can view all.';
