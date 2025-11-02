-- Migration: Create Matchmaking Tables for "Find Your Hackathon Buddy" Feature
-- Created: 2025-02-01
-- Description: Creates hacker_connections, match_preferences, and match_insights tables with RLS policies

-- =====================================================
-- 1. HACKER CONNECTIONS TABLE
-- =====================================================
-- Stores swipe actions (like, pass, block) and matches between users
CREATE TABLE IF NOT EXISTS hacker_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  connection_type TEXT NOT NULL CHECK (connection_type IN ('like', 'pass', 'match', 'block')),
  matched BOOLEAN DEFAULT FALSE,
  matched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_connection UNIQUE(user_id, target_user_id)
);

-- Create indexes for hacker_connections
CREATE INDEX IF NOT EXISTS idx_hacker_connections_user_id ON hacker_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_hacker_connections_target_user_id ON hacker_connections(target_user_id);
CREATE INDEX IF NOT EXISTS idx_hacker_connections_matched ON hacker_connections(matched) WHERE matched = TRUE;
CREATE INDEX IF NOT EXISTS idx_hacker_connections_type ON hacker_connections(connection_type);
CREATE INDEX IF NOT EXISTS idx_hacker_connections_created_at ON hacker_connections(created_at DESC);

-- Enable RLS for hacker_connections
ALTER TABLE hacker_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hacker_connections
DROP POLICY IF EXISTS "Users can view their own connections" ON hacker_connections;
CREATE POLICY "Users can view their own connections"
  ON hacker_connections FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = target_user_id);

DROP POLICY IF EXISTS "Users can create connections" ON hacker_connections;
CREATE POLICY "Users can create connections"
  ON hacker_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own connections" ON hacker_connections;
CREATE POLICY "Users can update their own connections"
  ON hacker_connections FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own connections" ON hacker_connections;
CREATE POLICY "Users can delete their own connections"
  ON hacker_connections FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 2. MATCH PREFERENCES TABLE
-- =====================================================
-- Stores user preferences for matchmaking algorithm
CREATE TABLE IF NOT EXISTS match_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,

  -- Skill preferences
  preferred_languages TEXT[], -- Languages they want in teammates
  preferred_frameworks TEXT[],
  preferred_skills TEXT[], -- Other skills they're looking for
  experience_level_preference TEXT, -- 'beginner', 'intermediate', 'advanced', 'any'

  -- Location preferences
  location_preference TEXT DEFAULT 'any', -- 'same_city', 'same_state', 'same_country', 'any'
  max_distance_km INTEGER, -- If location matters

  -- Hackathon preferences
  preferred_hackathon_categories TEXT[],
  min_hackathons_participated INTEGER DEFAULT 0,
  min_hackathons_won INTEGER DEFAULT 0,

  -- Availability preferences
  looking_for_team BOOLEAN DEFAULT TRUE,
  available_for_online BOOLEAN DEFAULT TRUE,
  available_for_offline BOOLEAN DEFAULT TRUE,
  available_for_hybrid BOOLEAN DEFAULT TRUE,

  -- Team size preference
  preferred_team_size INTEGER DEFAULT 4, -- Ideal team size

  -- GitHub activity preference
  prefer_active_github BOOLEAN DEFAULT FALSE, -- Prefer users with active GitHub
  min_github_contributions INTEGER DEFAULT 0,

  -- Other preferences
  only_show_verified BOOLEAN DEFAULT FALSE, -- Only show verified users
  hide_profile BOOLEAN DEFAULT FALSE, -- Hide own profile from matchmaking

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for match_preferences
CREATE INDEX IF NOT EXISTS idx_match_preferences_user_id ON match_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_match_preferences_looking_for_team ON match_preferences(looking_for_team) WHERE looking_for_team = TRUE;

-- Enable RLS for match_preferences
ALTER TABLE match_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for match_preferences
DROP POLICY IF EXISTS "Users can view their own preferences" ON match_preferences;
CREATE POLICY "Users can view their own preferences"
  ON match_preferences FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own preferences" ON match_preferences;
CREATE POLICY "Users can insert their own preferences"
  ON match_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own preferences" ON match_preferences;
