'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTeamAction(
  hackathonId: string,
  registrationId: string,
  teamData: {
    teamName: string
    lookingForTeammates: boolean
    teamSizeMax: number
  },
  leaderData: {
    email: string
    mobile: string
    firstName: string
    lastName: string
    organizationName: string
    participantType: string
    passoutYear: string
    domain: string
    location: string
  }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    console.log('\n🎯 ========== TEAM CREATION (SERVER ACTION) ==========')
    console.log('🎯 User ID:', user.id)
    console.log('🎯 Hackathon ID:', hackathonId)
    console.log('🎯 Team Name:', teamData.teamName)

    // Create team
    console.log('🎯 Creating team...')
    const { data: team, error: teamError } = await supabase
      .from('hackathon_teams')
      .insert({
        hackathon_id: hackathonId,
        team_name: teamData.teamName,
        team_leader_id: user.id,
        looking_for_teammates: teamData.lookingForTeammates,
        team_size_current: 1,
        team_size_max: teamData.teamSizeMax,
      })
      .select()
      .single()

    if (teamError) {
      console.error('🎯 ❌ Error creating team:', teamError)
      return {
        success: false,
        error: teamError.message || 'Failed to create team. Team name might already exist.'
      }
    }

    console.log('🎯 ✅ Team created successfully, Team ID:', team.id)

    // Add team leader as first member
    console.log('🎯 Adding team leader as first member...')
    const { error: memberError } = await supabase
      .from('hackathon_team_members')
      .insert({
        team_id: team.id,
        user_id: user.id,
        email: leaderData.email,
        mobile: leaderData.mobile,
        first_name: leaderData.firstName,
        last_name: leaderData.lastName,
        organization_name: leaderData.organizationName,
        participant_type: leaderData.participantType,
        passout_year: leaderData.passoutYear,
        domain: leaderData.domain,
        location: leaderData.location,
        is_leader: true,
        status: 'accepted',
        joined_at: new Date().toISOString(),
      })

    if (memberError) {
      console.error('🎯 ❌ Error adding team leader:', memberError)
      // Rollback team creation
      await supabase.from('hackathon_teams').delete().eq('id', team.id)
      return { success: false, error: 'Failed to add you as team leader' }
    }

    console.log('🎯 ✅ Team leader added successfully')

    // Update registration with team ID
    console.log('🎯 Updating registration with team ID...')
    const { error: updateError } = await supabase
      .from('hackathon_registrations')
      .update({ team_id: team.id })
      .eq('id', registrationId)

    if (updateError) {
      console.error('🎯 ⚠️ Error updating registration:', updateError)
    } else {
      console.log('🎯 ✅ Registration updated with team ID')
    }

    // Increment teams count
    console.log('🎯 Incrementing teams count...')
    try {
      await supabase.rpc('increment_hackathon_teams', {
        hackathon_id_param: hackathonId
      })
      console.log('🎯 ✅ Teams count incremented by 1')
    } catch (error) {
      console.error('🎯 ❌ Error incrementing teams count:', error)
    }

    // Send email notification to organizer
    console.log('🎯 Sending email notification to organizer...')
    try {
      // Fetch hackathon details
      const { data: hackathonData, error: hackathonError } = await supabase
        .from('hackathons')
        .select('title, created_by')
        .eq('id', hackathonId)
        .single()

      console.log('🎯 Hackathon query result:', hackathonData ? 'Found' : 'Not found')
      if (hackathonError) {
        console.error('🎯 Hackathon query error:', hackathonError)
      }

      if (hackathonData && hackathonData.created_by) {
        const hackathonTitle = hackathonData.title
        console.log('🎯 Hackathon Title:', hackathonTitle)
        console.log('🎯 Organizer User ID:', hackathonData.created_by)

        // Fetch organizer details from user_profiles
        const { data: organizerProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('email, full_name')
          .eq('user_id', hackathonData.created_by)
          .single()

        console.log('🎯 Organizer profile query result:', organizerProfile ? 'Found' : 'Not found')
        if (profileError) {
          console.error('🎯 Organizer profile query error:', profileError)
        }

        if (organizerProfile) {
          const organizerEmail = organizerProfile.email
          const organizerName = organizerProfile.full_name

          console.log('🎯 Organizer Email:', organizerEmail)
          console.log('🎯 Organizer Name:', organizerName)

          if (organizerEmail) {
            const isDevelopment = !process.env.BREVO_API_KEY

          if (isDevelopment) {
            console.log('\n📧 ========== TEAM REGISTRATION EMAIL (DEV MODE) ==========')
            console.log('📧 To:', organizerEmail)
            console.log('📧 Organizer:', organizerName)
            console.log('📧 Hackathon:', hackathonTitle)
            console.log('📧 Team Name:', teamData.teamName)
            console.log('📧 Team Leader:', `${leaderData.firstName} ${leaderData.lastName}`)
            console.log('📧 Email:', leaderData.email)
            console.log('📧 Mobile:', leaderData.mobile)
            console.log('📧 Organization:', leaderData.organizationName)
            console.log('📧 Location:', leaderData.location)
            console.log('📧 =======================================================\n')
          } else {
            const brevo = await import('@getbrevo/brevo')
            const apiInstance = new brevo.TransactionalEmailsApi()
            apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '')

            const sendSmtpEmail = new brevo.SendSmtpEmail()
            sendSmtpEmail.subject = `New Team Registered for ${hackathonTitle}!`
            sendSmtpEmail.to = [{ email: organizerEmail, name: organizerName || 'Organizer' }]
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
                          <td style="padding: 8px 0;">${teamData.teamName}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0;"><strong>Team Leader:</strong></td>
                          <td style="padding: 8px 0;">${leaderData.firstName} ${leaderData.lastName}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0;"><strong>Email:</strong></td>
                          <td style="padding: 8px 0;">${leaderData.email}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0;"><strong>Mobile:</strong></td>
                          <td style="padding: 8px 0;">${leaderData.mobile}</td>
                        </tr>
                        ${leaderData.organizationName ? `
                        <tr>
                          <td style="padding: 8px 0;"><strong>Organization:</strong></td>
                          <td style="padding: 8px 0;">${leaderData.organizationName}</td>
                        </tr>
                        ` : ''}
                        <tr>
                          <td style="padding: 8px 0;"><strong>Location:</strong></td>
                          <td style="padding: 8px 0;">${leaderData.location}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0;"><strong>Participant Type:</strong></td>
                          <td style="padding: 8px 0;">${leaderData.participantType}</td>
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
            `
            sendSmtpEmail.sender = {
              name: process.env.BREVO_SENDER_NAME || 'HackerFlow',
              email: process.env.BREVO_FROM_EMAIL || 'noreply@yourdomain.com'
            }

            await apiInstance.sendTransacEmail(sendSmtpEmail)
            console.log('🎯 ✅ Email sent to organizer:', organizerEmail)
          }
          } else {
            console.log('🎯 ⚠️ Organizer email not found')
          }
        } else {
          console.log('🎯 ⚠️ Organizer profile not found in user_profiles')
        }
      } else {
        console.log('🎯 ⚠️ Hackathon details not found')
      }
    } catch (emailError) {
      console.error('🎯 ❌ Error sending organizer notification:', emailError)
    }

    console.log('🎯 =====================================================\n')

    revalidatePath(`/hackathons/${hackathonId}`)
    return { success: true, teamId: team.id }
  } catch (error) {
    console.error('🎯 ❌ Error in createTeamAction:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
