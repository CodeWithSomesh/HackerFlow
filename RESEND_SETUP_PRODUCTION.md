# ✉️ Resend Setup Guide - Send Real Emails

## Current Status

✅ **Code Updated**: Real email sending is NOW ENABLED
❌ **Resend Configuration**: You need to complete setup on Resend

---

## Step-by-Step Setup on Resend.com

### Step 1: Login to Resend Dashboard

1. Go to https://resend.com/login
2. Login with your account (codewithsomesh@gmail.com)

### Step 2: Check Your API Key

1. Go to https://resend.com/api-keys
2. You should see your API key already created
3. ✅ **Your .env.local already has this** - No action needed

### Step 3: Understand Email Sending Limits

With `onboarding@resend.dev` (the current from address):

**RESTRICTIONS**:
- ❌ Can ONLY send to: `codewithsomesh@gmail.com` (your account email)
- ❌ Cannot send to other users
- ✅ Good for: Testing if Resend connection works

**TO SEND TO ANYONE**, you have 2 options:

---

## OPTION 1: Quick Testing (5 minutes) - Add Test Emails

This lets you send to specific email addresses without a domain.

### Steps:

1. **Go to Resend Dashboard** → https://resend.com/settings/team

2. **Add Team Members**:
   - Click "Invite Team Member"
   - Add emails of people you want to test with:
     - `p21013044@student.newinti.edu.my` (the user from your screenshot)
     - Any other test email addresses

3. **They Accept Invite**:
   - They'll receive an email invitation
   - They click "Accept"
   - Now you can send emails to them using `onboarding@resend.dev`

**PROS**:
- ✅ Works immediately (5 minutes setup)
- ✅ No domain needed
- ✅ Good for testing with friends/teammates

**CONS**:
- ❌ Limited to team members only
- ❌ Not scalable for production
- ❌ Max 10-20 team members

**USE THIS FOR**: Testing your app right now!

---

## OPTION 2: Production Setup (1-2 days) - Verify Domain

This lets you send emails to ANYONE.

### What You Need:
- A domain name (e.g., `hackerflow.com`, `myapp.com`)
- OR a free domain from:
  - **Freenom**: https://www.freenom.com (Free .tk, .ml, .ga domains)
  - **InfinityFree**: https://www.infinityfree.net (Free subdomain)

### Steps:

#### A. Get a Domain

**Option A1: Buy a Domain ($10-15/year)**
- Go to Namecheap, GoDaddy, or Google Domains
- Buy domain like `hackerflow.com`

**Option A2: Free Domain**
- Go to https://www.freenom.com
- Search for available domain (e.g., `hackerflow.tk`)
- Register for free (1 year)

#### B. Add Domain to Resend

1. **Go to Resend** → https://resend.com/domains

2. **Click "Add Domain"**

3. **Enter your domain**:
   - If you own `hackerflow.com`, enter: `hackerflow.com`
   - OR use subdomain: `mail.hackerflow.com`

4. **Resend shows DNS records** (like this):
   ```
   MX Record:
   Name: @
   Value: feedback-smtp.us-east-1.amazonses.com
   Priority: 10

   TXT Record (SPF):
   Name: @
   Value: v=spf1 include:amazonses.com ~all

   TXT Record (DKIM):
   Name: resend._domainkey
   Value: [long string provided by Resend]
   ```

#### C. Add DNS Records

**Where to add**:
- If domain from Namecheap → Namecheap DNS settings
- If domain from Freenom → Freenom DNS settings
- If domain from GoDaddy → GoDaddy DNS settings

