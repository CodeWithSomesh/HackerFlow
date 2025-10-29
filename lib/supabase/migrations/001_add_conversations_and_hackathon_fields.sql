-- Migration: Add conversations table and additional hackathon fields
-- Date: 2025-10-29
-- Description: Adds conversations table for AI chat feature and missing hackathon detail columns

-- Add additional hackathon detail columns if they don't exist
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS eligibility TEXT;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS requirements TEXT;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS important_dates JSONB;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS timeline JSONB;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS prizes JSONB;

-- Conversations table for AI chat
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  hackathon_id UUID REFERENCES hackathons(id) NOT NULL,
  idea_id UUID REFERENCES generated_ideas(id),
  messages TEXT NOT NULL DEFAULT '[]', -- JSON string of messages array
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_idea_id ON conversations(idea_id);
CREATE INDEX IF NOT EXISTS idx_conversations_hackathon_id ON conversations(hackathon_id);

-- Trigger to update conversations updated_at
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
