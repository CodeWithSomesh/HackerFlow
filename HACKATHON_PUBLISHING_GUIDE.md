# Hackathon Publishing Guide - New Features

## What Was Fixed?

1. ✅ **Hybrid Mode Database Error** - Fixed constraint that prevented saving hackathons with "Hybrid" mode
2. ✅ **Certificate Prizes** - Prizes of type "Certificate" no longer require a monetary amount
3. ✅ **Organizer Verification** - Added identity verification modal before publishing
4. ✅ **Payment Wall** - Added payment system with no-refund policy

---

## Before You Test - CRITICAL STEP!

### ⚠️ Run Database Migration First!

**You MUST run this SQL in your Supabase dashboard:**

```sql
ALTER TABLE hackathons DROP CONSTRAINT IF EXISTS hackathons_mode_check;
ALTER TABLE hackathons ADD CONSTRAINT hackathons_mode_check
  CHECK (mode IN ('online', 'offline', 'hybrid'));
```

**Where to run it:**
Supabase Dashboard → SQL Editor → Paste SQL → Click "Run"

📖 **Detailed instructions:** See [MIGRATION_INSTRUCTIONS.md](./MIGRATION_INSTRUCTIONS.md)

---

## Test the New Features

### 1. Test Hybrid Mode (2 minutes)
1. Go to `/organize/step1`
2. Fill out the form
3. Select **"Hybrid"** mode
4. Enter a location
5. Click **Next**
6. ✅ Should save without errors

---

### 2. Test Certificate Prizes (3 minutes)
1. Complete Steps 1 & 2
2. In Step 3, click **"Prizes"** section
3. In the prize form:
   - Select **"Certificate"** as type FIRST
   - Notice the amount field disappears
   - Enter position (e.g., "Best Innovation")
   - Add description (optional)
   - Click **"Add Prize"**
4. ✅ Should add successfully without requiring amount

Now test cash prize:
1. Select **"Cash"** as type
2. Notice amount field appears
3. Try to add without amount
4. ✅ Should show error requiring amount

---

### 3. Test Verification Modal (4 minutes)
1. Complete all hackathon details
2. Click **"Publish"** button
3. Modal should appear asking for:
   - Identity document upload
   - Authorization letter upload
   - Two consent checkboxes
4. Try submitting without uploads
5. ✅ Should show error
6. Upload both documents (any PDF/image)
7. Check both boxes
8. Click **"Submit for Verification"**
9. ✅ Should proceed to payment modal

---

### 4. Test Payment Wall (4 minutes)
1. After verification, payment modal appears
2. Notice the **red no-refund policy box**
3. Try submitting without filling form
4. ✅ Should show validation errors
5. Fill in:
   - Card: 4242 4242 4242 4242
   - Name: TEST USER
   - Expiry: 12/25
   - CVV: 123
6. Try submitting without no-refund checkbox
7. ✅ Should show error
8. Check the no-refund checkbox
9. Click **"Pay $50"**
10. ✅ Should show processing, then success
11. ✅ Publish confirmation dialog should appear

---

### 5. Complete Publishing Flow (2 minutes)
1. In the final confirmation dialog
2. Review the checklist
3. Click **"Publish Hackathon"**
4. ✅ Should show success message
5. ✅ Should redirect to hackathons page
6. ✅ Check your hackathon appears in the list

---

## Publishing Flow Diagram

```
┌─────────────────────────────────┐
│  Click "Publish" Button         │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Form Validation Check          │
│  (title, dates, logo, etc.)     │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Organizer Verification Modal   │
│  • Upload ID document           │
│  • Upload auth letter           │
│  • Agree to terms               │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Payment Modal                  │
│  • Enter card details           │
│  • Agree to no-refund policy    │
│  • Process payment ($50)        │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Publish Confirmation Dialog    │
│  • Final review                 │
│  • Click confirm                │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Hackathon Published! 🎉        │
│  Status: published              │
└─────────────────────────────────┘
```

---

## Files Changed Summary

### Modified Files
- [lib/supabase/schema.sql](lib/supabase/schema.sql) - Added 'hybrid' to mode constraint
- [lib/validations/createHackathons.ts](lib/validations/createHackathons.ts) - Made prize amount optional for certificates
- [app/organize/step3/page.tsx](app/organize/step3/page.tsx) - Updated prize handling, added modals

### New Files
- [components/organizer-verification-modal.tsx](components/organizer-verification-modal.tsx) - New verification UI
- [components/payment-modal.tsx](components/payment-modal.tsx) - New payment UI
- [lib/supabase/migrations/add_hybrid_mode.sql](lib/supabase/migrations/add_hybrid_mode.sql) - Database migration

### Documentation
- [CHANGES_SUMMARY.md](CHANGES_SUMMARY.md) - Detailed documentation of all changes
- [MIGRATION_INSTRUCTIONS.md](MIGRATION_INSTRUCTIONS.md) - Step-by-step migration guide
- [HACKATHON_PUBLISHING_GUIDE.md](HACKATHON_PUBLISHING_GUIDE.md) - This file

---

## Important Notes

### Payment Integration
- Current payment is **simulated** for testing
- To use in production, integrate with:
  - Stripe (recommended)
  - Razorpay (for Malaysia/India)
  - PayPal

### Document Storage
- Verification documents are **not actually uploaded** yet
- You need to set up Supabase Storage buckets
- Add document URL columns to database

### Admin Panel
- Consider building an admin panel to:
  - Review verification documents
  - Approve/reject hackathons
  - Manage payments
  - Handle support requests

---

## Troubleshooting

### "Constraint violation" error
→ You haven't run the database migration. See [MIGRATION_INSTRUCTIONS.md](MIGRATION_INSTRUCTIONS.md)

### Prize amount still required for certificates
→ Clear your browser cache and reload the page

### Modals not appearing
→ Check browser console for errors
→ Ensure all components are imported correctly

### Payment not processing
→ This is normal - it's simulated. Check the console for logs.

---

## Next Steps

After testing:

1. ✅ **Run the migration** (if not done)
2. ✅ **Test all features** using the guides above
3. 🔄 **Set up real payment gateway** (Stripe/Razorpay)
4. 🔄 **Configure document storage** (Supabase Storage)
5. 🔄 **Build admin review panel** (optional but recommended)
6. 🔄 **Add email notifications** for verification status
7. 🔄 **Set up payment webhooks** for real-time updates

---

## Need More Help?

- **Detailed Changes:** See [CHANGES_SUMMARY.md](CHANGES_SUMMARY.md)
- **Migration Help:** See [MIGRATION_INSTRUCTIONS.md](MIGRATION_INSTRUCTIONS.md)
- **Console Errors:** Check browser DevTools → Console tab
- **Database Errors:** Check Supabase Dashboard → Logs

---

## Success Checklist

Before deploying to production:

- [ ] Database migration completed successfully
- [ ] Hybrid mode hackathons save correctly
- [ ] Certificate prizes work without amounts
- [ ] Cash prizes still require amounts
- [ ] Verification modal shows and validates
- [ ] Payment modal shows and validates
- [ ] Complete publish flow works end-to-end
- [ ] Real payment gateway integrated (if going live)
- [ ] Document storage configured
- [ ] Admin review system in place (recommended)

**Happy building! 🚀**
