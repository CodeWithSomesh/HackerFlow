-- =====================================================
-- RLS POLICY FIX for Friend Search Feature
-- =====================================================
-- Run this in Supabase SQL Editor if search still doesn't work
-- This ensures authenticated users can view all user profiles

-- 1. Check if RLS is enabled on user_profiles
-- If this returns false, run: ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'user_profiles';

-- 2. Check existing SELECT policies
SELECT
  policyname,
  permissive,
  roles,
  qual
FROM pg_policies
WHERE tablename = 'user_profiles'
  AND cmd = 'SELECT';

-- 3. Create or replace the SELECT policy
-- This allows all authenticated users to view all profiles

DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;

CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

-- 4. Verify the policy was created
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'user_profiles'
  AND policyname = 'Users can view all profiles';

-- Expected result: Should show one row with:
-- policyname: "Users can view all profiles"
-- permissive: PERMISSIVE
-- roles: {authenticated}
-- cmd: SELECT
-- qual: true

-- =====================================================
-- OPTIONAL: If you also ran the friend system migration
-- =====================================================

-- Ensure friend_requests and friendships tables have correct policies
-- (These are already in the migration but included here for reference)

-- Friend Requests - View policy
DROP POLICY IF EXISTS "Users can view their own friend requests" ON friend_requests;
CREATE POLICY "Users can view their own friend requests"
  ON friend_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Friendships - View policy
DROP POLICY IF EXISTS "Users can view their own friendships" ON friendships;
CREATE POLICY "Users can view their own friendships"
  ON friendships FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- =====================================================
-- TEST QUERIES
-- =====================================================

-- Test 1: Can you see user profiles?
SELECT
  user_id,
  full_name,
  email,
  user_primary_type
FROM user_profiles
LIMIT 5;

-- If this returns rows, RLS is working correctly

-- Test 2: Can you search by name?
SELECT
  user_id,
  full_name,
  email
FROM user_profiles
WHERE LOWER(full_name) LIKE LOWER('%Maisarah%');

-- If this returns Maisarah's profile, search should work

-- Test 3: Check your own user ID
SELECT auth.uid() as my_user_id;

-- Note this ID - it should NOT appear in search results

-- =====================================================
-- GRANT PERMISSIONS (if needed)
-- =====================================================

-- Ensure authenticated role can access tables
GRANT SELECT ON user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON friend_requests TO authenticated;
GRANT SELECT, INSERT, DELETE ON friendships TO authenticated;

-- =====================================================
-- SUMMARY
-- =====================================================
-- After running this file:
-- 1. All authenticated users can view all user profiles
-- 2. Users can only see their own friend requests
-- 3. Users can only see their own friendships
-- 4. The search feature should work properly

-- To verify everything works:
-- 1. Refresh your Next.js app
-- 2. Go to /search-friends
-- 3. Type a user's name
-- 4. Check browser console for logs
-- 5. Results should appear
