import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { hackathonId, hackathonTitle, organizerName, organizerEmail } = await request.json();

    // Check if we're in development mode
    const isDevelopment = !process.env.BREVO_API_KEY;

    if (isDevelopment) {
      console.log('\n=ç ========== HACKATHON PUBLICATION EMAIL (DEV MODE) ==========');
      console.log('=ç Hackathon:', hackathonTitle);
      console.log('=ç Organizer:', organizerName);
      console.log('=ç Email:', organizerEmail);
      console.log('=ç Status: Submitted for Approval');
      console.log('=ç =========================================================\n');

      return NextResponse.json({ success: true, message: 'Email logged in development mode' });
    }

    // Production: Send actual email using Brevo
    const brevo = await import('@getbrevo/brevo');
    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = `Hackathon "${hackathonTitle}" Submitted Successfully! <‰`;
    sendSmtpEmail.to = [{ email: organizerEmail, name: organizerName }];
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Hackathon Submitted</title>
        </head>
        <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;"><‰ HackerFlow</h1>
          </div>

          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #8b5cf6; margin-top: 0;">Your Hackathon Has Been Submitted! =€</h2>

            <p>Hi ${organizerName},</p>

            <p>Great news! Your hackathon <strong>"${hackathonTitle}"</strong> has been successfully submitted to HackerFlow and is now pending admin approval!</p>

            <div style="background: #ddd6fe; padding: 20px; border-left: 4px solid #8b5cf6; margin: 20px 0;">
              <p style="margin: 0; color: #5b21b6;">
                <strong>ó What's Next?</strong>
              </p>
            </div>

            <h3 style="color: #334155; margin-top: 25px;">Review Process:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li><strong>Admin Review:</strong> Our team will review your hackathon details to ensure everything meets our guidelines</li>
              <li><strong>Verification:</strong> We'll verify the provided documents and information</li>
              <li><strong>Approval:</strong> Once approved, your hackathon will be published and visible to all users</li>
              <li><strong>Notification:</strong> You'll receive an email once your hackathon is approved or if any changes are needed</li>
            </ul>

            <div style="background: #eff6ff; padding: 20px; border-left: 4px solid #3b82f6; margin: 25px 0;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                <strong>=¡ Tip:</strong> The review process typically takes 1-3 business days. You can check the status of your hackathon in your organizer dashboard.
              </p>
            </div>

            <div style="background: #dcfce7; padding: 20px; border-left: 4px solid #10b981; margin: 25px 0;">
              <p style="margin: 0 0 10px 0; color: #065f46;">
                <strong>=Ë Hackathon Details:</strong>
              </p>
              <ul style="margin: 0; color: #065f46; line-height: 1.8;">
                <li><strong>Title:</strong> ${hackathonTitle}</li>
                <li><strong>Status:</strong> Pending Approval</li>
                <li><strong>Submitted:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</li>
              </ul>
            </div>

            <p style="margin-top: 25px; font-size: 16px; color: #334155;">
              Thank you for choosing HackerFlow to host your hackathon! We're excited to see your event come to life! =»(
            </p>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com'}/dashboard/organizer"
                 style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                View Dashboard
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="color: #666; font-size: 12px; margin-bottom: 0;">
              Best regards,<br>
              The HackerFlow Team<br>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com'}" style="color: #8b5cf6;">HackerFlow.com</a>
            </p>

            <p style="color: #999; font-size: 11px; margin-top: 20px;">
              If you have any questions, please contact us at support@hackerflow.com
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
    console.log(` Publication notification sent to ${organizerName} (${organizerEmail})`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending organizer notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send notification email' },
      { status: 500 }
    );
  }
}
