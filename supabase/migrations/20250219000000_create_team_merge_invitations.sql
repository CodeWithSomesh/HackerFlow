-- =====================================================
-- CREATE TEAM MERGE INVITATIONS TABLE
-- Created: 2025-02-19
-- Description: Creates table for managing team merge invitations
--              and notifications between teams
-- =====================================================

-- =====================================================
-- 1. CREATE TEAM MERGE INVITATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS team_merge_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE NOT NULL,
  sender_team_id UUID REFERENCES hackathon_teams(id) ON DELETE CASCADE NOT NULL,
  receiver_team_id UUID REFERENCES hackathon_teams(id) ON DELETE CASCADE NOT NULL,
  sender_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'accepted', 'rejected', 'cancelled'
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,

  -- Prevent duplicate invitations
  UNIQUE(sender_team_id, receiver_team_id, hackathon_id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_team_merge_invitations_sender_team ON team_merge_invitations(sender_team_id);
CREATE INDEX IF NOT EXISTS idx_team_merge_invitations_receiver_team ON team_merge_invitations(receiver_team_id);
CREATE INDEX IF NOT EXISTS idx_team_merge_invitations_hackathon ON team_merge_invitations(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_team_merge_invitations_status ON team_merge_invitations(status);

-- =====================================================
-- 2. ENABLE RLS
-- =====================================================
ALTER TABLE team_merge_invitations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. CREATE RLS POLICIES
-- =====================================================

-- SELECT: Team leaders can view invitations involving their teams
DROP POLICY IF EXISTS "Team leaders can view merge invitations" ON team_merge_invitations;
CREATE POLICY "Team leaders can view merge invitations"
  ON team_merge_invitations FOR SELECT
  USING (
    -- Sender team leader can view
    EXISTS (
      SELECT 1 FROM hackathon_teams
      WHERE hackathon_teams.id = sender_team_id
      AND hackathon_teams.team_leader_id = auth.uid()
    )
    OR
    -- Receiver team leader can view
    EXISTS (
      SELECT 1 FROM hackathon_teams
      WHERE hackathon_teams.id = receiver_team_id
      AND hackathon_teams.team_leader_id = auth.uid()
    )
  );

-- INSERT: Team leaders can send invitations from their teams
DROP POLICY IF EXISTS "Team leaders can send merge invitations" ON team_merge_invitations;
CREATE POLICY "Team leaders can send merge invitations"
  ON team_merge_invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM hackathon_teams
      WHERE hackathon_teams.id = sender_team_id
      AND hackathon_teams.team_leader_id = auth.uid()
    )
    AND sender_user_id = auth.uid()
  );

-- UPDATE: Sender can cancel, receiver can accept/reject
DROP POLICY IF EXISTS "Team leaders can update merge invitations" ON team_merge_invitations;
CREATE POLICY "Team leaders can update merge invitations"
  ON team_merge_invitations FOR UPDATE
  USING (
    -- Sender can cancel
    (
      EXISTS (
        SELECT 1 FROM hackathon_teams
        WHERE hackathon_teams.id = sender_team_id
        AND hackathon_teams.team_leader_id = auth.uid()
      )
      AND status = 'pending'
    )
    OR
    -- Receiver can accept/reject
    (
      EXISTS (
        SELECT 1 FROM hackathon_teams
        WHERE hackathon_teams.id = receiver_team_id
        AND hackathon_teams.team_leader_id = auth.uid()
      )
      AND status = 'pending'
    )
  );

-- DELETE: Team leaders can delete their invitations
DROP POLICY IF EXISTS "Team leaders can delete merge invitations" ON team_merge_invitations;
CREATE POLICY "Team leaders can delete merge invitations"
  ON team_merge_invitations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM hackathon_teams
      WHERE hackathon_teams.id = sender_team_id
      AND hackathon_teams.team_leader_id = auth.uid()
    )
  );

-- =====================================================
-- 4. CREATE TRIGGERS
-- =====================================================

-- Updated_at trigger
DROP TRIGGER IF EXISTS update_team_merge_invitations_updated_at ON team_merge_invitations;
CREATE TRIGGER update_team_merge_invitations_updated_at
  BEFORE UPDATE ON team_merge_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. GRANT PERMISSIONS
-- =====================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON team_merge_invitations TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- 6. ADD COMMENTS
-- =====================================================
COMMENT ON TABLE team_merge_invitations
  IS 'Stores team merge invitation requests between teams in hackathons';

COMMENT ON COLUMN team_merge_invitations.status
  IS 'Invitation status: pending, accepted, rejected, cancelled';

COMMENT ON POLICY "Team leaders can view merge invitations" ON team_merge_invitations
  IS 'Allows team leaders to view invitations involving their teams';

COMMENT ON POLICY "Team leaders can send merge invitations" ON team_merge_invitations
  IS 'Allows team leaders to send merge invitations from their teams';

COMMENT ON POLICY "Team leaders can update merge invitations" ON team_merge_invitations
  IS 'Allows senders to cancel and receivers to accept/reject invitations';
