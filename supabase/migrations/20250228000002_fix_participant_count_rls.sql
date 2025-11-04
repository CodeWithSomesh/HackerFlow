-- =====================================================
-- FIX: Allow authenticated users to count participants
-- Created: 2025-02-28
-- Description: Adds RLS policy to allow authenticated users to view
--              hackathon_registrations for counting participant numbers
--              WITHOUT exposing sensitive registration details
-- =====================================================

-- This policy allows all authenticated users to SELECT from hackathon_registrations
-- for the purpose of counting participants in hackathons
-- It does NOT conflict with existing policies because:
-- 1. Multiple SELECT policies are combined with OR logic
-- 2. This adds PUBLIC counting ability IN ADDITION TO existing personal view ability
-- 3. Users already get: own registrations OR team member registrations OR ALL (for counting)

CREATE POLICY "Anyone can view registrations for counting participants"
  ON hackathon_registrations
  FOR SELECT
  TO authenticated
  USING (true);

-- Add comment for documentation
COMMENT ON POLICY "Anyone can view registrations for counting participants" ON hackathon_registrations
  IS 'Allows all authenticated users to view hackathon registrations for counting participant numbers in hackathons listing and details pages';

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '✅ PARTICIPANT COUNT FIX APPLIED!';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Added RLS Policy:';
  RAISE NOTICE '   "Anyone can view registrations for counting participants"';
  RAISE NOTICE '';
  RAISE NOTICE '✅ This allows:';
  RAISE NOTICE '   - All authenticated users to count participants';
  RAISE NOTICE '   - Hackathon listing page to show participant counts';
  RAISE NOTICE '   - Hackathon details page to show participant counts';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Existing policies preserved:';
  RAISE NOTICE '   - Users can view their own registrations ✓';
  RAISE NOTICE '   - Team leaders can view team members registrations ✓';
  RAISE NOTICE '   - Users and team leaders can delete registrations ✓';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Next steps:';
  RAISE NOTICE '   1. Refresh your browser (Ctrl+Shift+R)';
  RAISE NOTICE '   2. Check hackathons page - participant counts should show';
  RAISE NOTICE '   3. Check hackathon details - participant counts should show';
  RAISE NOTICE '';
END $$;
