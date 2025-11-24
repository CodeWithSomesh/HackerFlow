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

// Helper function to update team size count
async function updateTeamSize(teamId: string) {
  const supabase = await createClient();

  const { data: acceptedMembers } = await supabase
    .from('hackathon_team_members')
    .select('id')
    .eq('team_id', teamId)
    .eq('status', 'accepted');

  if (acceptedMembers) {
    await supabase
      .from('hackathon_teams')
      .update({ team_size_current: acceptedMembers.length })
      .eq('id', teamId);
  }
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

    console.log('\n📝 ========== REGISTER FOR HACKATHON ==========');
    console.log('📝 User ID:', user.id);
    console.log('📝 Hackathon ID:', hackathonId);
    console.log('📝 Registration Type:', teamData ? 'Team' : 'Individual');
    if (teamData) {
      console.log('📝 Team Name:', teamData.teamName);
    }

    // Check if user is already registered
    const { isRegistered } = await checkUserRegistration(hackathonId);
    if (isRegistered) {
      console.log('📝 ❌ User already registered');
      return { success: false, error: 'You are already registered for this hackathon' };
    }

    // Get hackathon details
    const { data: hackathon, error: hackathonError } = await supabase
      .from('hackathons')
      .select('participation_type, team_size_min, team_size_max')
      .eq('id', hackathonId)
      .single();

    if (hackathonError) {
      console.log('📝 ❌ Failed to fetch hackathon details:', hackathonError);
      return { success: false, error: 'Failed to fetch hackathon details' };
    }

    console.log('📝 Hackathon Type:', hackathon.participation_type);

    let teamId = null;

    // If team-based, create team
    if (hackathon.participation_type === 'team' && teamData) {
      console.log('📝 Creating team...');
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
        console.error('📝 ❌ Error creating team:', teamError);
        return { success: false, error: 'Failed to create team. Team name might already exist.' };
      }

      teamId = team.id;
      console.log('📝 ✅ Team created successfully, Team ID:', teamId);

      // Add team leader as first member
      console.log('📝 Adding team leader as first member...');
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
        console.error('📝 ❌ Error adding team leader:', memberError);
        // Rollback team creation
        await supabase.from('hackathon_teams').delete().eq('id', teamId);
        return { success: false, error: 'Failed to add team leader' };
      }
      console.log('📝 ✅ Team leader added successfully');
    }

    // Create registration record
    console.log('📝 Creating registration record...');
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
      console.error('📝 ❌ Error creating registration:', regError);
      // Rollback team creation if exists
      if (teamId) {
        await supabase.from('hackathon_teams').delete().eq('id', teamId);
      }
      return { success: false, error: 'Failed to complete registration' };
    }

    console.log('📝 ✅ Registration created successfully, Registration ID:', registration.id);

    // Increment participants count in hackathons table
    console.log('📝 Incrementing participants count...');
    try {
      await supabase.rpc('increment_hackathon_participants', {
        hackathon_id_param: hackathonId
      });
      console.log('📝 ✅ Participants count incremented by 1');
    } catch (error) {
      console.error('📝 ❌ Error incrementing participant count:', error);
      // Don't fail the registration if this fails
    }

    // Increment teams count if team was created
    if (teamId) {
      console.log('📝 Incrementing teams count...');
      try {
        await supabase.rpc('increment_hackathon_teams', {
          hackathon_id_param: hackathonId
        });
        console.log('📝 ✅ Teams count incremented by 1');
      } catch (error) {
        console.error('📝 ❌ Error incrementing teams count:', error);
        // Don't fail the registration if this fails
      }
    }

    // Send email notification to organizer if team was created
    if (teamId) {
      console.log('📝 Sending email notification to organizer...');
      try {
        // Fetch hackathon details
        const { data: hackathonData, error: hackathonError } = await supabase
          .from('hackathons')
          .select('title, created_by')
          .eq('id', hackathonId)
          .single();

        console.log('📝 Hackathon query result:', hackathonData ? 'Found' : 'Not found');
        if (hackathonError) {
          console.error('📝 Hackathon query error:', hackathonError);
        }

        if (hackathonData && hackathonData.created_by) {
          const hackathonTitle = hackathonData.title;
          console.log('📝 Hackathon Title:', hackathonTitle);
          console.log('📝 Organizer User ID:', hackathonData.created_by);

          // Fetch organizer details from user_profiles
          const { data: organizerProfile, error: profileError } = await supabase
            .from('user_profiles')
            .select('email, name')
            .eq('user_id', hackathonData.created_by)
            .single();

          console.log('📝 Organizer profile query result:', organizerProfile ? 'Found' : 'Not found');
          if (profileError) {
            console.error('📝 Organizer profile query error:', profileError);
          }

          if (organizerProfile) {
            const organizerEmail = organizerProfile.email;
            const organizerName = organizerProfile.name;

            console.log('📝 Organizer Email:', organizerEmail);
            console.log('📝 Organizer Name:', organizerName);

            if (organizerEmail) {
              const isDevelopment = !process.env.BREVO_API_KEY;

            if (isDevelopment) {
              console.log('\n📧 ========== TEAM REGISTRATION NOTIFICATION (DEV MODE) ==========');
              console.log('📧 To:', organizerEmail);
              console.log('📧 Organizer:', organizerName);
              console.log('📧 Hackathon:', hackathonTitle);
              console.log('📧 Team Name:', teamData?.teamName);
              console.log('📧 Team Leader:', `${registrationData.firstName} ${registrationData.lastName}`);
              console.log('📧 Email:', registrationData.email);
              console.log('📧 Mobile:', registrationData.mobile);
              console.log('📧 Organization:', registrationData.organizationName);
              console.log('📧 =============================================================\n');
            } else {
              const brevo = await import('@getbrevo/brevo');
              const apiInstance = new brevo.TransactionalEmailsApi();
              apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');

              const sendSmtpEmail = new brevo.SendSmtpEmail();
              sendSmtpEmail.subject = `New Team Registered for ${hackathonTitle}!`;
              sendSmtpEmail.to = [{ email: organizerEmail, name: organizerName || 'Organizer' }];
              sendSmtpEmail.htmlContent = `
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>New Team Registration</title>
                  </head>
                  <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 30px; border-radius: 10px 10px 0 0;">
                      <h1 style="color: white; margin: 0; font-size: 28px;">🎉 HackerFlow</h1>
                    </div>

                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                      <h2 style="color: #8b5cf6; margin-top: 0;">New Team Registered! 🚀</h2>

                      <p>Hi ${organizerName || 'Organizer'},</p>

                      <p>Great news! A new team has registered for your hackathon <strong>"${hackathonTitle}"</strong>.</p>

                      <div style="background: #f3e8ff; padding: 20px; border-left: 4px solid #8b5cf6; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #6b21a8;">Team Details:</h3>
                        <table style="width: 100%; color: #4c1d95;">
                          <tr>
                            <td style="padding: 8px 0;"><strong>Team Name:</strong></td>
                            <td style="padding: 8px 0;">${teamData?.teamName || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0;"><strong>Team Leader:</strong></td>
                            <td style="padding: 8px 0;">${registrationData.firstName} ${registrationData.lastName}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0;"><strong>Email:</strong></td>
                            <td style="padding: 8px 0;">${registrationData.email}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0;"><strong>Mobile:</strong></td>
                            <td style="padding: 8px 0;">${registrationData.mobile}</td>
                          </tr>
                          ${registrationData.organizationName ? `
                          <tr>
                            <td style="padding: 8px 0;"><strong>Organization:</strong></td>
                            <td style="padding: 8px 0;">${registrationData.organizationName}</td>
                          </tr>
                          ` : ''}
                          <tr>
                            <td style="padding: 8px 0;"><strong>Location:</strong></td>
                            <td style="padding: 8px 0;">${registrationData.location}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0;"><strong>Participant Type:</strong></td>
                            <td style="padding: 8px 0;">${registrationData.participantType}</td>
                          </tr>
                        </table>
                      </div>

                      <div style="background: #dbeafe; padding: 20px; border-left: 4px solid #3b82f6; margin: 25px 0;">
                        <p style="margin: 0; color: #1e40af; font-size: 14px;">
                          <strong>💡 Tip:</strong> You can view all registered teams and manage participants from your organizer dashboard.
                        </p>
                      </div>

                      <p style="margin-top: 25px; font-size: 16px; color: #334155;">
                        Keep track of your registrations and ensure a smooth hackathon experience! 💻✨
                      </p>

                      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

                      <p style="color: #666; font-size: 12px; margin-bottom: 0;">
                        Best regards,<br>
                        The HackerFlow Team
                      </p>
                    </div>
                  </body>
                </html>
              `;
              sendSmtpEmail.sender = {
                name: process.env.BREVO_SENDER_NAME || 'HackerFlow',
                email: process.env.BREVO_FROM_EMAIL || 'noreply@yourdomain.com'
              };

              await apiInstance.sendTransacEmail(sendSmtpEmail);
              console.log('📝 ✅ Team registration email sent to organizer:', organizerEmail);
            }
            } else {
              console.log('📝 ⚠️ Organizer email not found');
            }
          } else {
            console.log('📝 ⚠️ Organizer profile not found in user_profiles');
          }
        } else {
          console.log('📝 ⚠️ Hackathon details not found');
        }
      } catch (emailError) {
        console.error('📝 ❌ Error sending organizer notification:', emailError);
        // Don't fail the registration if email fails
      }
    }

    console.log('📝 ==========================================\n');

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
    console.error('📝 ❌ Error in registerForHackathon:', error);
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

    // Check if user already exists in the system by checking user_profiles
    let existingUserId = null;
    const { data: existingUserProfile } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('email', memberData.email)
      .single();

    if (existingUserProfile) {
      existingUserId = existingUserProfile.user_id;
    }

    console.log('Adding team member:', {
      email: memberData.email,
      existingUserId,
      teamId
    });

    const { data: member, error: memberError } = await supabase
      .from('hackathon_team_members')
      .insert({
        team_id: teamId,
        user_id: existingUserId,
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
        invited_by: user.id,
      })
      .select()
      .single();

    if (memberError) {
      console.error('❌ Error adding team member:', memberError);
      console.error('Member data:', memberData);
      return { success: false, error: `Failed to add team member: ${memberError.message}` };
    }

    console.log('✅ Team member added successfully:', member);

    revalidatePath(`/hackathons/register/${teamId}`);
    return { success: true, data: member };
  } catch (error) {
    console.error('❌ Error in addTeamMember:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: errorMessage };
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

    console.log('\n👥 ========== UPDATE TEAM MEMBER STATUS ==========');
    console.log('👥 Member ID:', memberId);
    console.log('👥 New Status:', status);
    console.log('👥 User ID:', user.id);

    const updateData: any = { status };
    if (status === 'accepted') {
      updateData.joined_at = new Date().toISOString();
    }

    // Get member's team_id and hackathon_id before update
    const { data: member } = await supabase
      .from('hackathon_team_members')
      .select('team_id, hackathon_teams(hackathon_id)')
      .eq('id', memberId)
      .single();

    if (member) {
      console.log('👥 Team ID:', member.team_id);
      console.log('👥 Hackathon ID:', (member as any).hackathon_teams?.hackathon_id);
    }

    const { error } = await supabase
      .from('hackathon_team_members')
      .update(updateData)
      .eq('id', memberId)
      .eq('user_id', user.id);

    if (error) {
      console.error('👥 ❌ Error updating member status:', error);
      return { success: false, error: 'Failed to update status' };
    }

    console.log('👥 ✅ Member status updated successfully');

    // Update team size count
    if (member?.team_id) {
      await updateTeamSize(member.team_id);
      console.log('👥 ✅ Team size updated');
    }

    // Increment participants count in hackathons table when member accepts
    if (status === 'accepted' && member?.team_id) {
      const hackathonId = (member as any).hackathon_teams?.hackathon_id;
      if (hackathonId) {
        console.log('👥 Incrementing participants count...');
        try {
          await supabase.rpc('increment_hackathon_participants', {
            hackathon_id_param: hackathonId
          });
          console.log('👥 ✅ Participants count incremented by 1');
        } catch (error) {
          console.error('👥 ❌ Error incrementing participant count:', error);
          // Don't fail the status update if this fails
        }
      }
    }

    console.log('👥 ==========================================\n');

    revalidatePath('/hackathons');
    return { success: true };
  } catch (error) {
    console.error('👥 ❌ Error in updateTeamMemberStatus:', error);
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

    // Get member details to verify team leader and for email notification
    const { data: member } = await supabase
      .from('hackathon_team_members')
      .select('team_id, is_leader, email, first_name, last_name, user_id')
      .eq('id', memberId)
      .single();

    if (!member) {
      return { success: false, error: 'Team member not found' };
    }

    if (member.is_leader) {
      return { success: false, error: 'Cannot remove team leader' };
    }

    // Verify user is team leader and get team/hackathon details for email
    const { data: team } = await supabase
      .from('hackathon_teams')
      .select('team_leader_id, team_name, hackathon_id, hackathons(title)')
      .eq('id', member.team_id)
      .single();

    if (!team || team.team_leader_id !== user.id) {
      return { success: false, error: 'Only team leader can remove members' };
    }

    // Delete member record
    const { error } = await supabase
      .from('hackathon_team_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      console.error('Error removing team member:', error);
      return { success: false, error: 'Failed to remove team member' };
    }

    // Also delete their registration record so they can rejoin
    console.log('🗑️ Attempting to delete registration for member:', {
      user_id: member.user_id,
      email: member.email,
      hackathon_id: team.hackathon_id,
      team_id: member.team_id
    });

    // FIRST: Check what registration actually exists
    const { data: existingReg } = await supabase
      .from('hackathon_registrations')
      .select('*')
      .eq('email', member.email)
      .eq('hackathon_id', team.hackathon_id);

    console.log('📋 Existing registration records for this email:', existingReg);

    // Delete registration by hackathon_id, team_id, and email
    // RLS policy allows team leaders to delete their team members' registrations
    const { data: deletedReg, error: regError } = await supabase
      .from('hackathon_registrations')
      .delete()
      .eq('hackathon_id', team.hackathon_id)
      .eq('team_id', member.team_id)
      .eq('email', member.email)
      .select();

    if (regError) {
      console.error('❌ Error removing registration:', regError);
      console.error('❌ Supabase error details:', JSON.stringify(regError, null, 2));
      return { success: false, error: 'Failed to remove registration record' };
    }

    if (deletedReg && deletedReg.length > 0) {
      console.log('✅ Registration deleted successfully:', deletedReg);
    } else {
      console.log('⚠️ No registration record found for this team member.');
      console.log('⚠️ This means RLS policy blocked the deletion or no matching record exists');
    }

    // Update team size count after removal
    await updateTeamSize(member.team_id);

    // Send removal notification email using Brevo API directly
    try {
      console.log('🔔 Sending removal notification email to:', member.email);

      const memberName = `${member.first_name} ${member.last_name || ''}`.trim();
      const teamName = team.team_name;
      const hackathonName = (team as any).hackathons?.title || 'the hackathon';
      const leaderName = user.user_metadata?.full_name || 'The team leader';

      // Check if we're in development mode (no Brevo API key)
      const isDevelopment = !process.env.BREVO_API_KEY;

      if (isDevelopment) {
        // Development mode: Log email details to console
        console.log('\n📧 ========== REMOVAL EMAIL SIMULATION (DEV MODE) ==========');
        console.log('📧 To:', member.email);
        console.log('📧 Member:', memberName);
        console.log('📧 Team:', teamName);
        console.log('📧 Hackathon:', hackathonName);
        console.log('📧 Removed by:', leaderName);
        console.log('📧 Subject:', `You have been removed from ${teamName}`);
        console.log('📧 ================================================\n');
        console.log('✅ Development mode: Email simulated successfully');
      } else {
        // Production mode: Send real email via Brevo
        const brevo = await import('@getbrevo/brevo');
        const apiInstance = new brevo.TransactionalEmailsApi();
        apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');

        const sendSmtpEmail = new brevo.SendSmtpEmail();
        sendSmtpEmail.subject = `You have been removed from ${teamName}`;
        sendSmtpEmail.to = [{ email: member.email, name: memberName }];
        sendSmtpEmail.htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Team Removal Notification</title>
            </head>
            <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); padding: 30px; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">HackerFlow</h1>
              </div>

              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #dc2626; margin-top: 0;">Team Removal Notification</h2>

                <p>Hi ${memberName},</p>

                <p>We're writing to inform you that you have been removed from the team "<strong>${teamName}</strong>" for <strong>${hackathonName}</strong> by ${leaderName}.</p>

                <div style="background: #fee2e2; padding: 20px; border-left: 4px solid #dc2626; margin: 20px 0;">
                  <p style="margin: 0; color: #991b1b;">
                    <strong>You are no longer a member of this team.</strong>
                  </p>
                </div>

                <p>If you believe this was a mistake, please contact the team leader directly.</p>

                <p>You can still participate in ${hackathonName} by:</p>
                <ul style="color: #666;">
                  <li>Joining another team that's looking for members</li>
                  <li>Creating your own team</li>
                  <li>Registering as an individual (if allowed)</li>
                </ul>

                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

                <p style="color: #666; font-size: 12px; margin-bottom: 0;">
                  Best regards,<br>
                  The HackerFlow Team
                </p>
              </div>
            </body>
          </html>
        `;
        sendSmtpEmail.sender = {
          name: process.env.BREVO_SENDER_NAME || 'HackerFlow',
          email: process.env.BREVO_FROM_EMAIL || 'noreply@yourdomain.com'
        };

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('✅ Removal notification email sent successfully via Brevo:', data);
      }
    } catch (emailError) {
      console.error('💥 Error sending removal email:', emailError);
      // Don't fail the removal if email fails
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
      .eq('is_completed', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching teams:', error);
      return { success: false, error: 'Failed to fetch teams' };
    }

    // Filter teams that still have space (client-side filtering)
    const teamsWithSpace = teams?.filter(team =>
      team.team_size_current < team.team_size_max
    ) || [];

    return { success: true, data: teamsWithSpace };
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

    console.log('\n🚫 ========== CANCEL REGISTRATION ==========');
    console.log('🚫 User ID:', user.id);
    console.log('🚫 Hackathon ID:', hackathonId);

    // Get registration and team
    const { data: registration } = await supabase
      .from('hackathon_registrations')
      .select('team_id')
      .eq('hackathon_id', hackathonId)
      .eq('user_id', user.id)
      .single();

    if (!registration) {
      console.log('🚫 Registration not found');
      return { success: false, error: 'Registration not found' };
    }

    let memberCount = 0;
    let isTeamRegistration = false;

    // If has team, verify user is team leader and count members
    if (registration.team_id) {
      isTeamRegistration = true;
      console.log('🚫 Team ID:', registration.team_id);

      const { data: team } = await supabase
        .from('hackathon_teams')
        .select('team_leader_id, hackathon_team_members(id, status)')
        .eq('id', registration.team_id)
        .single();

      if (!team || team.team_leader_id !== user.id) {
        console.log('🚫 Only team leader can cancel registration');
        return { success: false, error: 'Only team leader can cancel registration' };
      }

      // Count accepted members (these are the ones that were counted in participants)
      const acceptedMembers = (team.hackathon_team_members as any[]).filter(
        (m: any) => m.status === 'accepted'
      );
      memberCount = acceptedMembers.length;
      console.log('🚫 Accepted members count:', memberCount);

      // Delete team (cascade will delete members)
      const { error: teamError } = await supabase
        .from('hackathon_teams')
        .delete()
        .eq('id', registration.team_id);

      if (teamError) {
        console.error('🚫 Error deleting team:', teamError);
        return { success: false, error: 'Failed to cancel registration' };
      }

      console.log('🚫 Team deleted successfully');

      // Decrement teams count
      try {
        await supabase.rpc('decrement_hackathon_teams', {
          hackathon_id_param: hackathonId
        });
        console.log('🚫 ✅ Teams count decremented by 1');
      } catch (error) {
        console.error('🚫 ❌ Error decrementing teams count:', error);
      }
    } else {
      // Individual registration - count as 1
      memberCount = 1;
      console.log('🚫 Individual registration');
    }

    // Delete registration
    const { error: regError } = await supabase
      .from('hackathon_registrations')
      .delete()
      .eq('hackathon_id', hackathonId)
      .eq('user_id', user.id);

    if (regError) {
      console.error('🚫 Error deleting registration:', regError);
      return { success: false, error: 'Failed to cancel registration' };
    }

    console.log('🚫 Registration deleted successfully');

    // Decrement participants count by the number of accepted members
    if (memberCount > 0) {
      try {
        await supabase.rpc('decrement_hackathon_participants', {
          hackathon_id_param: hackathonId,
          count_param: memberCount
        });
        console.log(`🚫 ✅ Participants count decremented by ${memberCount}`);
      } catch (error) {
        console.error('🚫 ❌ Error decrementing participants count:', error);
      }
    }

    console.log('🚫 ==========================================\n');

    revalidatePath(`/hackathons/${hackathonId}`);
    return { success: true };
  } catch (error) {
    console.error('🚫 Error in cancelRegistration:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Complete team and send confirmation emails to all members
export async function completeTeam(teamId: string) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Verify user is team leader and get team details
    const { data: team, error: teamError } = await supabase
      .from('hackathon_teams')
      .select(`
        *,
        hackathons(title, registration_start_date),
        hackathon_team_members!inner(*)
      `)
      .eq('id', teamId)
      .single();

    if (teamError || !team) {
      console.error('Error fetching team:', teamError);
      return { success: false, error: 'Team not found' };
    }

    if (team.team_leader_id !== user.id) {
      return { success: false, error: 'Only team leader can complete the team' };
    }

    // Check if team already completed
    if (team.is_completed) {
      return { success: false, error: 'Team is already completed' };
    }

    // Update team as completed
    const { error: updateError } = await supabase
      .from('hackathon_teams')
      .update({
        is_completed: true,
        status: 'confirmed',
        completed_at: new Date().toISOString()
      })
      .eq('id', teamId);

    if (updateError) {
      console.error('Error completing team:', updateError);
      return { success: false, error: 'Failed to complete team' };
    }

    // Get all accepted team members for sending confirmation emails
    const acceptedMembers = team.hackathon_team_members.filter((member: any) =>
      member.status === 'accepted'
    );

    // Send confirmation emails to all accepted members using Brevo API directly
    try {
      const teamName = team.team_name;
      const hackathonName = (team as any).hackathons?.title || 'the hackathon';

      const isDevelopment = !process.env.BREVO_API_KEY;

      if (isDevelopment) {
        console.log('\n📧 ========== TEAM COMPLETION EMAILS (DEV MODE) ==========');
        console.log('📧 Team:', teamName);
        console.log('📧 Hackathon:', hackathonName);
        console.log('📧 Recipients:', acceptedMembers.length);
        acceptedMembers.forEach((member: any) => {
          console.log(`   - ${member.first_name} ${member.last_name} (${member.email})`);
        });
        console.log('📧 ================================================\n');
      } else {
        const brevo = await import('@getbrevo/brevo');
        const apiInstance = new brevo.TransactionalEmailsApi();
        apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');

        for (const member of acceptedMembers) {
          const memberName = `${member.first_name} ${member.last_name || ''}`.trim();

          const sendSmtpEmail = new brevo.SendSmtpEmail();
          sendSmtpEmail.subject = `Team "${teamName}" is Ready for ${hackathonName}!`;
          sendSmtpEmail.to = [{ email: member.email, name: memberName }];
          sendSmtpEmail.htmlContent = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Team Completed</title>
              </head>
              <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 30px; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">🎉 HackerFlow</h1>
                </div>

                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                  <h2 style="color: #10b981; margin-top: 0;">Your Team is Ready! 🚀</h2>

                  <p>Hi ${memberName},</p>

                  <p>Great news! Your team <strong>"${teamName}"</strong> has been confirmed and is ready for <strong>${hackathonName}</strong>!</p>

                  <div style="background: #d1fae5; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0;">
                    <p style="margin: 0; color: #065f46;">
                      <strong>🎯 It's time to prepare!</strong>
                    </p>
                  </div>

                  <h3 style="color: #334155; margin-top: 25px;">Next Steps:</h3>
                  <ul style="color: #666; line-height: 1.8;">
                    <li><strong>Connect with your team:</strong> Schedule a meeting to discuss your strategy and ideas</li>
                    <li><strong>Plan your approach:</strong> Brainstorm solutions and divide responsibilities among team members</li>
                    <li><strong>Prepare your tools:</strong> Set up your development environment and necessary tools</li>
                    <li><strong>Review the rules:</strong> Make sure everyone understands the hackathon guidelines</li>
                    <li><strong>Stay motivated:</strong> Remember, you've got this! Work together and have fun!</li>
                  </ul>

                  <div style="background: #eff6ff; padding: 20px; border-left: 4px solid #3b82f6; margin: 25px 0;">
                    <p style="margin: 0; color: #1e40af; font-size: 14px;">
                      <strong>💡 Pro Tip:</strong> Great teams communicate well! Set up a group chat or communication channel to stay in sync during the hackathon.
                    </p>
                  </div>

                  <p style="margin-top: 25px; font-size: 16px; color: #334155;">
                    We're excited to see what your team creates! Good luck, and may the code be with you! 💻✨
                  </p>

                  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

                  <p style="color: #666; font-size: 12px; margin-bottom: 0;">
                    Best of luck,<br>
                    The HackerFlow Team
                  </p>
                </div>
              </body>
            </html>
          `;
          sendSmtpEmail.sender = {
            name: process.env.BREVO_SENDER_NAME || 'HackerFlow',
            email: process.env.BREVO_FROM_EMAIL || 'noreply@yourdomain.com'
          };

          await apiInstance.sendTransacEmail(sendSmtpEmail);
          console.log(`✅ Completion email sent to ${memberName} (${member.email})`);
        }
      }
    } catch (emailError) {
      console.error('Error sending completion emails:', emailError);
      // Don't fail the completion if emails fail
    }

    revalidatePath(`/hackathons/${team.hackathon_id}/team`);
    return { success: true };
  } catch (error) {
    console.error('Error in completeTeam:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
