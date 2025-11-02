-- Migration: Add conversations table and additional hackathon fields
-- Date: 2025-10-29
-- Description: Adds conversations table for AI chat feature and missing hackathon detail columns

-- Add additional hackathon detail columns if they don't exist
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS eligibility TEXT;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS requirements TEXT;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS important_dates JSONB;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS timeline JSONB;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS prizes JSONB;

-- Create generated_ideas table if it doesn't exist
CREATE TABLE IF NOT EXISTS generated_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  hackathon_id UUID REFERENCES hackathons(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  problem_statement TEXT,
  vision TEXT,
  tech_stack TEXT[], -- Array of strings
  estimated_time TEXT,
  skills_required TEXT[],
  success_metrics TEXT[],
  implementation JSONB, -- Store phases data
  inspiration TEXT,
  resume_analyzed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for generated_ideas if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'generated_ideas' AND policyname = 'Users can view own ideas'
  ) THEN
    ALTER TABLE generated_ideas ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can view own ideas" ON generated_ideas FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own ideas" ON generated_ideas FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Conversations table for AI chat
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  hackathon_id UUID REFERENCES hackathons(id) NOT NULL,
  idea_id UUID REFERENCES generated_ideas(id) ON DELETE CASCADE,
  messages TEXT NOT NULL DEFAULT '[]', -- JSON string of messages array
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for conversations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'conversations'
  ) THEN
    ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own conversations" ON conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update own conversations" ON conversations FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_idea_id ON conversations(idea_id);
CREATE INDEX IF NOT EXISTS idx_conversations_hackathon_id ON conversations(hackathon_id);

-- Trigger to update conversations updated_at (only if function exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
    CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
