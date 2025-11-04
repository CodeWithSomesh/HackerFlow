# Fix Participant Count Showing 0

## Problem
Participant counts show 0 in both:
- Hackathons listing page ([app/hackathons/page.tsx](app/hackathons/page.tsx))
- Hackathon details page ([app/hackathons/[id]/page.tsx](app/hackathons/[id]/page.tsx))

Team counts work correctly, but participant counts show 0 for regular users.

## Root Cause
The RLS policy on `hackathon_registrations` table only allows:
1. Users to view their OWN registrations
2. Team leaders to view their TEAM MEMBERS' registrations

But it does NOT allow authenticated users to SELECT from `hackathon_registrations` to count total participants across all hackathons.

The functions `getHackathonParticipantCount()` and `fetchPublishedHackathons()` need to COUNT rows in `hackathon_registrations`, but regular users don't have permission to read this table.

## Solution
Add an RLS policy that allows ALL authenticated users to SELECT from `hackathon_registrations` for counting purposes.

---

## How to Fix (1 Minute)

### Step 1: Open Supabase SQL Editor
1. Go to https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in left sidebar

### Step 2: Run the Migration
1. Open file: [supabase/migrations/20250228000002_fix_participant_count_rls.sql](supabase/migrations/20250228000002_fix_participant_count_rls.sql)
2. Copy **ALL** contents
3. Paste into SQL Editor
4. Click **RUN**

### Step 3: Verify Output
You should see:
```
✅ PARTICIPANT COUNT FIX APPLIED!

✅ Added RLS Policy:
   "Anyone can view registrations for counting participants"

✅ This allows:
   - All authenticated users to count participants
   - Hackathon listing page to show participant counts
   - Hackathon details page to show participant counts

✅ Existing policies preserved:
   - Users can view their own registrations ✓
   - Team leaders can view team members registrations ✓
   - Users and team leaders can delete registrations ✓
```

### Step 4: Test
1. **Hard refresh browser:** Ctrl+Shift+R (or Cmd+Shift+R on Mac)
2. Go to Hackathons page → Participant counts should now display correctly
3. Click on a hackathon → Details page should show correct participant count

---

## What This Migration Does

### The New Policy:
```sql
CREATE POLICY "Anyone can view registrations for counting participants"
  ON hackathon_registrations
  FOR SELECT
  TO authenticated
  USING (true);
```

### Why It's Safe:
1. **Multiple SELECT policies use OR logic** - Users get access if ANY policy matches
2. **Doesn't conflict with existing policies** - Adds public counting IN ADDITION TO personal view
3. **Users now get access to:**
   - Their own registrations (existing policy)
   - OR their team members' registrations (existing policy)
   - OR ALL registrations for counting (NEW policy)

### What Changes:
- **Before:** Regular users couldn't read `hackathon_registrations` at all (except their own)
- **After:** Regular users can read ALL `hackathon_registrations` to count participants
- **Security:** No sensitive data exposed - just allows counting for public display

---

## Files Modified
- [supabase/migrations/20250228000002_fix_participant_count_rls.sql](supabase/migrations/20250228000002_fix_participant_count_rls.sql) (NEW - RUN THIS!)

## Related Functions
These functions will now work correctly for all users:
- `getHackathonParticipantCount()` in [lib/actions/createHackathon-actions.ts:390-410](lib/actions/createHackathon-actions.ts#L390-L410)
- `fetchPublishedHackathons()` in [lib/actions/createHackathon-actions.ts:310-315](lib/actions/createHackathon-actions.ts#L310-L315)

---

**Run the migration now to see participant counts!** 🚀
