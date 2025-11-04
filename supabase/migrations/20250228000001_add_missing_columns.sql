-- Migration: Add Missing Columns to Hackathons Table
-- Created: 2025-02-28
-- Description: Adds posting fee and admin approval tracking columns

-- =====================================================
-- 1. ADD MISSING COLUMNS TO HACKATHONS TABLE
-- =====================================================

-- Add posting fee column to track when hackathon was approved and fee was charged
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS posting_fee NUMERIC DEFAULT 20.00;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS posting_fee_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS posting_fee_paid_at TIMESTAMPTZ;

-- Add approved_by column to track which admin approved the hackathon
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Add rejection tracking
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES auth.users(id);
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hackathons_posting_fee_paid ON hackathons(posting_fee_paid, posting_fee_paid_at);
CREATE INDEX IF NOT EXISTS idx_hackathons_approved_at ON hackathons(approved_at) WHERE approved_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_hackathons_rejected_at ON hackathons(rejected_at) WHERE rejected_at IS NOT NULL;

-- Add comments
COMMENT ON COLUMN hackathons.posting_fee IS 'Fee charged for posting hackathon (RM 20.00)';
COMMENT ON COLUMN hackathons.posting_fee_paid IS 'Whether the posting fee has been paid (set to true on admin approval)';
COMMENT ON COLUMN hackathons.posting_fee_paid_at IS 'Timestamp when the posting fee was paid';
COMMENT ON COLUMN hackathons.approved_by IS 'Admin user who approved the hackathon';
COMMENT ON COLUMN hackathons.approved_at IS 'Timestamp when the hackathon was approved';
COMMENT ON COLUMN hackathons.rejected_by IS 'Admin user who rejected the hackathon';
COMMENT ON COLUMN hackathons.rejected_at IS 'Timestamp when the hackathon was rejected';
COMMENT ON COLUMN hackathons.rejection_reason IS 'Reason provided for rejecting the hackathon';
