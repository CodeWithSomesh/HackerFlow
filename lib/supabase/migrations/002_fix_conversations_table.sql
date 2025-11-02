-- Fix conversations table by dropping and recreating it
-- This ensures the schema cache is properly updated

-- Drop existing conversations table if it exists
DROP TABLE IF EXISTS conversations CASCADE;

-- Recreate conversations table with proper structure
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  hackathon_id UUID REFERENCES hackathons(id) NOT NULL,
  idea_id UUID REFERENCES generated_ideas(id) ON DELETE CASCADE,
  messages TEXT NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_idea_id ON conversations(idea_id);
CREATE INDEX idx_conversations_hackathon_id ON conversations(hackathon_id);

-- Add trigger for updated_at
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
