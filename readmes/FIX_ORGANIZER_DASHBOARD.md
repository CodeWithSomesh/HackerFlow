# Fix Organizer Dashboard - Complete Guide

## Issues Identified

Your Organizer Dashboard has TWO main issues:

### Issue 1: RLS Policy Blocking Participant Access ❌
**Problem:** Organizers cannot view participants for hackathons they created because there's no RLS (Row Level Security) policy allowing them to SELECT from `hackathon_registrations` for their hackathons.

**What this affects:**
- ❌ Overview tab - participant counts show as 0
- ❌ Hackathons tab - participant counts show as 0
- ❌ Manage Participants - no participants displayed
- ❌ Analytics tab - no registration data

**Solution:** Apply the new migration to create the RLS policy.

### Issue 2: Calendar Pagination Limit ❌
**Problem:** Calendar page was only fetching 10 hackathons (default pagination), so if you have more than 10 hackathons, some won't appear on the calendar.

**What this affects:**
- ❌ Calendar view - only shows first 10 hackathons
- ❌ Upcoming Hackathons list - incomplete

**Solution:** Updated to fetch up to 1000 hackathons for the calendar. ✅ **FIXED**

---

## How to Fix (Step-by-Step)

### Step 1: Apply the RLS Policy Migration

You need to run the new migration file in your Supabase database.

**Option A: Using Supabase Dashboard (Recommended)**

1. **Open your Supabase project dashboard**
   - Go to https://app.supabase.com
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "+ New query"

3. **Copy and paste the migration**
   - Open the file: `supabase/migrations/20250300000000_fix_organizer_participant_access.sql`
   - Copy ALL the content
   - Paste into the SQL Editor

4. **Run the migration**
   - Click "Run" button (or press Ctrl+Enter / Cmd+Enter)
   - Wait for success message
   - You should see: "✅ ORGANIZER PARTICIPANT ACCESS FIX APPLIED!"

**Option B: Using Supabase CLI**

```bash
# Navigate to your project directory
cd C:\Users\User\FYP\hacker-flow

# Apply the migration
npx supabase db push
```

### Step 2: Verify the Migration Was Applied

Run this query in Supabase SQL Editor to verify:

```sql
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'hackathon_registrations'
  AND policyname = 'Organizers can view participants of their hackathons';
```

**Expected result:** You should see 1 row with the policy name.

If you see 0 rows, the migration wasn't applied. Go back to Step 1.

### Step 3: Clear Browser Cache and Test

1. **Clear browser cache:**
   - Windows/Linux: `Ctrl + Shift + Delete`
   - Mac: `Cmd + Shift + Delete`
   - Select "Cached images and files"
   - Click "Clear data"

2. **Hard refresh the page:**
   - Windows/Linux: `Ctrl + Shift + R` or `Ctrl + F5`
   - Mac: `Cmd + Shift + R`

3. **Make sure dummy data is OFF:**
   ```javascript
   localStorage.setItem('useDummyData', 'false')
   ```
   Then refresh again.

### Step 4: Test All Organizer Dashboard Features

✅ **Test Checklist:**

**Overview Tab** (`/dashboard/organizer`)
- [ ] Total Participants count shows correct number (not 0)
- [ ] Recent Hackathons list shows participant counts
- [ ] Registration Trend chart shows data
- [ ] Participation Type pie chart shows data
- [ ] Top Hackathons bar chart shows data

**Hackathons Tab** (`/dashboard/organizer/hackathons`)
- [ ] Each hackathon shows participant count
- [ ] Clicking on a hackathon shows details

**Manage Participants** (`/dashboard/organizer/hackathons/[id]/participants`)
- [ ] Participants are listed in the table
- [ ] Can filter by "All", "Teams", "Individuals"
- [ ] Search works
- [ ] Can export to CSV

**Manage Winners** (`/dashboard/organizer/hackathons/[id]/winners`)
- [ ] Can select participants as winners
- [ ] Can update payment status