CREATE POLICY "Users can update their own preferences"
  ON match_preferences FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own preferences" ON match_preferences;
CREATE POLICY "Users can delete their own preferences"
  ON match_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 3. MATCH INSIGHTS TABLE
-- =====================================================
-- Stores calculated compatibility scores and matching factors
CREATE TABLE IF NOT EXISTS match_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Compatibility scores (0-100 scale)
  compatibility_score NUMERIC(5,2) NOT NULL DEFAULT 0, -- Overall score 0.00 to 100.00
  skill_overlap_score NUMERIC(5,2) DEFAULT 0,
  experience_compatibility_score NUMERIC(5,2) DEFAULT 0,
  location_score NUMERIC(5,2) DEFAULT 0,
  github_activity_score NUMERIC(5,2) DEFAULT 0,
  hackathon_experience_score NUMERIC(5,2) DEFAULT 0,
  recent_activity_score NUMERIC(5,2) DEFAULT 0,

  -- Detailed matching factors (JSONB for flexibility)
  matching_factors JSONB DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "sharedLanguages": ["Python", "JavaScript"],
  --   "sharedFrameworks": ["React", "Node.js"],
  --   "complementarySkills": {
  --     "userSkills": ["Frontend"],
  --     "targetSkills": ["Backend"]
  --   },
  --   "experienceGap": 5,
  --   "locationMatch": "same_city",
  --   "githubActivityLevel": "both_active",
  --   "sharedInterests": ["AI/ML", "Web3"],
  --   "strengthAreas": ["Full Stack Development"],
  --   "whyGreatTogether": [
  --     "You both excel in React",
  --     "Complementary backend/frontend skills"
  --   ]
  -- }

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_match_insight UNIQUE(user_id, target_user_id)
);

-- Create indexes for match_insights
CREATE INDEX IF NOT EXISTS idx_match_insights_user_id ON match_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_match_insights_target_user_id ON match_insights(target_user_id);
CREATE INDEX IF NOT EXISTS idx_match_insights_score ON match_insights(compatibility_score DESC);
CREATE INDEX IF NOT EXISTS idx_match_insights_user_score ON match_insights(user_id, compatibility_score DESC);

-- Enable RLS for match_insights
ALTER TABLE match_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for match_insights
DROP POLICY IF EXISTS "Users can view insights for their matches" ON match_insights;
CREATE POLICY "Users can view insights for their matches"
  ON match_insights FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert match insights" ON match_insights;
CREATE POLICY "System can insert match insights"
  ON match_insights FOR INSERT
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "System can update match insights" ON match_insights;
CREATE POLICY "System can update match insights"
  ON match_insights FOR UPDATE
  USING (TRUE);

DROP POLICY IF EXISTS "Users can delete their own insights" ON match_insights;
CREATE POLICY "Users can delete their own insights"
  ON match_insights FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 4. UPDATED_AT TRIGGER FUNCTION
-- =====================================================
-- Reuse existing update_updated_at_column function if it exists
-- Otherwise create it
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_hacker_connections_updated_at ON hacker_connections;
CREATE TRIGGER update_hacker_connections_updated_at
  BEFORE UPDATE ON hacker_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_match_preferences_updated_at ON match_preferences;
CREATE TRIGGER update_match_preferences_updated_at
  BEFORE UPDATE ON match_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_match_insights_updated_at ON match_insights;
CREATE TRIGGER update_match_insights_updated_at
  BEFORE UPDATE ON match_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. MUTUAL MATCH DETECTION FUNCTION
-- =====================================================
-- Automatically detect mutual matches when both users like each other
CREATE OR REPLACE FUNCTION check_mutual_match()
RETURNS TRIGGER AS $$
DECLARE
  v_mutual_match_exists BOOLEAN;
  v_connection_id UUID;
