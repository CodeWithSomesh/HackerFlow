# Dashboard Server Actions - Quick Reference

This document provides a quick reference for all available dashboard server actions.

## Import Statement

```tsx
import {
  // Hacker actions
  getHackerDashboardStats,
  getHackerParticipationHistory,
  getHackerPrizeTracker,
  getHackerTeamMemberships,
  getHackerUpcomingDeadlines,
  getHackerPerformanceAnalytics,
  getHackerBadges,
  getHackerRecentActivity,

  // Organizer actions
  getOrganizerDashboardStats,
  getOrganizerHackathons,
  getHackathonParticipants,
  getHackathonTeams,
  getTeamDetails,
  getHackathonWinners,
  saveHackathonWinners,
  updateWinnerPaymentStatus,
  getOrganizerAnalytics,
  exportParticipants,

  // Notification actions
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification,
} from '@/lib/actions/dashboard-actions'
```

## Hacker Dashboard Actions

### 1. getHackerDashboardStats

**Purpose:** Get overview statistics for hacker dashboard

**Usage:**
```tsx
const result = await getHackerDashboardStats()

if (result.success) {
  console.log(result.data)
  // {
  //   totalParticipations: 10,
  //   hackathonsWon: 3,
  //   totalPrizeMoney: 15000,
  //   activeRegistrations: 2,
  //   winRate: 30.0
  // }
}
```

**Use in:** Overview page - stats cards

---

### 2. getHackerParticipationHistory

**Purpose:** Get paginated participation history with filters

**Usage:**
```tsx
const result = await getHackerParticipationHistory(undefined, {
  status: 'all', // 'all' | 'upcoming' | 'ongoing' | 'completed'
  result: 'all', // 'all' | 'won' | 'participated'
  page: 1,
  limit: 10
})

if (result.success) {
  console.log(result.data) // Array of participation records
  console.log(result.pagination) // { page, limit, total, totalPages }
}
```

**Use in:** Hackathons page - main table

---

### 3. getHackerPrizeTracker

**Purpose:** Get all prizes won with payment status

**Usage:**
```tsx
const result = await getHackerPrizeTracker()

if (result.success) {
  console.log(result.data) // Array of prize records
  console.log(result.summary)
  // {
  //   totalEarned: 15000,
  //   totalCredited: 10000,
  //   totalPending: 3000,
  //   totalProcessing: 2000
  // }
}
```

**Use in:** Prizes page - summary cards and table

---

### 4. getHackerTeamMemberships

**Purpose:** Get all teams user is part of

**Usage:**
```tsx
const result = await getHackerTeamMemberships()

if (result.success) {
  result.data.forEach(team => {
    console.log(team.team_name)
    console.log(team.hackathon_title)
    console.log(team.is_leader)
    console.log(team.members) // Array of team members
  })
}
```

**Use in:** Teams page - team cards

---

### 5. getHackerUpcomingDeadlines

**Purpose:** Get next N upcoming hackathon deadlines

**Usage:**
```tsx
const result = await getHackerUpcomingDeadlines(undefined, 5) // Get next 5

if (result.success) {
  result.data.forEach(deadline => {
    console.log(deadline.title)
    console.log(deadline.deadline)
    console.log(deadline.daysLeft) // Number of days until deadline
  })
}
```

**Use in:** Overview page - upcoming deadlines card

---

### 6. getHackerPerformanceAnalytics

**Purpose:** Get data for performance charts

**Usage:**
```tsx
const result = await getHackerPerformanceAnalytics()

if (result.success) {
  console.log(result.data.participationsOverTime)
  // [{ month: 'Jan 2025', count: 3 }, ...]

  console.log(result.data.winRate)
  // { won: 3, participated: 7 }

  console.log(result.data.categoriesDistribution)
  // [{ category: 'Web Development', count: 5 }, ...]
}
```

**Use in:** Overview page - charts

---

### 7. getHackerBadges

**Purpose:** Get earned badges and progress

