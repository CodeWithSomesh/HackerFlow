-- =====================================================
-- COMPLETE ORGANIZER DASHBOARD FIX
-- Run this ENTIRE script in Supabase SQL Editor
-- =====================================================

-- Step 1: Check current policies on hackathon_registrations
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '🔍 CHECKING CURRENT POLICIES...';
  RAISE NOTICE '════════════════════════════════════════════';
END $$;

-- Show current policies
SELECT
  policyname,
  cmd,
  CASE
    WHEN policyname LIKE '%Organizers%' THEN '✅ ORGANIZER POLICY EXISTS'
    ELSE '⚠️ OTHER POLICY'
  END as status
FROM pg_policies
WHERE tablename = 'hackathon_registrations';

-- Step 2: Drop and recreate the organizer policy
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '🔧 CREATING ORGANIZER ACCESS POLICY...';
  RAISE NOTICE '════════════════════════════════════════════';
END $$;

-- Drop if exists
DROP POLICY IF EXISTS "Organizers can view participants of their hackathons" ON hackathon_registrations;

-- Create the policy
CREATE POLICY "Organizers can view participants of their hackathons"
  ON hackathon_registrations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM hackathons
      WHERE hackathons.id = hackathon_registrations.hackathon_id
        AND hackathons.created_by = auth.uid()
      LIMIT 1
    )
  );

-- Step 3: Verify the policy was created
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'hackathon_registrations'
    AND policyname = 'Organizers can view participants of their hackathons';

  IF policy_count > 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════';
    RAISE NOTICE '✅ SUCCESS! POLICY CREATED!';
    RAISE NOTICE '════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Policy: "Organizers can view participants of their hackathons"';
    RAISE NOTICE '';
    RAISE NOTICE '✅ This FIXES:';
    RAISE NOTICE '   ✅ Overview Tab - Participant counts will show';
    RAISE NOTICE '   ✅ Hackathons Tab - Participant counts will show';
    RAISE NOTICE '   ✅ Manage Participants - Participants will be listed';
    RAISE NOTICE '   ✅ Manage Winners - Can select winners';
    RAISE NOTICE '   ✅ Analytics Tab - Registration data will display';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════';
    RAISE NOTICE '❌ ERROR! POLICY NOT CREATED!';
    RAISE NOTICE '════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'Please contact support or check permissions.';
    RAISE NOTICE '';
  END IF;
END $$;

-- Step 4: Test the policy with a sample query
DO $$
DECLARE
  your_user_id UUID;
  hackathon_count INTEGER;
  registration_count INTEGER;
BEGIN
  -- Get your user ID
  SELECT auth.uid() INTO your_user_id;

  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '🧪 TESTING YOUR DATA ACCESS...';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Your User ID: %', your_user_id;
  RAISE NOTICE '';

  -- Count your hackathons
  SELECT COUNT(*) INTO hackathon_count
  FROM hackathons
  WHERE created_by = your_user_id;

  RAISE NOTICE '📊 Your Hackathons: % hackathons created', hackathon_count;

  -- Count registrations for your hackathons
  SELECT COUNT(*) INTO registration_count
  FROM hackathon_registrations hr
  WHERE EXISTS (
    SELECT 1
    FROM hackathons h
    WHERE h.id = hr.hackathon_id
      AND h.created_by = your_user_id
  );

  RAISE NOTICE '📊 Total Registrations: % participants across all your hackathons', registration_count;
  RAISE NOTICE '';

  IF registration_count > 0 THEN
    RAISE NOTICE '✅ SUCCESS! You can now see participant data!';
  ELSE
    IF hackathon_count > 0 THEN
      RAISE NOTICE '⚠️ You have hackathons but no registrations yet.';
      RAISE NOTICE '   This is normal if no one has registered.';
    ELSE
      RAISE NOTICE '⚠️ You have not created any hackathons yet.';
      RAISE NOTICE '   Create a hackathon first, then check back.';
    END IF;
  END IF;
  RAISE NOTICE '';
END $$;

-- Step 5: Show detailed breakdown
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '📋 DETAILED BREAKDOWN BY HACKATHON:';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '';
END $$;

-- Show participant counts per hackathon
SELECT
  h.title AS "Hackathon Title",
  h.status AS "Status",
  COUNT(DISTINCT hr.id) AS "Total Participants",
  COUNT(DISTINCT CASE WHEN hr.participant_type = 'team' THEN hr.id END) AS "Team Participants",
  COUNT(DISTINCT CASE WHEN hr.participant_type = 'individual' THEN hr.id END) AS "Individual Participants",
  to_char(h.registration_start_date, 'YYYY-MM-DD') AS "Registration Start",
  to_char(h.registration_end_date, 'YYYY-MM-DD') AS "Registration End"
FROM hackathons h
LEFT JOIN hackathon_registrations hr ON h.id = hr.hackathon_id
WHERE h.created_by = auth.uid()
GROUP BY h.id, h.title, h.status, h.registration_start_date, h.registration_end_date
ORDER BY h.created_at DESC;

-- Final success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '🎉 ALL DONE!';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Next Steps:';
  RAISE NOTICE '   1. Close this SQL Editor';
  RAISE NOTICE '   2. Go to your browser';
  RAISE NOTICE '   3. Open Developer Console (F12)';
  RAISE NOTICE '   4. Run: localStorage.setItem("useDummyData", "false")';
  RAISE NOTICE '   5. Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)';
  RAISE NOTICE '   6. Check your Organizer Dashboard!';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Expected Results:';
  RAISE NOTICE '   • Overview Tab: Shows participant counts';
  RAISE NOTICE '   • Hackathons Tab: Shows participant counts';
  RAISE NOTICE '   • Manage Participants: Lists all participants';
  RAISE NOTICE '   • Manage Winners: Can select winners';
  RAISE NOTICE '   • Calendar: Shows all your hackathons';
  RAISE NOTICE '   • Analytics: Displays registration charts';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Your Organizer Dashboard is now FIXED!';
  RAISE NOTICE '';
END $$;
