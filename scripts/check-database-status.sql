-- ============================================================================
-- DATABASE DIAGNOSTIC SCRIPT
-- Run this in Supabase SQL Editor to check status values in your database
-- ============================================================================

-- 1. Check registration_status values in hackathon_registrations
SELECT
  registration_status,
  COUNT(*) as count
FROM hackathon_registrations
GROUP BY registration_status
ORDER BY count DESC;

-- 2. Check status values in hackathon_team_members
SELECT
  status,
  COUNT(*) as count
FROM hackathon_team_members
GROUP BY status
ORDER BY count DESC;

-- 3. Check if you have any registrations at all
SELECT COUNT(*) as total_registrations
FROM hackathon_registrations;

-- 4. Check if you have any team memberships at all
SELECT COUNT(*) as total_team_members
FROM hackathon_team_members;

-- 5. Check your specific registrations (replace with your user_id)
-- First, get your user_id
SELECT auth.uid() as your_user_id;

-- Then check your registrations
SELECT
  id,
  hackathon_id,
  registration_status,
  participant_type,
  created_at
FROM hackathon_registrations
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- 6. Check your team memberships
SELECT
  tm.id,
  tm.team_id,
  tm.status,
  tm.is_leader,
  t.team_name,
  h.title as hackathon_title
FROM hackathon_team_members tm
LEFT JOIN hackathon_teams t ON tm.team_id = t.id
LEFT JOIN hackathons h ON t.hackathon_id = h.id
WHERE tm.user_id = auth.uid()
ORDER BY tm.joined_at DESC;

-- 7. Check RLS policies on hackathon_registrations
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'hackathon_registrations';

-- 8. Check RLS policies on hackathon_team_members
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'hackathon_team_members';

-- ============================================================================
-- OPTIONAL: Update status values if needed
-- ============================================================================

-- UNCOMMENT THESE ONLY IF YOU WANT TO UPDATE YOUR DATABASE
-- Replace 'YOUR_OLD_STATUS' with the actual status value you found above

-- Update registration_status to 'confirmed'
-- UPDATE hackathon_registrations
-- SET registration_status = 'confirmed'
-- WHERE registration_status IN ('pending', 'approved', 'registered', 'active');

-- Update team member status to 'active'
-- UPDATE hackathon_team_members
-- SET status = 'active'
-- WHERE status IN ('pending', 'invited', 'accepted', 'joined', 'confirmed');
