# HackerFlow Dashboard - Implementation Guide

## What's Been Built

### ✅ Completed Components

1. **Database Migration File** (`supabase/migrations/20250131000000_create_dashboard_tables.sql`)
   - `hackathon_winners` table with RLS policies
   - `notifications` table with RLS policies
   - `user_badges` table with RLS policies
   - Auto-badge award functions
   - Auto-notification triggers
   - Payment status update triggers

2. **Server Actions** (`lib/actions/dashboard-actions.ts`)
   - All Hacker Dashboard actions (stats, history, prizes, teams, badges, analytics, activity)
   - All Organizer Dashboard actions (stats, hackathons, participants, teams, winners, analytics, export)
   - Shared notification actions
   - Complete TypeScript interfaces

3. **Dashboard Infrastructure**
   - Sidebar UI component (`components/ui/sidebar.tsx`)
   - Main dashboard routing (`app/dashboard/page.tsx`)
   - Dashboard layout (`app/dashboard/layout.tsx`)

4. **Hacker Dashboard**
   - Layout with sidebar navigation (`app/dashboard/hacker/layout.tsx`)
   - Overview page with stats, charts, deadlines, activity (`app/dashboard/hacker/page.tsx`)
   - Hackathons page with data table and filters (`app/dashboard/hacker/hackathons/page.tsx`)

### 📋 Remaining Pages to Build

#### Hacker Dashboard Pages

1. **Teams Page** (`app/dashboard/hacker/teams/page.tsx`)
   - Display all team memberships as cards
   - Show team details (hackathon, members, status)
   - Filter by hackathon or role
   - Link to team details

2. **Prizes Page** (`app/dashboard/hacker/prizes/page.tsx`)
   - Summary cards (total earned, credited, pending, processing)
   - Prize table with payment status
   - Filter by payment status
   - Click rows to view hackathon details

3. **Badges Page** (`app/dashboard/hacker/badges/page.tsx`)
   - Grid of earned badges with icons
   - Progress bars toward next badges
   - Motivational copy

4. **Activity Page** (`app/dashboard/hacker/activity/page.tsx`)
   - Timeline of all activities
   - Grouped by date
   - Filter by activity type
   - Infinite scroll or pagination

#### Organizer Dashboard Pages

5. **Organizer Layout** (`app/dashboard/organizer/layout.tsx`)
   - Similar to hacker layout but with organizer navigation
   - Navigation items: Overview, Hackathons, Calendar, Analytics, Settings

6. **Organizer Overview** (`app/dashboard/organizer/page.tsx`)
   - Stats cards (total hackathons, participants, active events, prize pool)
   - Charts (registrations over time, participants per hackathon, team vs individual)
   - Recent hackathons table

7. **Organizer Hackathons** (`app/dashboard/organizer/hackathons/page.tsx`)
   - Data table with all hackathons
   - Filters by status
   - Actions: View, Edit, Manage Participants, Manage Winners
   - Create new hackathon button

8. **Hackathon Detail** (`app/dashboard/organizer/hackathons/[id]/page.tsx`)
   - Overview with stats
   - Tabs: Overview, Participants, Teams, Winners, Analytics

9. **Participants Management** (`app/dashboard/organizer/hackathons/[id]/participants/page.tsx`)
   - Tabs: All, Teams, Individuals
   - Data table with participant details
   - Bulk actions, export

10. **Winners Management** (`app/dashboard/organizer/hackathons/[id]/winners/page.tsx`)
    - Select winners interface
    - Payment tracking table
    - Update payment status

#### Shared Pages

11. **Settings Page** (`app/dashboard/settings/page.tsx`)
    - Profile settings
    - Notification preferences
    - Privacy settings
    - Account settings

## Installation Steps

### Step 1: Apply Database Migration

**IMPORTANT:** You must run this first before testing the dashboard.

1. Go to [Supabase SQL Editor](https://app.supabase.com/project/azsdbblffealwkxrhqae/sql/new)
2. Copy the entire contents of `supabase/migrations/20250131000000_create_dashboard_tables.sql`
3. Paste into the editor and click **Run**
4. Verify tables created: Go to Table Editor and check for `hackathon_winners`, `notifications`, `user_badges`

### Step 2: Install Dependencies

```bash
npm install recharts date-fns
# or
pnpm add recharts date-fns
```

### Step 3: Test What's Built

```bash
npm run dev
```

Navigate to `/dashboard` while logged in. You should be redirected to either:
- `/dashboard/hacker` if you're a hacker
- `/dashboard/organizer` if you're an organizer

Test the following:
1. Overview page loads with stats and charts
2. Hackathons page shows your participation history
3. Notifications bell icon shows notifications
4. Sidebar navigation works
5. Mobile menu works

## Building Remaining Pages

### Template Structure

Each page follows this pattern:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getServerAction } from '@/lib/actions/dashboard-actions'

