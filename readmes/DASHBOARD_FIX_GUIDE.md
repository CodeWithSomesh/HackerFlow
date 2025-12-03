# Dashboard Fix Guide - Enabling Real Data

## The Problem

Your dashboards (both Hacker and Organizer) are showing **dummy data** instead of real data from your database. This is because the application has a development feature that shows dummy data by default.

Even though you have:
- ✅ Registered for hackathons
- ✅ Created teams
- ✅ Participated in events
- ✅ Posted hackathons as an organizer

The dashboards are not showing this real data because of a `localStorage` flag.

## The Solution

### Quick Fix (Recommended)

1. **Open your browser** where the application is running
2. **Open Developer Console**:
   - Windows/Linux: Press `F12` or `Ctrl + Shift + J`
   - Mac: Press `Cmd + Option + J`
3. **Paste this command** in the console:
   ```javascript
   localStorage.setItem('useDummyData', 'false')
   ```
4. **Press Enter**
5. **Refresh the page** (`F5` or `Ctrl + R`)

✅ **Done!** All dashboards will now show real data from your database.

### Verify the Fix

After refreshing, you should see:

**Hacker Dashboard:**
- ✅ Your actual hackathon registrations in "Overview" tab
- ✅ Your real hackathons in "My Hackathons" tab
- ✅ Your actual teams in "Teams" tab
- ✅ Your earned badges based on real participation in "Badges" tab

**Organizer Dashboard:**
- ✅ Real participant counts and details in "Overview" tab
- ✅ Actual participants in "Manage Participants" page
- ✅ Real teams and their details
- ✅ Actual upcoming hackathons in "Calendar" tab
- ✅ Real registration data in "Analytics" tab

## Alternative Method (If Console Method Doesn't Work)

If the console method doesn't work, you can run this Node.js script:

```bash
node scripts/disable-dummy-data.js
```

Then refresh your browser.

## To Re-enable Dummy Data (For Development/Demo)

If you ever need to show dummy data again:

```javascript
localStorage.removeItem('useDummyData')
```

Or:

```javascript
localStorage.setItem('useDummyData', 'true')
```

Then refresh the page.

## Technical Details

### How It Works

All dashboard pages check a localStorage flag:

```javascript
const useDummyData = typeof window !== 'undefined'
  ? localStorage.getItem('useDummyData') !== 'false'
  : true
```

- If `useDummyData` is NOT set to the string `'false'`, it shows dummy data
- If `useDummyData` IS set to `'false'`, it fetches real data from Supabase

### Affected Pages

**Hacker Dashboard:**
- `/dashboard/hacker` (Overview)
- `/dashboard/hacker/hackathons` (My Hackathons)
- `/dashboard/hacker/teams` (Teams)
- `/dashboard/hacker/badges` (Badges)

**Organizer Dashboard:**
- `/dashboard/organizer` (Overview)
- `/dashboard/organizer/calendar` (Calendar)
- `/dashboard/organizer/analytics` (Analytics)

**Note:** The following pages already use real data (no dummy data):
- Manage Participants page
- Manage Winners page

## Troubleshooting

### Issue: Still seeing dummy data after the fix

**Solution:**
1. Clear browser cache:
   - Windows/Linux: `Ctrl + Shift + Delete`
   - Mac: `Cmd + Shift + Delete`
2. Make sure you refreshed the page after setting localStorage
3. Check the console for any errors
4. Verify the localStorage was set by running:
   ```javascript
   localStorage.getItem('useDummyData')
   ```
   It should return `"false"`

### Issue: Getting errors after enabling real data

**Possible causes:**
1. Database connection issues - Check your Supabase credentials in `.env.local`
2. Missing data in database - Ensure you have actual registrations/hackathons
3. RLS (Row Level Security) policies - Ensure your Supabase policies allow reading data

## For Production Deployment

When deploying to production, you should:

1. Remove all dummy data code blocks from the dashboard files
2. Or set the default to use real data by changing:
   ```javascript
   const useDummyData = false; // Always use real data in production
   ```

This ensures production users only see real data.

---

**Need Help?** If you continue to experience issues after following this guide, check:
- Browser console for errors (`F12`)
- Supabase dashboard to verify data exists
- Network tab to see if API calls are succeeding
