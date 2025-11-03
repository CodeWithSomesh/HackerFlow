-- =====================================================
-- FIX: Allow team leaders to delete their team members' registrations
-- Created: 2025-02-17
-- Description: Updates RLS policy on hackathon_registrations to allow
--              team leaders to delete registrations of their team members
-- =====================================================

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

-- Add comment for documentation
COMMENT ON POLICY "Users and team leaders can delete registrations" ON hackathon_registrations
  IS 'Allows users to delete their own registrations and team leaders to delete their team members registrations';
