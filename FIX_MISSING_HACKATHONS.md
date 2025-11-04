# 🚨 EMERGENCY FIX: Restore Profile & Admin Access

## Critical Problems
1. ❌ Cannot access your own profile ("No profile found")
2. ❌ Cannot access admin dashboard ("Failed to verify admin access")
3. ❌ Missing rejected hackathons (only seeing 1 of 2)

## Root Cause
The previous RLS policy migration accidentally removed the critical "Users can view own profile" policy, breaking ALL access including your own profile and admin dashboard.

## Solution
Run the EMERGENCY FIX migration that properly layers RLS policies.

---

## 🚨 FIX NOW (URGENT - 1 Minute!)

### Step 1: Open Supabase SQL Editor
1. Go to https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in left sidebar

### Step 2: Run EMERGENCY Migration
1. Open file: `supabase/migrations/FIX_RLS_POLICIES.sql`
2. Copy **ALL** contents (entire file!)
3. Paste into SQL Editor
4. Click **RUN** ✅

### Step 3: Check Output
You should see:
```
✅ EMERGENCY FIX APPLIED - ACCESS RESTORED!

✅ Fixed RLS Policies:
   1. Users can view their OWN profile ✓
   2. Users can update their OWN profile ✓
   3. Admins can view ALL profiles ✓
   4. Admins can view ALL hackathons ✓
   5. Admins can update ALL hackathons ✓

📊 Database stats:
   Total hackathons: 5
   Rejected hackathons: 2
```

### Step 4: Test Access
1. **Hard refresh browser:** Ctrl+Shift+R (or Cmd+Shift+R on Mac)
2. Try accessing your profile → Should work! ✅
3. Try accessing admin dashboard → Should work! ✅
4. Go to **Hackathons** → **All Hackathons** → Filter **Rejected**
5. You should now see BOTH rejected hackathons! ✅

---

## What This EMERGENCY Migration Does

### Critical Fix Order:

#### 1. Restores User Profile Access (FIRST!)
**Drops all broken policies, then creates proper layered policies:**

```sql
-- POLICY 1: Users can view their OWN profile (CRITICAL!)
CREATE POLICY "Users can view own profile"
USING (auth.uid() = user_id);

-- POLICY 2: Users can update their OWN profile
CREATE POLICY "Users can update own profile"
USING (auth.uid() = user_id);

-- POLICY 3: Admins can view ALL profiles (in ADDITION to their own)
CREATE POLICY "Admins can view all user profiles"
USING (role IN ('admin', 'superadmin'));

-- POLICY 4: Superadmins can update any user's role
CREATE POLICY "Superadmins can update user roles"
USING (role = 'superadmin');
```

**Key Point:** Multiple SELECT policies are combined with OR logic, so users get access if EITHER:
- They're viewing their own profile, OR
- They're an admin viewing any profile

#### 2. Fixes Hackathon Admin Access
Recreates admin policies WITHOUT removing user policies:
- Admins can view ALL hackathons
- Admins can update ANY hackathon (for approve/reject)

#### 3. Verifies Database Stats
Shows you:
- Total hackathons count
- Rejected hackathons count
- Confirms all policies are in place

---

## After Running Migration

### Expected Results:
- ✅ All rejected hackathons visible in UI
- ✅ Stats count matches actual displayed hackathons
- ✅ Can approve/reject from any status
- ✅ Organizer info displays (or shows "N/A" if profile missing)

### If Still Having Issues:

**Check the SQL output:**
- Look for the "DATABASE STATS" section
- If it shows 2 rejected hackathons, but you still see only 1:
  1. Hard refresh browser (Ctrl+Shift+R)
  2. Clear browser cache
  3. Check browser console for errors

**Check for dummy data:**
- Make sure dummy data toggle is OFF
- Verify you're viewing real database data

---

## Files Modified
- `supabase/migrations/FIX_RLS_POLICIES.sql` (RUN THIS!)

---

## Related Fixes
This is separate from:
- `FIX_APPROVE_REJECT_ANY_STATUS.sql` (approve/reject bidirectional - already applied)

Both migrations are safe to run multiple times (they use `DROP POLICY IF EXISTS`).

---

**Run the migration now to see all your rejected hackathons!** 🚀
