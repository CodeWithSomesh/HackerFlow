/*
 * ADD THESE FUNCTIONS AND STATE TO YOUR TEAM PAGE
 * Copy the relevant sections to app/hackathons/[id]/team/page.tsx
 */

// ============================================
// 1. ADD THESE IMPORTS AT THE TOP
// ============================================
import { updateTeamMember, cancelRegistration } from "@/lib/actions/hackathon-registration-actions";
import { createClient } from "@/lib/supabase/client";

// WhatsApp icon component (or use an SVG)
const WhatsAppIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path>
  </svg>
);

// ============================================
// 2. ADD THESE STATE VARIABLES
// ============================================
const [inviteLink, setInviteLink] = useState('');
const [inviteEmail, setInviteEmail] = useState('');
const [sendingEmail, setSendingEmail] = useState(false);
const [confirmText, setConfirmText] = useState('');

// ============================================
// 3. ADD THIS useEffect TO GENERATE INVITE LINK
// ============================================
useEffect(() => {
  if (team?.id) {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    setInviteLink(`${baseUrl}/hackathons/${resolvedParams.id}/join-team/${team.id}`);
  }
}, [team, resolvedParams.id]);

// ============================================
// 4. ADD THESE HANDLER FUNCTIONS
// ============================================

// Share link handlers
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

// Send email invitation
const handleSendInviteEmail = async () => {
  if (!inviteEmail) {
    showCustomToast('error', 'Please enter an email address');
    return;
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(inviteEmail)) {
    showCustomToast('error', 'Please enter a valid email address');
    return;
  }

  setSendingEmail(true);
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const response = await fetch('/api/send-team-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: inviteEmail,
        teamName: team.team_name,
        hackathonName: hackathon.title,
        hackathonId: resolvedParams.id,
        teamId: team.id,
        inviterName: user?.user_metadata?.full_name || 'A team member',
      }),
    });

    const data = await response.json();

    if (response.ok) {
      showCustomToast('success', 'Invitation email sent successfully!');
      setInviteEmail('');
    } else {
      showCustomToast('error', data.error || 'Failed to send invitation email');
    }
  } catch (error) {
    showCustomToast('error', 'Failed to send invitation email');
  } finally {
    setSendingEmail(false);
  }
};

// Edit member
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

  setSubmitting(true);
  try {
    const result = await updateTeamMember(memberToEdit.id, memberFormData);
    if (result.success) {
      showCustomToast('success', 'Member details updated successfully');
      setShowEditMemberModal(false);
      setMemberToEdit(null);
      await loadData();
    } else {
      showCustomToast('error', result.error || 'Failed to update member details');
    }
  } catch (error) {
    showCustomToast('error', 'An unexpected error occurred');
  } finally {
    setSubmitting(false);
  }
};

// Cancel registration
const handleCancelRegistration = async () => {
  if (confirmText !== 'confirm') {
    showCustomToast('error', 'Please type "confirm" to continue');
    return;
  }

  try {
    const result = await cancelRegistration(resolvedParams.id);
    if (result.success) {
      showCustomToast('success', 'Registration cancelled successfully');
      router.push(`/hackathons/${resolvedParams.id}`);
    } else {
      showCustomToast('error', result.error || 'Failed to cancel registration');
    }
  } catch (error) {
    showCustomToast('error', 'An unexpected error occurred');
  } finally {
    setShowCancelDialog(false);
    setConfirmText('');
  }
};

// Get organization label based on participant type
const getOrganizationLabel = (participantType: string) => {
  switch (participantType) {
    case 'College Students':
      return 'University Name';
    case 'High School / Primary School Student':
      return 'School Name';
    case 'Professional':
      return 'Organization Name';
    default:
      return 'Organization Name';
  }
};

// ============================================
// 5. UPDATE THE "INVITE FRIENDS" BUTTON
// ============================================
// Replace the existing "Invite Friends" button with:
<button
  onClick={() => setShowInviteModal(true)}
  className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-mono font-bold transition-all border-2 border-gray-700"
>
  <Share2 className="w-5 h-5" />
  Invite Friends
</button>

// ============================================
// 6. ADD EDIT BUTTON TO EACH MEMBER CARD
// ============================================
// In the member card, after the trash button, add:
<button
  onClick={() => handleEditMember(member)}
  className="p-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg transition-all"
  title="Edit member"
>
  <Edit2 className="w-4 h-4 text-blue-400" />