**How to add** (example for Namecheap):
1. Login to Namecheap
2. Go to Domain List → Manage
3. Click "Advanced DNS"
4. Click "Add New Record"
5. Add each record shown by Resend:
   - Type: MX, Host: @, Value: feedback-smtp..., Priority: 10
   - Type: TXT, Host: @, Value: v=spf1 include:amazonses.com ~all
   - Type: TXT, Host: resend._domainkey, Value: [Resend's value]

#### D. Verify Domain

1. After adding DNS records, **wait 1-48 hours** (usually 2-4 hours)
2. Go back to Resend → Domains
3. Click "Verify"
4. ✅ Status changes to "Verified"

#### E. Update Your Code

Change the `from` email address:

```typescript
// In: app/api/send-team-invite/route.ts
// Line 35

// OLD:
from: process.env.RESEND_FROM_EMAIL || 'HackerFlow <onboarding@resend.dev>',

// NEW:
from: 'HackerFlow <noreply@hackerflow.com>',
// Replace hackerflow.com with YOUR domain
```

**PROS**:
- ✅ Send to anyone
- ✅ Professional emails from your domain
- ✅ Unlimited recipients
- ✅ Better deliverability

**CONS**:
- ❌ Requires domain ($10/year or free)
- ❌ DNS setup (1-2 days wait time)
- ❌ More complex setup

**USE THIS FOR**: Production app with real users

---

## Recommended Approach FOR YOU

### Phase 1: NOW (Next 30 minutes)

**Use Option 1 - Add Test Emails**:

1. Go to https://resend.com/settings/team
2. Add `p21013044@student.newinti.edu.my`
3. They accept invite
4. Test your app - emails will work!

### Phase 2: LATER (When app is ready)

**Use Option 2 - Verify Domain**:

1. Get free domain from Freenom
2. Add to Resend
3. Wait for verification
4. Update code with your domain

---

## Quick Test RIGHT NOW

### Test with Resend Team Member

1. **Add team member** (Option 1 above)

2. **Send test email**:
   - Add a member in your app
   - Check server console
   - Email should send (no more simulation!)

3. **Check Resend Dashboard**:
   - Go to https://resend.com/emails
   - You'll see sent email!

### Test with Domain (Option 2)

After domain verification:

1. **Update code** with your domain
2. **Restart server**: `npm run dev`
3. **Add member** → Email sends to anyone!

---

## Troubleshooting

### "You can only send to your email"

**Solution**: Add recipient to Resend team (Option 1) OR verify domain (Option 2)

### DNS records not verifying

**Wait Time**:
- Minimum: 2-4 hours
- Maximum: 48 hours
- Check: Use https://dnschecker.org to see if records propagated

### Email not sending

**Check**:
1. Resend API key in .env.local is correct
2. Restart dev server after any changes
3. Check Resend dashboard → Emails tab for delivery status
4. Check spam folder

### "Failed to send email"

**Check server console** for error:
```bash
Resend error: { message: "..." }
```

Common errors:
- "Domain not verified" → Complete Option 2
- "Not authorized" → Add to team (Option 1) or verify domain (Option 2)

---

## What Happens After Setup

### Option 1 Setup (Team Members):

**When you add a member**:
```
1. Member saved to database ✅
2. Email sent via Resend ✅
3. Recipient receives email ✅ (if they're in team)
4. They click link → Join team ✅
```

### Option 2 Setup (Domain Verified):

**When you add a member**:
```
1. Member saved to database ✅
2. Email sent via Resend ✅
3. ANY email receives it ✅
4. They click link → Join team ✅
```

---

## Summary

| Method | Setup Time | Can Send To | Best For |
|--------|------------|-------------|----------|
| **Option 1: Team Members** | 5 minutes | Specific emails (team) | Testing NOW |
| **Option 2: Domain** | 1-2 days | Anyone | Production |

**MY RECOMMENDATION**:

1. **RIGHT NOW**: Use Option 1 (add test emails to team)
2. **THIS WEEK**: Set up Option 2 (get free domain + verify)
3. **NEXT WEEK**: Launch with real emails working!

---

## Files I Updated

✅ **`app/api/send-team-invite/route.ts`**
   - Disabled dev mode simulation
   - Now sends REAL emails via Resend

✅ **`app/hackathons/[id]/join-team/[teamId]/page.tsx`**
   - Fixed member lookup by email
   - Now finds members correctly

**YOU JUST NEED TO**: Configure Resend (Option 1 or 2)

---

## Next Steps

1. **Choose**: Option 1 (quick) or Option 2 (production)
2. **Complete setup** on Resend.com
3. **Test**: Add member → Check email received
4. **Verify**: Check Resend dashboard for sent emails

**Questions?** Check Resend documentation: https://resend.com/docs

**Need help?** Resend support: https://resend.com/support

---

## Environment Variables

Make sure your `.env.local` has:

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production (Option 2), add:
```env
RESEND_FROM_EMAIL=HackerFlow <noreply@yourdomain.com>
```

---

**Your app is NOW configured to send real emails!**
**Just complete Resend setup (Option 1 or 2) and it will work!** ✉️
