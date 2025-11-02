'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  User,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Instagram,
  Code2,
  Trophy,
  Building,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { FriendRequestButton } from '@/components/friend-request-button'
import Link from 'next/link'
import { toast } from 'sonner'

interface UserProfile {
  user_id: string
  full_name: string
  email: string
  bio?: string
  city?: string
  state?: string
  country?: string
  profile_image?: string
  user_primary_type: 'hacker' | 'organizer'

  // Hacker fields
  university?: string
  course?: string
  year_of_study?: string
  graduation_year?: number
  programming_languages?: string[]
  frameworks?: string[]
  other_skills?: string[]
  experience_level?: string
  github_username?: string
  linkedin_url?: string
  twitter_username?: string
  portfolio_url?: string
  instagram_username?: string
  position?: string
  company?: string

  // Organizer fields
  organization_type?: string
  organization_name?: string
  organization_size?: string
  organization_website?: string
  organization_description?: string
  event_organizing_experience?: string
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [userId])

  const loadProfile = async () => {
    try {
      const supabase = createClient()

      // Check if viewing own profile
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.id === userId) {
        setIsOwnProfile(true)
        router.push('/profile')
        return
      }

      // Get user profile
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
        toast.error('Failed to load profile')
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center mt-4">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-teal-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-mono">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center mt-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-400 mb-2">Profile Not Found</h2>
          <p className="text-gray-500 font-mono mb-6">This user profile does not exist</p>
          <Link href="/search-friends">
            <button className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-mono font-bold rounded-lg transition-colors">
              Back to Search
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black mt-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-500 to-yellow-400 border-y-4 border-pink-400 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 bg-gray-900/80 backdrop-blur border-2 border-gray-700 rounded-lg flex items-center justify-center hover:border-teal-400 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-5xl font-blackops text-white drop-shadow-lg">
                User Profile
              </h1>
              <p className="text-xl text-white/90 font-mono">
                View {profile.full_name}'s information
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-gray-900 border-2 border-gray-800 rounded-lg p-8">
          {/* Profile Header */}
          <div className="flex items-start gap-6 mb-8 pb-8 border-b-2 border-gray-800">
            {/* Profile Image */}
            {profile.profile_image ? (
              <img
                src={profile.profile_image}
                alt={profile.full_name}
                className="w-32 h-32 rounded-full border-4 border-teal-400 object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-teal-400 bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                <User className="w-16 h-16 text-white" />
              </div>
            )}

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-4xl font-bold text-white mb-2">{profile.full_name}</h2>
                  <div className="flex items-center gap-2 text-gray-400 font-mono mb-3">
                    <Mail className="w-4 h-4" />
                    {profile.email}
                  </div>
                </div>

                {/* Friend Request Button */}
                {!isOwnProfile && (
                  <FriendRequestButton
                    userId={profile.user_id}
                    userName={profile.full_name}
                    userImage={profile.profile_image}
                  />
                )}
              </div>

              {/* User Type Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 mb-4 ${
                profile.user_primary_type === 'hacker'
                  ? 'bg-purple-500/10 border-purple-500 text-purple-400'
                  : 'bg-orange-500/10 border-orange-500 text-orange-400'
              }`}>
                {profile.user_primary_type === 'hacker' ? (
                  <Code2 className="w-5 h-5" />
                ) : (
                  <Building className="w-5 h-5" />
                )}
                <span className="font-mono font-bold capitalize text-lg">
                  {profile.user_primary_type}
                </span>
              </div>

              {profile.bio && (
                <p className="text-gray-300 text-lg">{profile.bio}</p>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Location */}
              {(profile.city || profile.state || profile.country) && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-teal-400" />
                    Location
                  </h3>
                  <p className="text-gray-300 font-mono">
                    {[profile.city, profile.state, profile.country].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}

              {/* Work/Education Info */}
              {profile.user_primary_type === 'hacker' && (
                <>
                  {(profile.company || profile.position) && (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-teal-400" />
                        Work
                      </h3>
                      <p className="text-gray-300">
                        {profile.position && <span className="font-bold">{profile.position}</span>}
                        {profile.position && profile.company && <span> at </span>}
                        {profile.company}
                      </p>
                    </div>
                  )}

                  {(profile.university || profile.course) && (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-teal-400" />
                        Education
                      </h3>
                      <div className="space-y-1">
                        {profile.university && (
                          <p className="text-gray-300 font-bold">{profile.university}</p>
                        )}
                        {profile.course && (
                          <p className="text-gray-400">{profile.course}</p>
                        )}
                        {(profile.year_of_study || profile.graduation_year) && (
                          <p className="text-gray-500 font-mono text-sm">
                            {profile.year_of_study && `Year ${profile.year_of_study}`}
                            {profile.year_of_study && profile.graduation_year && ' • '}
                            {profile.graduation_year && `Graduating ${profile.graduation_year}`}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {profile.experience_level && (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-teal-400" />
                        Experience Level
                      </h3>
                      <p className="text-gray-300 capitalize">{profile.experience_level}</p>
                    </div>
                  )}
                </>
              )}

              {/* Organization Info */}
              {profile.user_primary_type === 'organizer' && (
                <>
                  {profile.organization_name && (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                        <Building className="w-5 h-5 text-teal-400" />
                        Organization
                      </h3>
                      <p className="text-gray-300 font-bold text-lg">{profile.organization_name}</p>
                      {profile.organization_type && (
                        <p className="text-gray-400 capitalize">{profile.organization_type}</p>
                      )}
                      {profile.organization_description && (
                        <p className="text-gray-500 mt-2">{profile.organization_description}</p>
                      )}
                    </div>
                  )}

                  {(profile.position || profile.organization_size) && (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-teal-400" />
                        Role & Size
                      </h3>
                      {profile.position && (
                        <p className="text-gray-300 mb-1">{profile.position}</p>
                      )}
                      {profile.organization_size && (
                        <p className="text-gray-400 text-sm">{profile.organization_size} employees</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Skills (for hackers) */}
              {profile.user_primary_type === 'hacker' && (
                <>
                  {profile.programming_languages && profile.programming_languages.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3">Programming Languages</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.programming_languages.map((lang, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 bg-purple-500/10 border-2 border-purple-500 rounded-lg text-purple-400 font-mono font-bold"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.frameworks && profile.frameworks.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3">Frameworks & Tools</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.frameworks.map((framework, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 bg-teal-500/10 border-2 border-teal-500 rounded-lg text-teal-400 font-mono font-bold"
                          >
                            {framework}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.other_skills && profile.other_skills.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3">Other Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.other_skills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 bg-cyan-500/10 border-2 border-cyan-500 rounded-lg text-cyan-400 font-mono font-bold"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Social Links */}
              <div>
                <h3 className="text-xl font-bold text-white mb-3">Social Links</h3>
                <div className="space-y-2">
                  {profile.github_username && (
                    <a
                      href={`https://github.com/${profile.github_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg hover:border-purple-500 transition-colors group"
                    >
                      <Github className="w-5 h-5 text-gray-400 group-hover:text-purple-400" />
                      <span className="text-gray-300 group-hover:text-white font-mono">
                        @{profile.github_username}
                      </span>
                    </a>
                  )}

                  {profile.linkedin_url && (
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg hover:border-blue-500 transition-colors group"
                    >
                      <Linkedin className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />
                      <span className="text-gray-300 group-hover:text-white font-mono">
                        LinkedIn Profile
                      </span>
                    </a>
                  )}

                  {profile.twitter_username && (
                    <a
                      href={`https://twitter.com/${profile.twitter_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg hover:border-cyan-500 transition-colors group"
                    >
                      <Twitter className="w-5 h-5 text-gray-400 group-hover:text-cyan-400" />
                      <span className="text-gray-300 group-hover:text-white font-mono">
                        @{profile.twitter_username}
                      </span>
                    </a>
                  )}

                  {(profile.portfolio_url || profile.organization_website) && (
                    <a
                      href={profile.portfolio_url || profile.organization_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg hover:border-teal-500 transition-colors group"
                    >
                      <Globe className="w-5 h-5 text-gray-400 group-hover:text-teal-400" />
                      <span className="text-gray-300 group-hover:text-white font-mono">
                        Website
                      </span>
                    </a>
                  )}

                  {profile.instagram_username && (
                    <a
                      href={`https://instagram.com/${profile.instagram_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg hover:border-pink-500 transition-colors group"
                    >
                      <Instagram className="w-5 h-5 text-gray-400 group-hover:text-pink-400" />
                      <span className="text-gray-300 group-hover:text-white font-mono">
                        @{profile.instagram_username}
                      </span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
