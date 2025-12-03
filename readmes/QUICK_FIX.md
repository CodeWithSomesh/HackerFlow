# 🚀 Quick Fix - Admin Dashboard Issues

## The Two Main Problems

### 1. "Failed to load pending hackathons" ❌
**Cause:** RLS policies not set up correctly for admin views

### 2. "Failed to promote user to admin" ❌
**Cause:** Function parameters in wrong order (alphabetical vs defined order)

---

## ⚡ Quick Fix (3 Minutes!)

### Step 1: Run ONE Combined SQL Migration ⭐
1. Open [Supabase Dashboard](https://app.supabase.com) → Your Project
2. Go to **SQL Editor**
3. Copy & paste entire file: **`supabase/migrations/COMBINED_FIX_ALL.sql`**
4. Click **RUN** ✅
5. Wait for Success message (should say "All admin dashboard fixes applied successfully!")

### Step 2: Set Yourself as Superadmin
```sql
-- Replace with YOUR email
UPDATE user_profiles
SET role = 'superadmin'
WHERE email = 'codewithsomesh@gmail.com';
```

### Step 3: Test
1. Go to `http://localhost:3000/admin/login`
2. You'll auto-login if already signed in
3. Check **Approvals** page - should load hackathons ✅
4. Check **Admin Management** - promote should work ✅

---

## 🎨 Bonus: Enable Dummy Data

To see the dashboard in action with sample data:

1. Visit any admin page
2. Toggle **"Use Dummy Data"** switch (top-right)
3. Page reloads with 5 sample hackathons + 10 users

---

## 📁 What Changed

### Files Created:
- ✅ `supabase/migrations/20250228000001_add_missing_columns.sql` - **RUN THIS FIRST!**
- ✅ `supabase/migrations/20250228000000_fix_admin_rls_policies.sql` - **RUN THIS SECOND!**
- ✅ `lib/dummy-data/admin-dummy-data.ts`
- ✅ `ADMIN_SETUP_GUIDE.md`
- ✅ `ADMIN_FIX_INSTRUCTIONS.md`
- ✅ `scripts/set-superadmin.sql`

### Files Modified:
- ✅ `app/admin/login/page.tsx` - Auto-login for existing sessions
- ✅ `app/admin/dashboard/approvals/page.tsx` - Added dummy data toggle
- ✅ `app/admin/dashboard/users/page.tsx` - Added dummy data toggle

---

## 🐛 Still Not Working?

### Check 1: Did migration run?
```sql
-- Should show 3 views
SELECT table_name FROM information_schema.views
WHERE table_name LIKE 'admin_%';
```

### Check 2: Are you superadmin?
```sql
-- Should return 'superadmin'
SELECT role FROM user_profiles WHERE email = 'your@email.com';
```

### Check 3: Can you access views?
```sql
-- Should return data
SELECT * FROM admin_pending_hackathons LIMIT 1;
```

### Check 4: Check browser console
Press `F12` → Console tab → Look for errors

---

## 📚 More Details

- **Full Setup Guide:** `ADMIN_SETUP_GUIDE.md`
- **Detailed Fix Instructions:** `ADMIN_FIX_INSTRUCTIONS.md`
- **Check admin users:** Run `node scripts/check-admin-user.js`

---

## ✨ Expected Results After Fix

| Feature | Before | After |
|---------|--------|-------|
| Load Pending Hackathons | ❌ Error | ✅ Works |
| Promote to Admin | ❌ Error | ✅ Works |
| Demote to User | ❌ Error | ✅ Works |
| View Documents | ⚠️ N/A | ✅ Clickable Links |
| Dummy Data | ❌ None | ✅ Toggle Available |

---

**Total Time:** ~5 minutes
**Complexity:** Easy (just run SQL + toggle dummy data)
**Files to Touch:** Just the SQL migration + your email in the UPDATE query

Good luck! 🎉
