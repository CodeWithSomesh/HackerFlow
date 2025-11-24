-- =====================================================
-- FIX ALL REMAINING ORGANIZER DASHBOARD ISSUES
-- Run this in Supabase SQL Editor
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '🔧 FIXING REMAINING ISSUES...';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '';
END $$;

-- =====================================================
-- FIX 1: Allow organizers to view teams for their hackathons
-- This fixes the "Teams" tab in Manage Participants
-- =====================================================

DROP POLICY IF EXISTS "Organizers can view teams for their hackathons" ON hackathon_teams;

CREATE POLICY "Organizers can view teams for their hackathons"
  ON hackathon_teams
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM hackathons
      WHERE hackathons.id = hackathon_teams.hackathon_id
        AND hackathons.created_by = auth.uid()
      LIMIT 1
    )
  );

DO $$
BEGIN
  RAISE NOTICE '✅ Created policy: "Organizers can view teams for their hackathons"';
  RAISE NOTICE '   This fixes: Teams tab in Manage Participants';
  RAISE NOTICE '';
END $$;

-- =====================================================
-- FIX 2: Allow organizers to view team members for their hackathons
-- This shows team member details
-- =====================================================

DROP POLICY IF EXISTS "Organizers can view team members for their hackathons" ON hackathon_team_members;

CREATE POLICY "Organizers can view team members for their hackathons"
  ON hackathon_team_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM hackathon_teams ht
      JOIN hackathons h ON h.id = ht.hackathon_id
      WHERE ht.id = hackathon_team_members.team_id
        AND h.created_by = auth.uid()
      LIMIT 1
    )
  );

DO $$
BEGIN
  RAISE NOTICE '✅ Created policy: "Organizers can view team members for their hackathons"';
  RAISE NOTICE '   This fixes: Team member details in Manage Participants';
  RAISE NOTICE '';
END $$;

-- =====================================================
-- FIX 3: Allow organizers to view winners for their hackathons
-- This fixes the Manage Winners page
-- =====================================================

DROP POLICY IF EXISTS "Organizers can view winners for their hackathons" ON hackathon_winners;

CREATE POLICY "Organizers can view winners for their hackathons"
  ON hackathon_winners
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM hackathons
      WHERE hackathons.id = hackathon_winners.hackathon_id
        AND hackathons.created_by = auth.uid()
      LIMIT 1
    )
  );

DO $$
BEGIN
  RAISE NOTICE '✅ Created policy: "Organizers can view winners for their hackathons"';
  RAISE NOTICE '   This fixes: Manage Winners page participant display';
  RAISE NOTICE '';
END $$;

-- =====================================================
-- FIX 4: Allow organizers to insert/update winners
-- This enables winner selection
-- =====================================================

DROP POLICY IF EXISTS "Organizers can manage winners for their hackathons" ON hackathon_winners;

CREATE POLICY "Organizers can manage winners for their hackathons"
  ON hackathon_winners
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM hackathons
      WHERE hackathons.id = hackathon_winners.hackathon_id
        AND hackathons.created_by = auth.uid()
      LIMIT 1
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM hackathons
      WHERE hackathons.id = hackathon_winners.hackathon_id
        AND hackathons.created_by = auth.uid()
      LIMIT 1
    )
  );

DO $$
BEGIN
  RAISE NOTICE '✅ Created policy: "Organizers can manage winners for their hackathons"';
  RAISE NOTICE '   This fixes: Ability to select and update winners';
  RAISE NOTICE '';
END $$;

-- =====================================================
-- VERIFICATION: Show all new policies
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '📋 VERIFICATION: New Policies Created';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '';
END $$;

SELECT
  tablename AS "Table",
  policyname AS "Policy Name",
  cmd AS "Command"
FROM pg_policies
WHERE policyname LIKE '%Organizers%'
ORDER BY tablename, policyname;

-- =====================================================
-- TEST: Check your data access
-- =====================================================