export default function PageName() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const result = await getServerAction()
    if (result.success) setData(result.data)
    setLoading(false)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6">
      {/* Your page content */}
    </div>
  )
}
```

### Quick Start Templates

#### Teams Page Template

```tsx
// app/dashboard/hacker/teams/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { getHackerTeamMemberships } from '@/lib/actions/dashboard-actions'
import { Card } from '@/components/ui/card'
import { Users, Crown } from 'lucide-react'

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const result = await getHackerTeamMemberships()
      if (result.success) setTeams(result.data)
    }
    load()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-4xl font-blackops text-teal-400 mb-6">MY TEAMS</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map(team => (
          <Card key={team.id} className="bg-gray-900 border-gray-800">
            {/* Team card content */}
          </Card>
        ))}
      </div>
    </div>
  )
}
```

#### Prizes Page Template

```tsx
// app/dashboard/hacker/prizes/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { getHackerPrizeTracker } from '@/lib/actions/dashboard-actions'
import { Card } from '@/components/ui/card'
import { Trophy } from 'lucide-react'

export default function PrizesPage() {
  const [prizes, setPrizes] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)

  useEffect(() => {
    async function load() {
      const result = await getHackerPrizeTracker()
      if (result.success) {
        setPrizes(result.data)
        setSummary(result.summary)
      }
    }
    load()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-4xl font-blackops text-teal-400 mb-6">MY PRIZES</h1>
      {/* Summary cards */}
      {/* Prize table */}
    </div>
  )
}
```

#### Organizer Layout Template

```tsx
// app/dashboard/organizer/layout.tsx
'use client'

// Copy structure from app/dashboard/hacker/layout.tsx
// Change navigation items to:
// - Overview
// - Hackathons
// - Calendar
// - Analytics
// - Settings
```

## Design Guidelines

### Colors & Theming

Use the existing color scheme:
- Primary: Teal (`#14b8a6`, `text-teal-400`, `bg-teal-500`)
- Secondary: Cyan (`#06b6d4`, `text-cyan-400`)
- Accent: Purple (`#8b5cf6`, `text-purple-400`)
- Success: Green (`#10b981`, `text-green-400`)
- Warning: Yellow (`#f59e0b`, `text-yellow-400`)
- Error: Red (`#ef4444`, `text-red-400`)

### Typography

- **Headings:** `font-blackops` (Black Ops One)
- **Body:** `font-mono` (default monospace)
- **Page Titles:** `text-4xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-purple-400`

### Card Styles

```tsx
<Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
  {/* Content */}
</Card>
```

### Gradient Backgrounds

```tsx
className="bg-gradient-to-br from-blue-500/10 to-blue-700/10 border-2 border-blue-500/50"
```

### Status Badges

```tsx
// Open/Active
<Badge className="bg-green-600 text-white">Open</Badge>

// Closing Soon
<Badge className="bg-yellow-600 text-black animate-pulse">Closing Soon</Badge>

// Closed/Completed
<Badge variant="secondary" className="bg-gray-700">Closed</Badge>

// Winner
<Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black">
  <Trophy className="h-3 w-3 mr-1" />
  Winner
</Badge>
```

### Buttons

```tsx
// Primary action
<Button className="bg-teal-600 hover:bg-teal-500 text-white font-mono font-bold">
  Action
</Button>

// Secondary action
<Button variant="outline" className="text-teal-400 border-teal-400 hover:bg-teal-400 hover:text-black">
  Secondary
</Button>

// Ghost action
<Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-gray-800">
  Cancel
</Button>
```

## Data Table Pattern

For all list views, use this pattern:

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

