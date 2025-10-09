-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_primary_type VARCHAR(20) NOT NULL CHECK (user_primary_type IN ('hacker', 'organizer')),
  full_name VARCHAR(255) NOT NULL,
  bio TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Malaysia',
  
  -- Profile type specific fields
  profile_type VARCHAR(20), -- 'student' or 'working' for hackers
  organization_type VARCHAR(20), -- 'individual', 'company', 'university', 'non-profit' for organizers
  
  -- Student fields (for hackers)
  university VARCHAR(255),
  course VARCHAR(255),
  year_of_study VARCHAR(50),
  graduation_year INTEGER,
  
  -- Working professional fields (for hackers)
  company VARCHAR(255),
  position VARCHAR(255),
  work_experience VARCHAR(50),
  
  -- Organization fields (for organizers)
  organization_name VARCHAR(255),
  organization_size VARCHAR(50),
  organization_website VARCHAR(255),
  organization_description TEXT,
  
  -- Technical skills (for hackers)
  programming_languages TEXT[], -- Array of programming languages
  frameworks TEXT[], -- Array of frameworks
  other_skills TEXT[], -- Array of other skills
  experience_level VARCHAR(50),
  
  -- Work experience (for hackers)
  has_work_experience BOOLEAN DEFAULT FALSE,
  work_experiences JSONB, -- Array of work experience objects
  
  -- Event experience (for organizers)
  event_organizing_experience VARCHAR(50),
  previous_events JSONB, -- Array of previous event objects
  
  -- Goals and preferences (for organizers)
  primary_goals TEXT[], -- Array of primary goals
  target_audience TEXT[], -- Array of target audience
  preferred_event_types TEXT[], -- Array of preferred event types
  
  -- Budget and resources (for organizers)
  typical_budget_range VARCHAR(100),
  has_venue BOOLEAN DEFAULT FALSE,
  venue_details TEXT,
  has_sponsor_connections BOOLEAN DEFAULT FALSE,
  sponsor_details TEXT,
  
  -- Technical capabilities (for organizers)
  tech_setup_capability VARCHAR(50),
  livestream_capability BOOLEAN DEFAULT FALSE,
  photography_capability BOOLEAN DEFAULT FALSE,
  marketing_capability BOOLEAN DEFAULT FALSE,
  
  -- Social links
  github_username VARCHAR(100),
  linkedin_url VARCHAR(255),
  twitter_username VARCHAR(100),
  portfolio_url VARCHAR(255),
  instagram_username VARCHAR(100),
  website_url VARCHAR(255), -- For organizers
  
  -- Other preferences
  open_to_recruitment BOOLEAN DEFAULT FALSE, -- For hackers
  looking_for_co_organizers BOOLEAN DEFAULT FALSE, -- For organizers
  willing_to_mentor BOOLEAN DEFAULT FALSE, -- For organizers
  available_for_consulting BOOLEAN DEFAULT FALSE, -- For organizers
  willing_to_travel_for BOOLEAN DEFAULT FALSE, -- For organizers
  
  -- NEW: GitHub integration tracking fields
  github_skills_analyzed_at TIMESTAMP WITH TIME ZONE, -- When we last analyzed their GitHub for skills
  github_repos_count INTEGER DEFAULT 0, -- Number of repos they have
  github_integration_id UUID, -- Reference to their GitHub integration record
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_profile UNIQUE(user_id)
);

-- GitHub Projects Table
CREATE TABLE IF NOT EXISTS github_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  github_repo_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  description TEXT,
  language VARCHAR(50),
  stars_count INTEGER DEFAULT 0,
  forks_count INTEGER DEFAULT 0,
  watchers_count INTEGER DEFAULT 0,
  open_issues_count INTEGER DEFAULT 0,
  size INTEGER DEFAULT 0,
  default_branch VARCHAR(100),
  topics TEXT[], -- Array of repository topics
  homepage VARCHAR(255),
  html_url VARCHAR(255) NOT NULL,
  clone_url VARCHAR(255),
  ssh_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  pushed_at TIMESTAMP WITH TIME ZONE,
  is_private BOOLEAN DEFAULT FALSE,
  is_fork BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  is_disabled BOOLEAN DEFAULT FALSE,
  is_selected BOOLEAN DEFAULT FALSE, -- Whether user selected this project for their profile
  last_analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  created_at_db TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at_db TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_repo UNIQUE(user_id, github_repo_id)
);

-- GitHub Integration Table
CREATE TABLE IF NOT EXISTS github_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  github_user_id BIGINT NOT NULL,
  github_username VARCHAR(100) NOT NULL,
  github_avatar_url VARCHAR(255),
  github_html_url VARCHAR(255),
  access_token_encrypted TEXT, -- Encrypted GitHub access token
  token_scope TEXT[], -- Array of token scopes
  is_active BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- NEW: OAuth integration fields
  auth_method VARCHAR(20) DEFAULT 'oauth', -- 'oauth' for our GitHub integration, 'github_signup' if they signed up with GitHub
  integration_status VARCHAR(20) DEFAULT 'connected', -- 'connected', 'disconnected', 'expired', 'error'
  oauth_state VARCHAR(50), -- For CSRF protection during OAuth flow
  token_expires_at TIMESTAMP WITH TIME ZONE, -- For future token refresh capability
  last_error TEXT, -- Store any integration errors for debugging
  refresh_token_encrypted TEXT, -- For future token refresh (GitHub doesn't provide this yet)
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_github_integration UNIQUE(user_id),
  CONSTRAINT check_auth_method CHECK (auth_method IN ('oauth', 'github_signup', 'manual')),
  CONSTRAINT check_integration_status CHECK (integration_status IN ('connected', 'disconnected', 'expired', 'error'))
);

