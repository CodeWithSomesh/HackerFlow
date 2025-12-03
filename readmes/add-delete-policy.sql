-- Add DELETE policies for hackathon_team_members, hackathon_teams, and hackathon_registrations
-- Run this in your Supabase SQL Editor

-- 1. Update the UPDATE policy for hackathon_team_members to allow members to update themselves
DROP POLICY IF EXISTS "Team leaders can update members" ON hackathon_team_members;
CREATE POLICY "Team leaders can update members" ON hackathon_team_members
  FOR UPDATE USING (
    auth.uid() IN (SELECT team_leader_id FROM hackathon_teams WHERE id = team_id) OR
    auth.uid() = user_id
  );

-- 2. Add DELETE policy for hackathon_team_members
CREATE POLICY "Team leaders can delete members" ON hackathon_team_members
  FOR DELETE USING (
    auth.uid() IN (SELECT team_leader_id FROM hackathon_teams WHERE id = team_id) AND
    is_leader = false
  );

-- 3. Add DELETE policy for hackathon_teams
CREATE POLICY "Team leaders can delete their teams" ON hackathon_teams
  FOR DELETE USING (auth.uid() = team_leader_id);

-- 4. Add DELETE policy for hackathon_registrations
CREATE POLICY "Users can delete their own registrations" ON hackathon_registrations
  FOR DELETE USING (auth.uid() = user_id);
