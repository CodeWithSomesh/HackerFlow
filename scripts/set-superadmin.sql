-- Script to set a user as superadmin
-- Run this in your Supabase SQL Editor

-- Step 1: View all existing users
SELECT
  up.user_id,
  up.email,
  up.full_name,
  up.role,
  up.user_primary_type,
  up.created_at
FROM user_profiles up
ORDER BY up.created_at DESC
LIMIT 10;

-- Step 2: Set a specific user as superadmin
-- REPLACE 'your-email@example.com' with your actual email
UPDATE user_profiles
SET role = 'superadmin'
WHERE email = 'your-email@example.com';

-- Step 3: Verify the change
SELECT
  user_id,
  email,
  full_name,
  role
FROM user_profiles
WHERE role IN ('admin', 'superadmin')
ORDER BY created_at DESC;

-- Alternative: Set superadmin by user_id if you know it
-- UPDATE user_profiles
-- SET role = 'superadmin'
-- WHERE user_id = 'your-user-id-here';

-- View all admin and superadmin users
SELECT
  user_id,
  email,
  full_name,
  role,
  user_primary_type
FROM user_profiles
WHERE role IN ('admin', 'superadmin');
