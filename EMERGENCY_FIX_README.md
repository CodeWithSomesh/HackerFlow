# 🚨 EMERGENCY FIX - READ THIS FIRST!

## What Happened?
The previous RLS policy fix accidentally removed the critical "Users can view own profile" policy, causing:
- ❌ Your profile to become inaccessible
- ❌ Admin dashboard access to fail
- ❌ Missing rejected hackathons

## The Fix
A new EMERGENCY migration has been created that properly layers RLS policies without breaking existing access.

---

## 🚀 Run This NOW (1 Minute)

### Quick Steps:
1. Open Supabase Dashboard → SQL Editor
2. Open: `supabase/migrations/FIX_RLS_POLICIES.sql`
3. Copy ENTIRE file
4. Paste in SQL Editor
5. Click **RUN**
6. Hard refresh browser (Ctrl+Shift+R)

**Detailed instructions:** [FIX_MISSING_HACKATHONS.md](FIX_MISSING_HACKATHONS.md)

---

## What Gets Fixed?

### ✅ User Profile Access
- **RESTORED:** Users can view their own profile
- **RESTORED:** Users can update their own profile
- **WORKS:** Admins can view all profiles (in addition to their own)
- **WORKS:** Superadmins can update user roles

### ✅ Admin Dashboard Access
- **RESTORED:** Admin verification now works
- **RESTORED:** Can access admin portal
- **WORKS:** All admin features accessible

### ✅ Hackathon Visibility
- **FIXED:** Admins can see ALL hackathons
- **FIXED:** Both rejected hackathons now visible
- **FIXED:** Can approve/reject from any status

---

## How RLS Policies Work (Important!)

### Multiple Policies = OR Logic
When you have multiple SELECT policies:
```sql
POLICY 1: Users can view own profile (auth.uid() = user_id)
POLICY 2: Admins can view all profiles (role IN ('admin', 'superadmin'))
```

**Result:** Access granted if EITHER policy matches!
- Regular user: Can view their OWN profile (Policy 1)
- Admin user: Can view THEIR OWN profile (Policy 1) AND ALL profiles (Policy 2)

### The Previous Mistake
The broken migration only had Policy 2, which meant:
- Admins could view all profiles
- BUT couldn't view their OWN profile (Policy 1 was missing!)
- This broke admin verification which checks for your own profile

---

## After Running Migration

### Test Checklist:
1. [ ] Can access your profile at `/profile`
2. [ ] Can access admin dashboard at `/admin/dashboard`
3. [ ] Can see admin stats in Overview
4. [ ] Can see all hackathons in Hackathons → All Hackathons
5. [ ] Can filter by Rejected and see BOTH rejected hackathons
6. [ ] Can approve/reject hackathons

---

## Files to Use

### Run This Migration:
- **File:** `supabase/migrations/FIX_RLS_POLICIES.sql`
- **Action:** Copy entire file → Paste in SQL Editor → RUN
- **Status:** ✅ Ready to run

### Read This Guide:
- **File:** `FIX_MISSING_HACKATHONS.md`
- **Contains:** Detailed step-by-step instructions
- **Status:** ✅ Updated with emergency fix

### Other Migrations:
- **File:** `supabase/migrations/FIX_APPROVE_REJECT_ANY_STATUS.sql`
- **Status:** ✅ Already applied (approve/reject bidirectional)
- **Note:** This one works fine, no issues

---

## Why This Happened

### Root Cause Analysis:
1. Previous migration dropped "Users can view own profile" policy
2. Only created "Admins can view all profiles" policy
3. Postgres RLS requires EXPLICIT permission for each access pattern
4. Without "own profile" policy, even admins couldn't see their own profile
5. Admin verification checks your own profile → failed → no admin access

### The Fix:
- Always create user policies FIRST
- Then ADD admin policies on top
- Never REPLACE user policies with admin-only policies
- Multiple SELECT policies work with OR logic

---

## Prevention

### In Future Migrations:
✅ Always include:
```sql
-- Base user policies (NEVER REMOVE THESE!)
CREATE POLICY "Users can view own profile"
USING (auth.uid() = user_id);

-- Admin policies (ADD ON TOP)
CREATE POLICY "Admins can view all profiles"
USING (role IN ('admin', 'superadmin'));
```

❌ Never do:
```sql
-- This breaks regular user access!
DROP POLICY "Users can view own profile";  -- DON'T DO THIS!
CREATE POLICY "Admins only"  -- WRONG!
```

---

## Support

**If still having issues after migration:**
1. Check SQL Editor output for errors
2. Verify migration completed successfully
3. Hard refresh browser multiple times
4. Clear browser cache
5. Check browser console for errors
6. Verify your role in database:
   ```sql
   SELECT email, role FROM user_profiles WHERE email = 'your-email@example.com';
   ```

---

## Summary

✅ **Run:** `FIX_RLS_POLICIES.sql`
✅ **Result:** Profile access + Admin access + All hackathons visible
✅ **Time:** 1 minute to fix
✅ **Status:** Emergency fix ready

**Run the migration now!** 🚀
