'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Types
export interface RegistrationData {
  email: string;
  mobile: string;
  firstName: string;
  lastName?: string;
  organizationName?: string;
  participantType: 'College Students' | 'Professional' | 'High School / Primary School Student' | 'Fresher';
  passoutYear?: string;
  domain?: string;
  location: string;
}

export interface TeamData {
  teamName: string;
  lookingForTeammates: boolean;
}

export interface TeamMemberData extends RegistrationData {
  status?: 'pending' | 'accepted' | 'rejected';
}

// Get user's existing profile data for pre-filling
export async function getUserProfileForRegistration() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('full_name, email, city, state, country, profile_type, university, company, position')
      .eq('user_id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
      return { success: false, error: 'Failed to fetch profile data' };
    }

    // Parse full name into first and last name
    const nameParts = profile?.full_name?.split(' ') || [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      success: true,
      data: {
        email: user.email || '',
        firstName,
        lastName,
        organizationName: profile?.university || profile?.company || '',
        location: `${profile?.city || ''}, ${profile?.state || ''}, ${profile?.country || ''}`.trim(),
        participantType: profile?.profile_type === 'student' ? 'College Students' : 'Professional',
      }
    };
  } catch (error) {
    console.error('Error in getUserProfileForRegistration:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Check if user is already registered for a hackathon
export async function checkUserRegistration(hackathonId: string) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'User not authenticated', isRegistered: false };
    }

    const { data: registration, error } = await supabase
      .from('hackathon_registrations')
      .select('*, hackathon_teams(id, team_name, team_leader_id, team_size_current, team_size_max, looking_for_teammates)')
      .eq('hackathon_id', hackathonId)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking registration:', error);
      return { success: false, error: 'Failed to check registration status', isRegistered: false };
    }

    return {
      success: true,
      isRegistered: !!registration,
      registration,
      isTeamLeader: registration?.hackathon_teams?.team_leader_id === user.id
    };
  } catch (error) {
    console.error('Error in checkUserRegistration:', error);
    return { success: false, error: 'An unexpected error occurred', isRegistered: false };
  }
}

