# Testing Guide for Team Invitation & Registration System

## ✅ All Issues Fixed!

### Issue 1 & 2: Email Sending (RESOLVED)

**Problem**: Resend's `onboarding@resend.dev` can only send to your own email address.

**Solution**: Implemented development mode that simulates email sending.

**How it works now**:
- In **development** (`npm run dev`): Emails are simulated, details logged to console
- In **production** (`npm run build`): Real emails sent via Resend

**What you'll see**:
```
When you add a member or send invite via email:
✅ Success toast: "Invitation link created! (Dev mode: check console for email details)"
📧 Server console shows full email details
```

---

## Test Cases for Copy Link Feature (Issue 3)

### Test Case 1: Copy Link Functionality
**Steps**:
1. Go to team page as team leader
2. Click "Invite Friends" button
3. Click "Copy link" button at the bottom
4. ✅ **Expected**: Toast shows "Invite link copied to clipboard!"
5. Paste the link in a text editor
6. ✅ **Expected**: Link format: `http://localhost:3000/hackathons/{hackathon-id}/join-team/{team-id}`

### Test Case 2: Social Media Sharing
**Steps**:
1. Click "Invite Friends"
2. Click Twitter icon
3. ✅ **Expected**: Opens Twitter with pre-filled tweet containing team name, hackathon name, and invite link

**Test same for**:
- WhatsApp icon → Opens WhatsApp web with message
- LinkedIn icon → Opens LinkedIn share dialog
- Email icon → Opens default email client with pre-filled subject and body

### Test Case 3: Invite via Email (Dev Mode)
**Steps**:
1. Click "Invite Friends"
2. Enter any email address in the input field
3. Click "Send"
4. ✅ **Expected**: Success toast shows "Email simulated successfully"
5. Check server console (where you ran `npm run dev`)
6. ✅ **Expected**: See email details logged:
```
📧 ========== EMAIL SIMULATION (DEV MODE) ==========
📧 To: test@example.com
📧 From: Your Name
📧 Team: Team Name
📧 Hackathon: Hackathon Name
📧 Invite Link: http://localhost:3000/...
📧 ================================================
```

---

## Test Cases for Join Team Flow (Issue 4)

### Test Case 4: Not Logged In User Clicks Invite Link
**Steps**:
1. Copy an invite link
2. Open in **incognito/private browser window** (or log out)
3. Paste the invite link
4. ✅ **Expected**: Redirects to `/sign-in?redirect=/hackathons/.../join-team/...`
5. Sign in or register
6. ✅ **Expected**: After login, redirects back to join-team page

### Test Case 5: User Already in Different Team
**Steps**:
1. User A is already in Team 1 for Hackathon X
2. User A receives invite link for Team 2 (same Hackathon X)
3. User A clicks the link
4. ✅ **Expected**: Error page shows:
   - Red error icon
   - "ERROR" heading
   - Message: "You are already registered for this hackathon with a different team. Please cancel your current registration first."

### Test Case 6: First Time Joining Team (Happy Path)
**Steps**:
1. Team leader adds member with email `newuser@example.com`
2. New user receives invite link (check server console in dev mode)
3. New user clicks link
4. ✅ **Expected**: Shows verification page with:
   - Yellow warning icon
   - "VERIFICATION REQUIRED" heading
   - Team details section
   - **Yellow bordered box** with "YOUR DETAILS (PENDING VERIFICATION)"
   - Shows: Name, Email, Mobile, Location, Participant Type, Organization
5. User reviews details
6. User clicks "Verify & Join Team" button
7. ✅ **Expected**: Success page shows:
   - Green success icon
   - "SUCCESS!" heading
   - Message: "Successfully joined the team! Your account is now verified."
8. Click "Go to Team Page"
9. ✅ **Expected**: On team page, user's card now has **GREEN background** (status = 'accepted')

### Test Case 7: User Clicks Link Again After Verifying
**Steps**:
1. User already verified (from Test Case 6)
2. User clicks the same invite link again
3. ✅ **Expected**: Shows "ALREADY A MEMBER" page with:
   - Blue icon
   - Message: "You are already a verified member of this team!"
   - Button to go to team page

### Test Case 8: Team is Full
**Steps**:
1. Hackathon has max team size of 3
2. Team already has 3 verified members
3. 4th person clicks invite link
4. ✅ **Expected**: Error page shows:
   - "This team is already full"

### Test Case 9: Invalid Invite Link
**Steps**:
1. Modify invite link URL to use fake team ID
2. Click the link
3. ✅ **Expected**: Error page shows:
   - "Team not found or invitation link is invalid"

---

## Visual Indicators on Team Page

### Member Status Colors