-- Add foreign key constraint from user_profiles to github_integrations
ALTER TABLE user_profiles ADD CONSTRAINT fk_github_integration 
  FOREIGN KEY (github_integration_id) REFERENCES github_integrations(id) ON DELETE SET NULL;

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_primary_type ON user_profiles(user_primary_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_github_integration ON user_profiles(github_integration_id) WHERE github_integration_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_github_projects_user_id ON github_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_github_projects_selected ON github_projects(user_id, is_selected);
CREATE INDEX IF NOT EXISTS idx_github_integrations_user_id ON github_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_github_integrations_github_user_id ON github_integrations(github_user_id);
CREATE INDEX IF NOT EXISTS idx_github_integrations_auth_method ON github_integrations(auth_method);
CREATE INDEX IF NOT EXISTS idx_github_integrations_status ON github_integrations(integration_status);
CREATE INDEX IF NOT EXISTS idx_github_integrations_oauth_state ON github_integrations(oauth_state) WHERE oauth_state IS NOT NULL;

-- RLS (Row Level Security) Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_integrations ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- GitHub projects policies
CREATE POLICY "Users can view their own GitHub projects" ON github_projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own GitHub projects" ON github_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own GitHub projects" ON github_projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own GitHub projects" ON github_projects
  FOR DELETE USING (auth.uid() = user_id);

-- GitHub integrations policies
CREATE POLICY "Users can view their own GitHub integration" ON github_integrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own GitHub integration" ON github_integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own GitHub integration" ON github_integrations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own GitHub integration" ON github_integrations
  FOR DELETE USING (auth.uid() = user_id);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to sync GitHub profile data
CREATE OR REPLACE FUNCTION sync_github_profile_data(
  p_user_id UUID,
  p_github_data JSONB
) RETURNS BOOLEAN AS $$
BEGIN
  -- Update user profile with GitHub analysis results
  UPDATE user_profiles 
  SET 
    programming_languages = COALESCE(
      programming_languages, 
      ARRAY(SELECT jsonb_array_elements_text(p_github_data->'skills'->'programmingLanguages'))
    ),
    frameworks = COALESCE(
      frameworks,
      ARRAY(SELECT jsonb_array_elements_text(p_github_data->'skills'->'frameworks'))
    ),
    github_skills_analyzed_at = NOW(),
    github_repos_count = (p_github_data->>'repoCount')::INTEGER,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for updating timestamps
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_github_projects_updated_at_db BEFORE UPDATE ON github_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_github_integrations_updated_at BEFORE UPDATE ON github_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View for user dashboard (helpful for displaying user info with GitHub status)
CREATE OR REPLACE VIEW user_dashboard AS
SELECT 
  up.user_id,
  up.full_name,
  up.user_primary_type,
  up.programming_languages,
  up.frameworks,
  up.github_username,
  gi.github_username as github_integrated_username,
  gi.is_active as github_connected,
  gi.integration_status,
  gi.last_sync_at as github_last_sync,
  gi.auth_method as github_auth_method,
  COUNT(gp.id) as github_repos_selected
FROM user_profiles up
LEFT JOIN github_integrations gi ON up.user_id = gi.user_id
LEFT JOIN github_projects gp ON up.user_id = gp.user_id AND gp.is_selected = true
GROUP BY 
  up.user_id, up.full_name, up.user_primary_type, up.programming_languages, 
  up.frameworks, up.github_username, gi.github_username, gi.is_active, 
  gi.integration_status, gi.last_sync_at, gi.auth_method;

-- Grant access to the view
GRANT SELECT ON user_dashboard TO authenticated;

CREATE TABLE IF NOT EXISTS hackathons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  website_url TEXT,
  visibility TEXT NOT NULL CHECK (visibility IN ('public', 'invite')),
  mode TEXT NOT NULL CHECK (mode IN ('online', 'offline')),
  categories TEXT[] NOT NULL,
  about TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  step INTEGER DEFAULT 1,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;

-- Policy for users to insert their own hackathons
CREATE POLICY "Users can insert own hackathons" ON hackathons
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Policy for users to view their own hackathons
CREATE POLICY "Users can view own hackathons" ON hackathons
  FOR SELECT USING (auth.uid() = created_by);

-- Policy for users to update their own hackathons
CREATE POLICY "Users can update own hackathons" ON hackathons
  FOR UPDATE USING (auth.uid() = created_by);

ALTER TABLE hackathons ADD COLUMN participation_type TEXT CHECK (participation_type IN ('individual', 'team'));
ALTER TABLE hackathons ADD COLUMN team_size_min INTEGER DEFAULT 1;
ALTER TABLE hackathons ADD COLUMN team_size_max INTEGER DEFAULT 400;
ALTER TABLE hackathons ADD COLUMN registration_start_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE hackathons ADD COLUMN registration_end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE hackathons ADD COLUMN max_registrations INTEGER;

ALTER TABLE hackathons ADD COLUMN logo_url TEXT;

CREATE POLICY "Authenticated users can upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hackathons' AND (storage.foldername(name))[1] = 'hackathon-logos');

CREATE POLICY "Public can view logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hackathons');

CREATE POLICY "Authenticated users can upload hackathon files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hackathons');

CREATE POLICY "Public can view hackathon files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'hackathons');