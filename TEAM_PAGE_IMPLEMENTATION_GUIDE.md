# Team Page Implementation Guide

## Features to Implement

Given the complexity and size of the team page, here's a comprehensive guide for implementing all the requested features:

### 1. **Organization Name Field Logic**

Update the Add Member Modal form to conditionally show organization field:

```tsx
{/* Organization Name - Conditional based on participant type */}
{(memberFormData.participantType === 'Professional' ||
  memberFormData.participantType === 'College Students' ||
  memberFormData.participantType === 'High School / Primary School Student') && (
  <div>
    <label className="block text-white font-mono font-bold mb-2">
      {memberFormData.participantType === 'Professional'
        ? 'Organization Name'
        : memberFormData.participantType === 'College Students'
        ? 'University Name'
        : 'School Name'
      }
    </label>
    <input
      type="text"
      value={memberFormData.organizationName}
      onChange={(e) => setMemberFormData(prev => ({ ...prev, organizationName: e.target.value }))}
      className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white font-mono focus:outline-none focus:border-teal-400"
    />
  </div>
)}
```

### 2. **AlertDialog for Member Deletion**

Replace the `window.confirm` with AlertDialog:

```tsx
// In handleRemoveMember function
const handleRemoveMember = (memberId: string) => {
  setMemberToDelete(memberId);
  setShowDeleteDialog(true);
};

const confirmDeleteMember = async () => {
  if (!memberToDelete) return;

  try {
    const result = await removeTeamMember(memberToDelete);
    if (result.success) {
      showCustomToast('success', 'Team member removed successfully');
      await loadData();
    } else {
      showCustomToast('error', result.error || 'Failed to remove team member');
    }
  } catch (error) {
    showCustomToast('error', 'An unexpected error occurred');
  } finally {
    setShowDeleteDialog(false);
    setMemberToDelete(null);
  }
};

// Add this AlertDialog component at the end of the JSX
<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
  <AlertDialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 max-w-md">
    <AlertDialogHeader>
      <AlertDialogTitle className="font-blackops text-2xl text-white flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
          <Trash2 className="w-6 h-6 text-white" />
        </div>
        Remove Team Member?
      </AlertDialogTitle>
      <AlertDialogDescription className="text-gray-300 font-mono text-sm space-y-3 pt-4">
        <p>Are you sure you want to remove this team member? This action cannot be undone.</p>
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter className="gap-3">
      <AlertDialogCancel className="bg-gray-800 py-6 hover:bg-black border-gray-600 text-white font-mono">
        Cancel
      </AlertDialogCancel>
      <AlertDialogAction
        onClick={confirmDeleteMember}
        className="bg-gradient-to-r py-6 from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-mono font-bold"
      >
        Remove Member
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### 3. **Invite Friends Share Link Feature**

Add a modal for sharing team invite link:

```tsx
const [inviteLink, setInviteLink] = useState('');

// Generate invite link when team is created
useEffect(() => {
  if (team?.id) {
    const baseUrl = window.location.origin;
    setInviteLink(`${baseUrl}/hackathons/${resolvedParams.id}/join-team/${team.id}`);
  }
}, [team, resolvedParams.id]);

const handleCopyLink = () => {
  navigator.clipboard.writeText(inviteLink);
  showCustomToast('success', 'Invite link copied to clipboard!');
};

const handleShareTwitter = () => {
  const text = `Join my team "${team?.team_name}" for ${hackathon?.title}!`;
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(inviteLink)}`, '_blank');
};

const handleShareWhatsApp = () => {
  const text = `Join my team "${team?.team_name}" for ${hackathon?.title}! ${inviteLink}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
};

const handleShareLinkedIn = () => {
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(inviteLink)}`, '_blank');
};

const handleShareEmail = () => {
  const subject = `Join my team for ${hackathon?.title}`;
  const body = `Hi!\n\nI'd like to invite you to join my team "${team?.team_name}" for ${hackathon?.title}.\n\nClick this link to join: ${inviteLink}`;
  window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
};

