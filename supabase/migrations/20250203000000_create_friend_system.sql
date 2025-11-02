-- Migration: Create Friend System Tables
-- Created: 2025-02-03
-- Description: Creates friend_requests and friendships tables with RLS policies

-- =====================================================
-- 1. FRIEND REQUESTS TABLE
-- =====================================================
-- Stores friend requests between users
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_friend_request UNIQUE(sender_id, receiver_id),
  CONSTRAINT no_self_friend_request CHECK (sender_id != receiver_id)
);

-- Create indexes for friend_requests
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender_id ON friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver_id ON friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status);
CREATE INDEX IF NOT EXISTS idx_friend_requests_created_at ON friend_requests(created_at DESC);

-- Enable RLS for friend_requests
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for friend_requests
DROP POLICY IF EXISTS "Users can view their own friend requests" ON friend_requests;
CREATE POLICY "Users can view their own friend requests"
  ON friend_requests FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can create friend requests" ON friend_requests;
CREATE POLICY "Users can create friend requests"
  ON friend_requests FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update friend requests they received" ON friend_requests;
CREATE POLICY "Users can update friend requests they received"
  ON friend_requests FOR UPDATE
  USING (auth.uid() = receiver_id OR auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can delete their own sent requests" ON friend_requests;
CREATE POLICY "Users can delete their own sent requests"
  ON friend_requests FOR DELETE
  USING (auth.uid() = sender_id);

-- =====================================================
-- 2. FRIENDSHIPS TABLE
-- =====================================================
-- Stores established friendships between users
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_1 UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_id_2 UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_friendship UNIQUE(user_id_1, user_id_2),
  CONSTRAINT no_self_friendship CHECK (user_id_1 != user_id_2),
  CONSTRAINT ordered_friendship CHECK (user_id_1 < user_id_2)
);

-- Create indexes for friendships
CREATE INDEX IF NOT EXISTS idx_friendships_user_id_1 ON friendships(user_id_1);
CREATE INDEX IF NOT EXISTS idx_friendships_user_id_2 ON friendships(user_id_2);
CREATE INDEX IF NOT EXISTS idx_friendships_created_at ON friendships(created_at DESC);

-- Enable RLS for friendships
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for friendships
DROP POLICY IF EXISTS "Users can view their own friendships" ON friendships;
CREATE POLICY "Users can view their own friendships"
  ON friendships FOR SELECT
  USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

DROP POLICY IF EXISTS "System can create friendships" ON friendships;
CREATE POLICY "System can create friendships"
  ON friendships FOR INSERT
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Users can delete their own friendships" ON friendships;
CREATE POLICY "Users can delete their own friendships"
  ON friendships FOR DELETE
  USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- =====================================================
-- 3. UPDATED_AT TRIGGER FUNCTION
-- =====================================================
-- Reuse existing update_updated_at_column function if it exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at columns
DROP TRIGGER IF EXISTS update_friend_requests_updated_at ON friend_requests;
CREATE TRIGGER update_friend_requests_updated_at
  BEFORE UPDATE ON friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. AUTOMATIC FRIENDSHIP CREATION FUNCTION
-- =====================================================
-- Automatically create friendship when request is accepted
CREATE OR REPLACE FUNCTION create_friendship_on_accept()
RETURNS TRIGGER AS $$
DECLARE
  v_user_1 UUID;
  v_user_2 UUID;
