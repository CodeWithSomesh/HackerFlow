# Quick Start Guide - Team Invitation System

## ⚡ Get Started in 3 Steps

### Step 1: Run SQL Migration (REQUIRED)
```sql
-- Open Supabase Dashboard → SQL Editor
-- Copy and run: add-delete-policy.sql
```
This adds database policies for delete operations.

### Step 2: Start Development Server
```bash
npm run dev
```
Email simulation is **automatically enabled** in dev mode!

### Step 3: Test the Flow
1. Register for a hackathon
2. Create a team
3. Add a member (check server console for email)
4. Copy invite link and open in incognito
5. Login/signup, verify details, join team
6. See status change from yellow to green! ✅

---

## 📧 Email Behavior

### Development Mode (Current)
```
✅ NO domain setup needed
✅ NO Resend limitations
✅ Works with ANY email address
✅ Emails simulated (logged to console)
✅ Perfect for testing
```

When you:
- Add a member
- Send invite via email

You'll see in **server console**:
```
📧 ========== EMAIL SIMULATION (DEV MODE) ==========
📧 To: test@example.com
📧 Team: Team Name
📧 Invite Link: http://localhost:3000/...
📧 ================================================
```

### Production Mode (Future)
```
⚠️ Requires verified domain
⚠️ See RESEND_DOMAIN_SETUP.md
```

---

## 🎨 Visual Status Guide

**Yellow Background** = Pending (not verified yet)
```
Member added → Shows yellow → Badge: "CONFIRMATION PENDING"
```

**Green Background** = Verified (joined via link)
```
Member clicks link → Verifies → Shows green → No badge
```

---

## 🔗 Key Features

✅ **Automatic Emails**: Sent when adding members
✅ **Copy Link**: Works with clipboard
✅ **Social Sharing**: Twitter, WhatsApp, LinkedIn, Email
✅ **Login Redirect**: Not logged in? Redirected then back
✅ **Team Check**: Prevents joining multiple teams
✅ **Verification Flow**: Yellow → Click link → Verify → Green

---

## 📚 Full Documentation

- **[SUMMARY_ALL_FIXES.md](./SUMMARY_ALL_FIXES.md)** - Complete changes overview
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Detailed test cases
- **[RESEND_DOMAIN_SETUP.md](./RESEND_DOMAIN_SETUP.md)** - Production email setup

---

## 🚨 Common Questions

**Q: Why am I not receiving emails?**
A: In dev mode, emails are simulated. Check server console!

**Q: Can I send to any email address?**
A: Yes! In dev mode, there are no restrictions.

**Q: How do I make it send real emails?**
A: See RESEND_DOMAIN_SETUP.md for domain verification.

**Q: What happens when a member clicks the invite link?**
A: They see their details, verify them, click "Verify & Join Team", then their status turns green!

---

## ✅ Quick Test

```bash
# 1. Start dev server
npm run dev

# 2. Register & create team
# 3. Add member "test@example.com"
# 4. Check console → See email details logged
# 5. Copy invite link from "Invite Friends" modal
# 6. Open in incognito/new browser
# 7. Login/signup
# 8. See verification page with yellow background
# 9. Click "Verify & Join Team"
# 10. Success! Return to team page → Green background ✅
```

All features working! 🎉
