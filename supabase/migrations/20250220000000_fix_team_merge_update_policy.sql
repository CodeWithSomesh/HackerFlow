-- =====================================================
-- FIX TEAM MERGE INVITATIONS UPDATE POLICY
-- Created: 2025-02-20
-- Description: Fixes the UPDATE policy to properly allow
--              receivers to reject invitations
-- =====================================================

-- Drop the existing UPDATE policy
DROP POLICY IF EXISTS "Team leaders can update merge invitations" ON team_merge_invitations;

-- Create new UPDATE policy with proper USING and WITH CHECK clauses
-- USING: Determines which rows can be selected for update
-- WITH CHECK: Validates the new values being set
CREATE POLICY "Team leaders can update merge invitations"
  ON team_merge_invitations FOR UPDATE
  USING (
    -- Current row must have status = 'pending' AND
    -- User must be either sender or receiver team leader
    status = 'pending'
    AND
    (
      -- Sender team leader
      EXISTS (
        SELECT 1 FROM hackathon_teams
        WHERE hackathon_teams.id = sender_team_id
        AND hackathon_teams.team_leader_id = auth.uid()
      )
      OR
      -- Receiver team leader
      EXISTS (
        SELECT 1 FROM hackathon_teams
        WHERE hackathon_teams.id = receiver_team_id
        AND hackathon_teams.team_leader_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    -- Allow updating to any valid status
    status IN ('pending', 'accepted', 'rejected', 'cancelled')
    AND
    -- User must still be sender or receiver team leader
    (
      EXISTS (
        SELECT 1 FROM hackathon_teams
        WHERE hackathon_teams.id = sender_team_id
        AND hackathon_teams.team_leader_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM hackathon_teams
        WHERE hackathon_teams.id = receiver_team_id
        AND hackathon_teams.team_leader_id = auth.uid()
      )
    )
  );

-- Add comment for documentation
COMMENT ON POLICY "Team leaders can update merge invitations" ON team_merge_invitations
  IS 'Allows senders and receivers to update pending invitations. Senders can cancel, receivers can accept/reject.';
