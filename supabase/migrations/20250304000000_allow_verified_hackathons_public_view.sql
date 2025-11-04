-- Migration: Allow all authenticated users to view verified/confirmed hackathons
-- Date: 2025-03-04
-- Purpose: Fix issue where verified hackathons are not visible to regular users

-- Drop existing policy for viewing own hackathons if it exists
DROP POLICY IF EXISTS "Users can view own hackathons" ON hackathons;

-- Drop the policy if it already exists (for idempotency)
DROP POLICY IF EXISTS "Users can view verified hackathons" ON hackathons;

-- Create a comprehensive policy that allows:
-- 1. Users to view their own hackathons (any status)
-- 2. All authenticated users to view verified/confirmed hackathons
CREATE POLICY "Users can view verified hackathons"
  ON hackathons
  FOR SELECT
  TO authenticated
  USING (
    -- User can view their own hackathons regardless of status
    auth.uid() = created_by
    OR
    -- OR anyone can view verified/confirmed hackathons
    verification_status IN ('verified', 'confirmed')
  );

-- Note: Admin policies remain unchanged - admins can still view all hackathons
-- through their separate "Admins can view all hackathons" policy
