-- =====================================================
-- COMBINED MIGRATION: Fix All Admin Dashboard Issues
-- =====================================================
-- This file combines all necessary migrations into one
-- Run this in Supabase SQL Editor to fix everything
-- =====================================================

-- =====================================================
-- PART 1: ADD MISSING COLUMNS TO HACKATHONS TABLE
-- =====================================================

-- Add posting fee column to track when hackathon was approved and fee was charged
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS posting_fee NUMERIC DEFAULT 20.00;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS posting_fee_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS posting_fee_paid_at TIMESTAMPTZ;

-- Add approved_by column to track which admin approved the hackathon
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Add rejection tracking
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES auth.users(id);
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hackathons_posting_fee_paid ON hackathons(posting_fee_paid, posting_fee_paid_at);
CREATE INDEX IF NOT EXISTS idx_hackathons_approved_at ON hackathons(approved_at) WHERE approved_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_hackathons_rejected_at ON hackathons(rejected_at) WHERE rejected_at IS NOT NULL;

-- =====================================================
-- PART 2: FIX RLS POLICIES FOR ADMIN VIEWS
-- =====================================================

-- Drop and recreate the views with proper permissions
DROP VIEW IF EXISTS admin_pending_hackathons;
DROP VIEW IF EXISTS admin_revenue_stats;
DROP VIEW IF EXISTS admin_user_stats;

-- Recreate admin_revenue_stats view
CREATE OR REPLACE VIEW admin_revenue_stats AS
SELECT
  COUNT(*) FILTER (WHERE posting_fee_paid = TRUE) as total_paid_hackathons,
  SUM(posting_fee) FILTER (WHERE posting_fee_paid = TRUE) as total_revenue,
  SUM(posting_fee) FILTER (
    WHERE posting_fee_paid = TRUE
    AND posting_fee_paid_at >= NOW() - INTERVAL '6 months'
  ) as revenue_last_6_months,
  SUM(posting_fee) FILTER (
    WHERE posting_fee_paid = TRUE
    AND posting_fee_paid_at >= DATE_TRUNC('month', NOW())
  ) as revenue_this_month,
  SUM(posting_fee) FILTER (
    WHERE posting_fee_paid = TRUE
    AND posting_fee_paid_at >= DATE_TRUNC('day', NOW())
  ) as revenue_today,
  COUNT(*) FILTER (WHERE verification_status = 'pending') as pending_approvals,
  COUNT(*) FILTER (WHERE verification_status = 'confirmed') as approved_hackathons,
  COUNT(*) FILTER (WHERE verification_status = 'rejected') as rejected_hackathons
FROM hackathons;

-- Recreate admin_pending_hackathons view
CREATE OR REPLACE VIEW admin_pending_hackathons AS
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
  up.full_name as organizer_name,
  up.email as organizer_email,
  up.organization_name as organizer_organization
FROM hackathons h
LEFT JOIN user_profiles up ON h.created_by = up.user_id
WHERE h.verification_status = 'pending'
ORDER BY h.created_at ASC;

-- Recreate admin_user_stats view
CREATE OR REPLACE VIEW admin_user_stats AS
SELECT
  COUNT(*) FILTER (WHERE role = 'user') as total_users,
  COUNT(*) FILTER (WHERE role = 'admin') as total_admins,
  COUNT(*) FILTER (WHERE role = 'superadmin') as total_superadmins,
  COUNT(*) FILTER (WHERE user_primary_type = 'hacker') as total_hackers,
  COUNT(*) FILTER (WHERE user_primary_type = 'organizer') as total_organizers,
  COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('month', NOW())) as new_users_this_month,
  COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('day', NOW())) as new_users_today
FROM user_profiles;

-- Grant permissions
GRANT SELECT ON admin_revenue_stats TO authenticated;
GRANT SELECT ON admin_pending_hackathons TO authenticated;
GRANT SELECT ON admin_user_stats TO authenticated;

-- =====================================================
-- PART 3: FIX FUNCTION PARAMETER ORDER ISSUE
-- =====================================================

-- Drop existing functions
DROP FUNCTION IF EXISTS promote_to_admin(UUID, UUID);
DROP FUNCTION IF EXISTS demote_to_user(UUID, UUID);