**Usage:**
```tsx
const result = await getHackerBadges()

if (result.success) {
  console.log(result.data.earnedBadges)
  // Array of earned badge objects

  console.log(result.data.progress)
  // [
  //   {
  //     badge_type: '5_hackathons',
  //     badge_name: 'Veteran',
  //     current: 3,
  //     target: 5,
  //     percentage: 60
  //   }
  // ]
}
```

**Use in:** Badges page

---

### 8. getHackerRecentActivity

**Purpose:** Get recent activity feed

**Usage:**
```tsx
const result = await getHackerRecentActivity(undefined, 20) // Get last 20

if (result.success) {
  result.data.forEach(activity => {
    console.log(activity.type) // 'registration' | 'win' | 'badge'
    console.log(activity.title)
    console.log(activity.description)
    console.log(activity.timestamp)
    console.log(activity.link) // Navigation link
  })
}
```

**Use in:** Overview page - recent activity card, Activity page

---

## Organizer Dashboard Actions

### 9. getOrganizerDashboardStats

**Purpose:** Get overview statistics for organizer dashboard

**Usage:**
```tsx
const result = await getOrganizerDashboardStats()

if (result.success) {
  console.log(result.data)
  // {
  //   totalHackathons: 5,
  //   totalParticipants: 250,
  //   activeHackathons: 2,
  //   totalPrizePoolDistributed: 50000,
  //   avgParticipantsPerHackathon: 50
  // }
}
```

**Use in:** Organizer overview page - stats cards

---

### 10. getOrganizerHackathons

**Purpose:** Get paginated list of organized hackathons

**Usage:**
```tsx
const result = await getOrganizerHackathons(undefined, {
  status: 'all', // 'all' | 'draft' | 'published' | 'completed' | 'cancelled'
  page: 1,
  limit: 10
})

if (result.success) {
  result.data.forEach(hackathon => {
    console.log(hackathon.title)
    console.log(hackathon.status)
    console.log(hackathon.participant_count) // Added by action
  })
}
```

**Use in:** Organizer hackathons page

---

### 11. getHackathonParticipants

**Purpose:** Get participants for a specific hackathon

**Usage:**
```tsx
const result = await getHackathonParticipants('hackathon-id', {
  type: 'all', // 'all' | 'team' | 'individual'
  search: 'john',
  page: 1,
  limit: 20
})

if (result.success) {
  console.log(result.data) // Array of participants
  console.log(result.pagination)
}
```

**Use in:** Participants management page

---

### 12. getHackathonTeams

**Purpose:** Get all teams for a hackathon

**Usage:**
```tsx
const result = await getHackathonTeams('hackathon-id')

if (result.success) {
  result.data.forEach(team => {
    console.log(team.team_name)
    console.log(team.hackathon_team_members) // Array of members
  })
}
```

**Use in:** Teams list page

---

### 13. getTeamDetails

**Purpose:** Get detailed information about a team

**Usage:**
```tsx
const result = await getTeamDetails('team-id')

if (result.success) {
  console.log(result.data.team_name)
  console.log(result.data.hackathon_team_members) // Detailed member list
}
```

**Use in:** Team detail page

---

### 14. getHackathonWinners

**Purpose:** Get winners for a hackathon

**Usage:**
```tsx
const result = await getHackathonWinners('hackathon-id')

if (result.success) {
  result.data.forEach(winner => {
    console.log(winner.prize_position)
    console.log(winner.prize_amount)
    console.log(winner.payment_status)
    console.log(winner.profile) // User profile info
  })
}
```

**Use in:** Winners management page

---

### 15. saveHackathonWinners

**Purpose:** Save/declare winners for a hackathon

**Usage:**
```tsx
const winnersData = [
  {
    user_id: 'user-uuid',
    team_id: 'team-uuid', // Optional
    prize_position: '1st Place',
    prize_amount: 10000
  },
  // ... more winners
]

const result = await saveHackathonWinners('hackathon-id', winnersData)

if (result.success) {
  console.log('Winners saved!', result.data)
}
```

