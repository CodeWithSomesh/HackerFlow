-- Create github_stats table to store user GitHub statistics
CREATE TABLE IF NOT EXISTS github_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total_contributions INTEGER DEFAULT 0,
  public_repos INTEGER DEFAULT 0,
  followers INTEGER DEFAULT 0,
  following INTEGER DEFAULT 0,
  total_stars INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  contribution_graph JSONB, -- Store contribution calendar data
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_user_github_stats UNIQUE(user_id)
);

-- Create github_repositories table to store user repositories
CREATE TABLE IF NOT EXISTS github_repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  github_repo_id BIGINT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  language VARCHAR(100),
  stars_count INTEGER DEFAULT 0,
  forks_count INTEGER DEFAULT 0,
  html_url VARCHAR(500) NOT NULL,
  is_fork BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at_db TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at_db TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create github_languages table to store user's top programming languages
CREATE TABLE IF NOT EXISTS github_languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  color VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_user_language UNIQUE(user_id, name)
);

-- Enable RLS on all tables
ALTER TABLE github_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_languages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for github_stats
CREATE POLICY "Anyone can view github stats" ON github_stats
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own github stats" ON github_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own github stats" ON github_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own github stats" ON github_stats
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for github_repositories
CREATE POLICY "Anyone can view github repositories" ON github_repositories
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own github repositories" ON github_repositories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own github repositories" ON github_repositories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own github repositories" ON github_repositories
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for github_languages
CREATE POLICY "Anyone can view github languages" ON github_languages
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own github languages" ON github_languages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own github languages" ON github_languages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own github languages" ON github_languages
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_github_stats_user_id ON github_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_github_repositories_user_id ON github_repositories(user_id);
CREATE INDEX IF NOT EXISTS idx_github_repositories_pinned ON github_repositories(user_id, is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_github_languages_user_id ON github_languages(user_id);

-- Triggers for updating timestamps
CREATE TRIGGER update_github_stats_updated_at BEFORE UPDATE ON github_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_github_repositories_updated_at_db BEFORE UPDATE ON github_repositories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add github_access_token field to user_profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles'
    AND column_name = 'github_access_token'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN github_access_token TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles'
    AND column_name = 'github_connected_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN github_connected_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;
