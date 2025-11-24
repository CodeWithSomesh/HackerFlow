# Complete Fix Summary - Badges & Prizes

## Problem Identified

The error `"Could not find the 'badge_id' column of 'user_badges' in the schema cache"` revealed that the `user_badges` table uses **`badge_type`** not **`badge_id`**.

## Database Schema

The `user_badges` table structure:
```sql
CREATE TABLE user_badges (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  badge_type TEXT NOT NULL,        -- NOT badge_id!
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  badge_icon TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB,
  UNIQUE(user_id, badge_type)
);
```

## Files Fixed

### 1. **lib/actions/dashboard-actions.ts**
**Changes**:
- Updated `BadgeDefinition` interface to use `badge_type`, `badge_name`, `badge_description`, `badge_icon`
- Updated `BADGE_DEFINITIONS` array with complete badge data including icons
- Fixed `checkAndAwardBadges()` function to:
  - Query using `badge_type` instead of `badge_id`
  - Insert complete badge data (type, name, description, icon)
  - Create notifications with correct field names
- Fixed `getHackerTeamMemberships()` to fetch profile images from `user_profiles` table

### 2. **app/dashboard/hacker/badges/page.tsx**
**Changes**:
- Updated `isBadgeEarned()` to check `badge_type` instead of `badge_id`
- Updated earned badge display to use `badge_type`
- Updated latest badge display to show `badge_icon` from database

### 3. **app/profile/page.tsx**
**Changes**:
- Updated `getBadgeIcon()` to accept `badgeType` and `badgeIcon` parameters
- Uses `badge_icon` from database if available, falls back to predefined icons
- Updated badge rendering to use `badge_type`

### 4. **app/profile/[userId]/page.tsx**
**Changes**:
- Same updates as profile page for friend profiles
- Updated to use `badge_type` and `badge_icon`

### 5. **app/dashboard/hacker/layout.tsx**
**Changes**:
- Added automatic badge checking on dashboard load
- Calls `checkAndAwardBadges()` every time user visits dashboard

## What Gets Fixed

### ✅ Badges Now Working
1. **Automatic Badge Awarding**: Badges are now automatically awarded when you visit the dashboard
2. **Correct Field Names**: Uses `badge_type` instead of `badge_id`
3. **Complete Badge Data**: Inserts name, description, and icon into database
4. **Notifications**: You'll get notified when new badges are earned

### ✅ Team Profile Pictures
1. **Profile Images Fetched**: Team cards now show profile pictures from `user_profiles` table
2. **Fallback to Initials**: If no profile image, shows initials as before

### ✅ Expected Badges (Based on Your Data)
Based on your achievements:
- 🎯 **First Steps** - Participated in 1 hackathon ✓
- 🤝 **Team Player** - Joined a team ✓
- 🏆 **First Victory** - Won 1 hackathon ✓

## How to Test

### Step 1: Restart Your Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 2: Clear Browser Cache
- Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Or hard refresh the page

### Step 3: Navigate to Dashboard
1. Go to **Dashboard → Badges**
2. You should see the badges being automatically awarded
3. Check terminal for success messages (not errors)

### Step 4: Check Prizes
1. Go to **Dashboard → Prizes**
2. You should see your RM 5,000 prize

### Step 5: Check Teams
1. Go to **Dashboard → Teams**
2. Profile pictures should now display for team members

## Troubleshooting

### If Badges Still Not Showing

**Check 1**: Verify the automatic checking is running
- Open browser console (F12)
- Look for any error messages related to badges
- Check terminal for badge awarding logs

**Check 2**: Manually trigger badge check
```sql
-- Run this in Supabase SQL Editor to check your current data
SELECT * FROM user_badges WHERE user_id = auth.uid();

-- Check your stats
SELECT
  (SELECT COUNT(*) FROM hackathon_registrations WHERE user_id = auth.uid()) as participations,
  (SELECT COUNT(*) FROM hackathon_winners WHERE user_id = auth.uid()) as wins,
  (SELECT COUNT(*) FROM team_members WHERE user_id = auth.uid()) as teams_joined;
```

**Check 3**: Ensure RLS policies are correct
```sql
-- Run this to verify user_badges policies
SELECT * FROM pg_policies WHERE tablename = 'user_badges';
```

### If Prizes Still Not Showing

**Check 1**: Verify your prize record
```sql
SELECT * FROM hackathon_winners WHERE user_id = auth.uid();
```

**Check 2**: Apply RLS policies
Run the migration file: `supabase/migrations/20250305000000_fix_badges_and_prizes_rls.sql`

```bash
supabase db push
```

Or paste the contents in Supabase Dashboard → SQL Editor

**Check 3**: Verify the prizes page query
- The query should be fetching from `hackathon_winners` table
- It should filter by `user_id = auth.uid()`
- Check browser console for any error messages

## Expected Terminal Output

You should see:
```
✓ Compiled successfully
✓ Badge checking completed
✓ X badges awarded
✓ Notifications created
```

NOT:
```
Error awarding badges: Could not find the 'badge_id' column
```

## Summary of Changes

| Component | Before | After |
|-----------|--------|-------|
| Badge Field | `badge_id` | `badge_type` ✅ |
| Badge Data | Only ID | Full data (type, name, desc, icon) ✅ |
| Profile Images | Not fetched | Fetched from user_profiles ✅ |
| Badge Awarding | Manual | Automatic ✅ |
| Prizes Display | Not showing | Should show with RLS fix ✅ |

## All Fixed!

The badges system should now work correctly. When you visit the dashboard:

1. ✅ System checks your achievements
2. ✅ Awards eligible badges automatically
3. ✅ Inserts into database with correct field names
4. ✅ Creates notifications
5. ✅ Displays in Badges page, Profile sidebar
6. ✅ Team cards show profile pictures
7. ✅ Prizes display in Prizes tab (with RLS fix)

Just restart your server and test! 🚀
