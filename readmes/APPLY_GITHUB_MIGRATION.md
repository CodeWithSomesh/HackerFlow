# How to Apply GitHub Data Tables Migration

The GitHub profile sync feature requires three new database tables that don't currently exist in your Supabase database.

## Quick Fix - Option 1: Using Supabase Dashboard (RECOMMENDED)

1. Open your Supabase project dashboard
2. Go to the **SQL Editor** tab
3. Click **New Query**
4. Copy and paste the ENTIRE contents of this file: `supabase/migrations/20250204000000_create_github_data_tables.sql`
5. Click **Run** or press `Ctrl+Enter`
6. Verify the tables were created by going to **Table Editor** and checking for:
   - `github_stats`
   - `github_repositories`
   - `github_languages`

## Option 2: Using Supabase CLI (if Docker is running)

```bash
npx supabase db push
```

## What This Migration Does

This migration creates three new tables:

1. **github_stats** - Stores GitHub statistics (contributions, repos, followers, stars, streaks)
2. **github_repositories** - Stores user repositories with metadata
3. **github_languages** - Stores top programming languages with percentages

All tables have:
- Proper foreign key relationships to `auth.users`
- Row Level Security (RLS) enabled with appropriate policies
- Indexes for performance
- Public read access (so anyone can view profiles)
- Authenticated write access (so users can update their own data)

## After Applying the Migration

Once you've applied the migration:
1. Refresh your application
2. Go to your Profile page
3. If you have GitHub connected, it will automatically sync your data
4. Other users will now be able to see your GitHub stats when they visit your profile!

## Troubleshooting

If you get errors about existing tables, the migration might have partially applied. You can:
1. Drop the existing incomplete tables in SQL Editor:
   ```sql
   DROP TABLE IF EXISTS github_languages CASCADE;
   DROP TABLE IF EXISTS github_repositories CASCADE;
   DROP TABLE IF EXISTS github_stats CASCADE;
   ```
2. Then re-run the full migration SQL