DO $$
DECLARE
  your_user_id UUID;
  teams_count INTEGER;
  team_members_count INTEGER;
  winners_count INTEGER;
BEGIN
  SELECT auth.uid() INTO your_user_id;

  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '🧪 TESTING YOUR DATA ACCESS';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Your User ID: %', your_user_id;
  RAISE NOTICE '';

  -- Count teams for your hackathons
  SELECT COUNT(*) INTO teams_count
  FROM hackathon_teams ht
  WHERE EXISTS (
    SELECT 1 FROM hackathons h
    WHERE h.id = ht.hackathon_id
      AND h.created_by = your_user_id
  );

  RAISE NOTICE '📊 Teams in your hackathons: %', teams_count;

  -- Count team members
  SELECT COUNT(*) INTO team_members_count
  FROM hackathon_team_members htm
  WHERE EXISTS (
    SELECT 1 FROM hackathon_teams ht
    JOIN hackathons h ON h.id = ht.hackathon_id
    WHERE ht.id = htm.team_id
      AND h.created_by = your_user_id
  );

  RAISE NOTICE '📊 Team members total: %', team_members_count;

  -- Count winners
  SELECT COUNT(*) INTO winners_count
  FROM hackathon_winners hw
  WHERE EXISTS (
    SELECT 1 FROM hackathons h
    WHERE h.id = hw.hackathon_id
      AND h.created_by = your_user_id
  );

  RAISE NOTICE '📊 Winners declared: %', winners_count;
  RAISE NOTICE '';

  IF teams_count > 0 THEN
    RAISE NOTICE '✅ You can now view teams in Manage Participants!';
  END IF;

  IF team_members_count > 0 THEN
    RAISE NOTICE '✅ You can now view team member details!';
  END IF;

  IF winners_count > 0 THEN
    RAISE NOTICE '✅ You can now view winners!';
  ELSE
    RAISE NOTICE '💡 No winners declared yet - you can now add them in Manage Winners!';
  END IF;

  RAISE NOTICE '';
END $$;

-- =====================================================
-- SHOW DETAILED BREAKDOWN
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '📋 TEAMS BY HACKATHON';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '';
END $$;

SELECT
  h.title AS "Hackathon",
  COUNT(DISTINCT ht.id) AS "Teams",
  COUNT(DISTINCT htm.id) AS "Team Members",
  COUNT(DISTINCT hr.id) FILTER (WHERE hr.participant_type = 'team') AS "Team Registrations",
  COUNT(DISTINCT hr.id) FILTER (WHERE hr.participant_type = 'individual') AS "Individual Registrations"
FROM hackathons h
LEFT JOIN hackathon_teams ht ON h.id = ht.hackathon_id
LEFT JOIN hackathon_team_members htm ON ht.id = htm.team_id
LEFT JOIN hackathon_registrations hr ON h.id = hr.hackathon_id
WHERE h.created_by = auth.uid()
GROUP BY h.id, h.title
ORDER BY h.created_at DESC;

-- =====================================================
-- FINAL SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '🎉 ALL FIXES APPLIED SUCCESSFULLY!';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✅ What was fixed:';
  RAISE NOTICE '   1. Teams tab in Manage Participants';
  RAISE NOTICE '   2. Team member details display';
  RAISE NOTICE '   3. Manage Winners participant list';
  RAISE NOTICE '   4. Ability to select and update winners';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Next Steps:';
  RAISE NOTICE '   1. Refresh your browser (Ctrl+Shift+R)';
  RAISE NOTICE '   2. Go to Manage Participants → Teams tab';
  RAISE NOTICE '   3. Go to Manage Winners';
  RAISE NOTICE '   4. All should work now!';
  RAISE NOTICE '';
  RAISE NOTICE 'Note: Analytics and Calendar issues require code fixes.';
  RAISE NOTICE 'Working on those next...';
  RAISE NOTICE '';
END $$;
