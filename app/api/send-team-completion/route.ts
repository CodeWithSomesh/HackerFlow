import { NextResponse } from 'next/server';
import * as brevo from '@getbrevo/brevo';

// Initialize Brevo API client
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');

const isDevelopment = !process.env.BREVO_API_KEY;

interface TeamMember {
  email: string;
  firstName: string;
  lastName?: string;
}

export async function POST(request: Request) {
  try {
    const { teamName, hackathonName, hackathonStartDate, members } = await request.json();

    // In development mode, simulate email sending
    if (isDevelopment) {
      console.log('\n🎉 ========== TEAM COMPLETION EMAIL SIMULATION (DEV MODE) ==========');
      console.log('🎉 Team:', teamName);
      console.log('🎉 Hackathon:', hackathonName);
      console.log('🎉 Start Date:', hackathonStartDate);
      console.log('🎉 Recipients:', members.length);
      members.forEach((member: TeamMember) => {
        console.log(`   - ${member.firstName} ${member.lastName || ''} <${member.email}>`);
      });
      console.log('🎉 ================================================\n');

      return NextResponse.json({
        success: true,
        message: 'Development mode: Emails simulated successfully. Check server console for details.',
        devMode: true,
        sentCount: members.length
      });
    }

    // Production mode: Send real emails via Brevo
    const emailPromises = members.map(async (member: TeamMember) => {
      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.subject = `Team "${teamName}" is Ready for ${hackathonName}!`;
      sendSmtpEmail.to = [{ email: member.email, name: `${member.firstName} ${member.lastName || ''}`.trim() }];
      sendSmtpEmail.htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Team Completion Confirmation</title>
          </head>
          <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #14b8a6 100%); padding: 30px; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">HackerFlow</h1>
            </div>

            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #3b82f6; margin-top: 0;">🎉 Your Team is Ready!</h2>

              <p>Hi ${member.firstName},</p>

              <p>Great news! Your team "<strong>${teamName}</strong>" has been confirmed and is all set for <strong>${hackathonName}</strong>!</p>

              <div style="background: linear-gradient(135deg, #dbeafe 0%, #d1fae5 100%); padding: 20px; border-left: 4px solid #3b82f6; margin: 20px 0; border-radius: 5px;">
                <p style="margin: 0; color: #1e40af; font-size: 18px;">
                  <strong>✅ Team Confirmed & Ready to Compete!</strong>
                </p>
              </div>

              ${hackathonStartDate ? `
              <div style="background: #fff; padding: 15px; border: 2px solid #e5e7eb; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; color: #666;">
                  <strong>Hackathon Start Date:</strong> ${new Date(hackathonStartDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              ` : ''}

              <h3 style="color: #3b82f6; margin-top: 30px;">What's Next?</h3>
              <ul style="color: #666;">
                <li>Stay connected with your team members</li>
                <li>Prepare your ideas and technologies</li>
                <li>Review the hackathon rules and judging criteria</li>
                <li>Make sure you're ready for the upcoming stages</li>
              </ul>

              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 5px;">
                <p style="margin: 0; color: #92400e;">
                  <strong>💡 Pro Tip:</strong> Communicate with your team regularly and start planning your project strategy now!
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <p style="font-size: 24px; color: #3b82f6; margin: 0;">
                  <strong>Good Luck! 🚀</strong>
                </p>
                <p style="color: #666; margin: 10px 0 0 0;">
                  We're excited to see what you build!
                </p>
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

      try {
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`✅ Team completion email sent to ${member.email}:`, data.messageId);
        return { success: true, email: member.email, messageId: data.messageId };
      } catch (error: any) {
        console.error(`❌ Failed to send email to ${member.email}:`, error);
        return { success: false, email: member.email, error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    console.log(`📧 Team completion emails: ${successCount} sent, ${failedCount} failed`);

    return NextResponse.json({
      success: true,
      sentCount: successCount,
      failedCount: failedCount,
      results
    });

  } catch (error) {
    console.error('Error in send-team-completion:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