**Calendar Tab** (`/dashboard/organizer/calendar`)
- [ ] All your hackathons appear on the calendar
- [ ] Upcoming Hackathons list shows all events
- [ ] Can navigate months

**Analytics Tab** (`/dashboard/organizer/analytics`)
- [ ] Registration Trend chart shows data
- [ ] Participants by Hackathon chart shows data
- [ ] Participation Type distribution shows data
- [ ] Performance Summary table is populated

---

## Troubleshooting

### Problem: Participant counts still show as 0

**Check 1: Verify migration was applied**
```sql
SELECT * FROM pg_policies
WHERE tablename = 'hackathon_registrations';
```
Look for the policy "Organizers can view participants of their hackathons"

**Check 2: Verify you have registrations in the database**
```sql
SELECT h.title, COUNT(r.id) as participant_count
FROM hackathons h
LEFT JOIN hackathon_registrations r ON h.id = r.hackathon_id
WHERE h.created_by = auth.uid()
GROUP BY h.id, h.title;
```
This should show your hackathons with participant counts.

**Check 3: Check registration status values**
```sql
SELECT DISTINCT registration_status
FROM hackathon_registrations;
```
Make sure the values include one of: `confirmed`, `approved`, `registered`, or `active`

### Problem: Calendar still doesn't show hackathons

**Check 1: Verify you have hackathons in the database**
```sql
SELECT id, title, start_date, end_date, status
FROM hackathons
WHERE created_by = auth.uid()
ORDER BY start_date;
```

**Check 2: Verify date format**
Make sure `start_date` and `end_date` are valid timestamps:
```sql
SELECT title, start_date, end_date,
  EXTRACT(MONTH FROM start_date) as start_month,
  EXTRACT(YEAR FROM start_date) as start_year
FROM hackathons
WHERE created_by = auth.uid();
```

### Problem: Still seeing issues after migration

1. **Check browser console for errors:**
   - Press F12
   - Click "Console" tab
   - Look for red error messages
   - Share them with me

2. **Check Network tab:**
   - Press F12
   - Click "Network" tab
   - Filter for "Fetch/XHR"
   - Click on failed requests (red)
   - Check "Response" tab for error details

3. **Verify authentication:**
   ```sql
   SELECT auth.uid() as your_user_id;
   ```
   Make sure this matches the `created_by` value in your hackathons table.

---

## What Was Changed in Code

### Files Modified:

1. ✅ **`app/dashboard/organizer/calendar/page.tsx`**
   - Changed: `getOrganizerHackathons()`
   - To: `getOrganizerHackathons(undefined, { limit: 1000 })`
   - Reason: Fetch all hackathons for calendar view instead of just 10

### Files Created:

1. ✅ **`supabase/migrations/20250300000000_fix_organizer_participant_access.sql`**
   - Creates RLS policy allowing organizers to SELECT from `hackathon_registrations`
   - Only for hackathons they created
   - This enables viewing participant counts and details

---

## Migration File Content

If you need to manually verify or recreate the migration, here's what it contains:

```sql
CREATE POLICY "Organizers can view participants of their hackathons"
  ON hackathon_registrations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM hackathons
      WHERE hackathons.id = hackathon_registrations.hackathon_id
        AND hackathons.created_by = auth.uid()
      LIMIT 1
    )
  );
```

This policy allows you (the organizer) to SELECT (read) from `hackathon_registrations` table, but ONLY for registrations where:
- The hackathon_id matches a hackathon you created
- The hackathon's created_by equals your user ID

---

## Summary

✅ **What's Fixed:**
1. Calendar now fetches all hackathons (code change - already applied)

🔄 **What You Need to Do:**
1. Apply the RLS policy migration in Supabase (required!)
2. Test all dashboard features

After applying the migration, your Organizer Dashboard should work completely!

---

**Need Help?** If you're still having issues after following this guide:
1. Check the Troubleshooting section
2. Share the output of the diagnostic queries
3. Share any console errors (F12 → Console tab)
