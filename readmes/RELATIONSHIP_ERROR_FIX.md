# Friend Requests Relationship Error - FIXED ✅

## Error Message
```
❌ Failed to load received requests: "Failed to get requests: Could not find a relationship between 'friend_requests' and 'sender_id' in the schema cache"

❌ Failed to load sent requests: "Failed to get sent requests: Could not find a relationship between 'friend_requests' and 'receiver_id' in the schema cache"
```

## Root Cause

The Supabase query was trying to use **automatic joins** with this syntax:
```typescript
.select(`
  *,
  sender:sender_id (
    user_id,
    full_name,
    email,
    ...
  )
`)
```

This syntax requires **foreign key relationships** to be defined in the database schema. However, the `friend_requests` table doesn't have foreign key constraints linking `sender_id` and `receiver_id` to the `user_profiles` table, so Supabase doesn't know how to perform the join.

## Solution Applied

Changed from **automatic joins** to **manual data enrichment**:

### Before (Broken):
```typescript
// This tries to join automatically but fails
const { data, error } = await supabase
  .from('friend_requests')
  .select(`
    *,
    sender:sender_id (
      user_id,
      full_name,
      ...
    )
  `)
```

### After (Working):
```typescript
// Step 1: Get requests without joins
const { data: requests, error } = await supabase
  .from('friend_requests')
  .select('*')
  .eq('receiver_id', user.id)
  .eq('status', 'pending')

// Step 2: Manually fetch user profiles
const enrichedRequests = await Promise.all(
  requests.map(async (request) => {
    const { data: senderProfile } = await supabase
      .from('user_profiles')
      .select('user_id, full_name, email, ...')
      .eq('user_id', request.sender_id)
      .single()

    return {
      ...request,
      sender: senderProfile
    }
  })
)
```

## Files Changed

### 1. lib/actions/friend-actions.ts

**Function: `getPendingFriendRequests()`**
- Removed automatic join syntax
- Now fetches `friend_requests` first
- Then fetches `user_profiles` for each sender
- Returns enriched data with sender information

**Function: `getSentFriendRequests()`**
- Removed automatic join syntax
- Now fetches `friend_requests` first
- Then fetches `user_profiles` for each receiver
- Returns enriched data with receiver information

## How It Works Now

### Loading Received Requests:
1. ✅ Query `friend_requests` table for requests where `receiver_id = current_user`
2. ✅ For each request, query `user_profiles` table for sender's profile
3. ✅ Combine the data: `{ ...request, sender: senderProfile }`
4. ✅ Return enriched array to component

### Loading Sent Requests:
1. ✅ Query `friend_requests` table for requests where `sender_id = current_user`
2. ✅ For each request, query `user_profiles` table for receiver's profile
3. ✅ Combine the data: `{ ...request, receiver: receiverProfile }`
4. ✅ Return enriched array to component

## Performance Impact

**Trade-off:**
- **Before:** 1 database query (if joins worked)
- **After:** 1 + N database queries (where N = number of requests)

**Example:**
- If you have 3 pending requests
- Makes 1 query for requests + 3 queries for profiles = 4 total queries

**Optimization for Production:**
- Could batch profile queries using `IN` clause:
  ```typescript
  const senderIds = requests.map(r => r.sender_id)
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('*')
    .in('user_id', senderIds)
  ```
- This would reduce to 2 queries total regardless of number of requests

## Testing

After this fix, you should see:

**Console logs:**
```
🔄 Loading friend requests...
📥 Received requests: 2
📤 Sent requests: 1
```

**No errors:**
- ✅ No "relationship not found" errors
- ✅ Requests load successfully
- ✅ Sender/receiver profiles display correctly

## Verification Steps

1. ✅ **Send a friend request**
   - Go to `/search-friends`
   - Search for a user
   - Click "Add Friend"

2. ✅ **Check Sent tab**
   - Go to Profile > Requests > Sent
   - Should show the request with receiver's name and profile

3. ✅ **Switch accounts**
   - Login as the other user

4. ✅ **Check Received tab**
   - Go to Profile > Requests > Received
   - Should show the request with sender's name and profile
   - ✅ Should see profile image, name, email, type badge

5. ✅ **Accept request**
   - Click "Accept"
   - ✅ Should show confetti
   - ✅ Should add to Friends tab

## Alternative Solution (If you want proper foreign keys)

If you want to add proper foreign key constraints to enable automatic joins:

```sql
-- Add foreign key constraints
ALTER TABLE friend_requests
  ADD CONSTRAINT fk_sender
  FOREIGN KEY (sender_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

ALTER TABLE friend_requests
  ADD CONSTRAINT fk_receiver
  FOREIGN KEY (receiver_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;
```

However, this requires that `friend_requests.sender_id` and `receiver_id` reference `auth.users(id)`, not `user_profiles.user_id`. The current manual approach works regardless of foreign keys.

## Summary

✅ **Fixed the "relationship not found" errors**
✅ **Friend requests now load correctly**
✅ **Sender/receiver profiles display properly**
✅ **No database schema changes required**
✅ **Works with existing data**

The friend request system should now work perfectly! 🎉
