# HackerFlow Dashboard Setup Guide

## Step 1: Apply Database Migration

You need to apply the SQL migration to create the required tables for the dashboard system.

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://app.supabase.com/project/azsdbblffealwkxrhqae
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/20250131000000_create_dashboard_tables.sql`
5. Paste into the SQL editor
6. Click **Run** to execute the migration

### Option B: Using Supabase CLI (If you have it set up)

```bash
# Make sure you're logged in to Supabase CLI
npx supabase login

# Link your project
npx supabase link --project-ref azsdbblffealwkxrhqae

# Push the migration
npx supabase db push
```

### Verify Migration Success

After running the migration, verify that the following tables were created:

1. **hackathon_winners** - Stores prize winner information
2. **notifications** - Stores user notifications
3. **user_badges** - Stores earned achievement badges

You can verify by going to **Table Editor** in your Supabase dashboard and checking if these tables exist.

## Step 2: Install Required Dependencies

The dashboard uses additional UI components. Install them:

```bash
npm install recharts date-fns lucide-react @radix-ui/react-avatar @radix-ui/react-dropdown-menu @radix-ui/react-popover @radix-ui/react-separator
```

Or if using pnpm:

```bash
pnpm add recharts date-fns lucide-react @radix-ui/react-avatar @radix-ui/react-dropdown-menu @radix-ui/react-popover @radix-ui/react-separator
```

## Step 3: Testing the Setup

### Test Database Functions

The migration includes automatic badge award functions and notification triggers. To test:

1. Register for a hackathon (should trigger a registration notification)
2. Check the `notifications` table - you should see a new entry
3. Check the `user_badges` table - you should see a "First Step" badge if it's your first participation

### Test Server Actions

The dashboard server actions are available at `/lib/actions/dashboard-actions.ts`. You can test them by:

1. Running the dev server: `npm run dev`
2. Navigating to the dashboard (once we build it)
3. Checking the browser console and network tab for any errors

## Step 4: What's Next

The dashboard implementation includes:

### For Hackers:
- **Overview** - Stats, charts, upcoming deadlines, recent activity
- **Hackathons** - Participation history with filters
- **Teams** - Team memberships and details
- **Prizes** - Prize tracker with payment status
- **Badges** - Achievements and progress
- **Activity** - Complete activity timeline

### For Organizers:
- **Overview** - Hackathon stats and analytics
- **Hackathons** - Manage all your hackathons
- **Participants** - View and manage registrations
- **Teams** - View team details
- **Winners** - Declare winners and track payments
- **Analytics** - Detailed charts and insights
- **Calendar** - Event timeline view

### Shared Features:
- **Notifications** - Real-time notification system with bell icon
- **Role Switcher** - For users who are both hackers and organizers
- **Settings** - Profile and notification preferences

## Troubleshooting

### Migration Errors

If you encounter errors when running the migration:

1. **"relation already exists"** - Tables might already exist. Drop them first or modify the migration to use `IF NOT EXISTS` (already included).

2. **"permission denied"** - Ensure you're using a user with sufficient privileges.

3. **"RLS policies"** - If RLS policies fail, check that the referenced tables exist.

### Runtime Errors

If you encounter errors in the dashboard:

1. **"User not authenticated"** - Ensure you're logged in before accessing dashboard pages.

2. **"Unauthorized"** - Check that RLS policies are correctly applied.

3. **Data not loading** - Check browser console and network tab for API errors.

## Badge System

The system automatically awards badges based on user activity:

| Badge | Criteria |
|-------|----------|
| First Step | Participate in first hackathon |
| Victory Royale | Win first hackathon |
| Veteran | Participate in 5 hackathons |
| Legend | Participate in 10 hackathons |
| Team Player | Participate in 5 team hackathons |
| Solo Champion | Win an individual hackathon |

## Notification Types

Automatic notifications are created for:

- **registration** - When user registers for a hackathon
- **team_invite** - When invited to join a team
- **winner_announcement** - When declared as a winner
- **payment_update** - When prize payment status changes
- **hackathon_update** - When organizer updates hackathon details

## Security Notes

All tables have Row Level Security (RLS) enabled:

- Users can only view their own data (registrations, prizes, notifications, badges)
- Organizers can only manage their own hackathons
- Team members can view their team details
- Public badge viewing is allowed for leaderboards/profiles

## Support

If you encounter any issues:

1. Check the browser console for JavaScript errors
2. Check the Supabase logs in your dashboard
3. Verify that all RLS policies are correctly applied
4. Ensure all server actions are properly imported

## Next Steps

Once the migration is applied and dependencies are installed:

1. I'll build the dashboard layout with sidebar navigation
2. Create all the hacker dashboard pages
3. Create all the organizer dashboard pages
4. Add shared components (notifications, settings, etc.)
5. Test the complete system

Ready to proceed? Let me know once you've applied the migration!
