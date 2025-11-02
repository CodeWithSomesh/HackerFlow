-- Migration: Create Dashboard Tables
-- Created: 2025-01-31
-- Description: Creates hackathon_winners, notifications, and user_badges tables with RLS policies

-- =====================================================
-- 1. HACKATHON WINNERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS hackathon_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES hackathon_teams(id) ON DELETE SET NULL,
  prize_position TEXT NOT NULL, -- "1st Place", "2nd Place", "3rd Place", "Special Prize"
  prize_amount NUMERIC,
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'credited'
  payment_date TIMESTAMPTZ,
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for hackathon_winners
CREATE INDEX IF NOT EXISTS idx_hackathon_winners_hackathon_id ON hackathon_winners(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_winners_user_id ON hackathon_winners(user_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_winners_team_id ON hackathon_winners(team_id);

-- Enable RLS for hackathon_winners
ALTER TABLE hackathon_winners ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hackathon_winners
DROP POLICY IF EXISTS "Users can view their own winnings" ON hackathon_winners;
CREATE POLICY "Users can view their own winnings"
  ON hackathon_winners FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Organizers can view winners of their hackathons" ON hackathon_winners;
CREATE POLICY "Organizers can view winners of their hackathons"
  ON hackathon_winners FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM hackathons
      WHERE hackathons.id = hackathon_winners.hackathon_id
      AND hackathons.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Organizers can insert winners for their hackathons" ON hackathon_winners;
CREATE POLICY "Organizers can insert winners for their hackathons"
  ON hackathon_winners FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM hackathons
      WHERE hackathons.id = hackathon_winners.hackathon_id
      AND hackathons.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Organizers can update winners for their hackathons" ON hackathon_winners;
CREATE POLICY "Organizers can update winners for their hackathons"
  ON hackathon_winners FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM hackathons
      WHERE hackathons.id = hackathon_winners.hackathon_id
      AND hackathons.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Organizers can delete winners for their hackathons" ON hackathon_winners;
CREATE POLICY "Organizers can delete winners for their hackathons"
  ON hackathon_winners FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM hackathons
      WHERE hackathons.id = hackathon_winners.hackathon_id
      AND hackathons.created_by = auth.uid()
    )
  );

-- =====================================================
-- 2. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'registration', 'team_invite', 'winner_announcement', 'payment_update', 'hackathon_update'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (TRUE);

-- =====================================================
-- 3. USER BADGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_type TEXT NOT NULL, -- 'first_participation', 'first_win', '5_hackathons', '10_hackathons', 'team_player', 'solo_champion'
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  badge_icon TEXT, -- URL or icon name
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB,
  UNIQUE(user_id, badge_type)
);

-- Create indexes for user_badges
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_type ON user_badges(badge_type);

-- Enable RLS for user_badges
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_badges
DROP POLICY IF EXISTS "Users can view their own badges" ON user_badges;
CREATE POLICY "Users can view their own badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view public badges" ON user_badges;
CREATE POLICY "Anyone can view public badges"
  ON user_badges FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "System can insert badges" ON user_badges;
CREATE POLICY "System can insert badges"
  ON user_badges FOR INSERT
  WITH CHECK (TRUE);

-- =====================================================
-- 4. UPDATED_AT TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for hackathon_winners
DROP TRIGGER IF EXISTS update_hackathon_winners_updated_at ON hackathon_winners;
CREATE TRIGGER update_hackathon_winners_updated_at
  BEFORE UPDATE ON hackathon_winners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. BADGE AUTO-AWARD FUNCTIONS
-- =====================================================

-- Function to check and award badges
CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_participation_count INT;
  v_win_count INT;
  v_team_participation_count INT;
  v_individual_win_count INT;
