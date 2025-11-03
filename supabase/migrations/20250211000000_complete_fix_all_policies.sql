-- Migration: Complete Fix - All RLS Policies
-- Created: 2025-02-11
-- Description: Comprehensive migration to fix all RLS policies for team management

-- =====================================================
-- PART 1: ADD ROLE COLUMN TO USER_PROFILES
-- =====================================================

-- Create ENUM type for roles
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin', 'superadmin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add role column to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user' NOT NULL;

-- Create index for efficient role-based queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Update existing users to have 'user' role
UPDATE user_profiles SET role = 'user' WHERE role IS NULL;

COMMENT ON COLUMN user_profiles.role IS 'User role: user (default), admin, or superadmin';

-- =====================================================
-- PART 2: DROP ALL EXISTING POLICIES ON HACKATHON_TEAM_MEMBERS
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
-- PART 3: CREATE SELECT POLICY
-- =====================================================

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
    OR
    -- Admins can view all team members
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN ('admin', 'superadmin')
    )
  );

-- =====================================================
-- PART 4: CREATE INSERT POLICIES
-- =====================================================

-- Users can insert themselves as team members (for invite links)
CREATE POLICY "Users can insert themselves as team members"
  ON hackathon_team_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND is_leader = FALSE
    AND status = 'pending'
  );

-- Team leaders can insert team members
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
-- PART 5: CREATE UPDATE POLICIES
-- =====================================================

-- Team leaders can update their team members
CREATE POLICY "Team leaders can update team members"
  ON hackathon_team_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM hackathon_teams
      WHERE hackathon_teams.id = team_id
      AND hackathon_teams.team_leader_id = auth.uid()
    )
  );

-- Users can update their own member record
CREATE POLICY "Users can update their own member record"
  ON hackathon_team_members FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- PART 6: CREATE DELETE POLICY
-- =====================================================

-- Team leaders can delete team members (except themselves)
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
-- PART 7: COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON POLICY "Team members can view their team" ON hackathon_team_members
  IS 'Allows team members to view all members of teams they belong to, or their own records across all teams. Admins can view all.';

COMMENT ON POLICY "Users can insert themselves as team members" ON hackathon_team_members
  IS 'Allows authenticated users to join teams via invite links by inserting their own member record with pending status';

COMMENT ON POLICY "Team leaders can insert team members" ON hackathon_team_members
  IS 'Allows team leaders to add members to their teams via the invite email feature';

COMMENT ON POLICY "Team leaders can update team members" ON hackathon_team_members
  IS 'Allows team leaders to update details of their team members';

COMMENT ON POLICY "Users can update their own member record" ON hackathon_team_members
  IS 'Allows users to update their own team member records';

COMMENT ON POLICY "Team leaders can delete team members" ON hackathon_team_members
  IS 'Allows team leaders to remove non-leader members from their teams';
