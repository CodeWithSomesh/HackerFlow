'use client'

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  Building,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User
} from "lucide-react";
import Link from "next/link";
import { z, ZodError } from "zod";
import { HackathonRegistrationSchema } from "@/lib/validations/hackathon-registration";
import {
  getUserProfileForRegistration,
  checkUserRegistration,
  registerForHackathon
} from "@/lib/actions/hackathon-registration-actions";
import { fetchHackathonById } from "@/lib/actions/createHackathon-actions";
import { showCustomToast } from "@/components/toast-notification";

interface HackathonRegisterProps {
  params: Promise<{ id: string }>;
}

type FormData = z.infer<typeof HackathonRegistrationSchema>;

const PARTICIPANT_TYPES = [
  'College Students',
  'Professional',
  'High School / Primary School Student',
  'Fresher'
] as const;

const DOMAINS = [
  'Management',
  'Engineering',
  'Arts & Science',
  'Medicine',
  'Law'
];

const PASSOUT_YEARS = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() + i - 5).toString());

export default function HackathonRegister({ params }: HackathonRegisterProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hackathon, setHackathon] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    mobile: '',
    firstName: '',
    lastName: '',
    organizationName: '',
    participantType: 'College Students',
    passoutYear: '',
    domain: '',
    location: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [fieldsFromDB, setFieldsFromDB] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, [resolvedParams.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Check if already registered
      const registrationCheck = await checkUserRegistration(resolvedParams.id);
      if (registrationCheck.isRegistered) {
        // Redirect to team management page
        router.push(`/hackathons/${resolvedParams.id}/team`);
        return;
      }

      // Fetch hackathon details
      const hackathonResult = await fetchHackathonById(resolvedParams.id);
      if (!hackathonResult.success || !hackathonResult.data) {
        showCustomToast('error', 'Hackathon not found');
        return;
      }
      setHackathon(hackathonResult.data);

      // Pre-fill user data
      const profileResult = await getUserProfileForRegistration();
      if (profileResult.success && profileResult.data) {
        const dbFields = new Set<string>();
        const profileData = profileResult.data;

        // Track which fields came from DB
        Object.keys(profileData).forEach(key => {
          if (profileData[key as keyof typeof profileData]) {
            dbFields.add(key);
          }
        });

        setFieldsFromDB(dbFields);
        setFormData(prev => ({
          ...prev,
          email: profileData.email || prev.email,
          firstName: profileData.firstName || prev.firstName,
          lastName: profileData.lastName || prev.lastName,
          organizationName: profileData.organizationName || prev.organizationName,
          location: profileData.location || prev.location,
          participantType: (profileData.participantType as any) || prev.participantType,
        }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showCustomToast('error', 'Failed to load registration data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field
    if (errors[name as keyof FormData]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormData];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    try {
      HackathonRegistrationSchema.parse(formData);
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
      showCustomToast('error', 'Please fix the errors before submitting');
      return;
    }

    setSubmitting(true);

    try {
      const registrationData = {
        email: formData.email,
        mobile: formData.mobile,
        firstName: formData.firstName,
        lastName: formData.lastName,
        organizationName: formData.organizationName,
        participantType: formData.participantType,
        passoutYear: formData.passoutYear,
        domain: formData.domain,
        location: formData.location,
      };

      const result = await registerForHackathon(
        resolvedParams.id,
        registrationData,
        hackathon?.participation_type === 'team' ? undefined : undefined // Will handle team creation in next step
      );

      if (result.success) {
        showCustomToast('success', 'Registration successful! Redirecting...');
        setTimeout(() => {
          if (hackathon?.participation_type === 'team') {
            router.push(`/hackathons/${resolvedParams.id}/create-team`);
          } else {
            router.push(`/hackathons/${resolvedParams.id}`);
          }
        }, 1500);
      } else {
        showCustomToast('error', result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Error submitting registration:', error);
      showCustomToast('error', 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-teal-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl font-mono">Loading registration...</p>
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center text-white font-blackops">
                1
              </div>
              <span className="font-mono text-white font-bold">Candidate Details</span>
            </div>
            {hackathon.participation_type === 'team' && (
              <>
                <div className="h-1 flex-1 mx-4 bg-gray-700"></div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 font-blackops">
                    2
                  </div>
                  <span className="font-mono text-gray-400 font-bold">Create Team</span>
                </div>
              </>
            )}
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-teal-500 w-1/2"></div>
          </div>
        </div>

        {/* Hackathon Info Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-6 mb-8">
          <h2 className="text-3xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-teal-400 mb-4">
            {hackathon.title}
          </h2>
          <div className="flex flex-wrap gap-4 text-gray-300 font-mono text-sm">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-400" />
              <span>{hackathon.organization}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-400" />
              <span>{hackathon.location}</span>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8">
          <h3 className="text-2xl font-blackops text-white mb-6">CANDIDATE DETAILS</h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-white font-mono font-bold mb-2">
                Email <span className="text-red-400">*</span>
                {fieldsFromDB.has('email') && (
                  <span className="ml-2 text-xs text-gray-400">(From your profile)</span>
                )}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={fieldsFromDB.has('email')}
                  className={`w-full pl-12 pr-4 py-3 border-2 ${
                    errors.email ? 'border-red-500' : 'border-gray-700'
                  } rounded-xl text-white font-mono focus:outline-none focus:border-teal-400 transition-colors ${
                    fieldsFromDB.has('email') ? 'bg-gray-700 cursor-not-allowed opacity-70' : 'bg-gray-800'
                  }`}
                  placeholder="your.email@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-red-400 text-sm font-mono">{errors.email}</p>
              )}
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-white font-mono font-bold mb-2">
                Mobile <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 bg-gray-800 border-2 ${
                    errors.mobile ? 'border-red-500' : 'border-gray-700'
                  } rounded-xl text-white font-mono focus:outline-none focus:border-teal-400 transition-colors`}
                  placeholder="+60 - 1128651105"
                />
              </div>
              {errors.mobile && (
                <p className="mt-2 text-red-400 text-sm font-mono">{errors.mobile}</p>
              )}
            </div>

            {/* First Name */}
            <div>
              <label className="block text-white font-mono font-bold mb-2">
                First Name <span className="text-red-400">*</span>
                {fieldsFromDB.has('firstName') && (
                  <span className="ml-2 text-xs text-gray-400">(From your profile)</span>
                )}
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={fieldsFromDB.has('firstName')}
                  className={`w-full pl-12 pr-4 py-3 border-2 ${
                    errors.firstName ? 'border-red-500' : 'border-gray-700'
                  } rounded-xl text-white font-mono focus:outline-none focus:border-teal-400 transition-colors ${
                    fieldsFromDB.has('firstName') ? 'bg-gray-700 cursor-not-allowed opacity-70' : 'bg-gray-800'
                  }`}
                  placeholder="John"
                />
              </div>
              {errors.firstName && (
                <p className="mt-2 text-red-400 text-sm font-mono">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-white font-mono font-bold mb-2">
                Last Name (if applicable)
                {fieldsFromDB.has('lastName') && (
                  <span className="ml-2 text-xs text-gray-400">(From your profile)</span>
                )}
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={fieldsFromDB.has('lastName')}
                  className={`w-full pl-12 pr-4 py-3 border-2 border-gray-700 rounded-xl text-white font-mono focus:outline-none focus:border-teal-400 transition-colors ${
                    fieldsFromDB.has('lastName') ? 'bg-gray-700 cursor-not-allowed opacity-70' : 'bg-gray-800'
                  }`}
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Organization Name */}
            <div>
              <label className="block text-white font-mono font-bold mb-2">
                Organization / Institute Name
                {fieldsFromDB.has('organizationName') && (
                  <span className="ml-2 text-xs text-gray-400">(From your profile)</span>
                )}
              </label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  disabled={fieldsFromDB.has('organizationName')}
                  className={`w-full pl-12 pr-4 py-3 border-2 border-gray-700 rounded-xl text-white font-mono focus:outline-none focus:border-teal-400 transition-colors ${
                    fieldsFromDB.has('organizationName') ? 'bg-gray-700 cursor-not-allowed opacity-70' : 'bg-gray-800'
                  }`}
                  placeholder="Your University or Company"
                />
              </div>
            </div>

            {/* Participant Type */}
            <div>
              <label className="block text-white font-mono font-bold mb-2">
                Type <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {PARTICIPANT_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, participantType: type }))}
                    className={`py-3 px-4 rounded-xl font-mono font-bold transition-all ${
                      formData.participantType === type
                        ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white border-2 border-white/20'
                        : 'bg-gray-800 text-gray-300 border-2 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {errors.participantType && (
                <p className="mt-2 text-red-400 text-sm font-mono">{errors.participantType}</p>
              )}
            </div>

            {/* Passout Year - Only for College Students */}
            {formData.participantType === 'College Students' && (
              <div>
                <label className="block text-white font-mono font-bold mb-2">
                  Passout Year <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {PASSOUT_YEARS.map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, passoutYear: year }))}
                      className={`py-2 px-4 rounded-xl font-mono font-bold transition-all ${
                        formData.passoutYear === year
                          ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white border-2 border-white/20'
                          : 'bg-gray-800 text-gray-300 border-2 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
                {errors.passoutYear && (
                  <p className="mt-2 text-red-400 text-sm font-mono">{errors.passoutYear}</p>
                )}
              </div>
            )}

            {/* Domain */}
            <div>
              <label className="block text-white font-mono font-bold mb-2">
                Domain
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {DOMAINS.map((domain) => (
                  <button
                    key={domain}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, domain: domain }))}
                    className={`py-3 px-4 rounded-xl font-mono font-bold transition-all ${
                      formData.domain === domain
                        ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white border-2 border-white/20'
                        : 'bg-gray-800 text-gray-300 border-2 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    {domain}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-white font-mono font-bold mb-2">
                Location <span className="text-red-400">*</span>
                {fieldsFromDB.has('location') && (
                  <span className="ml-2 text-xs text-gray-400">(From your profile)</span>
                )}
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={fieldsFromDB.has('location')}
                  className={`w-full pl-12 pr-4 py-3 border-2 ${
                    errors.location ? 'border-red-500' : 'border-gray-700'
                  } rounded-xl text-white font-mono focus:outline-none focus:border-teal-400 transition-colors ${
                    fieldsFromDB.has('location') ? 'bg-gray-700 cursor-not-allowed opacity-70' : 'bg-gray-800'
                  }`}
                  placeholder="George Town, Penang, Malaysia"
                />
              </div>
              {errors.location && (
                <p className="mt-2 text-red-400 text-sm font-mono">{errors.location}</p>
              )}
              {fieldsFromDB.has('location') && (
                <p className="mt-2 text-gray-400 text-xs font-mono">
                  To update your location, please edit your profile page.
                </p>
              )}
            </div>

            {/* Info Note */}
            <div className="bg-blue-500/10 border-2 border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-sm font-bold">i</span>
              </div>
              <div className="text-blue-300 text-sm font-mono space-y-1">
                <p>Note: You can add team members on the next step.</p>
                {fieldsFromDB.size > 0 && (
                  <p>Fields marked "(From your profile)" can only be edited from your profile page.</p>
                )}
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="w-5 h-5 mt-0.5 rounded border-2 border-gray-700 bg-gray-800 checked:bg-teal-500 focus:ring-2 focus:ring-teal-400"
              />
              <label className="text-gray-300 text-sm font-mono">
                By registering for this opportunity, you agree to share the data mentioned in this form or any form henceforth on this opportunity with the organizer of this opportunity for further analysis, processing, and outreach. 
                Your data will also be used by HackerFlow for providing you regular and constant updates on this opportunity. 
                {/* You also agree to the{' '}
                <a href="#" className="text-teal-400 hover:underline">privacy policy</a>{' '}
                and{' '}
                <a href="#" className="text-teal-400 hover:underline">terms of use</a>{' '}
                of HackerFlow. */}
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-red-400 text-sm font-mono">{errors.agreeToTerms}</p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Link
                href={`/hackathons/${resolvedParams.id}`}
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
                    Registering...
                  </>
                ) : (
                  'Next'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
