# Database Migration Instructions

## IMPORTANT: You must run this migration before testing the changes!

The hybrid mode fix requires updating your Supabase database constraint. Follow these steps:

---

## Step 1: Access Supabase Dashboard

1. Go to [https://supabase.com](https://supabase.com)
2. Log in to your account
3. Select your HackerFlow project

---

## Step 2: Open SQL Editor

1. In the left sidebar, click on **SQL Editor**
2. Click **New Query** to create a new SQL script

---

## Step 3: Run the Migration

Copy and paste the following SQL code into the editor:

```sql
-- Migration to add 'hybrid' mode to hackathons table
-- This fixes the 'hackathons_mode_check' constraint violation

-- Drop the existing check constraint
ALTER TABLE hackathons DROP CONSTRAINT IF EXISTS hackathons_mode_check;

-- Add new check constraint with 'hybrid' included
ALTER TABLE hackathons ADD CONSTRAINT hackathons_mode_check
  CHECK (mode IN ('online', 'offline', 'hybrid'));
```

---

## Step 4: Execute the Migration

1. Click the **Run** button (or press Ctrl+Enter / Cmd+Enter)
2. Wait for the query to complete
3. You should see a success message like: "Success. No rows returned"

---

## Step 5: Verify the Migration

Run this verification query to confirm the constraint was updated:

```sql
-- Verify the constraint exists
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname = 'hackathons_mode_check';
```

**Expected Output:**
```
conname: hackathons_mode_check
pg_get_constraintdef: CHECK ((mode = ANY (ARRAY['online'::text, 'offline'::text, 'hybrid'::text])))
```

---

## Step 6: Test the Fix

1. Go to your HackerFlow application
2. Navigate to `/organize/step1`
3. Fill out the form and select **Hybrid** mode
4. Click **Next**
5. The form should save successfully without any constraint errors

---

## Troubleshooting

### Error: "constraint does not exist"
This is normal if the constraint wasn't created with that exact name. The migration will still add the correct constraint.

### Error: "permission denied"
Make sure you're logged in as the database owner or have sufficient privileges.

### Still getting constraint errors after migration?
1. Check if the migration ran successfully
2. Run the verification query
3. Clear your browser cache
4. Try creating a new hackathon (don't edit an old one)

---

## Alternative: Manual Fix via Dashboard

If the SQL approach doesn't work:

1. Go to **Table Editor** in Supabase
2. Select the `hackathons` table
3. Click on the **mode** column
4. Look for the CHECK constraint
5. Edit it to include `'hybrid'`

---

## Need Help?

If you encounter issues:
1. Check the Supabase logs for detailed error messages
2. Ensure you're connected to the correct database
3. Verify your database role has ALTER TABLE permissions
4. Try running the migration in the Supabase Studio SQL editor instead of via CLI

---

## After Migration

Once the migration is complete, you can:
- Create hackathons with Online, Offline, or Hybrid modes
- All three modes will save correctly to the database
- No more constraint violation errors

**Note:** Existing hackathons with 'hybrid' mode (if any failed to save) will need to be recreated.
