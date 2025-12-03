# 🚨 URGENT FIX: Approve/Reject Not Working from Any Status

## Problem
- ❌ Approved hackathons cannot be rejected
- ❌ Rejected hackathons cannot be approved
- ❌ Status changes only work from "pending" status

## Root Cause
Database functions `approve_hackathon()` and `reject_hackathon()` have WHERE clauses that restrict updates to only `verification_status = 'pending'`.

## Solution
Run the new migration that removes these restrictions.

---

## 🎯 Run This NOW (1 Minute!)

### Step 1: Open Supabase SQL Editor
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **SQL Editor** in the left sidebar

### Step 2: Run Migration
1. Copy & paste the entire file: **`supabase/migrations/FIX_APPROVE_REJECT_ANY_STATUS.sql`**
2. Click **RUN** ✅
3. Wait for success message

### Step 3: Test
1. Go to `/admin/dashboard/approvals`
2. Filter to **Approved** hackathons
3. Click **Reject** → Should work now! ✅
4. Filter to **Rejected** hackathons
5. Click **Approve** → Should work now! ✅

---

## What Changed

### Before (❌ Broken)
```sql
-- approve_hackathon() - Line 51
WHERE verification_status = 'pending'  -- Only works on pending!

-- reject_hackathon() - Line 253
WHERE verification_status = 'pending'  -- Only works on pending!
```

### After (✅ Fixed)
```sql
-- approve_hackathon()
WHERE id = p_hackathon_id  -- Works on ANY status!

-- reject_hackathon()
WHERE id = p_hackathon_id  -- Works on ANY status!
```

---

## Bonus Improvements

1. **Clear conflicting fields:**
   - When approving: Clears `rejected_by`, `rejected_at`, `rejection_reason`
   - When rejecting: Clears `approved_by`, `approved_at`

2. **Revoke payment status:**
   - When rejecting: Sets `posting_fee_paid = FALSE` and clears `posting_fee_paid_at`

3. **Status transitions:**
   - Approved → Rejected ✅
   - Rejected → Approved ✅
   - Pending → Approved ✅
   - Pending → Rejected ✅
   - Can toggle multiple times ✅

---

## Expected Behavior After Fix

### Approved Tab:
- ✅ Shows "Reject" button
- ✅ Clicking reject updates DB to rejected status
- ✅ Moves hackathon to Rejected tab
- ✅ Clears approval fields, sets rejection fields

### Rejected Tab:
- ✅ Shows "Approve" button (re-approve)
- ✅ Clicking approve updates DB to verified status
- ✅ Moves hackathon to Approved tab
- ✅ Clears rejection fields, sets approval fields

---

## Files Modified

| File | What Changed |
|------|-------------|
| [FIX_APPROVE_REJECT_ANY_STATUS.sql](supabase/migrations/FIX_APPROVE_REJECT_ANY_STATUS.sql) | **RUN THIS!** New migration |

---

## Troubleshooting

### Still not working?
1. Check Supabase SQL Editor for errors
2. Verify migration ran successfully
3. Hard refresh browser (Ctrl+Shift+R)
4. Check browser console for errors

### Status not updating?
1. Verify you ran the migration
2. Check terminal/server logs
3. Verify admin access (must be admin or superadmin)

---

**Run the migration now!** 🚀
