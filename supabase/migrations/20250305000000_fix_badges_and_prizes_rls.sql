-- =====================================================
-- Fix RLS Policies for Badges and Prizes
-- This migration fixes issues with:
-- 1. Users not being able to see their badges
-- 2. Users not being able to see their prizes
-- 3. System not being able to award badges
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own badges" ON user_badges;
DROP POLICY IF EXISTS "Users can view others badges" ON user_badges;
DROP POLICY IF EXISTS "System can insert badges" ON user_badges;
DROP POLICY IF EXISTS "Allow badge inserts" ON user_badges;

DROP POLICY IF EXISTS "Users can view their own prizes" ON hackathon_winners;
DROP POLICY IF EXISTS "Users can view their prizes" ON hackathon_winners;
DROP POLICY IF EXISTS "Organizers can view prizes for their hackathons" ON hackathon_winners;
DROP POLICY IF EXISTS "Organizers can manage prizes" ON hackathon_winners;

-- =====================================================
-- USER_BADGES TABLE POLICIES
-- =====================================================

-- Enable RLS on user_badges
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own badges
CREATE POLICY "Users can view their own badges"
ON user_badges
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow users to view other users' badges (for profile viewing)
CREATE POLICY "Users can view others badges"
ON user_badges
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert badges (for auto-awarding)
CREATE POLICY "System can award badges"
ON user_badges
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- =====================================================
-- HACKATHON_WINNERS TABLE POLICIES
-- =====================================================

-- Enable RLS on hackathon_winners
ALTER TABLE hackathon_winners ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own prizes
CREATE POLICY "Users can view their own prizes"
ON hackathon_winners
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow organizers to view prizes for their hackathons
CREATE POLICY "Organizers can view their hackathon prizes"
ON hackathon_winners
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM hackathons
    WHERE hackathons.id = hackathon_winners.hackathon_id
    AND hackathons.created_by = auth.uid()
  )
);

-- Allow organizers to insert prizes for their hackathons
CREATE POLICY "Organizers can create prizes"
ON hackathon_winners
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM hackathons
    WHERE hackathons.id = hackathon_winners.hackathon_id
    AND hackathons.created_by = auth.uid()
  )
);

-- Allow organizers to update prizes for their hackathons
CREATE POLICY "Organizers can update prizes"
ON hackathon_winners
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM hackathons
    WHERE hackathons.id = hackathon_winners.hackathon_id
    AND hackathons.created_by = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM hackathons
    WHERE hackathons.id = hackathon_winners.hackathon_id
    AND hackathons.created_by = auth.uid()
  )
);

-- Allow organizers to delete prizes for their hackathons
CREATE POLICY "Organizers can delete prizes"
ON hackathon_winners
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM hackathons
    WHERE hackathons.id = hackathon_winners.hackathon_id
    AND hackathons.created_by = auth.uid()
  )
);

-- =====================================================
-- NOTIFICATIONS TABLE POLICIES (for badge notifications)
-- =====================================================

-- Ensure notifications table has proper policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

-- Allow users to view their own notifications
CREATE POLICY "Users can view their own notifications"
ON notifications
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow system to create notifications for any user
CREATE POLICY "System can create notifications"
ON notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON notifications
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