-- Recreate promote_to_admin with alphabetical parameter order
CREATE OR REPLACE FUNCTION promote_to_admin(
  p_superadmin_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if caller is superadmin
  IF NOT is_superadmin(p_superadmin_id) THEN
    RAISE EXCEPTION 'Unauthorized: Only superadmins can promote users to admin';
  END IF;

  -- Update user role
  UPDATE user_profiles
  SET
    role = 'admin',
    updated_at = NOW()
  WHERE user_id = p_user_id
  AND role = 'user';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate demote_to_user with alphabetical parameter order
CREATE OR REPLACE FUNCTION demote_to_user(
  p_superadmin_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if caller is superadmin
  IF NOT is_superadmin(p_superadmin_id) THEN
    RAISE EXCEPTION 'Unauthorized: Only superadmins can demote admins';
  END IF;

  -- Prevent demoting superadmin
  IF is_superadmin(p_user_id) THEN
    RAISE EXCEPTION 'Cannot demote superadmin';
  END IF;

  -- Update user role
  UPDATE user_profiles
  SET
    role = 'user',
    updated_at = NOW()
  WHERE user_id = p_user_id
  AND role = 'admin';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION promote_to_admin(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION demote_to_user(UUID, UUID) TO authenticated;

-- =====================================================
-- PART 4: ADD MISSING RLS POLICIES FOR USER_PROFILES
-- =====================================================

-- Ensure admins can view user emails (needed for admin dashboard)
DO $$
BEGIN
  -- Drop existing policy if it exists
  DROP POLICY IF EXISTS "Admins can view all user emails" ON user_profiles;

  -- Create new policy
  CREATE POLICY "Admins can view all user emails"
    ON user_profiles FOR SELECT
    USING (
      auth.uid() = user_id  -- Users can view their own profile
      OR
      EXISTS (
        SELECT 1 FROM user_profiles up
        WHERE up.user_id = auth.uid()
        AND up.role IN ('admin', 'superadmin')
      )
    );
END $$;

-- =====================================================
-- PART 5: ENSURE STORAGE POLICIES FOR DOCUMENTS
-- =====================================================

-- Allow admins to view all identity documents
DROP POLICY IF EXISTS "Admins can view identity documents" ON storage.objects;
CREATE POLICY "Admins can view identity documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'identity-documents'
    AND (
      auth.uid() = owner
      OR EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.role IN ('admin', 'superadmin')
      )
    )
  );

-- Allow admins to view all authorization letters
DROP POLICY IF EXISTS "Admins can view authorization letters" ON storage.objects;
CREATE POLICY "Admins can view authorization letters"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'authorization-letters'
    AND (
      auth.uid() = owner
      OR EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.role IN ('admin', 'superadmin')
      )
    )
  );

-- =====================================================
-- PART 6: ADD COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN hackathons.posting_fee IS 'Fee charged for posting hackathon (RM 20.00)';
COMMENT ON COLUMN hackathons.posting_fee_paid IS 'Whether the posting fee has been paid (set to true on admin approval)';
COMMENT ON COLUMN hackathons.posting_fee_paid_at IS 'Timestamp when the posting fee was paid';
COMMENT ON COLUMN hackathons.approved_by IS 'Admin user who approved the hackathon';
COMMENT ON COLUMN hackathons.approved_at IS 'Timestamp when the hackathon was approved';
COMMENT ON COLUMN hackathons.rejected_by IS 'Admin user who rejected the hackathon';
COMMENT ON COLUMN hackathons.rejected_at IS 'Timestamp when the hackathon was rejected';
COMMENT ON COLUMN hackathons.rejection_reason IS 'Reason provided for rejecting the hackathon';
COMMENT ON VIEW admin_revenue_stats IS 'Revenue statistics for admin dashboard';
COMMENT ON VIEW admin_pending_hackathons IS 'Pending hackathons awaiting admin approval';
COMMENT ON VIEW admin_user_stats IS 'User statistics for admin dashboard';
COMMENT ON FUNCTION promote_to_admin(UUID, UUID) IS 'Promotes a user to admin role (superadmin only). Parameters are in alphabetical order for RPC compatibility.';
COMMENT ON FUNCTION demote_to_user(UUID, UUID) IS 'Demotes an admin to user role (superadmin only). Parameters are in alphabetical order for RPC compatibility.';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ All admin dashboard fixes applied successfully!';
  RAISE NOTICE '📝 Next step: Set your account as superadmin';
  RAISE NOTICE 'Run: UPDATE user_profiles SET role = ''superadmin'' WHERE email = ''your-email@example.com'';';
END $$;
