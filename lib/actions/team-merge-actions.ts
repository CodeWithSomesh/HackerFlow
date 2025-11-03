'use server';

import { createClient } from '@/lib/supabase/server';

export async function sendTeamMergeInvite(
  senderTeamId: string,
  receiverTeamId: string,
  hackathonId: string,
  message?: string
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get sender team details
    const { data: senderTeam, error: senderError } = await supabase
      .from('hackathon_teams')
      .select(`
        *,
        hackathon_team_members!inner(
          first_name,
          last_name,
          email,
          is_leader,
          status
        )
      `)
      .eq('id', senderTeamId)
      .single();

    if (senderError || !senderTeam) {
      return { success: false, error: 'Sender team not found' };
    }

    // Verify user is the team leader
    if (senderTeam.team_leader_id !== user.id) {
      return { success: false, error: 'Only team leaders can send merge invitations' };
    }

    // Check if both teams are not completed
    if (senderTeam.is_completed) {
      return { success: false, error: 'Completed teams cannot send merge invitations' };
    }

    // Get receiver team details including leader email
    const { data: receiverTeam, error: receiverError } = await supabase
      .from('hackathon_teams')
      .select(`
        *,
        hackathon_team_members!inner(
          first_name,
          last_name,
          email,
          is_leader,
          status
        )
      `)
      .eq('id', receiverTeamId)
      .single();

    if (receiverError || !receiverTeam) {
      return { success: false, error: 'Receiver team not found' };
    }

    if (receiverTeam.is_completed) {
      return { success: false, error: 'Cannot invite completed teams' };
    }

    // Get hackathon details
    const { data: hackathon, error: hackathonError } = await supabase
      .from('hackathons')
      .select('title')
      .eq('id', hackathonId)
      .single();

    if (hackathonError || !hackathon) {
      return { success: false, error: 'Hackathon not found' };
    }

    // Check for existing invitation
    const { data: existingInvite } = await supabase
      .from('team_merge_invitations')
      .select('id, status')
      .eq('sender_team_id', senderTeamId)
      .eq('receiver_team_id', receiverTeamId)
      .eq('hackathon_id', hackathonId)
      .maybeSingle();

    if (existingInvite) {
      if (existingInvite.status === 'pending') {
        return { success: false, error: 'You already have a pending invitation with this team' };
      }
      // Delete old rejected/cancelled invitations
      await supabase
        .from('team_merge_invitations')
        .delete()
        .eq('id', existingInvite.id);
    }

    // Create invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('team_merge_invitations')
      .insert({
        hackathon_id: hackathonId,
        sender_team_id: senderTeamId,
        receiver_team_id: receiverTeamId,
        sender_user_id: user.id,
        message: message || null,
        status: 'pending'
      })
      .select()
      .single();

    if (inviteError || !invitation) {
      console.error('Error creating invitation:', inviteError);
      return { success: false, error: 'Failed to create invitation' };
    }

    // Send email to receiver team leader
    try {
      const receiverLeader = receiverTeam.hackathon_team_members.find((m: any) => m.is_leader);
      const senderLeader = senderTeam.hackathon_team_members.find((m: any) => m.is_leader);

      if (!receiverLeader || !senderLeader) {
        return { success: false, error: 'Team leader not found' };
      }

      const receiverLeaderName = `${receiverLeader.first_name} ${receiverLeader.last_name || ''}`.trim();
      const senderLeaderName = `${senderLeader.first_name} ${senderLeader.last_name || ''}`.trim();

      console.log('🔔 Sending team merge invitation email to:', receiverLeader.email);

      const isDevelopment = !process.env.BREVO_API_KEY;

      if (isDevelopment) {
        console.log('\n📧 ========== TEAM MERGE INVITATION EMAIL (DEV MODE) ==========');
        console.log('📧 To:', receiverLeader.email);
        console.log('📧 Receiver Team Leader:', receiverLeaderName);
        console.log('📧 Sender Team:', senderTeam.team_name);
        console.log('📧 Sender Leader:', senderLeaderName);
        console.log('📧 Receiver Team:', receiverTeam.team_name);
        console.log('📧 Hackathon:', hackathon.title);
        console.log('📧 Message:', message || 'No message');
        console.log('📧 ================================================================\n');
      } else {
        const brevo = await import('@getbrevo/brevo');
        const apiInstance = new brevo.TransactionalEmailsApi();
        apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');

        const sendSmtpEmail = new brevo.SendSmtpEmail();
        sendSmtpEmail.subject = `Team Merge Invitation from ${senderTeam.team_name}`;
        sendSmtpEmail.to = [{ email: receiverLeader.email, name: receiverLeaderName }];
        sendSmtpEmail.htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Team Merge Invitation</title>
            </head>
            <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #3b82f6 0%, #14b8a6 100%); padding: 30px; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🤝 HackerFlow</h1>
              </div>

              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #3b82f6; margin-top: 0;">Team Merge Invitation!</h2>

                <p>Hi ${receiverLeaderName},</p>

                <p>Great news! <strong>${senderLeaderName}</strong> from team <strong>"${senderTeam.team_name}"</strong> wants to join forces with your team <strong>"${receiverTeam.team_name}"</strong> for <strong>${hackathon.title}</strong>!</p>

                ${message ? `
                  <div style="background: #eff6ff; padding: 20px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                    <p style="margin: 0; color: #1e40af; font-style: italic;">
                      "${message}"
                    </p>
                  </div>
                ` : ''}

                <h3 style="color: #334155; margin-top: 25px;">What happens if you accept?</h3>
                <ul style="color: #666; line-height: 1.8;">
                  <li>All members from <strong>${senderTeam.team_name}</strong> will join your team</li>
                  <li>Your team name <strong>"${receiverTeam.team_name}"</strong> will remain</li>
                  <li>You will remain as the team leader</li>
                  <li>The combined team can work together for the hackathon</li>
                </ul>

                <div style="background: #fef3c7; padding: 20px; border-left: 4px solid #f59e0b; margin: 25px 0;">
                  <p style="margin: 0; color: #92400e;">
                    <strong>⚠️ Important:</strong> This action cannot be undone. Make sure you're comfortable working with this team!
                  </p>
                </div>

                <p style="margin-top: 25px;">
                  <strong>To respond to this invitation:</strong><br>
                  Log in to HackerFlow and go to your team page to accept or reject this invitation.
                </p>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/hackathons/${hackathonId}/team"
                     style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #3b82f6 0%, #14b8a6 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    View Invitation
                  </a>
                </div>

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
        console.log('✅ Team merge invitation email sent successfully');
      }

      return {
        success: true,
        message: 'Invitation sent successfully!',
        invitationId: invitation.id
      };
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError);
      // Still return success since invitation was created
      return {
        success: true,
        message: 'Invitation created but email failed to send',
        invitationId: invitation.id
      };
    }
  } catch (error) {
    console.error('Error in sendTeamMergeInvite:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: errorMessage };
  }
}

