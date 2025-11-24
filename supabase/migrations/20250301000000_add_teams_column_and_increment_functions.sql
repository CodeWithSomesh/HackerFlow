-- Add teams column to hackathons table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'hackathons'
        AND column_name = 'teams'
    ) THEN
        ALTER TABLE hackathons
        ADD COLUMN teams INTEGER DEFAULT 0 NOT NULL;
    END IF;
END $$;

-- Create function to increment hackathon participants count
CREATE OR REPLACE FUNCTION increment_hackathon_participants(hackathon_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE hackathons
    SET participants = COALESCE(participants, 0) + 1
    WHERE id = hackathon_id_param;
END;
$$;

-- Create function to increment hackathon teams count
CREATE OR REPLACE FUNCTION increment_hackathon_teams(hackathon_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE hackathons
    SET teams = COALESCE(teams, 0) + 1
    WHERE id = hackathon_id_param;
END;
$$;

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION increment_hackathon_participants(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_hackathon_teams(UUID) TO authenticated;

-- Initialize teams count for existing hackathons based on actual teams
UPDATE hackathons h
SET teams = (
    SELECT COUNT(*)
    FROM hackathon_teams ht
    WHERE ht.hackathon_id = h.id
)
WHERE teams = 0 OR teams IS NULL;

-- Initialize participants count for existing hackathons based on confirmed registrations
UPDATE hackathons h
SET participants = (
    SELECT COUNT(*)
    FROM hackathon_registrations hr
    WHERE hr.hackathon_id = h.id
    AND hr.registration_status = 'confirmed'
)
WHERE participants = 0 OR participants IS NULL;
