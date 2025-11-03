-- Migration: Fix RLS Policies (Working Version)
-- Created: 2025-02-13
-- Description: Fix RLS policies with optimized queries that avoid circular references

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
-- PART 2: ENSURE RLS IS ENABLED
-- =====================================================

ALTER TABLE hackathon_team_members ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 3: CREATE HELPER FUNCTION FOR TEAM MEMBERSHIP CHECK
-- =====================================================

-- Drop function if exists
DROP FUNCTION IF EXISTS is_team_member(UUID, UUID);

-- Create function to check if user is member of a team
CREATE OR REPLACE FUNCTION is_team_member(check_user_id UUID, check_team_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM hackathon_team_members
    WHERE user_id = check_user_id
    AND team_id = check_team_id
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- =====================================================
-- PART 4: CREATE SELECT POLICY USING HELPER FUNCTION
-- =====================================================

CREATE POLICY "Team members can view their team"
  ON hackathon_team_members FOR SELECT
  USING (
    -- Users can view their own records
    auth.uid() = user_id
    OR
    -- Users can view members of their own teams
    is_team_member(auth.uid(), team_id)
    OR
    -- Admins can view all
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN ('admin', 'superadmin')
      LIMIT 1
    )
  );

-- =====================================================
-- PART 5: CREATE INSERT POLICIES
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
      LIMIT 1
    )
  );

-- =====================================================
-- PART 6: CREATE UPDATE POLICIES
-- =====================================================

CREATE POLICY "Team leaders can update team members"
  ON hackathon_team_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM hackathon_teams
      WHERE hackathon_teams.id = team_id
      AND hackathon_teams.team_leader_id = auth.uid()
      LIMIT 1
    )
  );

CREATE POLICY "Users can update their own member record"
  ON hackathon_team_members FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- PART 7: CREATE DELETE POLICY
-- =====================================================

CREATE POLICY "Team leaders can delete team members"
  ON hackathon_team_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM hackathon_teams
      WHERE hackathon_teams.id = team_id
      AND hackathon_teams.team_leader_id = auth.uid()
      LIMIT 1
    )
    AND is_leader = FALSE
  );

-- =====================================================
-- PART 8: GRANT EXECUTE PERMISSION ON HELPER FUNCTION
-- =====================================================

GRANT EXECUTE ON FUNCTION is_team_member(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_team_member(UUID, UUID) TO anon;

-- =====================================================
-- PART 9: COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION is_team_member(UUID, UUID)
  IS 'Helper function to check if a user is a member of a specific team';

COMMENT ON POLICY "Team members can view their team" ON hackathon_team_members
  IS 'Allows team members to view all members of teams they belong to, or their own records. Admins can view all.';

COMMENT ON POLICY "Users can insert themselves as team members" ON hackathon_team_members
  IS 'Allows authenticated users to join teams via invite links by inserting their own member record with pending status';

COMMENT ON POLICY "Team leaders can insert team members" ON hackathon_team_members
  IS 'Allows team leaders to add members to their teams';

COMMENT ON POLICY "Team leaders can update team members" ON hackathon_team_members
  IS 'Allows team leaders to update details of their team members';

COMMENT ON POLICY "Users can update their own member record" ON hackathon_team_members
  IS 'Allows users to update their own team member records';

COMMENT ON POLICY "Team leaders can delete team members" ON hackathon_team_members
  IS 'Allows team leaders to remove non-leader members from their teams';
