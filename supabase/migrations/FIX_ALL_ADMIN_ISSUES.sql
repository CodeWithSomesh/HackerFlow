-- =====================================================
-- FIX ALL ADMIN ISSUES - Complete Fix
-- =====================================================
-- This fixes:
-- 1. Missing is_superadmin and is_admin functions
-- 2. Missing columns in hackathons table
-- 3. User profile RLS policies
-- 4. Admin views and permissions
-- =====================================================

-- =====================================================
-- PART 1: FIX user_profiles RLS POLICIES (SAFE)
-- =====================================================

-- Drop only user_profiles policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON user_profiles';
    END LOOP;
END $$;

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Everyone can read all profiles
CREATE POLICY "Enable read access for all authenticated users"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

-- Policy 2: Users can insert their own profile
CREATE POLICY "Enable insert for users based on user_id"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own profile
CREATE POLICY "Enable update for users based on user_id"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Superadmins can update any profile
CREATE POLICY "Enable update for superadmins"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role = 'superadmin'
    )
  );

-- =====================================================
-- PART 2: ADD MISSING COLUMNS TO HACKATHONS
-- =====================================================

ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS posting_fee NUMERIC DEFAULT 20.00;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS posting_fee_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS posting_fee_paid_at TIMESTAMPTZ;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES auth.users(id);
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_hackathons_posting_fee_paid ON hackathons(posting_fee_paid, posting_fee_paid_at);
CREATE INDEX IF NOT EXISTS idx_hackathons_approved_at ON hackathons(approved_at) WHERE approved_at IS NOT NULL;

-- =====================================================
-- PART 3: CREATE HELPER FUNCTIONS (IF NOT EXISTS)
-- =====================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role::TEXT INTO v_role
  FROM user_profiles
  WHERE user_id = p_user_id;

  RETURN v_role IN ('admin', 'superadmin');
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is superadmin
CREATE OR REPLACE FUNCTION is_superadmin(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role::TEXT INTO v_role
  FROM user_profiles
  WHERE user_id = p_user_id;

  RETURN v_role = 'superadmin';
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PART 4: CREATE ADMIN FUNCTIONS WITH CORRECT PARAMS
-- =====================================================

-- Drop old functions
DROP FUNCTION IF EXISTS approve_hackathon(UUID, UUID);
DROP FUNCTION IF EXISTS reject_hackathon(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS promote_to_admin(UUID, UUID);
DROP FUNCTION IF EXISTS demote_to_user(UUID, UUID);

-- Function to approve hackathon
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

-- Function to reject hackathon
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

-- Function to promote user to admin (alphabetical params)
CREATE OR REPLACE FUNCTION promote_to_admin(
  p_superadmin_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  IF NOT is_superadmin(p_superadmin_id) THEN
    RAISE EXCEPTION 'Unauthorized: Only superadmins can promote users to admin';
  END IF;

  UPDATE user_profiles
  SET role = 'admin', updated_at = NOW()
  WHERE user_id = p_user_id AND role = 'user';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to demote admin to user (alphabetical params)
CREATE OR REPLACE FUNCTION demote_to_user(
  p_superadmin_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  IF NOT is_superadmin(p_superadmin_id) THEN
    RAISE EXCEPTION 'Unauthorized: Only superadmins can demote admins';
  END IF;

  IF is_superadmin(p_user_id) THEN
    RAISE EXCEPTION 'Cannot demote superadmin';
  END IF;

  UPDATE user_profiles
  SET role = 'user', updated_at = NOW()
  WHERE user_id = p_user_id AND role = 'admin';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PART 5: CREATE ADMIN VIEWS
-- =====================================================

DROP VIEW IF EXISTS admin_pending_hackathons;
DROP VIEW IF EXISTS admin_revenue_stats;
DROP VIEW IF EXISTS admin_user_stats;

CREATE OR REPLACE VIEW admin_revenue_stats AS
SELECT
  COUNT(*) FILTER (WHERE posting_fee_paid = TRUE) as total_paid_hackathons,
  SUM(posting_fee) FILTER (WHERE posting_fee_paid = TRUE) as total_revenue,
  SUM(posting_fee) FILTER (WHERE posting_fee_paid = TRUE AND posting_fee_paid_at >= NOW() - INTERVAL '6 months') as revenue_last_6_months,
  SUM(posting_fee) FILTER (WHERE posting_fee_paid = TRUE AND posting_fee_paid_at >= DATE_TRUNC('month', NOW())) as revenue_this_month,
  SUM(posting_fee) FILTER (WHERE posting_fee_paid = TRUE AND posting_fee_paid_at >= DATE_TRUNC('day', NOW())) as revenue_today,
  COUNT(*) FILTER (WHERE verification_status = 'pending') as pending_approvals,
  COUNT(*) FILTER (WHERE verification_status = 'confirmed') as approved_hackathons,
  COUNT(*) FILTER (WHERE verification_status = 'rejected') as rejected_hackathons
FROM hackathons;

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

GRANT SELECT ON admin_revenue_stats TO authenticated;
GRANT SELECT ON admin_pending_hackathons TO authenticated;
GRANT SELECT ON admin_user_stats TO authenticated;

-- =====================================================
-- PART 6: GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_superadmin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION approve_hackathon(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_hackathon(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION promote_to_admin(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION demote_to_user(UUID, UUID) TO authenticated;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '✅ ALL ADMIN ISSUES FIXED!';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Fixed:';
  RAISE NOTICE '   - user_profiles RLS policies';
  RAISE NOTICE '   - Missing hackathons columns';
  RAISE NOTICE '   - is_admin() and is_superadmin() functions';
  RAISE NOTICE '   - approve_hackathon() function';
  RAISE NOTICE '   - reject_hackathon() function';
  RAISE NOTICE '   - promote_to_admin() function';
  RAISE NOTICE '   - demote_to_user() function';
  RAISE NOTICE '   - Admin views and permissions';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Next Steps:';
  RAISE NOTICE '   1. Set yourself as superadmin:';
  RAISE NOTICE '      UPDATE user_profiles SET role = ''superadmin'' WHERE email = ''your@email.com'';';
  RAISE NOTICE '   2. Refresh your browser';
  RAISE NOTICE '   3. Test admin features';
  RAISE NOTICE '';
END $$;
