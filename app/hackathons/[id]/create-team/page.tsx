'use client'

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { z, ZodError } from "zod";
import { TeamCreationSchema } from "@/lib/validations/hackathon-registration";
import {
  checkUserRegistration,
} from "@/lib/actions/hackathon-registration-actions";
import { fetchHackathonById } from "@/lib/actions/createHackathon-actions";
import { createTeamAction } from "@/lib/actions/create-team-actions";
import { showCustomToast } from "@/components/toast-notification";

interface CreateTeamPageProps {
  params: Promise<{ id: string }>;
}

type TeamFormData = z.infer<typeof TeamCreationSchema>;

export default function CreateTeamPage({ params }: CreateTeamPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hackathon, setHackathon] = useState<any>(null);
  const [registration, setRegistration] = useState<any>(null);

  const [formData, setFormData] = useState<TeamFormData>({
    teamName: '',
    lookingForTeammates: true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TeamFormData, string>>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadData();
  }, [resolvedParams.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Check registration status
      const registrationCheck = await checkUserRegistration(resolvedParams.id);
      if (!registrationCheck.isRegistered) {
        router.push(`/hackathons/${resolvedParams.id}/register`);
        return;
      }

      setRegistration(registrationCheck.registration);

      // If team already exists, redirect to team page
      if (registrationCheck.registration?.team_id) {
        router.push(`/hackathons/${resolvedParams.id}/team`);
        return;
      }

      // Fetch hackathon details
      const hackathonResult = await fetchHackathonById(resolvedParams.id);
      if (hackathonResult.success && hackathonResult.data) {
        setHackathon(hackathonResult.data);

        // If not a team-based hackathon, redirect
        if (hackathonResult.data.participation_type !== 'team') {
          router.push(`/hackathons/${resolvedParams.id}`);
          return;
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setErrorMessage('Failed to load registration data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    try {
      TeamCreationSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const zodError = error as ZodError;
        zodError.issues.forEach((err) => {
          showCustomToast('error', err.message);
        });
        setErrors(errors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setErrorMessage('Please fix the errors before submitting');
      return;
    }

    if (!registration) {
      setErrorMessage('Registration not found');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      console.log('🎯 [CLIENT] Calling createTeamAction...');

      const result = await createTeamAction(
        resolvedParams.id,
        registration.id,
        {
          teamName: formData.teamName,
          lookingForTeammates: formData.lookingForTeammates,
          teamSizeMax: hackathon.team_size_max,
        },
        {
          email: registration.email,
          mobile: registration.mobile,
          firstName: registration.first_name,
          lastName: registration.last_name,
          organizationName: registration.organization_name,
          participantType: registration.participant_type,
          passoutYear: registration.passout_year,
          domain: registration.domain,
          location: registration.location,
        }
      );

      if (result.success) {
        console.log('🎯 [CLIENT] Team created successfully!');
        setSuccessMessage('Team created successfully! Redirecting...');
        showCustomToast('success', 'Team created successfully! Redirecting...');
        setTimeout(() => {
          router.push(`/hackathons/${resolvedParams.id}/team`);
        }, 1500);
      } else {
        console.error('🎯 [CLIENT] Error creating team:', result.error);
        setErrorMessage(result.error || 'Failed to create team');
      }
    } catch (error) {
      console.error('🎯 [CLIENT] Unexpected error:', error);
      setErrorMessage('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-teal-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl font-mono">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-3xl font-blackops text-white mb-4">Hackathon Not Found</h1>
          <Link
            href="/hackathons"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-lg font-mono font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Hackathons
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b-2 border-gray-700 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
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
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 opacity-50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center text-white font-blackops">
                <CheckCircle className="w-6 h-6" />
              </div>
              <span className="font-mono text-gray-400 font-bold">Candidate Details</span>
            </div>
            <div className="h-1 flex-1 mx-4 bg-gradient-to-r from-blue-500 to-teal-500"></div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center text-white font-blackops">
                2
              </div>
              <span className="font-mono text-white font-bold">Create Team</span>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-teal-500 w-full"></div>
          </div>
        </div>

        {/* Hackathon Info Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-6 mb-8">
          <h2 className="text-3xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-teal-400 mb-4">
            {hackathon.title}
          </h2>
          <p className="text-gray-300 font-mono">
            Team Size: {hackathon.team_size_min} - {hackathon.team_size_max} members
          </p>
        </div>

        {/* Team Creation Form */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-8 h-8 text-teal-400" />
            <h3 className="text-2xl font-blackops text-white">CREATE YOUR TEAM</h3>
          </div>

          {successMessage && (
            <div className="mb-6 p-4 bg-green-500/10 border-2 border-green-500 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <p className="text-green-400 font-mono">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-500/10 border-2 border-red-500 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <p className="text-red-400 font-mono">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Team Name */}
            <div>
              <label className="block text-white font-mono font-bold mb-2">
                Team Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="teamName"
                value={formData.teamName}
                onChange={(e) => setFormData(prev => ({ ...prev, teamName: e.target.value }))}
                className={`w-full px-4 py-3 bg-gray-800 border-2 ${
                  errors.teamName ? 'border-red-500' : 'border-gray-700'
                } rounded-xl text-white font-mono focus:outline-none focus:border-teal-400 transition-colors`}
                placeholder="Enter your team name"
              />
              {errors.teamName && (
                <p className="mt-2 text-red-400 text-sm font-mono">{errors.teamName}</p>
              )}
              <p className="mt-2 text-gray-400 text-sm font-mono">
                Team name should be unique and memorable
              </p>
            </div>

            {/* Looking for Teammates */}
            <div className="bg-blue-500/10 border-2 border-blue-500/30 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.lookingForTeammates}
                  onChange={(e) => setFormData(prev => ({ ...prev, lookingForTeammates: e.target.checked }))}
                  className="w-5 h-5 mt-0.5 rounded border-2 border-gray-700 bg-gray-800 checked:bg-teal-500 focus:ring-2 focus:ring-teal-400"
                />
                <div>
                  <label className="text-white font-mono font-bold block mb-2">
                    Looking for Teammates
                  </label>
                  <p className="text-gray-300 text-sm font-mono">
                    Enable this to let other participants know you're looking for team members. Your team will appear in the "Teams Seeking Members" section.
                  </p>
                </div>
              </div>
            </div>

            {/* Info Note */}
            <div className="bg-blue-500/10 border-2 border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-sm font-bold">i</span>
              </div>
              <p className="text-blue-300 text-sm font-mono">
                You can add team members on the next page. You'll be set as the team leader automatically.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Link
                href={`/hackathons/${resolvedParams.id}/register`}
                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-mono font-bold transition-all border-2 border-gray-700"
              >
                Back
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white rounded-xl font-mono font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Team...
                  </>
                ) : (
                  'Create Team & Continue'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
