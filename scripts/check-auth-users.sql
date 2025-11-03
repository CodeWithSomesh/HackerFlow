-- Script to check authentication users and profiles
-- Run this in Supabase SQL Editor

-- Check all authenticated users
SELECT
  au.id,
  au.email,
  au.created_at as auth_created_at,
  up.user_id as profile_exists,
  up.full_name,
  up.role,
  up.user_primary_type
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
ORDER BY au.created_at DESC;

-- Count users
SELECT
  COUNT(*) as total_auth_users,
  COUNT(up.user_id) as users_with_profiles
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id;
