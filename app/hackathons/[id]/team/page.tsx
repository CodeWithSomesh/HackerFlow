'use client'

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  Edit2,
  Users,
  UserPlus,
  X,
  Mail,
  Phone,
  MapPin,
  Building,
  Share2,
  Trash2,
  Copy,
  Linkedin
} from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { TeamCreationSchema, TeamMemberSchema } from "@/lib/validations/hackathon-registration";
import {
  checkUserRegistration,
  getMyTeam,
  updateTeam,
  addTeamMember,
  removeTeamMember,
  getTeamsSeekingMembers,
  completeTeam
} from "@/lib/actions/hackathon-registration-actions";
import {
  sendTeamMergeInvite,
  getTeamMergeInvitations,
  respondToMergeInvite
} from "@/lib/actions/team-merge-actions";
import { fetchHackathonById } from "@/lib/actions/createHackathon-actions";
import { showCustomToast } from "@/components/toast-notification";
import { triggerCustomShapes } from "@/lib/confetti";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { updateTeamMember, cancelRegistration } from "@/lib/actions/hackathon-registration-actions";
import { createClient } from "@/lib/supabase/client";

interface TeamPageProps {
  params: Promise<{ id: string }>;
}

const WhatsAppIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path>
  </svg>
);

type TeamFormData = z.infer<typeof TeamCreationSchema>;
type MemberFormData = z.infer<typeof TeamMemberSchema>;

