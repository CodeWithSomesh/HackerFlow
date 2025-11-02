-- Migration to add organizer verification columns to hackathons table

-- Add columns for storing verification document URLs
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS identity_document_url TEXT;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS authorization_letter_url TEXT;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';

-- Add check constraint for verification_status
ALTER TABLE hackathons DROP CONSTRAINT IF EXISTS hackathons_verification_status_check;
ALTER TABLE hackathons ADD CONSTRAINT hackathons_verification_status_check
  CHECK (verification_status IN ('pending', 'approved', 'rejected'));
