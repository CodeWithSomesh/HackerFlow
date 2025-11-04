-- =====================================================
-- EMERGENCY FIX: Restore Profile and Admin Access
-- =====================================================
-- This will fix the "No profile found" and admin access issues
-- =====================================================

-- =====================================================
-- STEP 1: COMPLETELY RESET USER_PROFILES RLS POLICIES
-- =====================================================

-- Disable RLS temporarily to see all policies
-- (Don't worry, we'll re-enable it with proper policies)

-- Drop ALL existing policies on user_profiles
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on user_profiles table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON user_profiles';
    END LOOP;
END $$;

-- =====================================================
-- STEP 2: CREATE PROPER RLS POLICIES (IN CORRECT ORDER)
-- =====================================================

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Everyone can view all profiles (SELECT)
-- This is needed for the app to work properly
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON user_profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);  -- Everyone can read profiles

-- Policy 2: Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can insert their own profile (during signup)
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Superadmins can update any profile (for role changes)
DROP POLICY IF EXISTS "Superadmins can update any profile" ON user_profiles;
CREATE POLICY "Superadmins can update any profile"
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
-- STEP 3: VERIFY YOUR DATA
-- =====================================================

-- Check your profile exists and has correct role
DO $$
DECLARE
  user_count INTEGER;
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM user_profiles;
  SELECT COUNT(*) INTO admin_count FROM user_profiles WHERE role IN ('admin', 'superadmin');

  RAISE NOTICE '✅ Found % total users', user_count;
  RAISE NOTICE '✅ Found % admin/superadmin users', admin_count;

  IF admin_count = 0 THEN
    RAISE WARNING '⚠️  No admin users found! You need to set your role to superadmin:';
    RAISE WARNING '   UPDATE user_profiles SET role = ''superadmin'' WHERE email = ''your-email@example.com'';';
  END IF;
END $$;

-- =====================================================
-- STEP 4: VERIFY VIEWS ARE ACCESSIBLE
-- =====================================================

GRANT SELECT ON admin_revenue_stats TO authenticated;
GRANT SELECT ON admin_pending_hackathons TO authenticated;
GRANT SELECT ON admin_user_stats TO authenticated;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '✅ EMERGENCY FIX APPLIED SUCCESSFULLY!';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '🔓 RLS Policies Reset:';
  RAISE NOTICE '   ✅ Everyone can now read all profiles';
  RAISE NOTICE '   ✅ Users can update their own profile';
  RAISE NOTICE '   ✅ Superadmins can update any profile';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Next Steps:';
  RAISE NOTICE '   1. Refresh your browser (Ctrl+F5)';
  RAISE NOTICE '   2. Your profile should now load';
  RAISE NOTICE '   3. Admin dashboard should work';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  If still not working, verify your role:';
  RAISE NOTICE '   SELECT user_id, email, role FROM user_profiles WHERE email = ''codewithsomesh@gmail.com'';';
  RAISE NOTICE '';
  RAISE NOTICE '   If role is not ''superadmin'', run:';
  RAISE NOTICE '   UPDATE user_profiles SET role = ''superadmin'' WHERE email = ''codewithsomesh@gmail.com'';';
  RAISE NOTICE '';
END $$;
