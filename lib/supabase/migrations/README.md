# Database Migrations

This folder contains SQL migration files for the Hacker Flow database.

## How to Apply Migrations

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of the migration file (e.g., `001_add_conversations_and_hackathon_fields.sql`)
5. Paste into the SQL editor
6. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Navigate to your project root
cd c:\Users\User\FYP\hacker-flow

# Apply the migration
supabase db push

# Or run a specific migration file
supabase db execute --file lib/supabase/migrations/001_add_conversations_and_hackathon_fields.sql
```

## Migration Files

### 001_add_conversations_and_hackathon_fields.sql

This migration adds:
- **Conversations table**: For storing AI chat conversations with proper RLS policies
- **Additional hackathon fields**: eligibility, requirements, important_dates, timeline, prizes
- **Indexes**: For better query performance on conversations
- **Triggers**: Automatic updated_at timestamp management

## Verifying the Migration

After running the migration, verify it was successful:

```sql
-- Check if conversations table exists
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'conversations';

-- Check if new hackathon columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'hackathons'
AND column_name IN ('eligibility', 'requirements', 'important_dates', 'timeline', 'prizes');

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'conversations';
```

## Troubleshooting

### Error: "relation already exists"

This means the table or column already exists. You can safely ignore this error or modify the migration to use `IF NOT EXISTS` clauses.

### Error: "permission denied"

Make sure you're running the migration as the database owner or a user with sufficient privileges.

### Error: "function update_updated_at_column() does not exist"

This function should be created in the main schema.sql file. Make sure you've run the initial schema setup first.
