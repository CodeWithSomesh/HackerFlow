-- =====================================================
-- FIX: User Profile and Admin Access Issues
-- =====================================================
-- Run this to fix "No profile found" and admin access issues
-- =====================================================

-- =====================================================
-- 1. FIX USER_PROFILES RLS POLICIES
-- =====================================================

-- First, let's see what policies exist and remove the problematic one
DROP POLICY IF EXISTS "Admins can view all user emails" ON user_profiles;

-- Now let's check if there's a basic "Users can view own profile" policy
-- If not, we need to create it

-- Enable RLS if not already enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own profile (MOST IMPORTANT)
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy 3: Admins can view all profiles (separate policy)
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role IN ('admin', 'superadmin')
    )
  );

-- Policy 4: Superadmins can update user roles
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

-- =====================================================
-- 2. VERIFY VIEWS ARE ACCESSIBLE
-- =====================================================

-- Make sure the views exist and have proper permissions
GRANT SELECT ON admin_revenue_stats TO authenticated;
GRANT SELECT ON admin_pending_hackathons TO authenticated;
GRANT SELECT ON admin_user_stats TO authenticated;

-- =====================================================
-- 3. VERIFY YOUR SUPERADMIN STATUS
-- =====================================================

-- Check if you have superadmin role (replace with your email)
-- This is just for verification - uncomment and run separately if needed
-- SELECT user_id, email, full_name, role FROM user_profiles WHERE email = 'codewithsomesh@gmail.com';

-- If role is not superadmin, set it:
-- UPDATE user_profiles SET role = 'superadmin' WHERE email = 'codewithsomesh@gmail.com';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies fixed!';
  RAISE NOTICE '📝 You should now be able to:';
  RAISE NOTICE '   1. View your own profile';
  RAISE NOTICE '   2. Access admin dashboard';
  RAISE NOTICE '   3. View all user profiles as admin';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  If still having issues, verify your role:';
  RAISE NOTICE '   SELECT email, role FROM user_profiles WHERE email = ''your-email@example.com'';';
END $$;