</button>

// ============================================
// 7. UPDATE ORGANIZATION NAME FIELD IN ADD/EDIT MEMBER MODAL
// ============================================
// Replace the existing Organization Name field with:
{(memberFormData.participantType === 'Professional' ||
  memberFormData.participantType === 'College Students' ||
  memberFormData.participantType === 'High School / Primary School Student') && (
  <div>
    <label className="block text-white font-mono font-bold mb-2">
      {getOrganizationLabel(memberFormData.participantType)}
    </label>
    <input
      type="text"
      value={memberFormData.organizationName}
      onChange={(e) => setMemberFormData(prev => ({ ...prev, organizationName: e.target.value }))}
      className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white font-mono focus:outline-none focus:border-teal-400"
      placeholder={getOrganizationLabel(memberFormData.participantType)}
    />
  </div>
)}

// ============================================
// 8. ADD THE CANCEL REGISTRATION BUTTON
// ============================================
// Add this button in the Action Buttons section at the bottom:
<button
  onClick={() => setShowCancelDialog(true)}
  className="px-8 py-4 bg-red-500/10 hover:bg-red-500/20 border-2 border-red-500/30 text-red-400 rounded-xl font-mono font-bold transition-all"
>
  Cancel Registration
</button>

// ============================================
// 9. ADD THESE MODALS BEFORE THE CLOSING </div> OF THE MAIN COMPONENT
// ============================================

{/* Invite Friends Modal */}
<AlertDialog open={showInviteModal} onOpenChange={setShowInviteModal}>
  <AlertDialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 max-w-md">
    <AlertDialogHeader>
      <AlertDialogTitle className="font-blackops text-2xl text-white text-center">
        Invite Friends
      </AlertDialogTitle>
      <div className="text-center">
        <button
          onClick={() => setShowInviteModal(false)}
          className="absolute right-6 top-6 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
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
            <WhatsAppIcon />
          </button>

          <button
            onClick={handleShareLinkedIn}
            className="w-12 h-12 rounded-full bg-[#0077B5] hover:bg-[#006399] flex items-center justify-center transition-colors"
            title="Share on LinkedIn"
          >
            <Linkedin className="w-6 h-6 text-white" />
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
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white font-mono focus:outline-none focus:border-teal-400 mb-3"
          />
          <button
            onClick={handleSendInviteEmail}
            disabled={sendingEmail}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white rounded-xl font-mono font-bold transition-all disabled:opacity-50"
          >
            {sendingEmail ? 'Sending...' : 'Send'}
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
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
              title="Copy link"
            >
              <Copy className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-mono">Copy link</span>
            </button>
          </div>
        </div>
      </AlertDialogDescription>
    </AlertDialogHeader>
  </AlertDialogContent>
</AlertDialog>

{/* Edit Member Modal */}
{showEditMemberModal && memberToEdit && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6 overflow-y-auto">
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8 max-w-2xl w-full my-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-blackops text-white">EDIT MEMBER DETAILS</h3>
        <button onClick={() => {
          setShowEditMemberModal(false);
          setMemberToEdit(null);
        }}>
          <X className="w-6 h-6 text-gray-400 hover:text-white" />
        </button>
      </div>

      <form onSubmit={handleUpdateMember} className="space-y-4">
        {/* Same form fields as Add Member Modal */}
        {/* Copy from the Add Member modal but use handleUpdateMember */}

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => {
              setShowEditMemberModal(false);
              setMemberToEdit(null);
            }}
            className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-mono font-bold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white rounded-xl font-mono font-bold disabled:opacity-50"
          >
            {submitting ? 'Updating...' : 'Update Member'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{/* Cancel Registration Dialog */}
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
        <div className="pt-2">
          <label className="block text-gray-400 text-sm mb-2">Type 'confirm' to continue</label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 rounded-lg text-white font-mono focus:outline-none focus:border-red-400"
            placeholder="confirm"
          />
        </div>
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter className="gap-3">
      <AlertDialogCancel
        className="bg-gray-800 py-6 hover:bg-black border-gray-600 text-white font-mono"
        onClick={() => setConfirmText('')}
      >
        Keep Registration
      </AlertDialogCancel>
      <AlertDialogAction
        onClick={handleCancelRegistration}
        disabled={confirmText !== 'confirm'}
        className="bg-gradient-to-r py-6 from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-mono font-bold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Cancel Registration
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
