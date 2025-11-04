-- =====================================================
-- FIX: Allow Approve/Reject from ANY Status
-- =====================================================
-- This migration fixes:
-- 1. approve_hackathon() can now approve from ANY status (not just pending)
-- 2. reject_hackathon() can now reject from ANY status (not just pending)
-- =====================================================

-- =====================================================
-- FIX APPROVE FUNCTION - Remove WHERE clause restriction
-- =====================================================

DROP FUNCTION IF EXISTS approve_hackathon(UUID, UUID);

CREATE OR REPLACE FUNCTION approve_hackathon(
  p_hackathon_id UUID,
  p_admin_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Unauthorized: User is not an admin';
  END IF;

  -- Update hackathon - REMOVED "WHERE verification_status = 'pending'" restriction
  -- Now works on rejected, pending, or any status
  UPDATE hackathons
  SET
    verification_status = 'verified',
    status = 'published',
    approved_by = p_admin_id,
    approved_at = NOW(),
    rejected_by = NULL,           -- Clear rejection fields
    rejected_at = NULL,
    rejection_reason = NULL,
    posting_fee_paid = TRUE,
    posting_fee_paid_at = NOW(),
    updated_at = NOW()
  WHERE id = p_hackathon_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION approve_hackathon(UUID, UUID) TO authenticated;

-- =====================================================
-- FIX REJECT FUNCTION - Remove WHERE clause restriction
-- =====================================================

DROP FUNCTION IF EXISTS reject_hackathon(UUID, UUID, TEXT);

CREATE OR REPLACE FUNCTION reject_hackathon(
  p_hackathon_id UUID,
  p_admin_id UUID,
  p_rejection_reason TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Unauthorized: User is not an admin';
  END IF;

  -- Update hackathon - REMOVED "WHERE verification_status = 'pending'" restriction
  -- Now works on verified, pending, or any status
  UPDATE hackathons
  SET
    verification_status = 'rejected',
    status = 'draft',
    rejected_by = p_admin_id,
    rejected_at = NOW(),
    rejection_reason = p_rejection_reason,
    approved_by = NULL,           -- Clear approval fields
    approved_at = NULL,
    posting_fee_paid = FALSE,     -- Revoke payment status
    posting_fee_paid_at = NULL,
    updated_at = NOW()
  WHERE id = p_hackathon_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION reject_hackathon(UUID, UUID, TEXT) TO authenticated;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '✅ APPROVE/REJECT ANY STATUS FIX APPLIED!';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Fixed:';
  RAISE NOTICE '   - approve_hackathon() now works from ANY status';
  RAISE NOTICE '   - reject_hackathon() now works from ANY status';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Now supports:';
  RAISE NOTICE '   - Rejecting approved/verified hackathons';
  RAISE NOTICE '   - Approving rejected hackathons';
  RAISE NOTICE '   - Re-approving/Re-rejecting multiple times';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Bonus improvements:';
  RAISE NOTICE '   - approve_hackathon() clears rejection fields';
  RAISE NOTICE '   - reject_hackathon() clears approval fields';
  RAISE NOTICE '   - reject_hackathon() revokes payment status';
  RAISE NOTICE '';
END $$;
