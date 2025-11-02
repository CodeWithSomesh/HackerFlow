-- Migration: Auto-update team_size_current when members are added/removed/verified
-- Created: 2025-02-05
-- Description: Creates trigger to automatically update team_size_current based on accepted members

-- =====================================================
-- FUNCTION: Update team size based on accepted members
-- =====================================================
CREATE OR REPLACE FUNCTION update_team_size()
RETURNS TRIGGER AS $$
DECLARE
  v_team_id UUID;
  v_accepted_count INT;
BEGIN
  -- Determine which team_id to use based on operation
  IF TG_OP = 'DELETE' THEN
    v_team_id := OLD.team_id;
  ELSE
    v_team_id := NEW.team_id;
  END IF;

  -- Count accepted members for this team
  SELECT COUNT(*) INTO v_accepted_count
  FROM hackathon_team_members
  WHERE team_id = v_team_id
  AND status = 'accepted';

  -- Update the team_size_current
  UPDATE hackathon_teams
  SET team_size_current = v_accepted_count
  WHERE id = v_team_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS: Apply to hackathon_team_members
-- =====================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_update_team_size_on_insert ON hackathon_team_members;
DROP TRIGGER IF EXISTS trigger_update_team_size_on_update ON hackathon_team_members;
DROP TRIGGER IF EXISTS trigger_update_team_size_on_delete ON hackathon_team_members;

-- Trigger on INSERT (when new member is added)
CREATE TRIGGER trigger_update_team_size_on_insert
  AFTER INSERT ON hackathon_team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_team_size();

-- Trigger on UPDATE (when member status changes)
CREATE TRIGGER trigger_update_team_size_on_update
  AFTER UPDATE ON hackathon_team_members
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_team_size();

-- Trigger on DELETE (when member is removed)
CREATE TRIGGER trigger_update_team_size_on_delete
  AFTER DELETE ON hackathon_team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_team_size();

-- =====================================================
-- FIX: Update existing teams to have correct counts
-- =====================================================
UPDATE hackathon_teams t
SET team_size_current = (
  SELECT COUNT(*)
  FROM hackathon_team_members m
  WHERE m.team_id = t.id
  AND m.status = 'accepted'
);