<Table>
  <TableHeader>
    <TableRow className="border-gray-800 hover:bg-gray-900">
      <TableHead className="text-gray-300 font-mono">Column</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map(item => (
      <TableRow key={item.id} className="border-gray-800 hover:bg-gray-900/50">
        <TableCell className="text-gray-300 font-mono">
          {item.value}
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

## Empty States Pattern

```tsx
import { Calendar } from 'lucide-react'

{data.length === 0 && (
  <div className="flex flex-col items-center justify-center py-16">
    <Calendar className="h-16 w-16 text-gray-600 mb-4" />
    <h3 className="text-xl font-blackops text-white mb-2">No Data Found</h3>
    <p className="text-gray-400 font-mono text-sm mb-6">
      Description of empty state
    </p>
    <Button>Call to Action</Button>
  </div>
)}
```

## Loading States Pattern

```tsx
import { Skeleton } from '@/components/ui/skeleton'

{loading && (
  <div className="space-y-4">
    {[1, 2, 3].map(i => (
      <Skeleton key={i} className="h-16" />
    ))}
  </div>
)}
```

## Chart Configuration

For all charts using Recharts:

```tsx
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
    <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
    <Tooltip
      contentStyle={{
        backgroundColor: '#1f2937',
        border: '1px solid #374151',
        borderRadius: '8px',
      }}
    />
    <Line type="monotone" dataKey="count" stroke="#14b8a6" strokeWidth={3} />
  </LineChart>
</ResponsiveContainer>
```

## Testing Checklist

### Hacker Dashboard
- [ ] Overview page loads with correct stats
- [ ] Charts display data correctly
- [ ] Upcoming deadlines show with correct urgency colors
- [ ] Recent activity displays properly
- [ ] Hackathons page filters work
- [ ] Search functionality works
- [ ] Export to CSV works
- [ ] Pagination works
- [ ] Teams page shows all memberships
- [ ] Prizes page shows payment status
- [ ] Badges page shows earned badges and progress
- [ ] Activity page timeline works

### Organizer Dashboard
- [ ] Overview page loads with organizer stats
- [ ] Hackathons list shows all created events
- [ ] Participant management works
- [ ] Team details load correctly
- [ ] Winner selection works
- [ ] Payment status updates work
- [ ] Analytics charts display
- [ ] Export participants works

### Shared Features
- [ ] Notifications load and update
- [ ] Mark as read works
- [ ] Notification click navigation works
- [ ] Settings page saves preferences
- [ ] Sidebar navigation works on desktop
- [ ] Mobile menu works on mobile
- [ ] User menu dropdown works
- [ ] Sign out works

### Security
- [ ] Users can only see their own data
- [ ] Organizers can only manage their hackathons
- [ ] RLS policies prevent unauthorized access
- [ ] Payment info only visible to organizers

## Common Issues & Solutions

### Issue: Migration fails with "relation already exists"
**Solution:** Tables might exist. Check Supabase Table Editor and delete old tables first, or modify migration to use IF NOT EXISTS (already included).

### Issue: "User not authenticated" errors
**Solution:** Ensure user is logged in before accessing dashboard. Check auth state in layout.

### Issue: Notifications not appearing
**Solution:** Check that notification triggers are created. Insert test notification manually to verify.

### Issue: Charts not rendering
**Solution:** Ensure recharts is installed (`npm install recharts`). Check that data is in correct format.

### Issue: Images not loading
**Solution:** Add image domain to `next.config.js`:
```js
images: {
  domains: ['azsdbblffealwkxrhqae.supabase.co'],
}
```

## Next Steps

1. **Complete Remaining Hacker Pages**
   - Create teams, prizes, badges, activity pages using templates above

2. **Build Organizer Dashboard**
   - Copy hacker layout structure
   - Modify navigation items
   - Create organizer pages using similar patterns

3. **Add Settings Page**
   - Profile update form
   - Notification preferences
   - Account management

4. **Polish & Test**
   - Test all features thoroughly
   - Fix any bugs
   - Optimize performance
   - Add error boundaries

5. **Deploy**
   - Push to production
   - Monitor for errors
   - Gather user feedback

## Support & Resources

- **Server Actions:** All data fetching logic is in `/lib/actions/dashboard-actions.ts`
- **UI Components:** ShadCN components in `/components/ui/`
- **Supabase Dashboard:** https://app.supabase.com/project/azsdbblffealwkxrhqae
- **Design Reference:** See `/app/hackathons/page.tsx` and `/app/auth/sign-up-success/page.tsx`

## File Structure Summary

```
app/
├── dashboard/
│   ├── page.tsx (router)
│   ├── layout.tsx (wrapper)
│   ├── hacker/
│   │   ├── layout.tsx (sidebar + navigation) ✅
│   │   ├── page.tsx (overview) ✅
│   │   ├── hackathons/
│   │   │   └── page.tsx ✅
│   │   ├── teams/
│   │   │   └── page.tsx ⏳
│   │   ├── prizes/
│   │   │   └── page.tsx ⏳
│   │   ├── badges/
│   │   │   └── page.tsx ⏳
│   │   └── activity/
│   │       └── page.tsx ⏳
│   ├── organizer/
│   │   ├── layout.tsx ⏳
│   │   ├── page.tsx ⏳
│   │   ├── hackathons/
│   │   │   ├── page.tsx ⏳
│   │   │   └── [id]/
│   │   │       ├── page.tsx ⏳
│   │   │       ├── participants/
│   │   │       │   └── page.tsx ⏳
│   │   │       ├── teams/
│   │   │       │   └── page.tsx ⏳
│   │   │       ├── winners/
│   │   │       │   └── page.tsx ⏳
│   │   │       └── analytics/
│   │   │           └── page.tsx ⏳
│   │   └── calendar/
│   │       └── page.tsx ⏳
│   └── settings/
│       └── page.tsx ⏳

lib/
└── actions/
    └── dashboard-actions.ts ✅

components/
└── ui/
    └── sidebar.tsx ✅

supabase/
└── migrations/
    └── 20250131000000_create_dashboard_tables.sql ✅
```

✅ = Completed
⏳ = Needs to be built

---

**You now have all the infrastructure, server actions, and core pages needed to complete the dashboard system. The remaining pages follow the same patterns shown in the completed pages. Good luck with the implementation!**