**Use in:** Winners management page - save button

---

### 16. updateWinnerPaymentStatus

**Purpose:** Update payment status for a winner

**Usage:**
```tsx
const result = await updateWinnerPaymentStatus(
  'winner-id',
  'credited', // 'pending' | 'processing' | 'credited'
  '2025-01-31', // Optional payment date
  'TXN123456' // Optional payment reference
)

if (result.success) {
  console.log('Payment status updated!')
}
```

**Use in:** Winners management page - payment status update

---

### 17. getOrganizerAnalytics

**Purpose:** Get analytics data for charts

**Usage:**
```tsx
// For all hackathons
const result = await getOrganizerAnalytics()

// For specific hackathon
const result = await getOrganizerAnalytics(undefined, 'hackathon-id')

if (result.success) {
  console.log(result.data.registrationTimeline) // For specific hackathon
  console.log(result.data.registrationsOverTime) // For all hackathons
  console.log(result.data.participantDistribution)
  console.log(result.data.participantsPerHackathon)
}
```

**Use in:** Analytics page, Overview page charts

---

### 18. exportParticipants

**Purpose:** Export participant list as CSV

**Usage:**
```tsx
const result = await exportParticipants('hackathon-id', 'csv')

if (result.success) {
  // Create download link
  const blob = new Blob([result.data], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = result.filename
  a.click()
}
```

**Use in:** Participants page - export button

---

## Notification Actions

### 19. getUserNotifications

**Purpose:** Get user's notifications

**Usage:**
```tsx
// Get all notifications
const result = await getUserNotifications()

// Get only unread notifications
const result = await getUserNotifications(undefined, true)

if (result.success) {
  console.log(result.data) // Array of notifications
  console.log(result.unreadCount) // Number of unread
}
```

**Use in:** Notifications dropdown, bell icon badge

---

### 20. markNotificationAsRead

**Purpose:** Mark a single notification as read

**Usage:**
```tsx
const result = await markNotificationAsRead('notification-id')

if (result.success) {
  // Reload notifications
}
```

**Use in:** Notification item click

---

### 21. markAllNotificationsAsRead

**Purpose:** Mark all notifications as read

**Usage:**
```tsx
const result = await markAllNotificationsAsRead()

if (result.success) {
  // Reload notifications
}
```

**Use in:** "Mark all as read" button

---

### 22. createNotification

**Purpose:** Create a new notification (typically used in backend)

**Usage:**
```tsx
const result = await createNotification(
  'user-id',
  'hackathon_update',
  'Hackathon Updated',
  'The hackathon details have been updated',
  '/hackathons/hackathon-id',
  { hackathon_id: 'hackathon-id' }
)
```

**Use in:** Backend processes, admin actions

---

## Error Handling Pattern

All actions follow this pattern:

```tsx
const result = await getHackerDashboardStats()

if (result.success) {
  // Handle success
  const data = result.data
} else {
  // Handle error
  console.error(result.error)
  toast.error(result.error || 'An error occurred')
}
```

## Loading State Pattern

```tsx
const [data, setData] = useState<any>(null)
const [loading, setLoading] = useState(true)

useEffect(() => {
  async function load() {
    setLoading(true)
    const result = await getHackerDashboardStats()
    if (result.success) setData(result.data)
    setLoading(false)
  }
  load()
}, [])

if (loading) return <Skeleton />
if (!data) return <EmptyState />

return <DataDisplay data={data} />
```

## TypeScript Interfaces

All interfaces are exported from `dashboard-actions.ts`:

```tsx
import type {
  HackerDashboardStats,
  OrganizerDashboardStats,
  ParticipationHistory,
  PrizeTracker,
  TeamMembership,
  Notification,
  Badge,
} from '@/lib/actions/dashboard-actions'
```

---

**This reference covers all available server actions. Each action includes proper error handling, authorization checks, and follows the established patterns.**
