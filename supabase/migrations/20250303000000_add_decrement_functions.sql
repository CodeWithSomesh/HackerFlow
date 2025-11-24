-- Create function to decrement hackathon participants count
CREATE OR REPLACE FUNCTION decrement_hackathon_participants(hackathon_id_param UUID, count_param INTEGER DEFAULT 1)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE hackathons
    SET participants = GREATEST(0, COALESCE(participants, 0) - count_param)
    WHERE id = hackathon_id_param;
END;
$$;

-- Create function to decrement hackathon teams count
CREATE OR REPLACE FUNCTION decrement_hackathon_teams(hackathon_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE hackathons
    SET teams = GREATEST(0, COALESCE(teams, 0) - 1)
    WHERE id = hackathon_id_param;
END;
$$;

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION decrement_hackathon_participants(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_hackathon_teams(UUID) TO authenticated;
