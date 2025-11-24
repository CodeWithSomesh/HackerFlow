# FIX ORGANIZER DASHBOARD - SIMPLE 3-STEP PROCESS

## The Problem
Your Organizer Dashboard can't show participant data because of a missing database permission (RLS policy).

## The Solution (3 Steps - Takes 2 Minutes)

### STEP 1: Open Supabase SQL Editor

1. Go to https://app.supabase.com
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"+ New query"** button

### STEP 2: Run the Fix Script

1. Open the file: **`APPLY_THIS_FIX_NOW.sql`** (in your project folder)
2. **Copy EVERYTHING** from that file (Ctrl+A, Ctrl+C)
3. **Paste** into the Supabase SQL Editor
4. Click the **"Run"** button (or press Ctrl+Enter)

**Wait for it to complete.** You'll see success messages like:
```
✅ SUCCESS! POLICY CREATED!
✅ This FIXES: Overview Tab - Participant counts will show
...
```

### STEP 3: Refresh Your Browser

1. Open your application in the browser
2. Press **F12** to open Developer Console
3. In the Console tab, paste this command:
   ```javascript
   localStorage.setItem('useDummyData', 'false')
   ```
4. Press **Enter**
5. **Hard refresh** the page:
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

## ✅ TEST - Check These Work Now:

Go to Organizer Dashboard and verify:

- [ ] **Overview Tab** - Shows participant counts (not 0)
- [ ] **Hackathons Tab** - Shows participant counts next to each hackathon
- [ ] **Manage Participants** - Lists all participants in a table
- [ ] **Manage Winners** - Can select participants as winners
- [ ] **Calendar Tab** - Shows all your hackathons on the calendar
- [ ] **Analytics Tab** - Shows registration charts with data

## ❓ Still Not Working?

If after Step 3 you still see issues:

1. **Check the SQL output** in Step 2 - Did you see "✅ SUCCESS! POLICY CREATED!"?
2. **Run this query** in SQL Editor to verify:
   ```sql
   SELECT policyname
   FROM pg_policies
   WHERE tablename = 'hackathon_registrations'
     AND policyname LIKE '%Organizers%';
   ```
   You should see 1 result: "Organizers can view participants of their hackathons"

3. **Check browser console** (F12) for error messages - share them with me

4. **Verify you have data** - Run this in SQL Editor:
   ```sql
   SELECT COUNT(*) as your_hackathons FROM hackathons WHERE created_by = auth.uid();
   SELECT COUNT(*) as total_registrations FROM hackathon_registrations;
   ```
   Share the results.

## 📝 What This Fix Does

The script creates a database **RLS (Row Level Security) policy** that gives you permission to view participants for hackathons YOU created. Without this policy, the database blocks you from seeing the participant data, even though you're the organizer.

**Technical Details:**
- Creates policy: "Organizers can view participants of their hackathons"
- Allows: `SELECT` from `hackathon_registrations` table
- Condition: Only for hackathons where `created_by = your_user_id`
- Security: You can ONLY see participants for YOUR hackathons (not others)

---

**That's it! Your Organizer Dashboard will work after these 3 steps.**
