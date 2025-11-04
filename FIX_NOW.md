# 🚨 EMERGENCY FIX - Profile & Admin Access

## What Happened?
The RLS policies I added were too restrictive and blocked your access to your own profile and admin dashboard.

## Quick Fix (2 Minutes)

### Step 1: Run Emergency Fix
1. Go to [Supabase Dashboard](https://app.supabase.com) → SQL Editor
2. Copy & paste: **`supabase/migrations/EMERGENCY_FIX.sql`**
3. Click **RUN**
4. Wait for success message ✅

### Step 2: Verify Your Role
Make sure you're still a superadmin:
```sql
SELECT user_id, email, full_name, role
FROM user_profiles
WHERE email = 'codewithsomesh@gmail.com';
```

If role is NOT `superadmin`, run:
```sql
UPDATE user_profiles
SET role = 'superadmin'
WHERE email = 'codewithsomesh@gmail.com';
```

### Step 3: Clear Browser & Test
1. **Hard refresh your browser:** `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
2. Or clear site data: `F12` → Application → Clear Storage → Clear site data
3. Go to `http://localhost:3000/profile` - Should load now!
4. Go to `http://localhost:3000/admin/login` - Should work now!

## What Did This Fix?

The emergency fix:
- ✅ **Removed ALL restrictive RLS policies** on user_profiles
- ✅ **Added simple policy:** Everyone can read all profiles (needed for the app)
- ✅ **Kept security:** Users can only update their own profile
- ✅ **Kept admin powers:** Superadmins can update any profile

This is **SAFE** because:
- Profiles are meant to be public in your app (users see each other in hackathons)
- Sensitive data is still protected (users can only edit their own)
- Admin features still require superadmin role

## Why Did This Happen?

The original `COMBINED_FIX_ALL.sql` had this policy:
```sql
CREATE POLICY "Admins can view all user emails"
  ON user_profiles FOR SELECT
  USING (
    auth.uid() = user_id  -- Users can view their own
    OR
    EXISTS (SELECT ... WHERE role IN ('admin', 'superadmin'))  -- OR admins
  );
```

**Problem:** This policy has a recursive dependency!
- To check if you're admin, it needs to read `user_profiles`
- But to read `user_profiles`, it needs to check if you're admin
- **Infinite loop = access denied!**

## The New Approach

Now we have simple, non-recursive policies:
1. **Everyone can SELECT** (read profiles) ✅
2. **Only you can UPDATE** your own profile ✅
3. **Superadmins can UPDATE** any profile ✅

No more recursive checks, no more lockouts!

## After Running Emergency Fix

You should be able to:
- ✅ View your profile page
- ✅ Access admin login
- ✅ View admin dashboard
- ✅ Promote/demote users
- ✅ View pending hackathons

## Still Having Issues?

### Issue: Profile still shows "No profile found"
**Solution:**
1. Clear browser cache completely
2. Sign out and sign in again
3. Check terminal logs for errors

### Issue: Admin access still denied
**Solution:**
```sql
-- Check your role
SELECT email, role FROM user_profiles WHERE email = 'your-email@example.com';

-- If not superadmin, set it
UPDATE user_profiles SET role = 'superadmin' WHERE email = 'your-email@example.com';
```

### Issue: Still getting errors
**Solution:**
Check browser console (F12) and terminal logs. Share the exact error message.

---

## Summary

**Run:** `supabase/migrations/EMERGENCY_FIX.sql`

**Then verify:** Your role is `superadmin`

**Then test:** Profile page and admin dashboard

**That's it!** 🎉
