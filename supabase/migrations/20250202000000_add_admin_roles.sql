-- Migration: Add Admin Role System
-- Created: 2025-02-02
-- Description: Adds role column to user_profiles, updates verification_status values, and sets up admin permissions

-- =====================================================
-- 1. ADD ROLE COLUMN TO USER_PROFILES
-- =====================================================

-- Create ENUM type for roles
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin', 'superadmin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add role column to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user' NOT NULL;

-- Create index for efficient role-based queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Update existing users to have 'user' role (default is already set, but just in case)
UPDATE user_profiles SET role = 'user' WHERE role IS NULL;

-- =====================================================
-- 2. UPDATE VERIFICATION STATUS VALUES
-- =====================================================

-- The verification_status constraint needs to be updated to use 'confirmed' instead of 'approved'
ALTER TABLE hackathons DROP CONSTRAINT IF EXISTS hackathons_verification_status_check;
ALTER TABLE hackathons ADD CONSTRAINT hackathons_verification_status_check
  CHECK (verification_status IN ('pending', 'confirmed', 'rejected'));

-- Update any existing 'approved' status to 'confirmed' (if any exist)
UPDATE hackathons SET verification_status = 'confirmed' WHERE verification_status = 'approved';

-- =====================================================
-- 3. UPDATE HACKATHON STATUS TO SUPPORT ADMIN APPROVAL
-- =====================================================

-- Add a check constraint for the new status flow
ALTER TABLE hackathons DROP CONSTRAINT IF EXISTS hackathons_status_check;
ALTER TABLE hackathons ADD CONSTRAINT hackathons_status_check
  CHECK (status IN ('draft', 'waiting_for_approval', 'published', 'completed', 'cancelled'));

-- =====================================================
-- 4. ADD REVENUE TRACKING
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

-- Create index for revenue queries
CREATE INDEX IF NOT EXISTS idx_hackathons_posting_fee_paid ON hackathons(posting_fee_paid, posting_fee_paid_at);
CREATE INDEX IF NOT EXISTS idx_hackathons_approved_at ON hackathons(approved_at) WHERE approved_at IS NOT NULL;

-- =====================================================
-- 5. RLS POLICIES FOR ADMIN ACCESS
-- =====================================================

-- Policy for admins to view all hackathons
DROP POLICY IF EXISTS "Admins can view all hackathons" ON hackathons;
CREATE POLICY "Admins can view all hackathons"
  ON hackathons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN ('admin', 'superadmin')
    )
  );

-- Policy for admins to update hackathon verification status
DROP POLICY IF EXISTS "Admins can update hackathon verification" ON hackathons;
CREATE POLICY "Admins can update hackathon verification"
  ON hackathons FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN ('admin', 'superadmin')
    )
  );

-- Policy for admins to view all user profiles
DROP POLICY IF EXISTS "Admins can view all user profiles" ON user_profiles;
CREATE POLICY "Admins can view all user profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role IN ('admin', 'superadmin')
    )
  );

-- Policy for superadmins to update user roles
DROP POLICY IF EXISTS "Superadmins can update user roles" ON user_profiles;
CREATE POLICY "Superadmins can update user roles"
  ON user_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role = 'superadmin'
    )
  );

-- Policy for admins to view all registrations
DROP POLICY IF EXISTS "Admins can view all registrations" ON hackathon_registrations;
CREATE POLICY "Admins can view all registrations"
  ON hackathon_registrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN ('admin', 'superadmin')
    )
  );

-- Policy for admins to view all teams
DROP POLICY IF EXISTS "Admins can view all teams" ON hackathon_teams;
CREATE POLICY "Admins can view all teams"
  ON hackathon_teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN ('admin', 'superadmin')
    )
  );

-- Policy for admins to view all team members
DROP POLICY IF EXISTS "Admins can view all team members" ON hackathon_team_members;
CREATE POLICY "Admins can view all team members"
  ON hackathon_team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN ('admin', 'superadmin')
    )
  );

-- Policy for admins to view all winners
DROP POLICY IF EXISTS "Admins can view all winners" ON hackathon_winners;
CREATE POLICY "Admins can view all winners"
  ON hackathon_winners FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN ('admin', 'superadmin')
    )
  );

-- =====================================================
-- 6. HELPER FUNCTIONS FOR ADMIN OPERATIONS
-- =====================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_role user_role;
BEGIN
  SELECT role INTO v_role
  FROM user_profiles
  WHERE user_id = p_user_id;

  RETURN v_role IN ('admin', 'superadmin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is superadmin
CREATE OR REPLACE FUNCTION is_superadmin(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_role user_role;
BEGIN
  SELECT role INTO v_role
  FROM user_profiles
  WHERE user_id = p_user_id;

  RETURN v_role = 'superadmin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve hackathon (called by admin)
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

  -- Update hackathon
  UPDATE hackathons
  SET
    verification_status = 'confirmed',
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

-- Function to reject hackathon (called by admin)
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

  -- Update hackathon
  UPDATE hackathons
  SET
    verification_status = 'rejected',
    status = 'draft',
    rejected_by = p_admin_id,
    rejected_at = NOW(),
    rejection_reason = p_rejection_reason,
    updated_at = NOW()
  WHERE id = p_hackathon_id
  AND verification_status = 'pending';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to promote user to admin (called by superadmin only)
CREATE OR REPLACE FUNCTION promote_to_admin(
  p_user_id UUID,
  p_superadmin_id UUID
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

-- Function to demote admin to user (called by superadmin only)
CREATE OR REPLACE FUNCTION demote_to_user(
  p_user_id UUID,
  p_superadmin_id UUID
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

-- =====================================================
-- 7. VIEWS FOR ADMIN DASHBOARD
-- =====================================================

-- View for revenue analytics
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

-- View for pending hackathons (for admin approval)
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
LEFT JOIN auth.users au ON h.created_by = au.id
WHERE h.verification_status = 'pending'
ORDER BY h.created_at ASC;

-- View for user statistics (for admin dashboard)
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

-- =====================================================
-- 8. GRANT PERMISSIONS
-- =====================================================

-- Grant access to views
GRANT SELECT ON admin_revenue_stats TO authenticated;
GRANT SELECT ON admin_pending_hackathons TO authenticated;
GRANT SELECT ON admin_user_stats TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_superadmin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION approve_hackathon(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_hackathon(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION promote_to_admin(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION demote_to_user(UUID, UUID) TO authenticated;

-- =====================================================
-- 9. ADD COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN user_profiles.role IS 'User role: user (default), admin, or superadmin';
COMMENT ON COLUMN hackathons.posting_fee IS 'Fee charged for posting hackathon (RM 20.00)';
COMMENT ON COLUMN hackathons.posting_fee_paid IS 'Whether the posting fee has been paid (set to true on admin approval)';
COMMENT ON COLUMN hackathons.approved_by IS 'Admin user who approved the hackathon';
COMMENT ON COLUMN hackathons.rejected_by IS 'Admin user who rejected the hackathon';
COMMENT ON VIEW admin_revenue_stats IS 'Revenue statistics for admin dashboard';
COMMENT ON VIEW admin_pending_hackathons IS 'Pending hackathons awaiting admin approval';
COMMENT ON VIEW admin_user_stats IS 'User statistics for admin dashboard';
