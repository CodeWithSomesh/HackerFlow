# Resend Email Setup Guide

## Step 1: Install Resend

Open your terminal in the project directory and run:

```bash
npm install resend
```

## Step 2: Get Your Resend API Key

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account (includes 100 emails/day for free)
3. Once logged in, go to **API Keys** section
4. Click **Create API Key**
5. Give it a name (e.g., "HackerFlow Production")
6. Copy the API key (it starts with `re_`)

## Step 3: Add API Key to Environment Variables

Add this to your `.env.local` file (create it if it doesn't exist):

```env
RESEND_API_KEY=re_your_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change to your production URL when deploying
```

## Step 4: Verify Your Domain (For Production)

For development, you can send emails to your own email address. For production:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `hackerflow.com`)
4. Add the DNS records shown (TXT, MX, and CNAME records)
5. Wait for verification (usually takes a few minutes)
6. Once verified, update the `from` field in the API route

## Step 5: Uncomment the Code

In `app/api/send-team-invite/route.ts`, uncomment:

1. The import statements at the top:
```typescript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
```

2. The email sending code (lines with `/* ... */`)

3. Comment out or remove the temporary response at the bottom

## Step 6: Test the Email

1. Start your dev server: `npm run dev`
2. Go to your team page
3. Click "Invite Friends"
4. Enter an email address
5. Click "Send"
6. Check your inbox!

## Development Tips

### Testing Without Sending Real Emails

For development, you can use [Mailtrap](https://mailtrap.io) or similar services to test emails without actually sending them:

```typescript
// In development, use Mailtrap SMTP
const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment) {
  // Use nodemailer with Mailtrap for testing
  // Or just log the email content
  console.log('Would send email:', { email, teamName, inviteLink });
  return NextResponse.json({ success: true, message: 'Development mode' });
}
```

### Rate Limiting

Free Resend accounts have limits. Consider adding rate limiting:

```typescript
// Example: Track emails sent per IP
const rateLimiter = new Map();

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 10; // Max 10 emails per hour per IP

  // Check rate limit
  const requests = rateLimiter.get(ip) || [];
  const recentRequests = requests.filter((time: number) => now - time < windowMs);

  if (recentRequests.length >= maxRequests) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    );
  }

  recentRequests.push(now);
  rateLimiter.set(ip, recentRequests);

  // Continue with email sending...
}
```

## Alternative: Using Nodemailer (If You Prefer)

If you prefer to use your own SMTP server or Gmail:

```bash
npm install nodemailer
```

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
  },
});

await transporter.sendMail({
  from: '"HackerFlow" <your-email@gmail.com>',
  to: email,
  subject: `You're invited to join ${teamName}!`,
  html: htmlContent,
});
```

## Troubleshooting

### "Invalid API key" error
- Make sure your API key is correct in `.env.local`
- Restart your dev server after adding environment variables

### Emails not being received
- Check spam folder
- Verify your domain is verified in Resend (for production)
- In development, you can only send to verified email addresses

### "Domain not verified" error
- You need to verify your domain before sending emails in production
- In development, use your personal email as the `from` address

## Production Checklist

Before deploying to production:

- [ ] Domain verified in Resend
- [ ] `RESEND_API_KEY` added to production environment variables
- [ ] `NEXT_PUBLIC_APP_URL` updated to production URL
- [ ] `from` email address updated to use your verified domain
- [ ] Rate limiting implemented
- [ ] Error handling tested
- [ ] Email templates tested across different email clients

## Cost

Resend Pricing:
- **Free**: 100 emails/day, 3,000/month
- **Pro** ($20/month): 50,000 emails/month
- **Business** ($85/month): 100,000 emails/month

For most hackathon platforms, the free tier should be sufficient for development and small-scale production use.
