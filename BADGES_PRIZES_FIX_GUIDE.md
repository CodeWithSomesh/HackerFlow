# Badges & Prizes Fix Guide

## Issues Fixed

This update fixes three critical issues:

1. ✅ **Team Card Profile Pictures Not Showing**
2. ✅ **Badges Not Being Unlocked/Awarded**
3. ✅ **Prizes Not Showing in Prizes Tab**

---

## What Was Changed

### 1. Team Members Profile Images (`lib/actions/dashboard-actions.ts`)

**Problem**: Team cards were not showing participant profile pictures from the database.

**Fix**: Updated `getHackerTeamMemberships()` function to fetch profile images from `user_profiles` table.

**Lines Modified**: 403-436

**What it does now**:
- Fetches team member data from `hackathon_team_members` table
- Queries `user_profiles` table to get profile images for all team members
- Maps profile images to each team member
- Returns complete data with profile images included

### 2. Automatic Badge Awarding (`app/dashboard/hacker/layout.tsx`)

**Problem**: Badges were not being automatically unlocked when users completed achievements.

**Fix**: Added automatic badge checking to dashboard layout.

**What it does now**:
- Calls `checkAndAwardBadges()` function when user visits dashboard
- Automatically checks user stats (participations, wins, teams, etc.)
- Awards any eligible badges that haven't been awarded yet
- Creates notifications for newly earned badges

**Badges that will be automatically awarded**:
- 🎯 **First Steps**: Participate in 1 hackathon
- 🔥 **On a Roll**: Participate in 3 hackathons
- ⭐ **Veteran Hacker**: Participate in 10 hackathons
- 🏆 **First Victory**: Win 1 hackathon
- 👑 **Champion**: Win 3 hackathons
- 💎 **Legend**: Win 5 hackathons
- 🤝 **Team Player**: Join 1 team
- 👨‍💼 **Team Leader**: Lead 1 team
- 💰 **Prize Collector**: Earn RM 10,000 in prizes

### 3. RLS Policies for Badges and Prizes (`supabase/migrations/20250305000000_fix_badges_and_prizes_rls.sql`)

**Problem**: Users couldn't see their badges or prizes due to missing/incorrect Row Level Security policies.

**Fix**: Created comprehensive RLS policies for:
- `user_badges` table
- `hackathon_winners` table
- `notifications` table

**New Policies**:

#### user_badges table:
- ✅ Users can view their own badges
- ✅ Users can view others' badges (for profile viewing)
- ✅ System can award badges automatically

#### hackathon_winners table:
- ✅ Users can view their own prizes
- ✅ Organizers can view prizes for their hackathons
- ✅ Organizers can create/update/delete prizes

#### notifications table:
- ✅ Users can view their own notifications
- ✅ System can create notifications for badge awards

---

## How to Apply the Fixes

### Step 1: Apply Database Migration

You have two options:

#### Option A: Using Supabase CLI (Recommended)

```bash
supabase db push
```

This will apply the migration file: `supabase/migrations/20250305000000_fix_badges_and_prizes_rls.sql`

#### Option B: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/20250305000000_fix_badges_and_prizes_rls.sql`
4. Click **Run**

### Step 2: Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

### Step 3: Test the Fixes

#### Test 1: Profile Pictures in Team Cards
1. Navigate to **Dashboard → Teams**
2. Check if team member profile pictures are now visible
3. If a user has uploaded a profile image, it should display instead of just initials

#### Test 2: Automatic Badge Awarding
1. Navigate to **Dashboard → Badges**
2. Check if badges are now unlocked based on your achievements
3. Expected badges (based on your current data):
   - 🤝 **Team Player** (you joined a team)
   - 🏆 **First Victory** (you won a hackathon)
   - 🎯 **First Steps** (you participated in a hackathon)

#### Test 3: Prizes Display
1. Navigate to **Dashboard → Prizes**
2. You should now see your prize from the hackathon_winners table:
   - Prize Position: Second Runner Up
   - Prize Amount: RM 5,000
   - Payment Status: Credited

---

## Verification Checklist

- [ ] Team cards show profile pictures for team members
- [ ] Badges tab shows unlocked badges based on achievements
- [ ] Prizes tab displays your winning from hackathon_winners table
- [ ] Notifications appear when new badges are earned
- [ ] Profile sidebar shows earned badges

---

## Troubleshooting

### Issue: Badges Still Not Showing

**Solution 1**: Clear browser cache and refresh
```
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

**Solution 2**: Check if RLS policies were applied
1. Go to Supabase Dashboard → Authentication → Policies
2. Verify that `user_badges` and `hackathon_winners` tables have the new policies

**Solution 3**: Manually trigger badge check
1. Navigate to Dashboard → Badges page
2. The page automatically calls `checkAndAwardBadges()` on load

### Issue: Prizes Still Not Showing

**Solution 1**: Verify RLS policies for hackathon_winners
```sql
-- Run this in Supabase SQL Editor to check policies
SELECT * FROM pg_policies WHERE tablename = 'hackathon_winners';
```

**Solution 2**: Check if your user_id matches in hackathon_winners table
```sql
-- Replace YOUR_USER_ID with your actual user ID
SELECT * FROM hackathon_winners WHERE user_id = 'YOUR_USER_ID';
```

### Issue: Profile Pictures Not Showing

**Solution 1**: Verify profile images exist in database
```sql
-- Check if profile images are stored
SELECT user_id, profile_image FROM user_profiles WHERE profile_image IS NOT NULL;
```

**Solution 2**: Check network tab for image loading errors
- Open browser DevTools (F12)
- Go to Network tab
- Look for failed image requests

---

## Technical Details

### Badge Awarding Flow

1. User visits Hacker Dashboard
2. `checkAndAwardUserBadges()` is called in layout
3. Function calls `checkAndAwardBadges()` from dashboard-actions
4. System fetches user's current stats:
   - Total participations
   - Total wins
   - Teams joined
   - Teams led
   - Total prize money
5. Compares stats against badge requirements
6. Awards any eligible badges not yet earned
7. Creates notifications for new badges
8. User sees badges in Badges tab and Profile sidebar

### Profile Image Fetching Flow

1. `getHackerTeamMemberships()` fetches team data
2. Extracts all team member user IDs
3. Queries `user_profiles` table for profile images
4. Maps profile images to each team member
5. Returns complete team data with images
6. Team cards display images using AvatarImage component

---

## Need More Help?

If issues persist after applying these fixes:

1. Check browser console for errors (F12 → Console tab)
2. Check Supabase logs for database errors
3. Verify all migrations have been applied successfully
4. Ensure you're logged in with the correct user account

---

## Summary

All three issues have been fixed:

1. ✅ **Profile Pictures**: Team cards now fetch and display profile images from user_profiles table
2. ✅ **Badge Awarding**: Badges are automatically checked and awarded on dashboard visit
3. ✅ **Prizes Display**: RLS policies now allow users to see their prizes from hackathon_winners table

Simply apply the database migration and restart your server to see the fixes in action!
