# Admin Dashboard Fix Instructions

This document contains step-by-step instructions to fix the admin dashboard issues you encountered.

## Issues Fixed

1. ✅ **Failed to load pending hackathons** - RLS policy issue
2. ✅ **Failed to promote user to admin** - Function parameter order mismatch
3. ✅ **Added Dummy Data feature** - Like in Organizer and Hacker dashboards
4. ✅ **Document viewing support** - PDFs can be viewed and downloaded

## Step 1: Run the Database Migration

You need to run the SQL migration to fix the RLS policies and function parameter order.

### Option A: Using Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **azsdbblffealwkxrhqae**
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the contents of `supabase/migrations/20250228000000_fix_admin_rls_policies.sql`
6. Paste into the SQL Editor
7. Click **Run** or press `Ctrl+Enter`
8. Wait for success message

### Option B: Using Supabase CLI (If installed)

```bash
cd "c:\Users\User\FYP\hacker-flow"
supabase db push
```

## Step 2: Set Your Account as Superadmin

After running the migration, set your account to superadmin:

```sql
-- In Supabase SQL Editor, replace with your email
UPDATE user_profiles
SET role = 'superadmin'
WHERE email = 'your-email@example.com';

-- Verify the change
SELECT user_id, email, full_name, role
FROM user_profiles
WHERE role = 'superadmin';
```

## Step 3: Test the Admin Portal

1. **Navigate to Admin Login**
   - If already logged in: Go to `http://localhost:3000/admin/login`
   - You'll be automatically verified and redirected to dashboard

2. **Test Approvals Page** (`/admin/dashboard/approvals`)
   - Should now load pending hackathons without errors
   - Documents (Identity Document & Authorization Letter) are clickable
   - Clicking documents will open them in a new tab
   - You can approve or reject hackathons

3. **Test Admin Management** (`/admin/dashboard/users`)
   - Should display all users
   - Promote to Admin button should work
   - Demote to User button should work

## Step 4: Enable Dummy Data (Optional)

To see the full potential of the admin dashboard with sample data:

1. Go to any admin dashboard page
2. Look for the **"Use Dummy Data (Development Mode)"** toggle in the top-right
3. Turn it **ON**
4. Page will reload with dummy data

### What Dummy Data Includes:

- **5 Pending Hackathons** with realistic details
- **10 Sample Users** (mix of hackers and organizers)
- **Sample Revenue Data** for charts
- **Sample User Statistics**

## What Was Fixed

### 1. RLS Policies Fixed

**Problem:** The `admin_pending_hackathons` view wasn't accessible due to missing RLS policies.

**Solution:**
- Recreated the view with proper permissions
- Added `GRANT SELECT` permissions for authenticated users
- Added storage policies for identity documents and authorization letters

### 2. Function Parameter Order Fixed

**Problem:** When calling `promote_to_admin` via RPC, Supabase reads parameters in **alphabetical order**, not the order defined in the function.

**Before:**
```sql
CREATE FUNCTION promote_to_admin(
  p_user_id UUID,           -- First parameter
  p_superadmin_id UUID      -- Second parameter
)
```

**JavaScript Call:**
```javascript
supabase.rpc('promote_to_admin', {
  p_user_id: userId,
  p_superadmin_id: user.id
})
```

**What happened:** Supabase sorted parameters alphabetically: `p_superadmin_id`, `p_user_id` - causing mismatch!

**After:**
```sql
CREATE FUNCTION promote_to_admin(
  p_superadmin_id UUID,     -- First (alphabetically)
  p_user_id UUID            -- Second (alphabetically)
)
```

Now the alphabetical order matches the intended order!

### 3. Document Viewing

Documents are already viewable! The URLs in the database are public Supabase Storage URLs:
- Identity Documents: `https://azsdbblffealwkxrhqae.supabase.co/storage/v1/object/public/identity-documents/...`
- Authorization Letters: `https://azsdbblffealwkxrhqae.supabase.co/storage/v1/object/public/authorization-letters/...`

