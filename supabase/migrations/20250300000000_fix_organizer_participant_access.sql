-- =====================================================
-- FIX: Organizer Dashboard Participant Access
-- Created: 2025-03-00
-- Description: Ensures organizers can view participants
--              for hackathons they created
-- =====================================================

-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Organizers can view participants of their hackathons" ON hackathon_registrations;

-- Create policy allowing organizers to view all registrations for their hackathons
CREATE POLICY "Organizers can view participants of their hackathons"
  ON hackathon_registrations
  FOR SELECT
  TO authenticated
  USING (
    -- User is the organizer of this hackathon
    EXISTS (
      SELECT 1
      FROM hackathons
      WHERE hackathons.id = hackathon_registrations.hackathon_id
        AND hackathons.created_by = auth.uid()
      LIMIT 1
    )
  );

-- Add comment for documentation
COMMENT ON POLICY "Organizers can view participants of their hackathons" ON hackathon_registrations
  IS 'Allows hackathon organizers to view all participants registered for their hackathons';

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '✅ ORGANIZER PARTICIPANT ACCESS FIX APPLIED!';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Added RLS Policy:';
  RAISE NOTICE '   "Organizers can view participants of their hackathons"';
  RAISE NOTICE '';
  RAISE NOTICE '✅ This allows:';
  RAISE NOTICE '   - Organizers to see participant counts for their hackathons';
  RAISE NOTICE '   - Organizers to view participant details in Manage Participants';
  RAISE NOTICE '   - Organizers to select winners from participants';
  RAISE NOTICE '   - Analytics tab to show registration data';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Next steps:';
  RAISE NOTICE '   1. Refresh your browser (Ctrl+Shift+R)';
  RAISE NOTICE '   2. Check Organizer Dashboard Overview - participant counts should show';
  RAISE NOTICE '   3. Check Hackathons tab - participant counts should show';
  RAISE NOTICE '   4. Check Manage Participants - participants should be listed';
  RAISE NOTICE '   5. Check Analytics tab - registration data should display';
  RAISE NOTICE '';
END $$;
