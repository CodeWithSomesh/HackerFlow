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
  const [editableData, setEditableData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    handleJoinTeam();
  }, [resolvedParams.id, resolvedParams.teamId]);

  useEffect(() => {
    if (memberData) {
      setEditableData({
        mobile: memberData.mobile || '',
        first_name: memberData.first_name || '',
        last_name: memberData.last_name || '',
        organization_name: memberData.organization_name || '',
        location: memberData.location || '',
      });
      // If mobile is missing, automatically enable editing
      if (!memberData.mobile) {
        setIsEditing(true);
      }
    }
  }, [memberData]);

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
        // No member record found with this email - this user came via shared link
        // Allow them to join by creating a new member record
        // First, get user profile data to pre-fill
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('full_name, email, city, state, country, university, company')
          .eq('user_id', currentUser.id)
          .single();

        // Parse full name
        const nameParts = userProfile?.full_name?.split(' ') || [currentUser.email?.split('@')[0] || 'User'];
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts.slice(1).join(' ') || '';
        const location = `${userProfile?.city || ''}, ${userProfile?.state || ''}, ${userProfile?.country || ''}`.trim() || 'Unknown';

        // Create a pending member record
        const { data: newMember, error: createError } = await supabase
          .from('hackathon_team_members')
          .insert({
            team_id: resolvedParams.teamId,
            user_id: currentUser.id,
            email: currentUser.email || '',
            mobile: '', // Will be filled during verification
            first_name: firstName,
            last_name: lastName,
            organization_name: userProfile?.university || userProfile?.company || '',
            participant_type: 'College Students',
            location: location,
            is_leader: false,
            status: 'pending',
          })
          .select()
          .single();

        if (createError || !newMember) {
          console.error('Failed to create member record:', createError);
          setStatus('error');
          setMessage('Failed to join team. Please try again or contact the team leader.');
          setLoading(false);
          return;
        }

        // Show verification page with the newly created member data
        setMemberData(newMember);
        setStatus('ready');
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

    // Validate required fields
    if (!editableData.mobile || !editableData.first_name || !editableData.location) {
      showCustomToast('error', 'Please fill in all required fields (Mobile, First Name, Location)');
      return;
    }

    setVerifying(true);
    try {
      const supabase = createClient();

      // Update member with edited data and set status to accepted
      const { error: updateError } = await supabase
        .from('hackathon_team_members')
        .update({
          mobile: editableData.mobile,
          first_name: editableData.first_name,
          last_name: editableData.last_name,
          organization_name: editableData.organization_name,
          location: editableData.location,
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
        // Create registration record with all required fields from updated member data
        const { error: regError } = await supabase
          .from('hackathon_registrations')
          .insert({
            hackathon_id: resolvedParams.id,
            user_id: user.id,
            team_id: resolvedParams.teamId,
            email: memberData.email,
            mobile: editableData.mobile,
            first_name: editableData.first_name,
            last_name: editableData.last_name,
            organization_name: editableData.organization_name,
            participant_type: memberData.participant_type,
            passout_year: memberData.passout_year,
            domain: memberData.domain,
            location: editableData.location,
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

          {/* Your Details - Editable Form */}
          <div className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-blackops text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                YOUR DETAILS
              </h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-300 rounded-lg text-sm font-mono transition-all"
                >
                  Edit
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm font-mono mb-1">
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editableData.first_name || ''}
                    onChange={(e) => setEditableData({...editableData, first_name: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-teal-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-mono mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editableData.last_name || ''}
                    onChange={(e) => setEditableData({...editableData, last_name: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-teal-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-mono mb-1">Email (read-only)</label>
                <input
                  type="email"
                  value={memberData.email}
                  disabled
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 font-mono text-sm cursor-not-allowed opacity-50"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-mono mb-1">
                  Mobile <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={editableData.mobile || ''}
                  onChange={(e) => setEditableData({...editableData, mobile: e.target.value})}
                  disabled={!isEditing}
                  placeholder="Enter your mobile number"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-teal-400 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-mono mb-1">
                  Location <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={editableData.location || ''}
                  onChange={(e) => setEditableData({...editableData, location: e.target.value})}
                  disabled={!isEditing}
                  placeholder="City, State, Country"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-teal-400 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-mono mb-1">Organization</label>
                <input
                  type="text"
                  value={editableData.organization_name || ''}
                  onChange={(e) => setEditableData({...editableData, organization_name: e.target.value})}
                  disabled={!isEditing}
                  placeholder="University/Company name"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-teal-400 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <p className="text-blue-300 text-sm font-mono">
              ℹ️ {isEditing ? 'Please fill in the required fields (*) and click "Verify & Join Team".' : 'Review your details and click "Verify & Join Team" to complete registration.'}
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