export default function TeamManagementPage({ params }: TeamPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [hackathon, setHackathon] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [team, setTeam] = useState<any>(null);
  const [isLeader, setIsLeader] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [teamsSeekingMembers, setTeamsSeekingMembers] = useState<any[]>([]);
  const [inviteLink, setInviteLink] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditTeamModal, setShowEditTeamModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<any>(null);
  const [completingTeam, setCompletingTeam] = useState(false);
  const [mergeInvitations, setMergeInvitations] = useState<any[]>([]);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [showInvitationsModal, setShowInvitationsModal] = useState(false);

  const [teamFormData, setTeamFormData] = useState<TeamFormData>({
    teamName: '',
    lookingForTeammates: true,
  });

  const [memberFormData, setMemberFormData] = useState<MemberFormData>({
    email: '',
    mobile: '',
    firstName: '',
    lastName: '',
    organizationName: '',
    participantType: 'College Students',
    passoutYear: '',
    domain: '',
    location: '',
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    loadData();
  }, [resolvedParams.id]);

  useEffect(() => {
    if (team?.id) {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      setInviteLink(`${baseUrl}/hackathons/${resolvedParams.id}/join-team/${team.id}`);
    }
  }, [team, resolvedParams.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Check registration status
      const registrationCheck = await checkUserRegistration(resolvedParams.id);
      if (!registrationCheck.isRegistered) {
        router.push(`/hackathons/${resolvedParams.id}/register`);
        return;
      }

      setIsLeader(registrationCheck.isTeamLeader || false);

      // For team-based hackathons, verify user is still a team member
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user && registrationCheck.registration?.team_id) {
        const { data: memberCheck } = await supabase
          .from('hackathon_team_members')
          .select('id, status')
          .eq('team_id', registrationCheck.registration.team_id)
          .eq('user_id', user.id)
          .maybeSingle();

        // If user was removed from team, they won't have a member record
        if (!memberCheck) {
          setTeam({ removed: true, team_name: registrationCheck.registration?.hackathon_teams?.team_name });
          setLoading(false);
          return;
        }
      }

      // Fetch hackathon details
      const hackathonResult = await fetchHackathonById(resolvedParams.id);
      if (hackathonResult.success && hackathonResult.data) {
        setHackathon(hackathonResult.data);
      }

      // Fetch team details
      if (hackathonResult.data?.participation_type === 'team') {
        const teamResult = await getMyTeam(resolvedParams.id);
        if (teamResult.success && teamResult.data) {
          setTeam(teamResult.data);
          setTeamFormData({
            teamName: teamResult.data.team_name,
            lookingForTeammates: teamResult.data.looking_for_teammates,
          });
        }

        // Fetch teams seeking members
        const teamsResult = await getTeamsSeekingMembers(resolvedParams.id);
        console.log('Teams seeking result:', teamsResult);
        if (teamsResult.success) {
          // Filter out own team from the list
          const filteredTeams = (teamsResult.data || []).filter(
            (seekingTeam: any) => seekingTeam.id !== teamResult.data?.id
          );
          console.log('Filtered teams:', filteredTeams);
          setTeamsSeekingMembers(filteredTeams);
        } else {
          console.error('Failed to fetch teams seeking members:', teamsResult.error);
        }

        // Fetch team merge invitations
        if (teamResult.data?.id) {
          const invitationsResult = await getTeamMergeInvitations(teamResult.data.id);
          if (invitationsResult.success) {
            setMergeInvitations(invitationsResult.data || []);
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showCustomToast('error', 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTeam = async () => {
    if (!team) return;

    setSubmitting(true);
    try {
      const result = await updateTeam(team.id, teamFormData);
      if (result.success) {
        showCustomToast('success', 'Team updated successfully');
        setShowEditTeamModal(false);
        await loadData();
      } else {
        showCustomToast('error', result.error || 'Failed to update team');
      }
    } catch (error) {
      showCustomToast('error', 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;

    setSubmitting(true);
    try {
      TeamMemberSchema.parse(memberFormData);

      const result = await addTeamMember(team.id, memberFormData);
      if (result.success) {
        showCustomToast('success', 'Team member added successfully');

        // Send email invitation to the added member
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();

          const emailResponse = await fetch('/api/send-team-invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: memberFormData.email,
              teamName: team.team_name,
              hackathonName: hackathon.title,
              hackathonId: resolvedParams.id,
              teamId: team.id,
              inviterName: user?.user_metadata?.full_name || 'Team Leader',
            }),
          });

          const emailData = await emailResponse.json();
          if (emailResponse.ok) {
            if (emailData.devMode) {
              showCustomToast('success', 'Invitation link created! (Dev mode: check console for email details)');
              console.log('📧 Invite link:', emailData.inviteLink);
            } else {
              showCustomToast('success', 'Invitation email sent successfully!');
            }
          } else {
            console.error('Email API error:', emailData);
            showCustomToast('error', `Email not sent: ${emailData.error || 'Unknown error'}`);
          }
        } catch (emailError) {
          console.error('Failed to send invitation email:', emailError);
          showCustomToast('error', 'Failed to send invitation email');
        }

        setShowAddMemberModal(false);
        setMemberFormData({
          email: '',
          mobile: '',
          firstName: '',
          lastName: '',
          organizationName: '',
          participantType: 'College Students',
          passoutYear: '',
          domain: '',
          location: '',
        });
        await loadData();
      } else {
        showCustomToast('error', result.error || 'Failed to add team member');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const zodError = error as z.ZodError;
        const newErrors: any = {};
        zodError.issues.forEach((err: any) => {
          if (err.path[0]) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
      }
      showCustomToast('error', 'Please fix the errors before submitting');
    } finally {
      setSubmitting(false);
    }
  };

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

  const getInitials = (firstName: string, lastName?: string) => {
    return `${firstName[0]}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getMemberStatusStyle = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-500/10 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 'rejected':
        return 'bg-red-500/10 border-red-500/30';
      default:
        return 'bg-gray-500/10 border-gray-500/30';
    }
  };

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

  const handleCompleteTeam = async () => {
    if (!team?.id) return;

    // Check if all members are verified (status === 'accepted')
    const unverifiedMembers = team.hackathon_team_members?.filter(
      (m: any) => m.status !== 'accepted'
    );

    if (unverifiedMembers && unverifiedMembers.length > 0) {
      showCustomToast('error', 'Cannot complete team. All team members must verify their accounts before completing the team.');
      return;
    }

    setCompletingTeam(true);
    try {
      const result = await completeTeam(team.id);
      if (result.success) {
        showCustomToast('success', 'Team completed successfully! Confirmation emails sent to all members.');
        triggerCustomShapes(); // Confetti celebration!
        await loadData(); // Reload to show updated state
      } else {
        showCustomToast('error', result.error || 'Failed to complete team');
      }
    } catch (error) {
      showCustomToast('error', 'An unexpected error occurred');
    } finally {
      setCompletingTeam(false);
      setShowCompleteDialog(false);
    }
  };

  const handleSendMergeInvite = async (receiverTeamId: string) => {
    if (!team?.id) return;

    setSendingInvite(true);
    try {
      const result = await sendTeamMergeInvite(
        team.id,
        receiverTeamId,
        resolvedParams.id
      );

      if (result.success) {
        showCustomToast('success', 'Merge invitation sent successfully!');
        await loadData(); // Reload to show updated invitations
      } else {
        showCustomToast('error', result.error || 'Failed to send invitation');
      }
    } catch (error) {
      showCustomToast('error', 'An unexpected error occurred');
    } finally {
      setSendingInvite(false);
    }
  };

  const handleRespondToInvite = async (invitationId: string, action: 'accept' | 'reject') => {
    try {
      const result = await respondToMergeInvite(invitationId, action);

      if (result.success) {
        showCustomToast('success', result.message || `Invitation ${action}ed successfully!`);
        if (action === 'accept') {
          triggerCustomShapes(); // Celebrate team merge!
        }

        // Immediately update UI by removing the invitation from state
        setMergeInvitations((prev: any[]) =>
          prev.filter((inv: any) => inv.id !== invitationId)
        );

        // Then reload all data to get fresh state
        await loadData();
      } else {
        showCustomToast('error', result.error || `Failed to ${action} invitation`);
      }
    } catch (error) {
      showCustomToast('error', 'An unexpected error occurred');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-teal-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl font-mono">Loading team details...</p>
        </div>
      </div>
    );
  }

  if (!hackathon || hackathon.participation_type !== 'team') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-3xl font-blackops text-white mb-4">Team Page Not Available</h1>
          <p className="text-gray-400 font-mono mb-6">This hackathon doesn't require teams</p>
          <Link
            href={`/hackathons/${resolvedParams.id}`}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-lg font-mono font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Hackathon
          </Link>
        </div>
      </div>
    );
  }

  // Non-leader view
  if (!isLeader) {
    return (
      <div className="min-h-screen bg-black">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b-2 border-gray-700 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link
                href={`/hackathons/${resolvedParams.id}`}
                className="flex items-center gap-3 bg-gradient-to-r from-purple-500/20 to-teal-500/20 hover:from-purple-500/30 hover:to-teal-500/30 border-2 border-purple-500/40 hover:border-teal-400 text-white px-6 py-3 rounded-xl font-blackops transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-lg">BACK</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8">
            <h1 className="text-3xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-teal-400 mb-6">
              MY TEAM
            </h1>

            {team?.removed ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center mx-auto mb-6">
                  <X className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-blackops text-white mb-4">REMOVED FROM TEAM</h2>
                <p className="text-gray-400 font-mono mb-2">
                  You have been removed from <strong className="text-white">{team.team_name}</strong>
                </p>
                <p className="text-gray-400 font-mono mb-6">
                  by the team leader.
                </p>
                <div className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-6 max-w-md mx-auto mb-6">
                  <p className="text-red-300 font-mono text-sm">
                    You are no longer part of this team. If you believe this was a mistake, please contact the team leader.
                  </p>
                </div>
                <Link
                  href={`/hackathons/${resolvedParams.id}`}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white rounded-xl font-mono font-bold transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Hackathon
                </Link>
              </div>
            ) : team && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-blackops text-white mb-2">{team.team_name}</h2>
                  <p className="text-gray-400 font-mono">
                    Team Size: {team.hackathon_team_members?.length}/{team.team_size_max}
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-blackops text-white">TEAMMATES ({team.hackathon_team_members?.length || 0}/{team.team_size_max})</h3>
                  {team.hackathon_team_members?.map((member: any) => (
                    <div
                      key={member.id}
                      className={`p-6 border-2 rounded-xl ${
                        member.is_leader ? 'bg-green-500/5 border-green-500/30' : getMemberStatusStyle(member.status)
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-blackops">
                          {getInitials(member.first_name, member.last_name)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-blackops text-white">
                              {member.first_name} {member.last_name}
                            </h4>
                            {member.is_leader && (
                              <span className="px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full text-yellow-400 text-xs font-mono font-bold">
                                TEAM LEADER
                              </span>
                            )}
                            {member.status === 'pending' && !member.is_leader && (
                              <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-400 text-xs font-mono font-bold">
                                PENDING
                              </span>
                            )}
                            {member.status === 'accepted' && !member.is_leader && (
                              <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-xs font-mono font-bold">
                                VERIFIED
                              </span>
                            )}
                          </div>
                          <div className="space-y-2 text-gray-300 font-mono text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span>{member.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span>{member.mobile}</span>
                            </div>
                            {member.organization_name && (
                              <div className="flex items-center gap-2">
                                <Building className="w-4 h-4 text-gray-400" />
                                <span>{member.organization_name}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span>{member.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Team leader view
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b-2 border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href={`/hackathons/${resolvedParams.id}`}
              className="flex items-center gap-3 bg-gradient-to-r from-purple-500/20 to-teal-500/20 hover:from-purple-500/30 hover:to-teal-500/30 border-2 border-purple-500/40 hover:border-teal-400 text-white px-6 py-3 rounded-xl font-blackops transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-lg">BACK</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className={`${team.hackathon_team_members?.length < hackathon.team_size_max && !team?.is_completed ? "grid lg:grid-cols-[60%_38%] gap-x-4": "max-w-7xl mx-auto gap-4"}`}>
          {/* Left Section - Team Management */}
          <div className="space-y-6">
            {/* Team Info Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8 mb-4">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-teal-400">
                  CREATE A TEAM
                </h1>
                <button
                  onClick={() => setShowEditTeamModal(true)}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg border-2 border-gray-700 hover:border-gray-600 transition-all"
                >
                  <Edit2 className="w-5 h-5 text-teal-400" />
                </button>
              </div>

              {/* Team Name */}
              <div className="mb-6">
                <h2 className="text-2xl font-blackops text-white mb-2">{team?.team_name || 'No Team Name'}</h2>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 font-mono">
                    Teammates ({team?.hackathon_team_members?.length || 0}/{hackathon.team_size_max})
                  </span>
                  {team?.team_size_current >= hackathon.team_size_max && (
                    <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-xs font-mono font-bold">
                      YOUR TEAM IS COMPLETE
                    </span>
                  )}
                </div>
              </div>

              {/* Team Members List */}
              <div className="space-y-4 mb-6">
                {team?.hackathon_team_members?.map((member: any, index: number) => (
                  <div
                    key={member.id}
                    className={`p-6 border-2 rounded-xl ${
                      member.is_leader
                        ? 'bg-green-500/5 border-green-500/30'
                        : member.status === 'accepted'
                        ? 'bg-green-500/5 border-green-500/30'
                        : member.status === 'pending'
                        ? 'bg-yellow-500/5 border-yellow-500/30'
                        : 'bg-gray-800/30 border-gray-700/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-blackops flex-shrink-0">
                        {getInitials(member.first_name, member.last_name)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-blackops text-white">
                            {member.first_name} {member.last_name}
                          </h4>
                          {member.is_leader && (
                            <span className="px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full text-yellow-400 text-xs font-mono font-bold">
                              TEAM LEADER
                            </span>
                          )}
                          {member.status === 'pending' && !member.is_leader && (
                            <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-400 text-xs font-mono font-bold">
                              CONFIRMATION PENDING
                            </span>
                          )}
                          {member.status === 'accepted' && !member.is_leader && (
                            <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-xs font-mono font-bold">
                              VERIFIED
                            </span>
                          )}
                        </div>
                        <div className="text-gray-300 font-mono text-sm">
                          <p>{member.mobile}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!member.is_leader && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEditMember(member)}
                          className="p-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg transition-all"
                          title="Edit member details"
                        >
                          <Edit2 className="w-4 h-4 text-blue-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Member Buttons */}
              {team && team.hackathon_team_members?.length < hackathon.team_size_max && !team.is_completed && (
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowAddMemberModal(true)}
                    disabled={team.hackathon_team_members?.length >= hackathon.team_size_max || team.is_completed}
                    className="flex-1 flex items-center  justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white rounded-xl font-mono font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserPlus className="w-5 h-5" />
                    Add New Member
                  </button>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    disabled={team.hackathon_team_members?.length >= hackathon.team_size_max || team.is_completed}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-mono font-bold transition-all border-2 border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Share2 className="w-5 h-5" />
                    Invite Friends
                  </button>
                </div>
              )}

              {/* Status Legend */}
              <div className="mt-6 pt-6 border-t-2 border-gray-700">
                <div className="flex flex-wrap gap-4 text-sm font-mono">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-300">Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-gray-300">Confirmation Pending/Unsaved Changes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-gray-300">Not Added Yet</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Teams Seeking Members */}
          {team && team.hackathon_team_members?.length < hackathon.team_size_max && !team.is_completed && (
            <div className="space-y-6 ">
              {/* Pending Invitations */}
              {mergeInvitations.filter((inv: any) => inv.status === 'pending' && inv.receiver_team_id === team.id).length > 0 && (
                <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl border-2 border-blue-700 p-6">
                  <h3 className="text-xl font-blackops text-white mb-6">MERGE INVITATIONS</h3>
                  <div className="space-y-4">
                    {mergeInvitations
                      .filter((inv: any) => inv.status === 'pending' && inv.receiver_team_id === team.id)
                      .map((invitation: any) => {
                        const senderTeam = invitation.sender_team;
                        const senderLeader = senderTeam?.hackathon_team_members?.find((m: any) => m.is_leader);

                        return (
                          <div key={invitation.id} className="p-4 bg-blue-800/30 border-2 border-blue-700/50 rounded-xl">
                            <div className="mb-3">
                              <h4 className="font-blackops text-white mb-1">{senderTeam?.team_name || 'Unknown Team'}</h4>
                              <p className="text-sm text-blue-300 font-mono">
                                {senderLeader?.first_name || 'Team Leader'} wants to merge teams!
                              </p>
                              {invitation.message && (
                                <p className="text-sm text-gray-300 font-mono mt-2 italic">
                                  &quot;{invitation.message}&quot;
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleRespondToInvite(invitation.id, 'accept')}
                                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-mono font-bold transition-all"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleRespondToInvite(invitation.id, 'reject')}
                                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-mono font-bold transition-all"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Teams Seeking Members */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-6">
                <h3 className="text-xl font-blackops text-white mb-6">TEAMS SEEKING MEMBERS</h3>

                {/* Content */}
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {teamsSeekingMembers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 font-mono">No teams looking for members at the moment.</p>
                    </div>
                  ) : (
                    teamsSeekingMembers.map((seekingTeam) => {
                      // Check if invitation already sent
                      const hasPendingInvite = mergeInvitations.some(
                        (inv: any) =>
                          inv.status === 'pending' &&
                          ((inv.sender_team_id === team.id && inv.receiver_team_id === seekingTeam.id) ||
                           (inv.receiver_team_id === team.id && inv.sender_team_id === seekingTeam.id))
                      );

                      return (
                        <div key={seekingTeam.id} className="p-4 bg-gray-800/30 border-2 border-gray-700/50 rounded-xl hover:border-teal-500/30 transition-all">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-blackops text-white mb-1">{seekingTeam.team_name}</h4>
                              <p className="text-sm text-gray-400 font-mono">
                                {seekingTeam.hackathon_team_members?.[0]?.first_name || 'Team Leader'}
                              </p>
                              <p className="text-sm text-gray-400 font-mono">
                                {seekingTeam.hackathon_team_members?.[0]?.organization_name || 'Organization'}
                              </p>
                            </div>
                            <button
                              onClick={() => handleSendMergeInvite(seekingTeam.id)}
                              disabled={sendingInvite || hasPendingInvite || !isLeader}
                              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white rounded-lg text-sm font-mono font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {hasPendingInvite ? 'Invited' : 'Invite'}
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                            <Users className="w-4 h-4" />
                            <span>({seekingTeam.hackathon_team_members?.length}/{seekingTeam.team_size_max})</span>
                            <span className="text-gray-600">•</span>
                            <span>Team created {new Date(seekingTeam.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-5 justify-end ">
            <Link
              href={`/hackathons/${resolvedParams.id}`}
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-mono font-bold transition-all border-2 border-gray-700"
            >
              Back
            </Link>
            {isLeader && (
              <>
                {!team?.is_completed ? (
                  <>
                    <button
                      onClick={() => setShowCancelDialog(true)}
                      className="px-8 py-4 bg-red-500/10 hover:bg-red-500/20 border-2 border-red-500/30 hover:border-red-500 text-red-400 hover:text-red-300 rounded-xl font-mono font-bold transition-all"
                    >
                      Cancel Registration
                    </button>
                    <button
                      onClick={() => setShowCompleteDialog(true)}
                      disabled={team?.hackathon_team_members?.filter((m: any) => m.status === 'accepted').length < 1}
                      className="px-8 py-4 bg-green-500/10 hover:bg-green-500/20 border-2 border-green-500/30 hover:border-green-500 text-green-400 hover:text-green-300 rounded-xl font-mono font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Complete Team
                    </button>
                  </>
                ) : (
                  <>
                    <div className="px-8 py-4 bg-green-500/20 border-2 border-green-500 text-green-300 rounded-xl font-mono font-bold">
                      ✓ Team Completed
                    </div>
                    {/* <button
                      onClick={() => setShowEditTeamModal(true)}
                      className="px-8 py-4 bg-blue-500/10 hover:bg-blue-500/20 border-2 border-blue-500/30 hover:border-blue-500 text-blue-400 hover:text-blue-300 rounded-xl font-mono font-bold transition-all"
                    >
                      Edit Team Details
                    </button> */}
                    <button
                      onClick={() => setShowCancelDialog(true)}
                      className="px-8 py-4 bg-red-500/10 hover:bg-red-500/20 border-2 border-red-500/30 hover:border-red-500 text-red-400 hover:text-red-300 rounded-xl font-mono font-bold transition-all"
                    >
                      Cancel Registration
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit Team Modal */}
      {showEditTeamModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-blackops text-white">EDIT TEAM</h3>
              <button onClick={() => setShowEditTeamModal(false)}>
                <X className="w-6 h-6 text-gray-400 hover:text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white font-mono font-bold mb-2">
                  Team Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={teamFormData.teamName}
                  onChange={(e) => setTeamFormData(prev => ({ ...prev, teamName: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white font-mono focus:outline-none focus:border-teal-400"
                  placeholder="Enter your team name"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={teamFormData.lookingForTeammates}
                  onChange={(e) => setTeamFormData(prev => ({ ...prev, lookingForTeammates: e.target.checked }))}
                  className="w-5 h-5 rounded border-2 border-gray-700 bg-gray-800"
                />
                <label className="text-gray-300 font-mono">Looking for Teammates</label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowEditTeamModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-mono font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateTeam}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white rounded-xl font-mono font-bold disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6 overflow-y-auto">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8 max-w-2xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-blackops text-white">ADD TEAM MEMBER</h3>
              <button onClick={() => {
                setShowAddMemberModal(false);
                setMemberFormData({
                  email: '',
                  mobile: '',
                  firstName: '',
                  lastName: '',
                  organizationName: '',
                  participantType: 'College Students',
                  passoutYear: '',
                  domain: '',
                  location: '',
                });
                setErrors({});
              }}>
                <X className="w-6 h-6 text-gray-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-mono font-bold mb-2">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={memberFormData.email}
                    onChange={(e) => setMemberFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white font-mono focus:outline-none focus:border-teal-400"
                  />
                  {errors.email && <p className="mt-1 text-red-400 text-sm font-mono">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-white font-mono font-bold mb-2">
                    Mobile <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={memberFormData.mobile}
                    onChange={(e) => setMemberFormData(prev => ({ ...prev, mobile: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white font-mono focus:outline-none focus:border-teal-400"
                  />
                  {errors.mobile && <p className="mt-1 text-red-400 text-sm font-mono">{errors.mobile}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-mono font-bold mb-2">
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={memberFormData.firstName}
                    onChange={(e) => setMemberFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white font-mono focus:outline-none focus:border-teal-400"
                  />
                  {errors.firstName && <p className="mt-1 text-red-400 text-sm font-mono">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-white font-mono font-bold mb-2">Last Name</label>
                  <input
                    type="text"
                    value={memberFormData.lastName}
                    onChange={(e) => setMemberFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white font-mono focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-mono font-bold mb-2">
                  Participant Type <span className="text-red-400">*</span>
                </label>
                <select
                  value={memberFormData.participantType}
                  onChange={(e) => setMemberFormData(prev => ({ ...prev, participantType: e.target.value as any }))}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white font-mono focus:outline-none focus:border-teal-400"
                >
                  <option value="College Students">College Students</option>
                  <option value="Professional">Professional</option>
                  <option value="High School / Primary School Student">High School / Primary School Student</option>
                  <option value="Fresher">Fresher</option>
                </select>
              </div>

              {/* Organization Name - Conditional based on participant type */}
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

              <div>
                <label className="block text-white font-mono font-bold mb-2">
                  Location <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={memberFormData.location}
                  onChange={(e) => setMemberFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white font-mono focus:outline-none focus:border-teal-400"
                  placeholder="City, State, Country"
                />
                {errors.location && <p className="mt-1 text-red-400 text-sm font-mono">{errors.location}</p>}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMemberModal(false);
                    setMemberFormData({
                      email: '',
                      mobile: '',
                      firstName: '',
                      lastName: '',
                      organizationName: '',
                      participantType: 'College Students',
                      passoutYear: '',
                      domain: '',
                      location: '',
                    });
                    setErrors({});
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
                  {submitting ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Member AlertDialog */}
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
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-300 text-xs">
                  The member will be removed from your team immediately.
                </p>
              </div>
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white font-mono font-bold mb-2">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={memberFormData.email}
              onChange={(e) => setMemberFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white font-mono focus:outline-none focus:border-teal-400"
            />
            {errors.email && <p className="mt-1 text-red-400 text-sm font-mono">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-white font-mono font-bold mb-2">
              Mobile <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              value={memberFormData.mobile}
              onChange={(e) => setMemberFormData(prev => ({ ...prev, mobile: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white font-mono focus:outline-none focus:border-teal-400"
            />
            {errors.mobile && <p className="mt-1 text-red-400 text-sm font-mono">{errors.mobile}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white font-mono font-bold mb-2">
              First Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={memberFormData.firstName}
              onChange={(e) => setMemberFormData(prev => ({ ...prev, firstName: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white font-mono focus:outline-none focus:border-teal-400"
            />
            {errors.firstName && <p className="mt-1 text-red-400 text-sm font-mono">{errors.firstName}</p>}
          </div>

          <div>
            <label className="block text-white font-mono font-bold mb-2">Last Name</label>
            <input
              type="text"
              value={memberFormData.lastName}
              onChange={(e) => setMemberFormData(prev => ({ ...prev, lastName: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white font-mono focus:outline-none focus:border-teal-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-white font-mono font-bold mb-2">
            Participant Type <span className="text-red-400">*</span>
          </label>
          <select
            value={memberFormData.participantType}
            onChange={(e) => setMemberFormData(prev => ({ ...prev, participantType: e.target.value as any }))}
            className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white font-mono focus:outline-none focus:border-teal-400"
          >
            <option value="College Students">College Students</option>
            <option value="Professional">Professional</option>
            <option value="High School / Primary School Student">High School / Primary School Student</option>
            <option value="Fresher">Fresher</option>
          </select>
        </div>

        {/* Organization Name - Conditional based on participant type */}
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

        <div>
          <label className="block text-white font-mono font-bold mb-2">
            Location <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={memberFormData.location}
            onChange={(e) => setMemberFormData(prev => ({ ...prev, location: e.target.value }))}
            className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white font-mono focus:outline-none focus:border-teal-400"
            placeholder="City, State, Country"
          />
          {errors.location && <p className="mt-1 text-red-400 text-sm font-mono">{errors.location}</p>}
        </div>

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

{/* Complete Team Dialog */}
<AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
  <AlertDialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 max-w-md">
    <AlertDialogHeader>
      <AlertDialogTitle className="font-blackops text-2xl text-white flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
          <Users className="w-6 h-6 text-white" />
        </div>
        Complete Team?
      </AlertDialogTitle>
      <AlertDialogDescription className="text-gray-300 font-mono text-sm space-y-3 pt-4">
        <p>Are you ready to complete your team for this hackathon?</p>
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <p className="text-green-300 text-xs">
            This will confirm your team for the hackathon and send confirmation emails to all team members with good luck wishes!
          </p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-3">
          <p className="text-blue-300 text-xs">
            <strong>Note:</strong> You don't need to reach the maximum team size to complete. You can proceed with your current team members.
          </p>
        </div>
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter className="gap-3">
      <AlertDialogCancel
        className="bg-gray-800 py-6 hover:bg-black border-gray-600 text-white font-mono"
      >
        Not Yet
      </AlertDialogCancel>
      <AlertDialogAction
        onClick={handleCompleteTeam}
        disabled={completingTeam}
        className="bg-gradient-to-r py-6 from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-mono font-bold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {completingTeam ? 'Completing...' : 'Complete Team'}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
    </div>
  );
}