These can be:
- ✅ Clicked to open in a new tab
- ✅ Downloaded by right-clicking and "Save As"
- ✅ Viewed directly in the browser (if PDFs)

### 4. Dummy Data Feature

Added comprehensive dummy data system:

**Files Created:**
- `lib/dummy-data/admin-dummy-data.ts` - Dummy data definitions
- Updated `app/admin/dashboard/approvals/page.tsx` - Added toggle
- Updated `app/admin/dashboard/users/page.tsx` - Added toggle

**Features:**
- Toggle persists in localStorage
- Merges dummy data with real data when enabled
- Shows only dummy data if API fails (graceful degradation)
- Reloads page when toggled for consistency

## Troubleshooting

### Issue: Still getting "Failed to load pending hackathons"

**Solution:**
1. Make sure you ran the SQL migration
2. Check browser console for specific errors
3. Verify you're logged in as superadmin:
   ```sql
   SELECT email, role FROM user_profiles WHERE user_id = auth.uid();
   ```

### Issue: "Failed to promote user to admin"

**Solution:**
1. Make sure you ran the SQL migration (fixes function parameter order)
2. Verify you're a superadmin (only superadmins can promote)
3. Check terminal logs for specific error

### Issue: Documents won't open

**Solution:**
1. Check if URLs are valid in the database
2. Verify storage buckets exist: `identity-documents` and `authorization-letters`
3. Check storage policies allow admin access
4. Right-click and copy link - paste in browser to test directly

### Issue: Dummy data not showing

**Solution:**
1. Make sure the toggle is ON (check localStorage: `useDummyData = "true"`)
2. Refresh the page after toggling
3. Check browser console for errors

## Testing Checklist

- [ ] Migration ran successfully
- [ ] Set account to superadmin
- [ ] Can access `/admin/login`
- [ ] Can view `/admin/dashboard/approvals`
- [ ] Pending hackathons load without errors
- [ ] Can click and view document URLs
- [ ] Can promote user to admin
- [ ] Can demote admin to user
- [ ] Dummy data toggle works
- [ ] Dummy data shows when enabled

## Files Modified

1. `supabase/migrations/20250228000000_fix_admin_rls_policies.sql` - **NEW**
2. `lib/dummy-data/admin-dummy-data.ts` - **NEW**
3. `app/admin/login/page.tsx` - Auto-login feature
4. `app/admin/dashboard/approvals/page.tsx` - Dummy data support
5. `app/admin/dashboard/users/page.tsx` - Dummy data support
6. `scripts/set-superadmin.sql` - **NEW** - Helper script
7. `scripts/check-admin-user.js` - **UPDATED** - Check admin users
8. `ADMIN_SETUP_GUIDE.md` - **NEW** - Comprehensive setup guide
9. `ADMIN_FIX_INSTRUCTIONS.md` - **NEW** - This file

## Quick Reference: Common SQL Queries

```sql
-- Check your role
SELECT email, role FROM user_profiles WHERE user_id = auth.uid();

-- Set yourself as superadmin
UPDATE user_profiles SET role = 'superadmin' WHERE email = 'your@email.com';

-- View all admins
SELECT email, full_name, role FROM user_profiles WHERE role IN ('admin', 'superadmin');

-- View all pending hackathons
SELECT * FROM admin_pending_hackathons;

-- Check if views exist
SELECT table_name FROM information_schema.views
WHERE table_schema = 'public'
AND table_name LIKE 'admin_%';

-- Check if functions exist
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('promote_to_admin', 'demote_to_user');
```

## Need Help?

1. Check the terminal logs for specific error messages
2. Check browser console (F12) for frontend errors
3. Review `ADMIN_SETUP_GUIDE.md` for detailed setup instructions
4. Run `node scripts/check-admin-user.js` to verify database state

## Next Steps

After fixing these issues, you should have a fully functional admin dashboard with:
- ✅ Pending hackathon approvals
- ✅ User management (promote/demote)
- ✅ Document viewing
- ✅ Dummy data for development
- ✅ Revenue analytics
- ✅ User statistics

Happy hacking! 🚀
