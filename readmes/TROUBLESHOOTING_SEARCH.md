# Troubleshooting Friend Search Issue

## Problem
The search functionality shows "No users found" even when searching for existing users.

## Root Cause Analysis

The issue is most likely one of the following:

### 1. **Database Migration Not Run** (Most Likely)
The SQL migration file was created but not executed in your Supabase database. The `search_users` function doesn't exist yet.

### 2. **RLS Policies Blocking Access**
Row Level Security might be preventing the function from accessing user_profiles table.

### 3. **Function Permissions**
The function might not have proper permissions for authenticated users.

## Solutions

### Solution 1: Run the Database Migration (REQUIRED)

**Step-by-step:**

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "+ New Query"

3. **Copy and Paste the Migration**
   - Open `supabase/migrations/20250203000000_create_friend_system.sql`
   - Copy ALL the content (entire file)
   - Paste into the SQL Editor

4. **Execute the Migration**
   - Click "Run" or press Ctrl+Enter
   - Wait for success message
   - Check for any errors in the output

### Solution 2: Verify the Function Exists

After running the migration, verify the function was created:

```sql
-- Run this in SQL Editor to check if function exists
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'search_users';
```

Expected result: Should return 1 row showing `search_users` function exists.

### Solution 3: Test the Function Directly

Run this test query to verify the function works:

```sql
-- Replace 'YOUR_USER_ID_HERE' with your actual user ID
-- You can find your user ID by running: SELECT auth.uid();

SELECT * FROM search_users(
  'Maisarah',  -- search query
  auth.uid(),  -- current user ID (automatically gets your ID)
  20           -- limit
);
```

### Solution 4: Check User Profiles Table

Verify users exist in the database:

```sql
SELECT
  user_id,
  full_name,
  email,
  user_primary_type
FROM user_profiles
LIMIT 10;
```

This should show all users in your database.

### Solution 5: Check RLS Policies

Verify RLS policies allow reading user_profiles:

```sql
-- Check if RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'user_profiles';

-- Check existing policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'user_profiles';
```

### Solution 6: Grant Permissions to Function

If the function exists but doesn't work, ensure it has proper permissions:

```sql
-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_users(TEXT, UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_friend_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_request_count(UUID) TO authenticated;
```

## Debugging Steps

### 1. Check Browser Console
Open Chrome DevTools (F12) and check for:
- Network errors (look for failed API calls)
- Console errors (JavaScript errors)
- Check the response from the RPC call

### 2. Enable Detailed Error Logging

Temporarily add more logging to the search function:

In `lib/actions/friend-actions.ts`, update the searchUsers function:

```typescript
export async function searchUsers(query: string) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('🔍 Search - Current User:', user?.id)

    if (authError || !user) {
      console.error('❌ Auth Error:', authError)
      return { success: false, error: 'User not authenticated' }
    }

    if (!query || query.trim().length === 0) {
      console.log('⚠️ Empty query')
      return { success: true, data: [] }
    }

    console.log('🔍 Searching for:', query.trim())

    // Use the database function for searching
    const { data, error } = await supabase
      .rpc('search_users', {
        p_search_query: query.trim(),
        p_current_user_id: user.id,
        p_limit: 20
      })

    console.log('📊 Search Results:', data)
    console.log('❌ Search Error:', error)

    if (error) {
      console.error('Search error details:', error)
      return { success: false, error: `Search failed: ${error.message}` }
    }

    return { success: true, data: data as SearchUserResult[] }
  } catch (error) {
    console.error('Error in searchUsers:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
```

Then check the browser console when searching.

### 3. Test with Direct SQL Query

In Supabase SQL Editor, run:

```sql
-- Test search directly
SELECT
  user_id,
  full_name,
  email,
  user_primary_type
FROM user_profiles
WHERE user_id != auth.uid()
  AND (
    LOWER(full_name) LIKE LOWER('%Maisarah%')
    OR LOWER(email) LIKE LOWER('%Maisarah%')
  );
```

If this returns results, the data exists and the issue is with the function.

## Quick Fix: Alternative Search Implementation

If the RPC function continues to have issues, you can temporarily use a direct query approach:

Create a new file: `lib/actions/friend-actions-fallback.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

export async function searchUsersDirect(query: string) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    if (!query || query.trim().length === 0) {
      return { success: true, data: [] }
    }

    // Direct query without RPC
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        user_id,
        full_name,
        email,
        bio,
        city,
        state,
        country,
        profile_image,
        user_primary_type,
        programming_languages,
        frameworks,
        experience_level,
        organization_name,
        position
      `)
      .neq('user_id', user.id)
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(20)

    if (error) {
      console.error('Search error:', error)
      return { success: false, error: `Search failed: ${error.message}` }
    }

    // Check friendship status for each user
    const enrichedData = await Promise.all(
      data.map(async (profile) => {
        // Check if friends
        const { data: friendship } = await supabase
          .from('friendships')
          .select('id')
          .or(`and(user_id_1.eq.${user.id < profile.user_id ? user.id : profile.user_id},user_id_2.eq.${user.id < profile.user_id ? profile.user_id : user.id})`)
          .maybeSingle()

        // Check friend request status
        const { data: request } = await supabase
          .from('friend_requests')
          .select('status, sender_id')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${profile.user_id}),and(sender_id.eq.${profile.user_id},receiver_id.eq.${user.id})`)
          .maybeSingle()

        return {
          ...profile,
          is_friend: !!friendship,
          friend_request_status: request?.status || null,
          friend_request_direction: request
            ? request.sender_id === user.id
              ? 'sent'
              : 'received'
            : null
        }
      })
    )

    return { success: true, data: enrichedData }
  } catch (error) {
    console.error('Error in searchUsersDirect:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
```

Then update `app/search-friends/page.tsx` to use the fallback:

```typescript
// Change this import
import { searchUsers } from '@/lib/actions/friend-actions'

// To this temporarily
import { searchUsersDirect as searchUsers } from '@/lib/actions/friend-actions-fallback'
```

## Expected Behavior

Once fixed, when you search for "Maisarah" or "Kevin":
1. Search bar shows loading spinner
2. Results appear within 300ms
3. User cards show with profile images, details, and "Add Friend" button

## Still Not Working?

If none of the above works, please:

1. Share the exact error message from browser console
2. Run this query and share the result:
   ```sql
   SELECT COUNT(*) as user_count FROM user_profiles;
   ```
3. Check if Supabase project URL and anon key are correct in `.env.local`
4. Verify your Supabase project is not paused/suspended

## Contact

If you continue experiencing issues, please provide:
- Browser console errors (F12 → Console tab)
- Network tab errors (F12 → Network tab, filter by "supabase")
- Result of the SQL test queries above
