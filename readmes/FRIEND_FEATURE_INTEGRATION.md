# Friend Feature Integration Guide

This document outlines the changes needed to integrate the friend feature into the profile page.

## Files Created

### 1. Database Migration
- **File**: `supabase/migrations/20250203000000_create_friend_system.sql`
- **Description**: Creates `friend_requests` and `friendships` tables with RLS policies

### 2. Server Actions
- **File**: `lib/actions/friend-actions.ts`
- **Description**: Contains all friend-related server actions (search, send/accept/reject requests, get friends list, etc.)

### 3. Components
- **File**: `components/friend-celebration-modal.tsx`
- **Description**: Confetti celebration modal shown when users become friends
- **File**: `components/friend-request-button.tsx`
- **Description**: Reusable button component for friend requests (Add Friend, Accept, Reject, etc.)
- **File**: `components/profile-friends-tab.tsx`
- **Description**: Friends tab content for profile page
- **File**: `components/profile-requests-tab.tsx`
- **Description**: Friend requests tab content for profile page

### 4. Pages
- **File**: `app/search-friends/page.tsx`
- **Description**: Search page for finding users to befriend
- **File**: `app/profile/[userId]/page.tsx`
- **Description**: View other users' profiles with friend request button

## Changes Needed to `app/profile/page.tsx`

### Step 1: Add imports at the top of the file (after line 46)

```typescript
import { ProfileFriendsTab } from "@/components/profile-friends-tab"
import { ProfileRequestsTab } from "@/components/profile-requests-tab"
import { getFriendCounts } from "@/lib/actions/friend-actions"
import { Inbox } from "lucide-react"  // Add to existing lucide-react imports
```

### Step 2: Add state for friend counts (after line 50, near other useState declarations)

```typescript
const [friendCounts, setFriendCounts] = useState({ friendCount: 0, pendingRequestCount: 0 })
```

### Step 3: Add useEffect to load friend counts (after line 110, after loadUserProfile is defined)

```typescript
useEffect(() => {
  loadFriendCounts()
}, [])

const loadFriendCounts = async () => {
  const result = await getFriendCounts()
  if (result.success && result.data) {
    setFriendCounts(result.data)
  }
}
```

### Step 4: Update the tabs array (line 796)

**OLD:**
```typescript
{["overview", "github", "activity"].map((tab) => (
```

**NEW:**
```typescript
{["overview", "friends", "requests", "github", "activity"].map((tab) => (
```

### Step 5: Add badge for requests tab (modify the tab button, around line 800)

**Find this section:**
```typescript
<button
  key={tab}
  onClick={() => setActiveTab(tab)}
  className={`px-6 py-3 rounded-xl font-mono font-bold capitalize transition-all whitespace-nowrap ${
    activeTab === tab
      ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
      : "bg-gray-900/50 text-gray-400 hover:text-white hover:bg-gray-900"
  }`}
>
  {tab}
</button>
```

**REPLACE WITH:**
```typescript
<button
  key={tab}
  onClick={() => setActiveTab(tab)}
  className={`px-6 py-3 rounded-xl font-mono font-bold capitalize transition-all whitespace-nowrap ${
    activeTab === tab
      ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
      : "bg-gray-900/50 text-gray-400 hover:text-white hover:bg-gray-900"
  }`}
>
  <span className="flex items-center gap-2">
    {tab}
    {tab === "friends" && friendCounts.friendCount > 0 && (
      <span className="px-2 py-0.5 bg-teal-500 rounded-full text-xs">
        {friendCounts.friendCount}
      </span>
    )}
    {tab === "requests" && friendCounts.pendingRequestCount > 0 && (
      <span className="px-2 py-0.5 bg-pink-500 rounded-full text-xs animate-pulse">
        {friendCounts.pendingRequestCount}
      </span>
    )}
  </span>
</button>
```

### Step 6: Add tab content for friends and requests (after line 1415, after the github tab content ends)

**Find this section:**
```typescript
{activeTab === "github" && userData.githubConnected && (
  // ... github tab content ...
)}

{activeTab === "activity" && (
  // ... activity tab content ...
)}
```

**ADD BEFORE the activity tab:**
```typescript
{activeTab === "friends" && (
  <ProfileFriendsTab />
)}

{activeTab === "requests" && (
  <ProfileRequestsTab />
)}
```

## Database Setup

Run the migration to create the friend system tables:

```bash
npx supabase db reset
```

Or if using a remote database:
```bash
npx supabase db push
```

## Testing Checklist

1. [ ] Run database migration successfully
2. [ ] Search for users on `/search-friends` page
3. [ ] Send a friend request
4. [ ] View sent requests in profile > requests tab
5. [ ] Accept a friend request (should show confetti modal)
6. [ ] View friends in profile > friends tab
7. [ ] Visit another user's profile via `/profile/[userId]`
8. [ ] Unfriend a user
9. [ ] Reject a friend request
10. [ ] Cancel a sent friend request

## Additional Features

- Real-time search with debouncing
- Friend count badges on tabs
- Confetti celebration when becoming friends
- Profile images with fallback avatars
- Skill tags for hackers
- Location information
- Responsive design matching HackerFlow theme