BEGIN
  -- Count total participations
  SELECT COUNT(*) INTO v_participation_count
  FROM hackathon_registrations
  WHERE user_id = p_user_id AND registration_status = 'confirmed';

  -- Count wins
  SELECT COUNT(*) INTO v_win_count
  FROM hackathon_winners
  WHERE user_id = p_user_id;

  -- Count team participations
  SELECT COUNT(DISTINCT r.hackathon_id) INTO v_team_participation_count
  FROM hackathon_registrations r
  WHERE r.user_id = p_user_id
  AND r.participant_type = 'team'
  AND r.registration_status = 'confirmed';

  -- Count individual wins
  SELECT COUNT(*) INTO v_individual_win_count
  FROM hackathon_winners w
  JOIN hackathon_registrations r ON r.hackathon_id = w.hackathon_id AND r.user_id = w.user_id
  WHERE w.user_id = p_user_id AND r.participant_type = 'individual';

  -- Award "First Participation" badge
  IF v_participation_count >= 1 THEN
    INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, badge_icon)
    VALUES (
      p_user_id,
      'first_participation',
      'First Step',
      'Participated in your first hackathon',
      'medal'
    )
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  -- Award "First Win" badge
  IF v_win_count >= 1 THEN
    INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, badge_icon)
    VALUES (
      p_user_id,
      'first_win',
      'Victory Royale',
      'Won your first hackathon',
      'trophy'
    )
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  -- Award "5 Hackathons" badge
  IF v_participation_count >= 5 THEN
    INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, badge_icon)
    VALUES (
      p_user_id,
      '5_hackathons',
      'Veteran',
      'Participated in 5 hackathons',
      'shield'
    )
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  -- Award "10 Hackathons" badge
  IF v_participation_count >= 10 THEN
    INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, badge_icon)
    VALUES (
      p_user_id,
      '10_hackathons',
      'Legend',
      'Participated in 10 hackathons',
      'crown'
    )
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  -- Award "Team Player" badge
  IF v_team_participation_count >= 5 THEN
    INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, badge_icon)
    VALUES (
      p_user_id,
      'team_player',
      'Team Player',
      'Participated in 5 team hackathons',
      'users'
    )
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  -- Award "Solo Champion" badge
  IF v_individual_win_count >= 1 THEN
    INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, badge_icon)
    VALUES (
      p_user_id,
      'solo_champion',
      'Solo Champion',
      'Won an individual hackathon',
      'star'
    )
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. TRIGGERS FOR AUTO-NOTIFICATIONS
-- =====================================================

-- Function to create registration notification
CREATE OR REPLACE FUNCTION create_registration_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_hackathon_title TEXT;
BEGIN
  -- Get hackathon title
  SELECT title INTO v_hackathon_title
  FROM hackathons
  WHERE id = NEW.hackathon_id;

  -- Create notification for user
  INSERT INTO notifications (user_id, type, title, message, link, metadata)
  VALUES (
    NEW.user_id,
    'registration',
    'Registration Confirmed',
    'You have successfully registered for ' || v_hackathon_title,
    '/hackathons/' || NEW.hackathon_id,
    jsonb_build_object(
      'hackathon_id', NEW.hackathon_id,
      'registration_id', NEW.id
    )
  );

  -- Check and award badges
  PERFORM check_and_award_badges(NEW.user_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for registration notifications
DROP TRIGGER IF EXISTS trigger_registration_notification ON hackathon_registrations;
CREATE TRIGGER trigger_registration_notification
  AFTER INSERT ON hackathon_registrations
  FOR EACH ROW
  WHEN (NEW.registration_status = 'confirmed')
  EXECUTE FUNCTION create_registration_notification();

-- Function to create winner notification
CREATE OR REPLACE FUNCTION create_winner_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_hackathon_title TEXT;
BEGIN
  -- Get hackathon title
  SELECT title INTO v_hackathon_title
  FROM hackathons
  WHERE id = NEW.hackathon_id;

  -- Create notification for winner
  INSERT INTO notifications (user_id, type, title, message, link, metadata)
  VALUES (
    NEW.user_id,
    'winner_announcement',
    'Congratulations! You Won!',
    'You won ' || NEW.prize_position || ' in ' || v_hackathon_title || '!',
    '/dashboard/hacker/prizes',
    jsonb_build_object(
      'hackathon_id', NEW.hackathon_id,
      'prize_position', NEW.prize_position,
      'prize_amount', NEW.prize_amount
    )
  );

  -- Check and award badges
  PERFORM check_and_award_badges(NEW.user_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for winner notifications
DROP TRIGGER IF EXISTS trigger_winner_notification ON hackathon_winners;
CREATE TRIGGER trigger_winner_notification
  AFTER INSERT ON hackathon_winners
  FOR EACH ROW
  EXECUTE FUNCTION create_winner_notification();

-- Function to create payment status update notification
CREATE OR REPLACE FUNCTION create_payment_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify on status change
  IF OLD.payment_status IS DISTINCT FROM NEW.payment_status THEN
    INSERT INTO notifications (user_id, type, title, message, link, metadata)
    VALUES (
      NEW.user_id,
      'payment_update',
      'Prize Payment Update',
      'Your prize payment status has been updated to: ' || NEW.payment_status,
      '/dashboard/hacker/prizes',
      jsonb_build_object(
        'winner_id', NEW.id,
        'payment_status', NEW.payment_status,
        'payment_reference', NEW.payment_reference
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for payment notifications
DROP TRIGGER IF EXISTS trigger_payment_notification ON hackathon_winners;
CREATE TRIGGER trigger_payment_notification
  AFTER UPDATE ON hackathon_winners
  FOR EACH ROW
  EXECUTE FUNCTION create_payment_notification();

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON hackathon_winners TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;
GRANT SELECT ON user_badges TO authenticated;
GRANT INSERT ON user_badges TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
