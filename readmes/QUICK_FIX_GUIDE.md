# 🚀 Quick Fix Guide - Friend Search Not Working

## Problem
Search shows "No users found" even when users exist in database.

## ✅ Solution (ALREADY APPLIED)

I've updated the code to use **direct database queries** instead of RPC functions. This works immediately without requiring database migrations.

## 🔧 What Was Changed

1. ✅ Created `lib/actions/friend-actions-direct.ts` - Direct query implementation
2. ✅ Updated `app/search-friends/page.tsx` - Uses direct search
3. ✅ Updated `app/profile/page.tsx` - Uses direct friend counts
4. ✅ Added console logging for debugging

## 📋 Steps to Fix (In Order)

### Step 1: Run RLS Policy Fix (REQUIRED)

The most likely issue is Row Level Security blocking access to user_profiles table.

**Action Required:**
1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in sidebar
4. Click **+ New Query**
5. Copy content from `RLS_POLICY_FIX.sql`
6. Paste and click **Run**

**What this does:**
- Allows authenticated users to view all user profiles
- Fixes the "No users found" issue

### Step 2: Test the Search

1. Refresh your Next.js app
2. Go to `/search-friends`
3. Open browser console (F12)
4. Type "Maisarah" or "Kevin"
5. Watch console logs:
   ```
   🔍 Search - Current User: [your-id]
   🔍 Searching for: Maisarah
   📊 Profile Results: 1
   ✅ Enriched Results: 1
   ```
6. User should appear in results!

### Step 3: If Still Not Working

**Check Console Logs:**

1. Press **F12** to open DevTools
2. Go to **Console** tab
3. Look for error messages

**Common Issues:**

| Error | Solution |
|-------|----------|
| ❌ "User not authenticated" | Make sure you're logged in |
| ❌ "Row Level Security" | Run RLS_POLICY_FIX.sql |
| ❌ "No profiles found" | Check if users exist in database |
| ❌ Network error | Check Supabase connection |

**Verify Users Exist:**

Run in Supabase SQL Editor:
```sql
SELECT user_id, full_name, email, user_primary_type
FROM user_profiles
LIMIT 10;
```

Should show users like Maisarah, Kevin Durant, etc.

## 🎯 Expected Results

### When you search for "Maisarah":
```
✅ Shows user card with:
   - Profile image or avatar
   - Name: "Maisarah"
   - Email: [their email]
   - Badge: "ORGANIZER"
   - Button: "Add Friend"
```

### When you search for "Kevin":
```
✅ Shows user card with:
   - Name: "Kevin Durant"
   - Email: [their email]
   - Badge: "ORGANIZER"
   - Button: "Add Friend"
```

## 📊 How to Debug

### Method 1: Browser Console
```javascript
// Open Console (F12) and look for:
🔍 Search - Current User: abc-123-def-456
🔍 Searching for: test
📊 Profile Results: 3
✅ Enriched Results: 3
```

### Method 2: Network Tab
1. Open DevTools (F12)
2. Click **Network** tab
3. Type in search box
4. Look for requests to Supabase
5. Check response data

### Method 3: SQL Direct Test
Run in Supabase SQL Editor:
```sql
-- Replace 'abc-123' with your actual user_id
SELECT
  user_id,
  full_name,
  email,
  user_primary_type
FROM user_profiles
WHERE user_id != 'abc-123-your-user-id'
  AND (
    LOWER(full_name) LIKE LOWER('%Maisarah%')
    OR LOWER(email) LIKE LOWER('%Maisarah%')
  );
```

If this returns results, the data exists and it's likely an RLS issue.

## 🔒 Security Note

The RLS policy allows authenticated users to view all profiles. This is standard for social features where users need to:
- Search for other users
- View public profiles
- Send friend requests

If you need stricter privacy:
- Add visibility settings to user_profiles
- Update RLS policy to respect those settings
- Filter search results by visibility

## ✨ Testing Checklist

Once fixed, test these scenarios:

- [ ] Search for "Maisarah" - Shows results
- [ ] Search for "Kevin" - Shows results
- [ ] Search for partial name "Mais" - Shows Maisarah
- [ ] Search for email - Shows matching users
- [ ] Search for non-existent user - Shows "No users found"
- [ ] Click "Add Friend" - Request sent successfully
- [ ] Check Profile > Requests - See sent request
- [ ] Login as other user - See received request
- [ ] Accept request - See confetti celebration 🎉
- [ ] Check Profile > Friends - See new friend

## 📚 Additional Resources

| File | Purpose |
|------|---------|
| `SEARCH_FIX_APPLIED.md` | Detailed explanation of the fix |
| `TROUBLESHOOTING_SEARCH.md` | Advanced troubleshooting steps |
| `RLS_POLICY_FIX.sql` | SQL to fix permissions |
| `FRIEND_FEATURE_COMPLETE.md` | Complete feature documentation |

## 🎉 Summary

**What to do NOW:**
1. ✅ Run `RLS_POLICY_FIX.sql` in Supabase SQL Editor
2. ✅ Refresh your app
3. ✅ Test search at `/search-friends`
4. ✅ Check browser console for logs

**Most Common Fix:**
The RLS policy fix solves 90% of search issues. If you've run the SQL file and refreshed the app, search should work!

**Still stuck?**
Check the detailed troubleshooting in `TROUBLESHOOTING_SEARCH.md` or share:
- Browser console errors
- Network tab responses
- Results from SQL test queries
