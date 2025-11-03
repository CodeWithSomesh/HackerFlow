import { NextResponse } from 'next/server';
import * as brevo from '@getbrevo/brevo';

// Initialize Brevo API client
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');

const isDevelopment = !process.env.BREVO_API_KEY;

export async function POST(request: Request) {
  try {
    const { email, memberName, teamName, hackathonName, leaderName } = await request.json();

    // In development mode, simulate email sending
    if (isDevelopment) {
      console.log('\n📧 ========== REMOVAL EMAIL SIMULATION (DEV MODE) ==========');
      console.log('📧 To:', email);
      console.log('📧 Member:', memberName);
      console.log('📧 Team:', teamName);
      console.log('📧 Hackathon:', hackathonName);
      console.log('📧 Removed by:', leaderName);
      console.log('📧 Subject:', `Removed from ${teamName}`);
      console.log('📧 ================================================\n');

      return NextResponse.json({
        success: true,
        message: 'Development mode: Email simulated successfully. Check server console for details.',
        devMode: true
      });
    }

    // Production mode: Send real email via Brevo
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = `You have been removed from ${teamName}`;
    sendSmtpEmail.to = [{ email, name: memberName }];
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

    try {
      const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('✅ Removal notification email sent successfully:', data);
      return NextResponse.json({ success: true, data, messageId: data.messageId });
    } catch (error: any) {
      console.error('❌ Brevo error:', error);
      return NextResponse.json({
        error: error.message || 'Failed to send email',
        details: error.response?.text
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in send-removal-notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