// Invite Friends Modal JSX
<AlertDialog open={showInviteModal} onOpenChange={setShowInviteModal}>
  <AlertDialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 max-w-md">
    <AlertDialogHeader>
      <AlertDialogTitle className="font-blackops text-2xl text-white text-center">
        Invite Friends
      </AlertDialogTitle>
      <AlertDialogDescription className="text-gray-300 font-mono text-sm space-y-4 pt-4">
        <p className="text-center">Invite via social media/copy link</p>

        {/* Social Share Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleShareTwitter}
            className="w-12 h-12 rounded-full bg-[#1DA1F2] hover:bg-[#1a8cd8] flex items-center justify-center transition-colors"
            title="Share on Twitter"
          >
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
            </svg>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20bd5a] flex items-center justify-center transition-colors"
            title="Share on WhatsApp"
          >
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path>
            </svg>
          </button>

          <button
            onClick={handleShareLinkedIn}
            className="w-12 h-12 rounded-full bg-[#0077B5] hover:bg-[#006399] flex items-center justify-center transition-colors"
            title="Share on LinkedIn"
          >
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
            </svg>
          </button>

          <button
            onClick={handleShareEmail}
            className="w-12 h-12 rounded-full bg-gray-600 hover:bg-gray-500 flex items-center justify-center transition-colors"
            title="Share via Email"
          >
            <Mail className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <p className="text-center mb-3">OR</p>
          <p className="text-center mb-2">Invite via email</p>
          <input
            type="email"
            placeholder="Type member's email here"
            className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white font-mono focus:outline-none focus:border-teal-400 mb-3"
          />
          <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white rounded-xl font-mono font-bold transition-all">
            Send
          </button>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inviteLink}
              readOnly
              className="flex-1 px-4 py-2 bg-gray-800 border-2 border-gray-700 rounded-lg text-gray-300 font-mono text-sm"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Copy link"
            >
              <Copy className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </AlertDialogDescription>
    </AlertDialogHeader>
  </AlertDialogContent>
</AlertDialog>
```

### 4. **Edit Member Details**

Add edit functionality for both leader's details and added members:

```tsx
const handleEditMember = (member: any) => {
  setMemberToEdit(member);
  setMemberFormData({
    email: member.email,
    mobile: member.mobile,
    firstName: member.first_name,
    lastName: member.last_name || '',
    organizationName: member.organization_name || '',
    participantType: member.participant_type,
    passoutYear: member.passout_year || '',
    domain: member.domain || '',
    location: member.location,
  });
  setShowEditMemberModal(true);
};

const handleUpdateMember = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!memberToEdit) return;

  // Call API to update member
  // Similar to addTeamMember but with update logic
  showCustomToast('success', 'Member details updated successfully');
  setShowEditMemberModal(false);
  await loadData();
};

// Add Edit button next to each member card
<button
  onClick={() => handleEditMember(member)}
  className="p-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg transition-all"
>
  <Edit2 className="w-4 h-4 text-blue-400" />
</button>
```

### 5. **Cancel Registration**

Add cancel registration with confirmation dialog:

```tsx
const handleCancelRegistration = async () => {
  try {
    // Call API to delete registration and team
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !team) return;

    // Delete team and registration
    await supabase.from('hackathon_teams').delete().eq('id', team.id);
    await supabase.from('hackathon_registrations').delete()
      .eq('hackathon_id', resolvedParams.id)
      .eq('user_id', user.id);

    showCustomToast('success', 'Registration cancelled successfully');
    router.push(`/hackathons/${resolvedParams.id}`);
  } catch (error) {
    showCustomToast('error', 'Failed to cancel registration');
  } finally {
    setShowCancelDialog(false);
  }
};

// Cancel Registration Dialog
<AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
  <AlertDialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 max-w-md">
    <AlertDialogHeader>
      <AlertDialogTitle className="font-blackops text-2xl text-white flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-white" />
        </div>
        Cancel Registration?
      </AlertDialogTitle>
      <AlertDialogDescription className="text-gray-300 font-mono text-sm space-y-3 pt-4">
        <p>Are you sure you wish to cancel your registration?</p>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-300 text-xs">
            This will delete your team and remove all team members. This action cannot be undone.
          </p>
        </div>
        <p className="text-gray-400 text-sm">Type 'confirm' to continue</p>
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter className="gap-3">
      <AlertDialogCancel className="bg-gray-800 py-6 hover:bg-black border-gray-600 text-white font-mono">
        Keep Registration
      </AlertDialogCancel>
      <AlertDialogAction
        onClick={handleCancelRegistration}
        className="bg-gradient-to-r py-6 from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-mono font-bold"
      >
        Cancel Registration
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

// Add Cancel Registration button
<button
  onClick={() => setShowCancelDialog(true)}
  className="px-8 py-4 bg-red-500/10 hover:bg-red-500/20 border-2 border-red-500/30 text-red-400 rounded-xl font-mono font-bold transition-all"
>
  Cancel Registration
</button>
```

### 6. **Email Sending Implementation Guide**

For sending emails to team members, you have several options:

#### Option A: Using Resend (Recommended)

1. Install Resend:
```bash
npm install resend
```

2. Create API route for sending emails:
```typescript
// app/api/send-team-invite/route.ts
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, teamName, hackathonName, inviteLink, inviterName } = await request.json();

    const { data, error } = await resend.emails.send({
      from: 'HackerFlow <noreply@yourdomain.com>',
      to: [email],
      subject: `You're invited to join ${teamName} for ${hackathonName}!`,
      html: `
        <h1>Team Invitation</h1>
        <p>Hi!</p>
        <p>${inviterName} has invited you to join their team "${teamName}" for ${hackathonName}.</p>
        <p><a href="${inviteLink}">Click here to accept the invitation</a></p>
        <p>Best regards,<br>HackerFlow Team</p>
      `,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
```

3. Call this API from your component:
```typescript
const sendInviteEmail = async (memberEmail: string) => {
  try {
    const response = await fetch('/api/send-team-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: memberEmail,
        teamName: team.team_name,
        hackathonName: hackathon.title,
        inviteLink: `${window.location.origin}/hackathons/${resolvedParams.id}/join-team/${team.id}`,
        inviterName: user.fullName
      }),
    });

    if (response.ok) {
      showCustomToast('success', 'Invitation email sent successfully');
    } else {
      showCustomToast('error', 'Failed to send invitation email');
    }
  } catch (error) {
    showCustomToast('error', 'Failed to send invitation email');
  }
};
```

#### Option B: Using Supabase Edge Functions

1. Create a Supabase Edge Function
2. Use SendGrid or another email service
3. Call the edge function from your app

#### Option C: Using SendGrid Directly

Similar to Resend but using SendGrid's API.

### 7. **Replace All Toast Messages**

Replace all occurrences of `setSuccessMessage` and `setErrorMessage` with `showCustomToast`:

```typescript
// Success
showCustomToast('success', 'Operation completed successfully');

// Error
showCustomToast('error', 'Operation failed');

// Info
showCustomToast('info', 'Information message');
```

## Implementation Steps

1. First, update all toast notifications
2. Add the AlertDialogs for delete and cancel
3. Implement the invite modal
4. Add edit functionality
5. Set up email sending (choose one option)
6. Test all features thoroughly

## Notes

- Make sure to import all necessary components from shadcn/ui
- Test the email functionality in development with a service like Mailtrap
- Consider rate limiting for email sending
- Add proper error handling for all async operations
- Ensure all modals have proper accessibility attributes