export async function getTeamMergeInvitations(teamId: string) {
  try {
    const supabase = await createClient();

    const { data: invitations, error } = await supabase
      .from('team_merge_invitations')
      .select(`
        *,
        sender_team:hackathon_teams!sender_team_id(
          id,
          team_name,
          hackathon_team_members(
            first_name,
            last_name,
            email,
            is_leader
          )
        ),
        receiver_team:hackathon_teams!receiver_team_id(
          id,
          team_name,
          hackathon_team_members(
            first_name,
            last_name,
            email,
            is_leader
          )
        )
      `)
      .or(`sender_team_id.eq.${teamId},receiver_team_id.eq.${teamId}`)
      .eq('status', 'pending') // Only fetch pending invitations
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invitations:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: invitations || [] };
  } catch (error) {
    console.error('Error in getTeamMergeInvitations:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: errorMessage, data: [] };
  }
}

export async function respondToMergeInvite(
  invitationId: string,
  action: 'accept' | 'reject'
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get invitation details
    const { data: invitation, error: inviteError } = await supabase
      .from('team_merge_invitations')
      .select(`
        *,
        sender_team:hackathon_teams!sender_team_id(
          *,
          hackathon_team_members(
            *
          )
        ),
        receiver_team:hackathon_teams!receiver_team_id(
          *,
          hackathon_team_members(
            *
          )
        )
      `)
      .eq('id', invitationId)
      .single();

    if (inviteError || !invitation) {
      return { success: false, error: 'Invitation not found' };
    }

    // Verify user is receiver team leader
    if ((invitation.receiver_team as any).team_leader_id !== user.id) {
      return { success: false, error: 'Only the receiver team leader can respond' };
    }

    if (invitation.status !== 'pending') {
      return { success: false, error: 'This invitation has already been responded to' };
    }

    // Get hackathon details
    const { data: hackathon } = await supabase
      .from('hackathons')
      .select('title')
      .eq('id', invitation.hackathon_id)
      .single();

    if (action === 'reject') {
      // Update invitation status
      const { error: updateError } = await supabase
        .from('team_merge_invitations')
        .update({
          status: 'rejected',
          responded_at: new Date().toISOString()
        })
        .eq('id', invitationId);

      if (updateError) {
        console.error('❌ Error updating invitation status:', updateError);
        return { success: false, error: 'Failed to update invitation status: ' + updateError.message };
      }

      console.log('✅ Invitation status updated to rejected');

      // Send rejection email to sender
      try {
        const senderLeader = (invitation.sender_team as any).hackathon_team_members.find((m: any) => m.is_leader);
        const receiverLeader = (invitation.receiver_team as any).hackathon_team_members.find((m: any) => m.is_leader);

        if (senderLeader && receiverLeader) {
          const senderLeaderName = `${senderLeader.first_name} ${senderLeader.last_name || ''}`.trim();
          const receiverLeaderName = `${receiverLeader.first_name} ${receiverLeader.last_name || ''}`.trim();

          const isDevelopment = !process.env.BREVO_API_KEY;

          if (isDevelopment) {
            console.log('\n📧 ========== MERGE INVITATION REJECTED EMAIL (DEV MODE) ==========');
            console.log('📧 To:', senderLeader.email);
            console.log('📧 Sender Team Leader:', senderLeaderName);
            console.log('📧 Receiver Team:', (invitation.receiver_team as any).team_name);
            console.log('📧 Status: REJECTED');
            console.log('📧 ================================================================\n');
          } else {
            const brevo = await import('@getbrevo/brevo');
            const apiInstance = new brevo.TransactionalEmailsApi();
            apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');

            const sendSmtpEmail = new brevo.SendSmtpEmail();
            sendSmtpEmail.subject = `Team Merge Invitation Declined`;
            sendSmtpEmail.to = [{ email: senderLeader.email, name: senderLeaderName }];
            sendSmtpEmail.htmlContent = `
              <!DOCTYPE html>
              <html>
                <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">HackerFlow</h1>
                  </div>
                  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #ef4444; margin-top: 0;">Invitation Declined</h2>
                    <p>Hi ${senderLeaderName},</p>
                    <p>Unfortunately, <strong>${receiverLeaderName}</strong> from team <strong>"${(invitation.receiver_team as any).team_name}"</strong> has declined your team merge invitation for <strong>${hackathon?.title || 'the hackathon'}</strong>.</p>
                    <p>Don't worry! You can:</p>
                    <ul style="color: #666; line-height: 1.8;">
                      <li>Continue building your current team</li>
                      <li>Reach out to other teams seeking members</li>
                      <li>Focus on making your project amazing with your current team!</li>
                    </ul>
                    <p style="margin-top: 25px; font-size: 16px; color: #334155;">
                      Keep your head up and keep building! 💪
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
          }
        }
      } catch (emailError) {
        console.error('Error sending rejection email:', emailError);
      }

      return { success: true, message: 'Invitation rejected' };
    }

    // Accept invitation - merge teams
    return await mergeTeams(
      invitation.sender_team_id,
      invitation.receiver_team_id,
      invitation.hackathon_id,
      invitationId
    );
  } catch (error) {
    console.error('Error in respondToMergeInvite:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: errorMessage };
  }
}

async function mergeTeams(
  senderTeamId: string,
  receiverTeamId: string,
  hackathonId: string,
  invitationId: string
) {
  try {
    // Use regular client for reading
    const supabase = await createClient();

    // Import service role client for updates that cross team boundaries
    const { createClient: createServiceClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get both teams with all details
    const { data: senderTeam } = await supabase
      .from('hackathon_teams')
      .select(`
        *,
        hackathon_team_members(*)
      `)
      .eq('id', senderTeamId)
      .single();

    const { data: receiverTeam } = await supabase
      .from('hackathon_teams')
      .select(`
        *,
        hackathon_team_members(*)
      `)
      .eq('id', receiverTeamId)
      .single();

    const { data: hackathon } = await supabase
      .from('hackathons')
      .select('title, team_size_max')
      .eq('id', hackathonId)
      .single();

    if (!senderTeam || !receiverTeam || !hackathon) {
      return { success: false, error: 'Team or hackathon not found' };
    }

    // Check combined team size
    const senderMemberCount = (senderTeam.hackathon_team_members as any[]).length;
    const receiverMemberCount = (receiverTeam.hackathon_team_members as any[]).length;
    const combinedSize = senderMemberCount + receiverMemberCount;

    if (combinedSize > hackathon.team_size_max) {
      return {
        success: false,
        error: `Combined team size (${combinedSize}) exceeds maximum (${hackathon.team_size_max})`
      };
    }

    // Update all sender team members to receiver team (use admin client to bypass RLS)
    console.log('🔄 Updating team members from team', senderTeamId, 'to team', receiverTeamId);
    const { data: updatedMembers, error: updateError } = await supabaseAdmin
      .from('hackathon_team_members')
      .update({
        team_id: receiverTeamId,
        is_leader: false // They won't be leaders in the new team
      })
      .eq('team_id', senderTeamId)
      .select();

    if (updateError) {
      console.error('❌ Error updating team members:', updateError);
      return { success: false, error: 'Failed to merge team members: ' + updateError.message };
    }

    console.log('✅ Updated', updatedMembers?.length || 0, 'team members');

    // Update registrations (use admin client to bypass RLS)
    console.log('🔄 Updating registrations from team', senderTeamId, 'to team', receiverTeamId);
    const { data: updatedRegs, error: regError } = await supabaseAdmin
      .from('hackathon_registrations')
      .update({ team_id: receiverTeamId })
      .eq('team_id', senderTeamId)
      .eq('hackathon_id', hackathonId)
      .select();

    if (regError) {
      console.error('❌ Error updating registrations:', regError);
      return { success: false, error: 'Failed to update registrations: ' + regError.message };
    }

    console.log('✅ Updated', updatedRegs?.length || 0, 'registrations');

    // Delete sender team (use admin client to bypass RLS)
    console.log('🗑️ Deleting sender team:', senderTeamId);
    const { error: deleteError } = await supabaseAdmin
      .from('hackathon_teams')
      .delete()
      .eq('id', senderTeamId);

    if (deleteError) {
      console.error('❌ Error deleting sender team:', deleteError);
      return { success: false, error: 'Failed to delete sender team: ' + deleteError.message };
    }

    console.log('✅ Sender team deleted successfully');

    // Update invitation status
    console.log('🔄 Updating invitation status to accepted');
    const { error: inviteUpdateError } = await supabase
      .from('team_merge_invitations')
      .update({
        status: 'accepted',
        responded_at: new Date().toISOString()
      })
      .eq('id', invitationId);

    if (inviteUpdateError) {
      console.error('❌ Error updating invitation status:', inviteUpdateError);
    } else {
      console.log('✅ Invitation status updated to accepted');
    }

    // Send success emails to both team leaders and all members
    try {
      const senderLeader = (senderTeam.hackathon_team_members as any[]).find((m: any) => m.is_leader);
      const receiverLeader = (receiverTeam.hackathon_team_members as any[]).find((m: any) => m.is_leader);

      if (senderLeader && receiverLeader) {
        const senderLeaderName = `${senderLeader.first_name} ${senderLeader.last_name || ''}`.trim();
        const receiverLeaderName = `${receiverLeader.first_name} ${receiverLeader.last_name || ''}`.trim();

        const isDevelopment = !process.env.BREVO_API_KEY;

        // Notify all members from both teams
        const allMembers = [...(senderTeam.hackathon_team_members as any[]), ...(receiverTeam.hackathon_team_members as any[])];

        for (const member of allMembers) {
          const memberName = `${member.first_name} ${member.last_name || ''}`.trim();

          if (isDevelopment) {
            console.log('\n📧 ========== TEAM MERGE SUCCESS EMAIL (DEV MODE) ==========');
            console.log('📧 To:', member.email);
            console.log('📧 Member:', memberName);
            console.log('📧 New Team:', receiverTeam.team_name);
            console.log('📧 ================================================================\n');
          } else {
            const brevo = await import('@getbrevo/brevo');
            const apiInstance = new brevo.TransactionalEmailsApi();
            apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');

            const sendSmtpEmail = new brevo.SendSmtpEmail();
            sendSmtpEmail.subject = `Teams Merged Successfully! 🎉`;
            sendSmtpEmail.to = [{ email: member.email, name: memberName }];
            sendSmtpEmail.htmlContent = `
              <!DOCTYPE html>
              <html>
                <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 30px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 HackerFlow</h1>
                  </div>
                  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #10b981; margin-top: 0;">Teams Successfully Merged!</h2>
                    <p>Hi ${memberName},</p>
                    <p>Exciting news! Teams <strong>"${senderTeam.team_name}"</strong> and <strong>"${receiverTeam.team_name}"</strong> have successfully merged for <strong>${hackathon.title}</strong>!</p>
                    <h3 style="color: #334155; margin-top: 25px;">Your New Team:</h3>
                    <ul style="color: #666; line-height: 1.8;">
                      <li><strong>Team Name:</strong> ${receiverTeam.team_name}</li>
                      <li><strong>Team Leader:</strong> ${receiverLeaderName}</li>
                      <li><strong>Total Members:</strong> ${combinedSize}</li>
                    </ul>
                    <div style="background: #eff6ff; padding: 20px; border-left: 4px solid #3b82f6; margin: 25px 0;">
                      <p style="margin: 0; color: #1e40af;">
                        <strong>💡 Next Steps:</strong> Connect with your new teammates and start planning your approach for the hackathon!
                      </p>
                    </div>
                    <p style="margin-top: 25px; font-size: 16px; color: #334155;">
                      Together, you're stronger! Good luck! 💪✨
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
          }
        }
      }
    } catch (emailError) {
      console.error('Error sending merge success emails:', emailError);
    }

    return {
      success: true,
      message: `Teams merged successfully! ${receiverTeam.team_name} now has ${combinedSize} members.`
    };
  } catch (error) {
    console.error('Error in mergeTeams:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: errorMessage };
  }
}