**Green Background** (Verified):
```
✅ Status: 'accepted'
✅ Member has clicked invite link and verified
✅ Border: border-green-500/30
✅ Background: bg-green-500/5
```

**Yellow Background** (Pending):
```
⚠️ Status: 'pending'
⚠️ Member added but hasn't verified yet
⚠️ Badge: "CONFIRMATION PENDING"
⚠️ Border: border-yellow-500/30
⚠️ Background: bg-yellow-500/5
```

**Leader Badge**:
```
👑 Team leader always shown with gold badge: "TEAM LEADER"
👑 Cannot be removed
👑 Can edit own details
```

---

## Complete Flow Testing Scenario

### Scenario: Create Team and Invite 2 Members

**Step 1: Team Leader Registration**
1. Go to hackathon page
2. Click "Register"
3. Fill form and submit
4. Create team with name "Code Warriors"
5. ✅ **Expected**: On team page, see yourself as leader with green background

**Step 2: Add First Member**
1. Click "Add 2nd Member"
2. Fill details for Alice (alice@example.com)
3. Click "Add Member"
4. ✅ **Expected**:
   - Toast: "Team member added successfully"
   - Toast: "Invitation link created! (Dev mode...)"
   - Check server console for email details
   - Alice appears in team list with **YELLOW background**
   - Badge shows "CONFIRMATION PENDING"

**Step 3: Add Second Member**
1. Click "Add 3rd Member"
2. Fill details for Bob (bob@example.com)
3. Click "Add Member"
4. ✅ **Expected**: Same as Step 2

**Step 4: Send Invite Links**
1. Click "Invite Friends"
2. Copy the invite link
3. Send to Alice and Bob (via WhatsApp, Email, or just copy-paste)

**Step 5: Alice Joins Team**
1. Alice (in new browser/incognito) clicks her invite link
2. If not logged in: Creates account
3. Sees verification page with her details
4. Clicks "Verify & Join Team"
5. ✅ **Expected**: Success message
6. Refreshes team page
7. ✅ **Expected**: Alice now has **GREEN background** (verified!)

**Step 6: Bob Joins Team**
1. Same process as Step 5
2. ✅ **Expected**: Bob also gets green background

**Step 7: Check Final Team Status**
1. As team leader, refresh team page
2. ✅ **Expected**: All 3 members have green background
3. Team size shows: (3/3)
4. Badge at top shows: "YOUR TEAM IS COMPLETE"
5. "Add Member" button is hidden (team full)

---

## Development vs Production

### Development Mode (Current)
```bash
npm run dev
```
- ✅ Emails are simulated (logged to console)
- ✅ Works without domain verification
- ✅ Can test with any email address
- ✅ No actual emails sent

### Production Mode (Future)
```bash
npm run build
npm start
```
- ⚠️ Requires verified domain on Resend
- ⚠️ Or use `onboarding@resend.dev` (only sends to your email)
- ✅ Real emails sent to recipients

---

## Common Issues & Solutions

### Issue: "You were not invited to this team"
**Cause**: User's email doesn't match any team member record
**Solution**: Team leader must first add the member via "Add Member" button

### Issue: "You are already registered with a different team"
**Cause**: User is in another team for the same hackathon
**Solution**: User must cancel their current registration first

### Issue: Email not receiving (in production)
**Cause**: Using `onboarding@resend.dev` without domain
**Solution**: See [RESEND_DOMAIN_SETUP.md](./RESEND_DOMAIN_SETUP.md) for domain setup

### Issue: Copy link not working
**Cause**: Browser clipboard permissions
**Solution**: Make sure localhost or HTTPS is used

---

## Files to Run SQL Migration

**IMPORTANT**: Before testing, run this SQL in Supabase:

File: `add-delete-policy.sql`

This adds RLS policies for:
- Deleting team members
- Deleting teams
- Deleting registrations
- Updating member details

---

## Summary of All Features

✅ **Email Invitations**: Dev mode simulation working
✅ **Copy Link**: Works with clipboard API
✅ **Social Sharing**: Twitter, WhatsApp, LinkedIn, Email
✅ **Join Team Flow**: Login redirect, verification, status updates
✅ **Team Already Exists Check**: Prevents duplicate registrations
✅ **Visual Status Indicators**: Yellow (pending) → Green (verified)
✅ **Edit Member Details**: Leader can edit all members
✅ **Remove Members**: Leader can remove non-leader members
✅ **Cancel Registration**: Full cleanup of team and registrations

---

## Next Steps for Production

1. **Set up domain on Resend** (see RESEND_DOMAIN_SETUP.md)
2. **Update `from` email** in route.ts with your domain
3. **Test with real emails** in production
4. **Monitor Resend dashboard** for email delivery stats