BEGIN
  -- Only process if request was just accepted
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    -- Ensure user_id_1 < user_id_2 for the unique constraint
    IF NEW.sender_id < NEW.receiver_id THEN
      v_user_1 := NEW.sender_id;
      v_user_2 := NEW.receiver_id;
    ELSE
      v_user_1 := NEW.receiver_id;
      v_user_2 := NEW.sender_id;
    END IF;

    -- Create friendship record
    INSERT INTO friendships (user_id_1, user_id_2)
    VALUES (v_user_1, v_user_2)
    ON CONFLICT (user_id_1, user_id_2) DO NOTHING;

    -- Create notifications for both users
    INSERT INTO notifications (user_id, type, title, message, link, metadata)
    VALUES (
      NEW.sender_id,
      'friendship_accepted',
      'Friend Request Accepted!',
      'Your friend request has been accepted! You are now friends.',
      '/profile?tab=friends',
      jsonb_build_object(
        'friend_user_id', NEW.receiver_id,
        'friendship_id', v_user_1 || '-' || v_user_2
      )
    );

    INSERT INTO notifications (user_id, type, title, message, link, metadata)
    VALUES (
      NEW.receiver_id,
      'new_friend',
      'New Friend!',
      'You have a new friend! Start chatting now.',
      '/profile?tab=friends',
      jsonb_build_object(
        'friend_user_id', NEW.sender_id,
        'friendship_id', v_user_1 || '-' || v_user_2
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic friendship creation
DROP TRIGGER IF EXISTS trigger_create_friendship_on_accept ON friend_requests;
CREATE TRIGGER trigger_create_friendship_on_accept
  AFTER UPDATE ON friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION create_friendship_on_accept();

-- =====================================================
-- 5. HELPER FUNCTIONS FOR FRIEND SYSTEM
-- =====================================================

-- Function to search users by name or email
CREATE OR REPLACE FUNCTION search_users(
  p_search_query TEXT,
  p_current_user_id UUID,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  email TEXT,
  bio TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  profile_image TEXT,
  user_primary_type TEXT,
  programming_languages TEXT[],
  frameworks TEXT[],
  experience_level TEXT,
  organization_name TEXT,
  position TEXT,
  is_friend BOOLEAN,
  friend_request_status TEXT,
  friend_request_direction TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    up.user_id,
    up.full_name,
    up.email,
    up.bio,
    up.city,
    up.state,
    up.country,
    up.profile_image,
    up.user_primary_type,
    up.programming_languages,
    up.frameworks,
    up.experience_level,
    up.organization_name,
    up.position,
    -- Check if already friends
    EXISTS (
      SELECT 1 FROM friendships f
      WHERE (f.user_id_1 = p_current_user_id AND f.user_id_2 = up.user_id)
         OR (f.user_id_1 = up.user_id AND f.user_id_2 = p_current_user_id)
    ) AS is_friend,
    -- Check friend request status
    (
      SELECT fr.status
      FROM friend_requests fr
      WHERE (fr.sender_id = p_current_user_id AND fr.receiver_id = up.user_id)
         OR (fr.sender_id = up.user_id AND fr.receiver_id = p_current_user_id)
      ORDER BY fr.created_at DESC
      LIMIT 1
    ) AS friend_request_status,
    -- Check friend request direction
    (
      CASE
        WHEN EXISTS (
          SELECT 1 FROM friend_requests fr
          WHERE fr.sender_id = p_current_user_id AND fr.receiver_id = up.user_id
        ) THEN 'sent'
        WHEN EXISTS (
          SELECT 1 FROM friend_requests fr
          WHERE fr.sender_id = up.user_id AND fr.receiver_id = p_current_user_id
        ) THEN 'received'
        ELSE NULL
      END
    ) AS friend_request_direction
  FROM user_profiles up
  WHERE up.user_id != p_current_user_id
  AND (
    LOWER(up.full_name) LIKE LOWER('%' || p_search_query || '%')
    OR LOWER(up.email) LIKE LOWER('%' || p_search_query || '%')
  )
  ORDER BY
    -- Prioritize exact matches
    CASE WHEN LOWER(up.full_name) = LOWER(p_search_query) THEN 0 ELSE 1 END,
    up.full_name
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get friend count for a user
CREATE OR REPLACE FUNCTION get_friend_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM friendships
  WHERE user_id_1 = p_user_id OR user_id_2 = p_user_id;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pending friend request count
CREATE OR REPLACE FUNCTION get_pending_request_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM friend_requests
  WHERE receiver_id = p_user_id AND status = 'pending';

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. GRANT PERMISSIONS
-- =====================================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON friend_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON friendships TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- 7. ADD COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE friend_requests IS 'Stores friend requests between users with pending/accepted/rejected status';
COMMENT ON TABLE friendships IS 'Stores established friendships between users (created when request is accepted)';

COMMENT ON COLUMN friend_requests.status IS 'Status of friend request: pending, accepted, or rejected';
COMMENT ON COLUMN friendships.user_id_1 IS 'Always the smaller UUID to ensure uniqueness (CHECK constraint: user_id_1 < user_id_2)';
COMMENT ON COLUMN friendships.user_id_2 IS 'Always the larger UUID to ensure uniqueness (CHECK constraint: user_id_1 < user_id_2)';