BEGIN
  -- Only process if this is a 'like'
  IF NEW.connection_type = 'like' THEN
    -- Check if target user also liked this user
    SELECT EXISTS (
      SELECT 1 FROM hacker_connections
      WHERE user_id = NEW.target_user_id
      AND target_user_id = NEW.user_id
      AND connection_type = 'like'
    ) INTO v_mutual_match_exists;

    -- If mutual match exists, update both records
    IF v_mutual_match_exists THEN
      -- Update the current record
      NEW.matched = TRUE;
      NEW.matched_at = NOW();
      NEW.connection_type = 'match';

      -- Update the reciprocal record
      UPDATE hacker_connections
      SET
        matched = TRUE,
        matched_at = NOW(),
        connection_type = 'match',
        updated_at = NOW()
      WHERE user_id = NEW.target_user_id
      AND target_user_id = NEW.user_id;

      -- Create notifications for both users
      INSERT INTO notifications (user_id, type, title, message, link, metadata)
      VALUES (
        NEW.user_id,
        'match',
        'It''s a Match!',
        'You and another hacker matched! Start chatting now.',
        '/find-teammates/matches',
        jsonb_build_object(
          'matched_user_id', NEW.target_user_id,
          'connection_id', NEW.id
        )
      );

      INSERT INTO notifications (user_id, type, title, message, link, metadata)
      VALUES (
        NEW.target_user_id,
        'match',
        'It''s a Match!',
        'You and another hacker matched! Start chatting now.',
        '/find-teammates/matches',
        jsonb_build_object(
          'matched_user_id', NEW.user_id,
          'connection_id', NEW.id
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for mutual match detection
DROP TRIGGER IF EXISTS trigger_check_mutual_match ON hacker_connections;
CREATE TRIGGER trigger_check_mutual_match
  BEFORE INSERT ON hacker_connections
  FOR EACH ROW
  EXECUTE FUNCTION check_mutual_match();

-- =====================================================
-- 6. HELPER FUNCTIONS FOR MATCHMAKING
-- =====================================================

-- Function to get potential matches for a user (excludes already connected users)
CREATE OR REPLACE FUNCTION get_potential_matches(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  bio TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  position TEXT,
  company TEXT,
  programming_languages TEXT[],
  frameworks TEXT[],
  experience_level TEXT,
  github_username TEXT,
  profile_image TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    up.user_id,
    up.full_name,
    up.bio,
    up.city,
    up.state,
    up.country,
    up.position,
    up.company,
    up.programming_languages,
    up.frameworks,
    up.experience_level,
    up.github_username,
    NULL::TEXT as profile_image
  FROM user_profiles up
  WHERE up.user_id != p_user_id -- Not the current user
  AND up.user_primary_type = 'hacker' -- Only hackers
  AND up.user_id NOT IN (
    -- Exclude users already swiped on
    SELECT target_user_id
    FROM hacker_connections
    WHERE user_id = p_user_id
  )
  AND NOT EXISTS (
    -- Exclude users who blocked this user
    SELECT 1
    FROM hacker_connections
    WHERE user_id = up.user_id
    AND target_user_id = p_user_id
    AND connection_type = 'block'
  )
  -- Could add more filters based on match_preferences here
  ORDER BY up.updated_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON hacker_connections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON match_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON match_insights TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- 8. CREATE INITIAL INDEXES FOR PERFORMANCE
-- =====================================================

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_hacker_connections_user_type ON hacker_connections(user_id, connection_type);
CREATE INDEX IF NOT EXISTS idx_hacker_connections_matched_users ON hacker_connections(user_id, target_user_id) WHERE matched = TRUE;

-- Index for sorting by compatibility score
CREATE INDEX IF NOT EXISTS idx_match_insights_user_compatibility ON match_insights(user_id, compatibility_score DESC, created_at DESC);

-- =====================================================
-- 9. ADD COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE hacker_connections IS 'Stores swipe actions (like, pass, block) and mutual matches between users';
COMMENT ON TABLE match_preferences IS 'Stores user preferences for the matchmaking algorithm';
COMMENT ON TABLE match_insights IS 'Stores calculated compatibility scores and detailed matching factors';

COMMENT ON COLUMN hacker_connections.connection_type IS 'Type of connection: like (user swiped right), pass (swiped left), match (mutual like), block (user blocked)';
COMMENT ON COLUMN hacker_connections.matched IS 'TRUE when both users have liked each other';
COMMENT ON COLUMN match_insights.matching_factors IS 'JSONB object containing detailed reasons why users match well';
COMMENT ON COLUMN match_preferences.location_preference IS 'Location filtering: same_city, same_state, same_country, or any';
