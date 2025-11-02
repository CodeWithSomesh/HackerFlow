'use client'

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Users, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { fetchHackathonById } from "@/lib/actions/createHackathon-actions";
import { getMyTeam, checkUserRegistration } from "@/lib/actions/hackathon-registration-actions";
import { createClient } from "@/lib/supabase/client";
import { showCustomToast } from "@/components/toast-notification";

interface JoinTeamPageProps {
  params: Promise<{ id: string; teamId: string }>;
}

export default function JoinTeamPage({ params }: JoinTeamPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'checking' | 'ready' | 'success' | 'error' | 'already-member'>('checking');
  const [message, setMessage] = useState('');
  const [verifying, setVerifying] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [hackathon, setHackathon] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [team, setTeam] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [memberData, setMemberData] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    handleJoinTeam();
  }, [resolvedParams.id, resolvedParams.teamId]);

  const handleJoinTeam = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      // If not logged in, redirect to login with return URL
      if (!currentUser) {
        const returnUrl = `/hackathons/${resolvedParams.id}/join-team/${resolvedParams.teamId}`;
        router.push(`/sign-in?redirect=${encodeURIComponent(returnUrl)}`);
        return;
      }

      setUser(currentUser);

      // Fetch hackathon details
      const hackathonResult = await fetchHackathonById(resolvedParams.id);
      if (!hackathonResult.success || !hackathonResult.data) {
        setStatus('error');
        setMessage('Hackathon not found');
        setLoading(false);
        return;
      }
      setHackathon(hackathonResult.data);

      // Fetch team details with members
      const { data: teamData, error: teamError } = await supabase
        .from('hackathon_teams')
        .select(`
          *,
          hackathon_team_members(*)
        `)
        .eq('id', resolvedParams.teamId)
        .single();

      if (teamError || !teamData) {
        setStatus('error');
        setMessage('Team not found or invitation link is invalid');
        setLoading(false);
        return;
      }
      setTeam(teamData);

      // Check if team is full
      if (teamData.team_size_current >= teamData.team_size_max) {
        setStatus('error');
        setMessage('This team is already full');
        setLoading(false);
        return;
      }

      // Check if user is already registered for this hackathon
      const registrationCheck = await checkUserRegistration(resolvedParams.id);
      if (registrationCheck.isRegistered) {
        // Check if user is already in this team
        const userTeam = await getMyTeam(resolvedParams.id);
        if (userTeam.success && userTeam.data) {
          if (userTeam.data.id === resolvedParams.teamId) {
            // User is already in this team
            const userMember = teamData.hackathon_team_members.find((m: any) => m.user_id === currentUser.id);
            if (userMember) {
              if (userMember.status === 'accepted') {
                setStatus('already-member');
                setMessage('You are already a verified member of this team!');
              } else {
                // User is pending, show details for verification
                setMemberData(userMember);
                setStatus('ready');
              }
            }
          } else {
            setStatus('error');
            setMessage('You are already registered for this hackathon with a different team. Please cancel your current registration first.');
          }
          setLoading(false);
          return;
        }
      }

      // Check if there's a member record with matching email for this team
      const { data: memberByEmail, error: memberError } = await supabase
        .from('hackathon_team_members')
        .select('*')
        .eq('team_id', resolvedParams.teamId)
        .eq('email', currentUser.email)
        .maybeSingle();

      console.log('Looking for member with email:', currentUser.email);
      console.log('Found member:', memberByEmail);
      console.log('Member error:', memberError);

      if (memberByEmail) {
        // Member record exists for this email
        if (memberByEmail.status === 'accepted') {
          setStatus('already-member');
          setMessage('You are already a verified member of this team!');
        } else {
          // Member is pending - need to link user_id if not already linked
          if (!memberByEmail.user_id || memberByEmail.user_id !== currentUser.id) {
            console.log('Linking user ID to member record...');
            const { error: linkError } = await supabase
              .from('hackathon_team_members')
              .update({ user_id: currentUser.id })
              .eq('id', memberByEmail.id);

            if (linkError) {
              console.error('Failed to link user:', linkError);
              setStatus('error');
              setMessage('Failed to link your account to team invitation');
              setLoading(false);
              return;
            }
            console.log('User ID linked successfully');
          }

          // Show verification page
          setMemberData(memberByEmail);
          setStatus('ready');
        }
      } else {
        // No member record found with this email
        setStatus('error');
        setMessage('You were not invited to this team. Please ask the team leader to add you first.');
      }
    } catch (error) {
      console.error('Error joining team:', error);
      setStatus('error');
      setMessage('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndJoin = async () => {
    if (!memberData || !user) return;

    setVerifying(true);
    try {
      const supabase = createClient();

      // Update member status to accepted
      const { error: updateError } = await supabase
        .from('hackathon_team_members')
        .update({
          status: 'accepted',
          joined_at: new Date().toISOString()
        })
        .eq('id', memberData.id);

      if (updateError) {
        showCustomToast('error', 'Failed to verify membership');
        return;
      }

      // Update team size count - count all accepted members
      const { data: acceptedMembers } = await supabase
        .from('hackathon_team_members')
        .select('id')
        .eq('team_id', resolvedParams.teamId)
        .eq('status', 'accepted');

      if (acceptedMembers) {
        await supabase
          .from('hackathon_teams')
          .update({ team_size_current: acceptedMembers.length })
          .eq('id', resolvedParams.teamId);
      }

      // Check if registration already exists
      const { data: existingReg } = await supabase
        .from('hackathon_registrations')
        .select('*')
        .eq('hackathon_id', resolvedParams.id)
        .eq('user_id', user.id)
        .single();

      if (!existingReg) {
        // Create registration record with all required fields from member data
        const { error: regError } = await supabase
          .from('hackathon_registrations')
          .insert({
            hackathon_id: resolvedParams.id,
            user_id: user.id,
            team_id: resolvedParams.teamId,
            email: memberData.email,
            mobile: memberData.mobile,
            first_name: memberData.first_name,
            last_name: memberData.last_name,
            organization_name: memberData.organization_name,
            participant_type: memberData.participant_type,
            passout_year: memberData.passout_year,
            domain: memberData.domain,
            location: memberData.location,
          });

        if (regError) {
          console.error('Failed to create registration:', regError);
          showCustomToast('error', 'Failed to complete registration');
          return;
        }
      }

      setStatus('success');
      setMessage('Successfully joined the team! Your account is now verified.');
      showCustomToast('success', 'Successfully joined the team!');
    } catch (error) {
      console.error('Error verifying membership:', error);
      showCustomToast('error', 'An unexpected error occurred');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-teal-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl font-mono">Checking invitation...</p>
        </div>
      </div>
    );
  }

  // Status: Ready to verify
  if (status === 'ready' && memberData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-blackops text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-4">
            VERIFICATION REQUIRED
          </h1>

          <p className="text-gray-300 font-mono text-center mb-6">
            You've been invited to join <strong className="text-white">{team?.team_name}</strong> for <strong className="text-white">{hackathon?.title}</strong>
          </p>

          {/* Team Details */}
          <div className="bg-gray-800/50 border-2 border-gray-700 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-blackops text-white mb-4">TEAM DETAILS</h2>
            <div className="space-y-2 text-gray-300 font-mono text-sm">
              <p><strong className="text-white">Team:</strong> {team?.team_name}</p>
              <p><strong className="text-white">Hackathon:</strong> {hackathon?.title}</p>
              <p><strong className="text-white">Team Size:</strong> {team?.team_size_current}/{team?.team_size_max}</p>
            </div>
          </div>

          {/* Your Details */}
          <div className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-blackops text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              YOUR DETAILS (PENDING VERIFICATION)
            </h2>
            <div className="space-y-2 text-gray-300 font-mono text-sm">
              <p><strong className="text-white">Name:</strong> {memberData.first_name} {memberData.last_name}</p>
              <p><strong className="text-white">Email:</strong> {memberData.email}</p>
              <p><strong className="text-white">Mobile:</strong> {memberData.mobile}</p>
              <p><strong className="text-white">Location:</strong> {memberData.location}</p>
              <p><strong className="text-white">Participant Type:</strong> {memberData.participant_type}</p>
              {memberData.organization_name && (
                <p><strong className="text-white">Organization:</strong> {memberData.organization_name}</p>
              )}
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <p className="text-blue-300 text-sm font-mono">
              ℹ️ Please verify that the details above are correct. Once you click "Verify & Join Team", your account will be marked as verified (green background).
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => router.push(`/hackathons/${resolvedParams.id}`)}
              className="flex-1 px-6 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-mono font-bold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleVerifyAndJoin}
              disabled={verifying}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-xl font-mono font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Verify & Join Team
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Status: Success
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-blackops text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-400 mb-4">
            SUCCESS!
          </h1>
          <p className="text-gray-300 font-mono text-center mb-6">{message}</p>
          <div className="space-y-3">
            <Link
              href={`/hackathons/${resolvedParams.id}/team`}
              className="block w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white rounded-xl font-mono font-bold text-center transition-all"
            >
              Go to Team Page
            </Link>
            <Link
              href={`/hackathons/${resolvedParams.id}`}
              className="block w-full px-6 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-mono font-bold text-center transition-all"
            >
              View Hackathon Details
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Status: Already Member
  if (status === 'already-member') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-blackops text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400 mb-4">
            ALREADY A MEMBER
          </h1>
          <p className="text-gray-300 font-mono text-center mb-6">{message}</p>
          <Link
            href={`/hackathons/${resolvedParams.id}/team`}
            className="block w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white rounded-xl font-mono font-bold text-center transition-all"
          >
            Go to Team Page
          </Link>
        </div>
      </div>
    );
  }

  // Status: Error
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-blackops text-center text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 mb-4">
          ERROR
        </h1>
        <p className="text-gray-300 font-mono text-center mb-6">{message}</p>
        <div className="space-y-3">
          <Link
            href={`/hackathons/${resolvedParams.id}`}
            className="block w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white rounded-xl font-mono font-bold text-center transition-all"
          >
            View Hackathon
          </Link>
          <Link
            href="/hackathons"
            className="block w-full px-6 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-mono font-bold text-center transition-all"
          >
            Browse Hackathons
          </Link>
        </div>
      </div>
    </div>
  );
}
