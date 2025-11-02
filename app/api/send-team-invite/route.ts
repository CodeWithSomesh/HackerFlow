import { NextResponse } from 'next/server';
import * as brevo from '@getbrevo/brevo';

// Initialize Brevo API client
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');

// Dev mode can be enabled for testing without sending real emails
const isDevelopment = !process.env.BREVO_API_KEY; // Automatically enable dev mode if no API key

export async function POST(request: Request) {
  try {
    const { email, teamName, hackathonName, hackathonId, teamId, inviterName } = await request.json();

    // Generate invite link
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/hackathons/${hackathonId}/join-team/${teamId}`;

    // In development mode, simulate email sending (bypass Resend's testing limitations)
    if (isDevelopment) {
      console.log('\n📧 ========== EMAIL SIMULATION (DEV MODE) ==========');
      console.log('📧 To:', email);
      console.log('📧 From:', inviterName);
      console.log('📧 Team:', teamName);
      console.log('📧 Hackathon:', hackathonName);
      console.log('📧 Invite Link:', inviteLink);
      console.log('📧 Subject:', `You're invited to join ${teamName} for ${hackathonName}!`);
      console.log('📧 ================================================\n');

      return NextResponse.json({
        success: true,
        message: 'Development mode: Email simulated successfully. Check server console for details.',
        inviteLink,
        devMode: true
      });
    }

    // Production mode: Send real email via Brevo
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = `You're invited to join ${teamName} for ${hackathonName}!`;
    sendSmtpEmail.to = [{ email, name: email.split('@')[0] }];
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Team Invitation</title>
        </head>
        <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">HackerFlow</h1>
          </div>

          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">You're Invited to Join a Team!</h2>

            <p>Hi there!</p>

            <p><strong>${inviterName}</strong> has invited you to join their team "<strong>${teamName}</strong>" for the hackathon:</p>

            <div style="background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #667eea;">${hackathonName}</h3>
            </div>

            <p>Click the button below to accept the invitation and join the team:</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteLink}"
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 15px 40px;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                        display: inline-block;">
                Accept Invitation
              </a>
            </div>

            <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="background: white; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">
              ${inviteLink}
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

    try {
      const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('✅ Brevo email sent successfully:', data);
      return NextResponse.json({ success: true, data, messageId: data.messageId });
    } catch (error: any) {
      console.error('❌ Brevo error:', error);
      return NextResponse.json({
        error: error.message || 'Failed to send email',
        details: error.response?.text
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in send-team-invite:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
