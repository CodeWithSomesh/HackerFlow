-- =====================================================
-- DIAGNOSTIC: Check Participant Types
-- Run this in Supabase SQL Editor to understand your data
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '🔍 CHECKING PARTICIPANT DATA...';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '';
END $$;

-- Check 1: How many participants by type?
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📊 PARTICIPANTS BY TYPE:';
  RAISE NOTICE '════════════════════════════════════════════';
END $$;

SELECT
  participant_type,
  COUNT(*) as count
FROM hackathon_registrations hr
WHERE EXISTS (
  SELECT 1 FROM hackathons h
  WHERE h.id = hr.hackathon_id
  AND h.created_by = auth.uid()
)
GROUP BY participant_type
ORDER BY count DESC;

-- Check 2: Show all participants with details
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📋 ALL YOUR PARTICIPANTS:';
  RAISE NOTICE '════════════════════════════════════════════';
END $$;

SELECT
  hr.first_name || ' ' || hr.last_name as "Participant",
  hr.email as "Email",
  hr.participant_type as "Type",
  hr.registration_status as "Status",
  h.title as "Hackathon",
  hr.team_id as "Team ID",
  CASE
    WHEN hr.team_id IS NOT NULL THEN '✅ Has Team'
    ELSE '❌ No Team'
  END as "Team Status"
FROM hackathon_registrations hr
JOIN hackathons h ON h.id = hr.hackathon_id
WHERE h.created_by = auth.uid()
ORDER BY hr.created_at DESC;

-- Check 3: Teams data
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🏆 TEAMS DATA:';
  RAISE NOTICE '════════════════════════════════════════════';
END $$;

SELECT
  ht.team_name as "Team Name",
  h.title as "Hackathon",
  ht.team_size_current as "Current Size",
  ht.team_size_max as "Max Size",
  COUNT(htm.id) as "Actual Members"
FROM hackathon_teams ht
JOIN hackathons h ON h.id = ht.hackathon_id
LEFT JOIN hackathon_team_members htm ON htm.team_id = ht.id
WHERE h.created_by = auth.uid()
GROUP BY ht.id, ht.team_name, h.title, ht.team_size_current, ht.team_size_max
ORDER BY h.title, ht.team_name;

-- Check 4: Registration-Team relationship
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔗 REGISTRATION-TEAM RELATIONSHIP:';
  RAISE NOTICE '════════════════════════════════════════════';
END $$;

SELECT
  hr.first_name || ' ' || hr.last_name as "Participant",
  hr.participant_type as "Reg Type",
  CASE
    WHEN hr.team_id IS NOT NULL THEN 'Linked to Team'
    ELSE 'No Team Link'
  END as "Has team_id?",
  ht.team_name as "Team Name (via team_id)"
FROM hackathon_registrations hr
JOIN hackathons h ON h.id = hr.hackathon_id
LEFT JOIN hackathon_teams ht ON ht.id = hr.team_id
WHERE h.created_by = auth.uid()
ORDER BY hr.participant_type, hr.created_at DESC;

-- Final diagnosis
DO $$
DECLARE
  team_registrations INTEGER;
  individual_registrations INTEGER;
  teams_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '🎯 DIAGNOSIS:';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '';

  -- Count by participant_type
  SELECT COUNT(*) INTO team_registrations
  FROM hackathon_registrations hr
  WHERE EXISTS (
    SELECT 1 FROM hackathons h
    WHERE h.id = hr.hackathon_id AND h.created_by = auth.uid()
  )
  AND hr.participant_type = 'team';

  SELECT COUNT(*) INTO individual_registrations
  FROM hackathon_registrations hr
  WHERE EXISTS (
    SELECT 1 FROM hackathons h
    WHERE h.id = hr.hackathon_id AND h.created_by = auth.uid()
  )
  AND hr.participant_type = 'individual';

  SELECT COUNT(*) INTO teams_count
  FROM hackathon_teams ht
  WHERE EXISTS (
    SELECT 1 FROM hackathons h
    WHERE h.id = ht.hackathon_id AND h.created_by = auth.uid()
  );

  RAISE NOTICE 'Registrations with participant_type = "team": %', team_registrations;
  RAISE NOTICE 'Registrations with participant_type = "individual": %', individual_registrations;
  RAISE NOTICE 'Actual teams in hackathon_teams table: %', teams_count;
  RAISE NOTICE '';

  IF team_registrations = 0 AND teams_count > 0 THEN
    RAISE NOTICE '⚠️ ISSUE FOUND: You have teams but no registrations marked as type "team"!';
    RAISE NOTICE '   This is why the Teams tab shows "0 of 0 participants".';
    RAISE NOTICE '';
    RAISE NOTICE '💡 SOLUTION: Check if registrations should be linked to teams via team_id.';
    RAISE NOTICE '   The participant_type field should be "team" for team participants.';
  ELSIF team_registrations > 0 THEN
    RAISE NOTICE '✅ You have % team registrations. Teams tab should work!', team_registrations;
  ELSE
    RAISE NOTICE 'ℹ️ You have no team participants yet. All participants are individuals.';
  END IF;

  RAISE NOTICE '';
END $$;
