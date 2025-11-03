-- Migration: Add Role Column to User Profiles
-- Created: 2025-02-10
-- Description: Adds role column to user_profiles table for admin functionality

-- =====================================================
-- 1. CREATE ROLE ENUM TYPE
-- =====================================================

-- Create ENUM type for roles
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin', 'superadmin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 2. ADD ROLE COLUMN TO USER_PROFILES
-- =====================================================

-- Add role column to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user' NOT NULL;

-- Create index for efficient role-based queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Update existing users to have 'user' role (default is already set, but just in case)
UPDATE user_profiles SET role = 'user' WHERE role IS NULL;

-- =====================================================
-- 3. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN user_profiles.role IS 'User role: user (default), admin, or superadmin';
