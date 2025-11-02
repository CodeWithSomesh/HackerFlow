# Resend Domain Setup Guide

## Why You Need a Domain

Resend's `onboarding@resend.dev` email can **ONLY** send to your own email address (the one you registered with). To send emails to team members, you need to verify a domain.

## Option 1: Use a Free Domain (Easiest for Testing)

### Step 1: Get a Free Domain
You can use services like:
- **Freenom** (free .tk, .ml, .ga domains) - https://www.freenom.com
- **InfinityFree** (free subdomain) - https://infinityfree.net
- Or use a subdomain from any domain you own

### Step 2: Add Domain to Resend

1. Go to https://resend.com/domains
2. Click "Add Domain"
3. Enter your domain (e.g., `yourdomain.tk` or `mail.yourdomain.com`)
4. Resend will show you DNS records to add

### Step 3: Add DNS Records

You'll need to add these records to your domain's DNS settings:

**MX Record:**
```
Name: @
Value: feedback-smtp.us-east-1.amazonses.com
Priority: 10
```

**TXT Records (for SPF, DKIM):**
Resend will show you the exact values. They look like:
```
Name: @
Value: v=spf1 include:amazonses.com ~all

Name: resend._domainkey
Value: [Resend will provide this]
```

### Step 4: Verify Domain

1. After adding DNS records, click "Verify" in Resend dashboard
2. Verification can take 24-48 hours
3. Once verified, you can send emails from `anything@yourdomain.tk`

### Step 5: Update Your Code

Change the `from` email in your code to use your verified domain:
```typescript
from: 'HackerFlow <noreply@yourdomain.tk>'
```

---

## Option 2: Use Resend's Test Mode (For Development Only)

For development/testing without a domain, you can:

1. **Invite test users to Resend**
   - Go to https://resend.com/settings/team
   - Add team members' email addresses
   - They'll receive an invite to join your Resend team
   - Once they accept, you can send emails to them using `onboarding@resend.dev`

2. **Use email simulation** (No real emails sent)
   - We can modify the code to simulate email sending in development
   - Saves email details to console/database instead of sending
   - Switch to real emails in production

---

## Option 3: Alternative Email Services (No Domain Required)

If you don't want to set up a domain, consider these alternatives:

### A. SendGrid (Has Free Tier)
- 100 emails/day free
- No domain required for testing
- https://sendgrid.com

### B. Mailgun (Has Free Tier)
- 5,000 emails/month free
- No domain required for sandbox mode
- https://www.mailgun.com

### C. Gmail SMTP (For Testing Only)
- Use your Gmail account
- Not recommended for production
- Easy setup with Nodemailer

---

## Recommended Approach for Your Project

### For Development (Now):
Use **Email Simulation Mode** - no real emails, just console logs

### For Production (Later):
Set up a domain with Resend (best deliverability)

---

## Quick Fix: Email Simulation Mode

I'll update your code to work in development without sending real emails.

This way you can:
- Test the full flow without email limitations
- See "email sent" messages in console
- Switch to real emails when you get a domain

Would you like me to implement this approach?
