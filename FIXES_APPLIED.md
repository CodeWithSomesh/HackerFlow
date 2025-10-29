# Fixes Applied - Certificate Prizes & Document Upload

## Issues Fixed

### Issue 1: Certificate Prize Validation Error ✅

**Problem:**
When trying to add a certificate prize without an amount, the error message "All prizes must have position, amount, and type" was displayed, preventing the prize from being saved.

**Root Cause:**
The validation logic in [app/organize/step3/page.tsx:499](app/organize/step3/page.tsx#L499) was checking that ALL prizes have an `amount` field, regardless of type.

**Solution:**
Updated the validation to:
1. Check that all prizes have `position` and `type` (required for all)
2. Only require `amount` for non-Certificate prizes (Cash and Others)

```typescript
// Before
if (tempFormData.prizes?.find(prize => !prize.position || !prize.amount || !prize.type)) {
  return 'All prizes must have position, amount, and type'
}

// After
if (tempFormData.prizes?.find(prize => !prize.position || !prize.type)) {
  return 'All prizes must have position and type'
}
// Check that non-certificate prizes have amounts
if (tempFormData.prizes?.find(prize => prize.type !== 'Certificate' && !prize.amount)) {
  return 'Cash and Other prizes must have an amount'
}
```

**Testing:**
1. Go to Step 3 → Prizes section
2. Select "Certificate" as prize type
3. Enter position only (no amount)
4. Click "Add Prize"
5. ✅ Should save successfully

---

### Issue 2: Document Upload Integration ✅

**Problem:**
The verification modal was simulating document uploads instead of actually uploading to the Supabase Storage buckets (`identity-documents` and `authorization-letters`).

**Solution Implemented:**

#### 1. Created Upload Server Actions

Added two new functions to [lib/actions/createHackathon-actions.ts](lib/actions/createHackathon-actions.ts):

**`uploadIdentityDocument(file: File)`**
- Uploads to `identity-documents` bucket
- Validates file type (PDF, JPG, PNG)
- Validates file size (max 5MB)
- Returns public URL

**`uploadAuthorizationLetter(file: File)`**
- Uploads to `authorization-letters` bucket
- Validates file type (PDF, JPG, PNG)
- Validates file size (max 5MB)
- Returns public URL

Both functions follow the same pattern as `uploadHackathonLogo`:
```typescript
const fileExt = file.name.split('.').pop();
const fileName = `${user.id}-${Date.now()}.${fileExt}`;
const filePath = `${fileName}`;

const { error: uploadError } = await supabase.storage
  .from('identity-documents') // or 'authorization-letters'
  .upload(filePath, file);

const { data: { publicUrl } } = supabase.storage
  .from('identity-documents')
  .getPublicUrl(filePath);

return { success: true, url: publicUrl };
```

#### 2. Updated Verification Modal

Modified [components/organizer-verification-modal.tsx](components/organizer-verification-modal.tsx):

- Imported the new upload functions
- Updated `handleSubmit` to actually upload files:
  ```typescript
  // Upload identity document
  const identityResult = await uploadIdentityDocument(identityDoc)
  if (!identityResult.success) {
    showCustomToast('error', identityResult.error)
    return
  }

  // Upload authorization letter
  const authResult = await uploadAuthorizationLetter(authorizationLetter)
  if (!authResult.success) {
    showCustomToast('error', authResult.error)
    return
  }

  // Pass URLs back to parent component
  onVerificationComplete(identityResult.url!, authResult.url!)
  ```

- Changed callback signature to return URLs:
  ```typescript
  interface OrganizerVerificationModalProps {
    onVerificationComplete: (identityDocUrl: string, authLetterUrl: string) => void
  }
  ```

#### 3. Updated Step3 to Store URLs

Modified [app/organize/step3/page.tsx](app/organize/step3/page.tsx):

- Added state to store document URLs:
  ```typescript
  const [identityDocumentUrl, setIdentityDocumentUrl] = useState<string>('')
  const [authorizationLetterUrl, setAuthorizationLetterUrl] = useState<string>('')
  ```

- Updated verification modal callback:
  ```typescript
  <OrganizerVerificationModal
    onVerificationComplete={(identityUrl, authUrl) => {
      setIdentityDocumentUrl(identityUrl)
      setAuthorizationLetterUrl(authUrl)
      setShowPaymentModal(true)
    }}
  />
  ```

- Updated `handlePublish` to save URLs to database:
  ```typescript
  const { error: publishError } = await supabase
    .from('hackathons')
    .update({
      status: 'published',
      identity_document_url: identityDocumentUrl,
      authorization_letter_url: authorizationLetterUrl,
      verification_status: 'pending',
    })
  ```

#### 4. Created Database Migration

Created [lib/supabase/migrations/add_verification_columns.sql](lib/supabase/migrations/add_verification_columns.sql):

```sql
-- Add columns for storing verification document URLs
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS identity_document_url TEXT;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS authorization_letter_url TEXT;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';

-- Add check constraint for verification_status
ALTER TABLE hackathons DROP CONSTRAINT IF EXISTS hackathons_verification_status_check;
ALTER TABLE hackathons ADD CONSTRAINT hackathons_verification_status_check
  CHECK (verification_status IN ('pending', 'approved', 'rejected'));
```

---

## Database Migrations Required

### ⚠️ IMPORTANT: Run Both Migrations

You need to run **TWO** migrations in your Supabase SQL Editor:

### Migration 1: Add Hybrid Mode Support
```sql
-- File: lib/supabase/migrations/add_hybrid_mode.sql
ALTER TABLE hackathons DROP CONSTRAINT IF EXISTS hackathons_mode_check;
ALTER TABLE hackathons ADD CONSTRAINT hackathons_mode_check
  CHECK (mode IN ('online', 'offline', 'hybrid'));
```

### Migration 2: Add Verification Columns
```sql
-- File: lib/supabase/migrations/add_verification_columns.sql
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS identity_document_url TEXT;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS authorization_letter_url TEXT;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';

ALTER TABLE hackathons DROP CONSTRAINT IF EXISTS hackathons_verification_status_check;
ALTER TABLE hackathons ADD CONSTRAINT hackathons_verification_status_check
  CHECK (verification_status IN ('pending', 'approved', 'rejected'));
```

**How to run:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy the first migration and click "Run"
3. Copy the second migration and click "Run"
4. Verify both completed successfully

---

## Storage Bucket Policies

Your buckets are already created. Ensure they have the correct policies:

### identity-documents bucket:
```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload identity documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'identity-documents');

-- Allow organizers to view their own documents (optional)
CREATE POLICY "Users can view own identity documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'identity-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### authorization-letters bucket:
```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload authorization letters"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'authorization-letters');

-- Allow organizers to view their own documents (optional)
CREATE POLICY "Users can view own authorization letters"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'authorization-letters' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## Complete Flow After Fixes

### Publishing Flow with Real Uploads:

1. **User fills hackathon details** (Steps 1, 2, 3)
2. **User clicks "Publish"**
3. **Form validation runs**
4. **Verification Modal appears**
   - User uploads identity document → **Uploaded to `identity-documents` bucket** ✅
   - User uploads authorization letter → **Uploaded to `authorization-letters` bucket** ✅
   - User agrees to terms
   - Documents are validated and uploaded
   - Public URLs are returned
5. **Payment Modal appears**
   - User enters payment details
   - Agrees to no-refund policy
   - Payment processed (simulated)
6. **Publish Confirmation Dialog**
   - User confirms publication
7. **Hackathon Published**
   - Document URLs saved to database ✅
   - `verification_status` set to `'pending'` ✅
   - Status updated to `'published'`
   - Success message shown
   - Redirect to hackathons page

---

## Testing Checklist

### Test Certificate Prizes:
- [ ] Go to Step 3 → Prizes
- [ ] Add a Certificate prize without amount
- [ ] ✅ Should save successfully
- [ ] Add a Cash prize without amount
- [ ] ✅ Should show error requiring amount
- [ ] Edit an existing Certificate prize
- [ ] ✅ Amount field should be hidden

### Test Document Upload:
- [ ] Complete all hackathon details
- [ ] Click "Publish"
- [ ] Upload identity document (PDF or image)
- [ ] ✅ Should upload to `identity-documents` bucket
- [ ] Check Supabase Storage → identity-documents
- [ ] ✅ File should appear with naming: `{userId}-{timestamp}.{ext}`
- [ ] Upload authorization letter (PDF or image)
- [ ] ✅ Should upload to `authorization-letters` bucket
- [ ] Check Supabase Storage → authorization-letters
- [ ] ✅ File should appear with correct naming
- [ ] Complete payment and publish
- [ ] Check database `hackathons` table
- [ ] ✅ `identity_document_url` should contain public URL
- [ ] ✅ `authorization_letter_url` should contain public URL
- [ ] ✅ `verification_status` should be `'pending'`

### Test Validation:
- [ ] Try uploading wrong file type (e.g., .txt)
- [ ] ✅ Should show error: "Please upload a PDF or image file"
- [ ] Try uploading file > 5MB
- [ ] ✅ Should show error: "File size must be less than 5MB"
- [ ] Try submitting without documents
- [ ] ✅ Should show error: "Please upload your identity document"

---

## Files Modified

### Core Files:
1. [app/organize/step3/page.tsx](app/organize/step3/page.tsx)
   - Fixed certificate prize validation (line 499-506)
   - Added document URL state (line 77-78)
   - Updated verification callback (line 2814-2818)
   - Updated publish function (line 722-734)

2. [lib/actions/createHackathon-actions.ts](lib/actions/createHackathon-actions.ts)
   - Added `uploadIdentityDocument` function (line 324-366)
   - Added `uploadAuthorizationLetter` function (line 368-410)

3. [components/organizer-verification-modal.tsx](components/organizer-verification-modal.tsx)
   - Imported upload functions (line 10)
   - Updated interface (line 15)
   - Implemented real uploads (line 86-117)

### New Migration Files:
1. [lib/supabase/migrations/add_verification_columns.sql](lib/supabase/migrations/add_verification_columns.sql)

---

## What's Different Now?

### Before:
- ❌ Certificate prizes couldn't be added without amount
- ❌ Documents were simulated (not uploaded)
- ❌ No database columns for document URLs
- ❌ Documents weren't saved anywhere

### After:
- ✅ Certificate prizes work without amount
- ✅ Documents are uploaded to Supabase Storage
- ✅ Public URLs are returned
- ✅ URLs are saved to database
- ✅ Verification status is tracked
- ✅ Files are organized by user ID and timestamp

---

## Next Steps (For Future Enhancement)

1. **Admin Panel** to review documents:
   - List all pending verifications
   - View uploaded documents
   - Approve/reject organizers
   - Send email notifications

2. **Email Notifications**:
   - Send confirmation email when documents are uploaded
   - Notify when verification is approved/rejected

3. **Document Security**:
   - Make buckets private
   - Only allow admins to view documents
   - Add RLS policies for better security

4. **Verification Badge**:
   - Show "Verified" badge on approved hackathons
   - Display verification status in organizer dashboard

---

## Support

If you encounter issues:
- Check browser console for errors
- Check Supabase logs for upload errors
- Verify bucket policies are correct
- Ensure migrations were run successfully
- Check that file sizes are under 5MB

**All fixes are complete and ready to test!** 🚀