// Register user and create team for team-based hackathons
export async function registerForHackathon(
  hackathonId: string,
  registrationData: RegistrationData,
  teamData?: TeamData
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Check if user is already registered
    const { isRegistered } = await checkUserRegistration(hackathonId);
    if (isRegistered) {
      return { success: false, error: 'You are already registered for this hackathon' };
    }

    // Get hackathon details
    const { data: hackathon, error: hackathonError } = await supabase
      .from('hackathons')
      .select('participation_type, team_size_min, team_size_max')
      .eq('id', hackathonId)
      .single();

    if (hackathonError) {
      return { success: false, error: 'Failed to fetch hackathon details' };
    }

    let teamId = null;

    // If team-based, create team
    if (hackathon.participation_type === 'team' && teamData) {
      const { data: team, error: teamError } = await supabase
        .from('hackathon_teams')
        .insert({
          hackathon_id: hackathonId,
          team_name: teamData.teamName,
          team_leader_id: user.id,
          looking_for_teammates: teamData.lookingForTeammates,
          team_size_current: 1,
          team_size_max: hackathon.team_size_max,
        })
        .select()
        .single();

      if (teamError) {
        console.error('Error creating team:', teamError);
        return { success: false, error: 'Failed to create team. Team name might already exist.' };
      }

      teamId = team.id;

      // Add team leader as first member
      const { error: memberError } = await supabase
        .from('hackathon_team_members')
        .insert({
          team_id: teamId,
          user_id: user.id,
          email: registrationData.email,
          mobile: registrationData.mobile,
          first_name: registrationData.firstName,
          last_name: registrationData.lastName,
          organization_name: registrationData.organizationName,
          participant_type: registrationData.participantType,
          passout_year: registrationData.passoutYear,
          domain: registrationData.domain,
          location: registrationData.location,
          is_leader: true,
          status: 'accepted',
          joined_at: new Date().toISOString(),
        });

      if (memberError) {
        console.error('Error adding team leader:', memberError);
        // Rollback team creation
        await supabase.from('hackathon_teams').delete().eq('id', teamId);
        return { success: false, error: 'Failed to add team leader' };
      }
    }

    // Create registration record
    const { data: registration, error: regError } = await supabase
      .from('hackathon_registrations')
      .insert({
        hackathon_id: hackathonId,
        user_id: user.id,
        team_id: teamId,
        email: registrationData.email,
        mobile: registrationData.mobile,
        first_name: registrationData.firstName,
        last_name: registrationData.lastName,
        organization_name: registrationData.organizationName,
        participant_type: registrationData.participantType,
        passout_year: registrationData.passoutYear,
        domain: registrationData.domain,
        location: registrationData.location,
      })
      .select()
      .single();

    if (regError) {
      console.error('Error creating registration:', regError);
      // Rollback team creation if exists
      if (teamId) {
        await supabase.from('hackathon_teams').delete().eq('id', teamId);
      }
      return { success: false, error: 'Failed to complete registration' };
    }

    revalidatePath(`/hackathons/${hackathonId}`);
    return {
      success: true,
      data: {
        registration,
        teamId,
        isTeamLeader: !!teamId
      }
    };
  } catch (error) {
    console.error('Error in registerForHackathon:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Get team details for a user's registration
export async function getMyTeam(hackathonId: string) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data: registration } = await supabase
      .from('hackathon_registrations')
      .select('team_id')
      .eq('hackathon_id', hackathonId)
      .eq('user_id', user.id)
      .single();

    if (!registration?.team_id) {
      return { success: false, error: 'No team found for this registration' };
    }

    const { data: team, error: teamError } = await supabase
      .from('hackathon_teams')
      .select(`
        *,
        hackathon_team_members(*)
      `)
      .eq('id', registration.team_id)
      .single();

    if (teamError) {
      console.error('Error fetching team:', teamError);
      return { success: false, error: 'Failed to fetch team details' };
    }

    return {
      success: true,
      data: team,
      isLeader: team.team_leader_id === user.id
    };
  } catch (error) {
    console.error('Error in getMyTeam:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Add team member (by team leader)
export async function addTeamMember(teamId: string, memberData: TeamMemberData) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Verify user is team leader
    const { data: team } = await supabase
      .from('hackathon_teams')
      .select('team_leader_id, team_size_current, team_size_max')
      .eq('id', teamId)
      .single();

    if (!team || team.team_leader_id !== user.id) {
      return { success: false, error: 'Only team leader can add members' };
    }

    if (team.team_size_current >= team.team_size_max) {
      return { success: false, error: 'Team is already full' };
    }

    // Check if user already exists in the system
    const { data: existingUser } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', memberData.email)
      .single();

    const { data: member, error: memberError } = await supabase
      .from('hackathon_team_members')
      .insert({
        team_id: teamId,
        user_id: existingUser?.id || null,
        email: memberData.email,
        mobile: memberData.mobile,
        first_name: memberData.firstName,
        last_name: memberData.lastName,
        organization_name: memberData.organizationName,
        participant_type: memberData.participantType,
        passout_year: memberData.passoutYear,
        domain: memberData.domain,
        location: memberData.location,
        is_leader: false,
        status: existingUser ? 'pending' : 'pending',
        invited_by: user.id,
      })
      .select()
      .single();

    if (memberError) {
      console.error('Error adding team member:', memberError);
      return { success: false, error: 'Failed to add team member' };
    }

    revalidatePath(`/hackathons/register/${teamId}`);
    return { success: true, data: member };
  } catch (error) {
    console.error('Error in addTeamMember:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Update team member status
export async function updateTeamMemberStatus(memberId: string, status: 'accepted' | 'rejected') {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const updateData: any = { status };
    if (status === 'accepted') {
      updateData.joined_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('hackathon_team_members')
      .update(updateData)
      .eq('id', memberId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating member status:', error);
      return { success: false, error: 'Failed to update status' };
    }

    revalidatePath('/hackathons');
    return { success: true };
  } catch (error) {
    console.error('Error in updateTeamMemberStatus:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Update team details
export async function updateTeam(teamId: string, updates: Partial<TeamData>) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('hackathon_teams')
      .update({
        team_name: updates.teamName,
        looking_for_teammates: updates.lookingForTeammates,
      })
      .eq('id', teamId)
      .eq('team_leader_id', user.id);

    if (error) {
      console.error('Error updating team:', error);
      return { success: false, error: 'Failed to update team' };
    }

    revalidatePath(`/hackathons/register/${teamId}`);
    return { success: true };
  } catch (error) {
    console.error('Error in updateTeam:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Remove team member (by team leader)
export async function removeTeamMember(memberId: string) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Get member details to verify team leader
    const { data: member } = await supabase
      .from('hackathon_team_members')
      .select('team_id, is_leader')
      .eq('id', memberId)
      .single();

    if (!member) {
      return { success: false, error: 'Team member not found' };
    }

    if (member.is_leader) {
      return { success: false, error: 'Cannot remove team leader' };
    }

    // Verify user is team leader
    const { data: team } = await supabase
      .from('hackathon_teams')
      .select('team_leader_id')
      .eq('id', member.team_id)
      .single();

    if (!team || team.team_leader_id !== user.id) {
      return { success: false, error: 'Only team leader can remove members' };
    }

    const { error } = await supabase
      .from('hackathon_team_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      console.error('Error removing team member:', error);
      return { success: false, error: 'Failed to remove team member' };
    }

    revalidatePath(`/hackathons/register/${member.team_id}`);
    return { success: true };
  } catch (error) {
    console.error('Error in removeTeamMember:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Get teams seeking members for a hackathon
export async function getTeamsSeekingMembers(hackathonId: string) {
  try {
    const supabase = await createClient();

    const { data: teams, error } = await supabase
      .from('hackathon_teams')
      .select(`
        *,
        hackathon_team_members!inner(
          first_name,
          last_name,
          organization_name,
          participant_type,
          is_leader
        )
      `)
      .eq('hackathon_id', hackathonId)
      .eq('looking_for_teammates', true)
      .lt('team_size_current', supabase.rpc('team_size_max'))
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching teams:', error);
      return { success: false, error: 'Failed to fetch teams' };
    }

    return { success: true, data: teams || [] };
  } catch (error) {
    console.error('Error in getTeamsSeekingMembers:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Request to join a team
export async function requestToJoinTeam(teamId: string, memberData: TeamMemberData) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Check if team is still accepting members
    const { data: team } = await supabase
      .from('hackathon_teams')
      .select('team_size_current, team_size_max, looking_for_teammates')
      .eq('id', teamId)
      .single();

    if (!team || !team.looking_for_teammates) {
      return { success: false, error: 'This team is not accepting new members' };
    }

    if (team.team_size_current >= team.team_size_max) {
      return { success: false, error: 'This team is already full' };
    }

    // Add member with pending status
    const { error } = await supabase
      .from('hackathon_team_members')
      .insert({
        team_id: teamId,
        user_id: user.id,
        email: memberData.email,
        mobile: memberData.mobile,
        first_name: memberData.firstName,
        last_name: memberData.lastName,
        organization_name: memberData.organizationName,
        participant_type: memberData.participantType,
        passout_year: memberData.passoutYear,
        domain: memberData.domain,
        location: memberData.location,
        is_leader: false,
        status: 'pending',
      });

    if (error) {
      console.error('Error requesting to join team:', error);
      return { success: false, error: 'Failed to send join request' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in requestToJoinTeam:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Update team member details
export async function updateTeamMember(memberId: string, memberData: TeamMemberData) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Get member details to verify team leader
    const { data: member } = await supabase
      .from('hackathon_team_members')
      .select('team_id, user_id')
      .eq('id', memberId)
      .single();

    if (!member) {
      return { success: false, error: 'Team member not found' };
    }

    // Verify user is team leader or the member themselves
    const { data: team } = await supabase
      .from('hackathon_teams')
      .select('team_leader_id')
      .eq('id', member.team_id)
      .single();

    if (!team || (team.team_leader_id !== user.id && member.user_id !== user.id)) {
      return { success: false, error: 'You do not have permission to update this member' };
    }

    const { error } = await supabase
      .from('hackathon_team_members')
      .update({
        email: memberData.email,
        mobile: memberData.mobile,
        first_name: memberData.firstName,
        last_name: memberData.lastName,
        organization_name: memberData.organizationName,
        participant_type: memberData.participantType,
        passout_year: memberData.passoutYear,
        domain: memberData.domain,
        location: memberData.location,
      })
      .eq('id', memberId);

    if (error) {
      console.error('Error updating team member:', error);
      return { success: false, error: 'Failed to update team member' };
    }

    revalidatePath(`/hackathons/*/team`);
    return { success: true };
  } catch (error) {
    console.error('Error in updateTeamMember:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Cancel registration and delete team
export async function cancelRegistration(hackathonId: string) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Get registration and team
    const { data: registration } = await supabase
      .from('hackathon_registrations')
      .select('team_id')
      .eq('hackathon_id', hackathonId)
      .eq('user_id', user.id)
      .single();

    if (!registration) {
      return { success: false, error: 'Registration not found' };
    }

    // If has team, verify user is team leader
    if (registration.team_id) {
      const { data: team } = await supabase
        .from('hackathon_teams')
        .select('team_leader_id')
        .eq('id', registration.team_id)
        .single();

      if (!team || team.team_leader_id !== user.id) {
        return { success: false, error: 'Only team leader can cancel registration' };
      }

      // Delete team (cascade will delete members)
      const { error: teamError } = await supabase
        .from('hackathon_teams')
        .delete()
        .eq('id', registration.team_id);

      if (teamError) {
        console.error('Error deleting team:', teamError);
        return { success: false, error: 'Failed to cancel registration' };
      }
    }

    // Delete registration
    const { error: regError } = await supabase
      .from('hackathon_registrations')
      .delete()
      .eq('hackathon_id', hackathonId)
      .eq('user_id', user.id);

    if (regError) {
      console.error('Error deleting registration:', regError);
      return { success: false, error: 'Failed to cancel registration' };
    }

    revalidatePath(`/hackathons/${hackathonId}`);
    return { success: true };
  } catch (error) {
    console.error('Error in cancelRegistration:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
