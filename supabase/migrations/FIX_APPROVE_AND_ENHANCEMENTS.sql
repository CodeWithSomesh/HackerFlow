-- =====================================================
-- FIX APPROVE HACKATHON + ADD ENHANCEMENTS
-- =====================================================
-- This migration fixes:
-- 1. Approve hackathon constraint issue
-- 2. Adds functions for hackathon filtering by status
-- 3. Adds user search functionality
-- =====================================================

-- =====================================================
-- PART 1: FIX VERIFICATION STATUS CONSTRAINT
-- =====================================================

-- First, let's ensure the constraint allows the right values
ALTER TABLE hackathons DROP CONSTRAINT IF EXISTS hackathons_verification_status_check;
ALTER TABLE hackathons ADD CONSTRAINT hackathons_verification_status_check
  CHECK (verification_status IN ('pending', 'verified', 'confirmed', 'rejected'));

-- =====================================================
-- PART 2: UPDATE APPROVE FUNCTION TO USE 'verified'
-- =====================================================

-- The issue is that we're setting verification_status = 'confirmed'
-- but the original constraint might be expecting 'verified'
-- Let's update the function to use 'verified' which is more standard

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

  -- Update hackathon - use 'verified' instead of 'confirmed'
  UPDATE hackathons
  SET
    verification_status = 'verified',  -- Changed from 'confirmed'
    status = 'published',
    approved_by = p_admin_id,
    approved_at = NOW(),
    posting_fee_paid = TRUE,
    posting_fee_paid_at = NOW(),
    updated_at = NOW()
  WHERE id = p_hackathon_id
  AND verification_status = 'pending';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION approve_hackathon(UUID, UUID) TO authenticated;

-- =====================================================
-- PART 3: ADD FUNCTION TO GET HACKATHONS BY STATUS
-- =====================================================

-- Function to get all hackathons with a specific verification status
CREATE OR REPLACE FUNCTION get_hackathons_by_status(
  p_status TEXT
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  organization TEXT,
  about TEXT,
  identity_document_url TEXT,
  authorization_letter_url TEXT,
  verification_status TEXT,
  status TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  organizer_name TEXT,
  organizer_email TEXT,
  organizer_organization TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    h.id,
    h.title,
    h.organization,
    h.about,
    h.identity_document_url,
    h.authorization_letter_url,
    h.verification_status,
    h.status,
    h.created_by,
    h.created_at,
    h.approved_at,
    h.rejected_at,
    h.rejection_reason,
    up.full_name as organizer_name,
    up.email as organizer_email,
    up.organization_name as organizer_organization
  FROM hackathons h
  LEFT JOIN user_profiles up ON h.created_by = up.user_id
  WHERE h.verification_status = p_status
  ORDER BY h.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_hackathons_by_status(TEXT) TO authenticated;

-- =====================================================
-- PART 4: ADD FUNCTION TO SEARCH USERS BY EMAIL
-- =====================================================

CREATE OR REPLACE FUNCTION search_users_by_email(
  p_email_query TEXT
)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  user_primary_type TEXT,
  organization_name TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    up.user_id,
    up.email,
    up.full_name,
    up.role,
    up.user_primary_type,
    up.organization_name,
    up.created_at
  FROM user_profiles up
  WHERE up.email ILIKE '%' || p_email_query || '%'
  ORDER BY up.email ASC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION search_users_by_email(TEXT) TO authenticated;

-- =====================================================
-- PART 5: ADD VIEW FOR ALL HACKATHONS (NOT JUST PENDING)
-- =====================================================

DROP VIEW IF EXISTS admin_all_hackathons;

CREATE OR REPLACE VIEW admin_all_hackathons AS
SELECT
  h.id,
  h.title,
  h.organization,
  h.about,
  h.identity_document_url,
  h.authorization_letter_url,
  h.verification_status,
  h.status,
  h.created_by,
  h.created_at,
  h.approved_by,
  h.approved_at,
  h.rejected_by,
  h.rejected_at,
  h.rejection_reason,
  h.posting_fee,
  h.posting_fee_paid,
  h.posting_fee_paid_at,
  up.full_name as organizer_name,
  up.email as organizer_email,
  up.organization_name as organizer_organization
FROM hackathons h
LEFT JOIN user_profiles up ON h.created_by = up.user_id
ORDER BY h.created_at DESC;

GRANT SELECT ON admin_all_hackathons TO authenticated;

-- =====================================================
-- PART 6: UPDATE ADMIN REVENUE STATS VIEW
-- =====================================================

DROP VIEW IF EXISTS admin_revenue_stats;

CREATE OR REPLACE VIEW admin_revenue_stats AS
SELECT
  COUNT(*) FILTER (WHERE posting_fee_paid = TRUE) as total_paid_hackathons,
  SUM(posting_fee) FILTER (WHERE posting_fee_paid = TRUE) as total_revenue,
  SUM(posting_fee) FILTER (WHERE posting_fee_paid = TRUE AND posting_fee_paid_at >= NOW() - INTERVAL '6 months') as revenue_last_6_months,
  SUM(posting_fee) FILTER (WHERE posting_fee_paid = TRUE AND posting_fee_paid_at >= DATE_TRUNC('month', NOW())) as revenue_this_month,
  SUM(posting_fee) FILTER (WHERE posting_fee_paid = TRUE AND posting_fee_paid_at >= DATE_TRUNC('day', NOW())) as revenue_today,
  COUNT(*) FILTER (WHERE verification_status = 'pending') as pending_approvals,
  COUNT(*) FILTER (WHERE verification_status IN ('verified', 'confirmed')) as approved_hackathons,
  COUNT(*) FILTER (WHERE verification_status = 'rejected') as rejected_hackathons
FROM hackathons;

GRANT SELECT ON admin_revenue_stats TO authenticated;

-- =====================================================
-- PART 7: ADD FUNCTION TO RE-APPROVE REJECTED HACKATHON
-- =====================================================

CREATE OR REPLACE FUNCTION reapprove_hackathon(
  p_hackathon_id UUID,
  p_admin_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Unauthorized: User is not an admin';
  END IF;

  -- Update previously rejected hackathon
  UPDATE hackathons
  SET
    verification_status = 'verified',
    status = 'published',
    approved_by = p_admin_id,
    approved_at = NOW(),
    rejected_by = NULL,
    rejected_at = NULL,
    rejection_reason = NULL,
    posting_fee_paid = TRUE,
    posting_fee_paid_at = NOW(),
    updated_at = NOW()
  WHERE id = p_hackathon_id
  AND verification_status = 'rejected';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION reapprove_hackathon(UUID, UUID) TO authenticated;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '✅ APPROVE FIX + ENHANCEMENTS APPLIED!';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Fixed:';
  RAISE NOTICE '   - approve_hackathon() now uses ''verified'' status';
  RAISE NOTICE '   - Updated verification_status constraint';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Added:';
  RAISE NOTICE '   - get_hackathons_by_status() function';
  RAISE NOTICE '   - search_users_by_email() function';
  RAISE NOTICE '   - reapprove_hackathon() function';
  RAISE NOTICE '   - admin_all_hackathons view';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Features enabled:';
  RAISE NOTICE '   - Filter hackathons by status (pending/verified/rejected)';
  RAISE NOTICE '   - Search users by email';
  RAISE NOTICE '   - Re-approve rejected hackathons';
  RAISE NOTICE '   - View all hackathons (not just pending)';
  RAISE NOTICE '';
END $$;
