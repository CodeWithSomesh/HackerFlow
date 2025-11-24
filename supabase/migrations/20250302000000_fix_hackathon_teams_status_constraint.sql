-- Fix hackathon_teams status check constraint
-- This migration fixes the status constraint to allow all necessary status values

-- Drop the existing constraint if it exists
ALTER TABLE hackathon_teams DROP CONSTRAINT IF EXISTS hackathon_teams_status_check;

-- Add the updated constraint with all necessary status values
ALTER TABLE hackathon_teams ADD CONSTRAINT hackathon_teams_status_check
  CHECK (status IN ('forming', 'confirmed', 'active', 'completed', 'cancelled'));

-- Update any existing teams with 'completed' status to 'confirmed' if needed
-- (This is a safety measure in case there are any with an invalid status)
UPDATE hackathon_teams
SET status = 'confirmed'
WHERE status NOT IN ('forming', 'confirmed', 'active', 'completed', 'cancelled');
