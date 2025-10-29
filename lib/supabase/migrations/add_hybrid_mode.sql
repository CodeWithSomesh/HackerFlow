-- Migration to add 'hybrid' mode to hackathons table
-- This fixes the 'hackathons_mode_check' constraint violation

-- Drop the existing check constraint
ALTER TABLE hackathons DROP CONSTRAINT IF EXISTS hackathons_mode_check;

-- Add new check constraint with 'hybrid' included
ALTER TABLE hackathons ADD CONSTRAINT hackathons_mode_check
  CHECK (mode IN ('online', 'offline', 'hybrid'));
