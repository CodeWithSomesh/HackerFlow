-- =====================================================
-- FIX TEAMS TAB - Update Participant Types
-- Run this ONLY if your participants are in teams but marked as 'individual'
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '🔧 FIXING TEAMS TAB PARTICIPANT TYPES';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '';
END $$;

-- Check current state before fix
DO $$
DECLARE
  individual_with_teams INTEGER;
BEGIN
  SELECT COUNT(*) INTO individual_with_teams
  FROM hackathon_registrations hr
  WHERE hr.participant_type = 'individual'
    AND hr.team_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM hackathons h
      WHERE h.id = hr.hackathon_id
      AND h.created_by = auth.uid()
    );

  RAISE NOTICE '📊 Current State:';
  RAISE NOTICE '   Registrations marked as "individual" but have team_id: %', individual_with_teams;
  RAISE NOTICE '';

  IF individual_with_teams > 0 THEN
    RAISE NOTICE '⚠️ Found % registrations that should be type "team"', individual_with_teams;
    RAISE NOTICE '   These will be updated...';
  ELSE
    RAISE NOTICE '✅ No registrations need updating.';
    RAISE NOTICE '   All registrations are correctly typed.';
  END IF;
  RAISE NOTICE '';
END $$;

-- Update participant_type from 'individual' to 'team' where team_id is set
UPDATE hackathon_registrations
SET participant_type = 'team'
WHERE team_id IS NOT NULL
  AND participant_type = 'individual'
  AND EXISTS (
    SELECT 1 FROM hackathons h
    WHERE h.id = hackathon_registrations.hackathon_id
    AND h.created_by = auth.uid()
  );

-- Show results after fix
DO $$
DECLARE
  team_count INTEGER;
  individual_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '✅ UPDATE COMPLETE';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '';

  -- Count team registrations
  SELECT COUNT(*) INTO team_count
  FROM hackathon_registrations hr
  WHERE hr.participant_type = 'team'
    AND EXISTS (
      SELECT 1 FROM hackathons h
      WHERE h.id = hr.hackathon_id
      AND h.created_by = auth.uid()
    );

  -- Count individual registrations
  SELECT COUNT(*) INTO individual_count
  FROM hackathon_registrations hr
  WHERE hr.participant_type = 'individual'
    AND EXISTS (
      SELECT 1 FROM hackathons h
      WHERE h.id = hr.hackathon_id
      AND h.created_by = auth.uid()
    );

  RAISE NOTICE '📊 Updated State:';
  RAISE NOTICE '   Team participants: %', team_count;
  RAISE NOTICE '   Individual participants: %', individual_count;
  RAISE NOTICE '';

  IF team_count > 0 THEN
    RAISE NOTICE '🎉 Teams tab should now show % participants!', team_count;
  ELSE
    RAISE NOTICE 'ℹ️ No team participants found.';
    RAISE NOTICE '   If you expected teams, check if team_id is set in registrations.';
  END IF;
  RAISE NOTICE '';
END $$;

-- Show breakdown by hackathon
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '📋 BREAKDOWN BY HACKATHON';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '';
END $$;

SELECT
  h.title AS "Hackathon",
  COUNT(*) FILTER (WHERE hr.participant_type = 'team') AS "Team Participants",
  COUNT(*) FILTER (WHERE hr.participant_type = 'individual') AS "Individual Participants",
  COUNT(*) AS "Total Participants"
FROM hackathons h
LEFT JOIN hackathon_registrations hr ON h.id = hr.hackathon_id
WHERE h.created_by = auth.uid()
GROUP BY h.id, h.title
ORDER BY h.created_at DESC;

-- Final instructions
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '🔄 NEXT STEPS';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '1. Refresh your browser (Ctrl+Shift+R)';
  RAISE NOTICE '2. Go to Manage Participants page';
  RAISE NOTICE '3. Click on "Teams" tab';
  RAISE NOTICE '4. You should now see team participants!';
  RAISE NOTICE '';
  RAISE NOTICE 'If Teams tab still shows "0 of 0", check:';
  RAISE NOTICE '• Are your participants truly in teams?';
  RAISE NOTICE '• Does team_id column have values?';
  RAISE NOTICE '• Run DIAGNOSTIC_CHECK_PARTICIPANT_TYPES.sql for details';
  RAISE NOTICE '';
END $$;
