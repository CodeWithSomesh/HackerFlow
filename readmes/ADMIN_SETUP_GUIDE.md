# Admin Portal Setup Guide

This guide will help you set up and access the HackerFlow Admin Portal.

## How the Admin System Works

The admin portal works with **any authentication method**:
- ✅ Email/Password login
- ✅ Google OAuth
- ✅ GitHub OAuth
- ✅ Any other authentication provider

**Key Feature**: When you visit `/admin/login`, the system automatically checks if you're already logged in and verifies your admin role. No need to enter credentials if you're already authenticated!

## Quick Start

### Step 1: Create a User Account

If you don't have a user account yet:

1. Go to your app's signup page (e.g., `/hacker/signup` or `/organizer/signup`)
2. Create an account using **any method** (email, Google, or GitHub)
3. Complete the signup process

### Step 2: Set Your User as Superadmin

You need to manually promote your account to superadmin in the database.

#### Option A: Using Supabase Dashboard (Easiest)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Table Editor** → `user_profiles`
4. Find your user account (search by email)
5. Click on the `role` field and change it to `superadmin`
6. Click ✓ to save

#### Option B: Using SQL Editor

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **SQL Editor**
3. Copy and paste the script from `scripts/set-superadmin.sql`
4. Replace `'your-email@example.com'` with your actual email
5. Click **Run**

Example:
```sql
-- View all users
SELECT user_id, email, full_name, role
FROM user_profiles
ORDER BY created_at DESC;

-- Set yourself as superadmin
UPDATE user_profiles
SET role = 'superadmin'
WHERE email = 'your-email@example.com';

-- Verify the change
SELECT email, full_name, role
FROM user_profiles
WHERE role = 'superadmin';
```

### Step 3: Access the Admin Portal

#### Method 1: Already Logged In (Recommended)
1. Make sure you're logged into HackerFlow (using any auth method)
2. Navigate to `http://localhost:3000/admin/login`
3. The system will automatically verify your admin role
4. You'll be redirected to the admin dashboard if you have access
5. If you don't have admin access, you'll be redirected home with an error message

#### Method 2: Email/Password Login
1. Go to `http://localhost:3000/admin/login`
2. Enter your email and password
3. Click "Access Admin Portal"
4. If you have admin/superadmin role, you'll be logged in

## User Roles

The system supports three roles:

| Role | Permissions | Who Can Assign |
|------|-------------|----------------|
| `user` | Regular user access | Default for all new users |
| `admin` | Can approve hackathons, view analytics, manage users | Superadmin only |
| `superadmin` | Full access including promoting/demoting admins | Manual database update only |

## Features by Role

### Admin & Superadmin Can:
- ✅ View all hackathons, users, teams, and registrations
- ✅ Approve or reject pending hackathons
- ✅ View revenue analytics and statistics
- ✅ Access detailed user analytics

### Superadmin Only Can:
- ✅ Promote users to admin
- ✅ Demote admins to regular users
- ✅ Access Admin Management page

## Troubleshooting

### Issue: "Access denied. Only administrators can access this portal."

**Solutions:**
1. Verify your role is set to `admin` or `superadmin` in the database:
   ```sql
   SELECT email, role FROM user_profiles WHERE email = 'your-email@example.com';
   ```
2. If the role is `user`, run the UPDATE query from Step 2
3. Log out and log back in
4. Try accessing `/admin/login` again

### Issue: "No user profiles found in database"

**Solutions:**
1. Make sure you've created at least one user account
2. Check if the `user_profiles` table exists in your database
3. Verify that the signup process is creating profiles correctly

### Issue: Can't login with Google/GitHub

**Solutions:**
1. Make sure you're already logged in to HackerFlow
2. Visit `/admin/login` - it will auto-verify your session
3. The email/password form is only for users with password-based accounts

## Checking Admin Users

Run this script to check all admin users:

```bash
node scripts/check-admin-user.js
```

This will show:
- All superadmins
- All admins
- Total regular users
- Instructions if no superadmin exists

## Security Notes

- ⚠️ **Only promote trusted users to admin/superadmin**
- ⚠️ All admin actions are logged (approved_by, rejected_by fields)
- ⚠️ Superadmin role can only be assigned via direct database access
- ⚠️ Cannot demote a superadmin (prevents accidental lockout)

## Admin Portal Routes

- `/admin/login` - Admin login page
- `/admin/dashboard` - Overview dashboard
- `/admin/dashboard/revenue` - Revenue analytics
- `/admin/dashboard/approvals` - Hackathon approvals
- `/admin/dashboard/analytics` - User analytics
- `/admin/dashboard/users` - Admin management (superadmin only)

## Need Help?

If you're still having issues:
1. Check the browser console for errors
2. Check your Supabase project logs
3. Verify your `.env.local` has correct Supabase credentials
4. Make sure all database migrations have been run
