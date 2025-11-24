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
  Loader2,
  Star,
  GitFork,
  Calendar,
  Users,
  Award
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getHackerDashboardStats, getHackerRecentActivity, getOrganizerDashboardStats } from '@/lib/actions/dashboard-actions'
import { FriendRequestButton } from '@/components/friend-request-button'
import { ProfileFriendsTab } from '@/components/profile-friends-tab'
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

interface GitHubStats {
  total_contributions?: number
  public_repos?: number
  followers?: number
  following?: number
  total_stars?: number
  current_streak?: number
  longest_streak?: number
  contribution_graph?: any[]
}

interface GitHubRepo {
  name: string
  description: string
  language: string
  stars: number
  forks: number
  url: string
}

interface Language {
  name: string
  percentage: number
  color: string
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'friends' | 'github' | 'activity'>('overview')
  const [friendCount, setFriendCount] = useState(0)

  // GitHub data
  const [githubStats, setGithubStats] = useState<GitHubStats | null>(null)
  const [pinnedProjects, setPinnedProjects] = useState<GitHubRepo[]>([])
  const [topStarredProjects, setTopStarredProjects] = useState<GitHubRepo[]>([])
  const [topLanguages, setTopLanguages] = useState<Language[]>([])
  const [loadingGithub, setLoadingGithub] = useState(false)
  const [hasGithubConnected, setHasGithubConnected] = useState(false)

  // Dashboard data
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [earnedBadges, setEarnedBadges] = useState<any[]>([])

  useEffect(() => {
    loadProfile()
  }, [userId])

  useEffect(() => {
    if (profile?.user_primary_type === 'hacker' && hasGithubConnected) {
      loadGitHubData()
    }
  }, [profile, hasGithubConnected])

  useEffect(() => {
    if (profile) {
      loadFriendCount()
    }
  }, [profile])

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
      const { data, error} = await supabase
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

      // Check if user has GitHub connected (check if they have any GitHub data)
      if (data.user_primary_type === 'hacker') {
        const { data: stats } = await supabase
          .from('github_stats')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle()

        if (stats || data.github_username) {
          setHasGithubConnected(true)
        }
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const loadFriendCount = async () => {
    const supabase = createClient()
    const { count} = await supabase
      .from('friendships')
      .select('*', { count: 'exact', head: true })
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)

    setFriendCount(count || 0)
  }

  const loadDashboardData = async () => {
    try {
      if (profile?.user_primary_type === 'hacker') {
        // Load hacker stats
        const statsResult = await getHackerDashboardStats(userId)
        if (statsResult.success) {
          setDashboardStats(statsResult.data)
        }

        // Load recent activities
        const activitiesResult = await getHackerRecentActivity(userId, 5)
        if (activitiesResult.success) {
          setRecentActivities(activitiesResult.data)
        }

        // Load earned badges
        const supabase = createClient()
        const { data: badges } = await supabase
          .from('user_badges')
          .select('*')
          .eq('user_id', userId)
          .order('earned_at', { ascending: false })
          .limit(5)

        if (badges) {
          setEarnedBadges(badges)
        }
      } else if (profile?.user_primary_type === 'organizer') {
        // Load organizer stats
        const statsResult = await getOrganizerDashboardStats(userId)
        if (statsResult.success) {
          setDashboardStats(statsResult.data)
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  // Load dashboard data when profile is loaded
  useEffect(() => {
    if (profile && !loading) {
      loadDashboardData()
    }
  }, [profile, loading])

  const loadGitHubData = async () => {
    setLoadingGithub(true)
    try {
      const supabase = createClient()

      // Fetch GitHub stats
      const { data: stats } = await supabase
        .from('github_stats')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (stats) {
        setGithubStats(stats)
      }

      // Fetch pinned repositories
      const { data: pinned } = await supabase
        .from('github_repositories')
        .select('*')
        .eq('user_id', userId)
        .eq('is_pinned', true)
        .limit(6)

      if (pinned) {
        setPinnedProjects(pinned.map((repo: any) => ({
          name: repo.name,
          description: repo.description || 'No description',
          language: repo.language || 'Unknown',
          stars: repo.stars_count || 0,
          forks: repo.forks_count || 0,
          url: repo.html_url
        })))
      }

      // Fetch top starred repositories
      const { data: repos } = await supabase
        .from('github_repositories')
        .select('*')
        .eq('user_id', userId)
        .eq('is_fork', false)
        .order('stars_count', { ascending: false })
        .limit(6)

      if (repos) {
        setTopStarredProjects(repos.map((repo: any) => ({
          name: repo.name,
          description: repo.description || 'No description',
          language: repo.language || 'Unknown',
          stars: repo.stars_count || 0,
          forks: repo.forks_count || 0,
          url: repo.html_url
        })))
      }

      // Fetch top languages
      const { data: languages } = await supabase
        .from('github_languages')
        .select('*')
        .eq('user_id', userId)
        .order('percentage', { ascending: false })
        .limit(5)

      if (languages) {
        setTopLanguages(languages)
      }
    } catch (error) {
      console.error('Error loading GitHub data:', error)
    } finally {
      setLoadingGithub(false)
    }
  }

  const getContributionColor = (count: number) => {
    if (count === 0) return 'bg-gray-800'
    if (count === 1) return 'bg-green-900'
    if (count === 2) return 'bg-green-700'
    if (count === 3) return 'bg-green-500'
    return 'bg-green-400'
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

  const tabs = ['overview', 'friends', profile.user_primary_type === 'hacker' ? 'github' : null, 'activity'].filter(Boolean) as ('overview' | 'friends' | 'github' | 'activity')[]

  return (
    <div className="min-h-screen bg-black mt-4">
      <div className="max-w-7xl mx-auto px-6 mb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-3 bg-gradient-to-r from-purple-500/30 to-teal-500/30 hover:from-purple-500/50 hover:to-teal-500/50 border-2 border-purple-500/40 hover:border-teal-400 text-white px-6 py-3 rounded-xl font-blackops transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          BACK
        </button>
      </div>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-500 to-yellow-400 border-y-4 border-pink-400 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-8">

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* Profile Image */}
              {profile.profile_image ? (
                <img
                  src={profile.profile_image}
                  alt={profile.full_name}
                  className="w-40 h-40 rounded-2xl border-4 border-black shadow-2xl object-cover"
                />
              ) : (
                <div className="w-40 h-40 rounded-2xl border-4 border-black shadow-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                  <User className="w-16 h-16 text-white" />
                </div>
              )}

              {/* Profile Info */}
              <div>
                <h1 className="text-5xl font-blackops text-white drop-shadow-lg mb-2">
                  {profile.full_name}
                </h1>
                <div className="flex items-center gap-2 text-white/90 font-mono text-lg mb-3">
                  <Mail className="w-5 h-5" />
                  {profile.email}
                </div>
                {(profile.city || profile.state || profile.country) && (
                  <div className="flex items-center gap-2 text-white/80 font-mono">
                    <MapPin className="w-5 h-5" />
                    {[profile.city, profile.state, profile.country].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Friend Request Button */}
            {!isOwnProfile && (
              <FriendRequestButton
                userId={profile.user_id}
                userName={profile.full_name}
                userImage={profile.profile_image}
                onStatusChange={loadFriendCount}
              />
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-mono font-bold capitalize transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                  : 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
              }`}
            >
              <span className="flex items-center gap-2">
                {tab}
                {tab === 'friends' && friendCount > 0 && (
                  <span className="px-2 py-0.5 bg-teal-500 rounded-full text-white text-xs">
                    {friendCount}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-[65%_33%] gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Bio Section */}
                {profile.bio && (
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-6">
                    <h2 className="text-3xl font-blackops text-white mb-4">ABOUT</h2>
                    <p className="text-gray-300 text-lg text-pretty leading-relaxed">{profile.bio}</p>

                    <div className="flex flex-wrap gap-3 mt-4">
                      {profile.github_username && (
                        <a
                          href={`https://github.com/${profile.github_username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 px-4 py-3 bg-gray-800 border-2 border-purple-800 rounded-lg hover:border-purple-500 transition-colors group"
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
                          className="flex items-center gap-3 px-4 py-3 bg-gray-800 border-2 border-blue-800 rounded-lg hover:border-blue-500 transition-colors group"
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
                          className="flex items-center gap-3 px-4 py-3 bg-gray-800 border-2 border-cyan-700 rounded-lg hover:border-cyan-500 transition-colors group"
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
                          className="flex items-center gap-3 px-4 py-3 bg-gray-800 border-2 border-teal-700 rounded-lg hover:border-teal-500 transition-colors group"
                        >
                          <Globe className="w-5 h-5 text-gray-400 group-hover:text-teal-400" />
                          <span className="text-gray-300 group-hover:text-white font-mono">
                            Portfolio
                          </span>
                        </a>
                      )}

                      {profile.instagram_username && (
                        <a
                          href={`https://instagram.com/${profile.instagram_username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 px-4 py-3 bg-gray-800 border-2 border-pink-700 rounded-lg hover:border-pink-500 transition-colors group"
                        >
                          <Instagram className="w-5 h-5 text-gray-400 group-hover:text-pink-400" />
                          <span className="text-gray-300 group-hover:text-white font-mono">
                            @{profile.instagram_username}
                          </span>
                        </a>
                      )}
                    </div>
                  </div>
                )}


                {/* Work/Education Info for Hackers */}
                {profile.user_primary_type === 'hacker' && (
                  <>
                    {(profile.company || profile.position) && (
                      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-6">
                        <h3 className="text-xl font-blackops text-white mb-4 flex items-center gap-2">
                          <Briefcase className="w-5 h-5 text-teal-400" />
                          WORK
                        </h3>
                        <p className="text-gray-300 text-lg">
                          {profile.position && <span className="font-bold">{profile.position}</span>}
                          {profile.position && profile.company && <span> at </span>}
                          {profile.company}
                        </p>
                      </div>
                    )}

                    {(profile.university || profile.course) && (
                      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-6">
                        <h3 className="text-xl font-blackops text-white mb-4 flex items-center gap-2">
                          <GraduationCap className="w-5 h-5 text-teal-400" />
                          EDUCATION
                        </h3>
                        <div className="space-y-2">
                          {profile.university && (
                            <p className="text-gray-300 font-bold text-lg">{profile.university}</p>
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
                      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-6">
                        <h3 className="text-xl font-blackops text-white mb-4 flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-teal-400" />
                          EXPERIENCE LEVEL
                        </h3>
                        <p className="text-gray-300 capitalize text-lg">{profile.experience_level}</p>
                      </div>
                    )}

                    {/* Skills */}
                    {profile.programming_languages && profile.programming_languages.length > 0 && (
                      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-6">
                        <h3 className="text-xl font-blackops text-white mb-4">PROGRAMMING LANGUAGES</h3>
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
                      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-6">
                        <h3 className="text-xl font-blackops text-white mb-4">FRAMEWORKS & TOOLS</h3>
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
                      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-6">
                        <h3 className="text-xl font-blackops text-white mb-4">OTHER SKILLS</h3>
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

                {/* Organization Info for Organizers */}
                {profile.user_primary_type === 'organizer' && (
                  <>
                    {profile.organization_name && (
                      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-6">
                        <h3 className="text-xl font-blackops text-white mb-4 flex items-center gap-2">
                          <Building className="w-5 h-5 text-teal-400" />
                          ORGANIZATION
                        </h3>
                        <p className="text-gray-300 font-bold text-lg mb-2">{profile.organization_name}</p>
                        {profile.organization_type && (
                          <p className="text-gray-400 capitalize mb-3">{profile.organization_type}</p>
                        )}
                        {profile.organization_description && (
                          <p className="text-gray-500">{profile.organization_description}</p>
                        )}
                      </div>
                    )}

                    {(profile.position || profile.organization_size) && (
                      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-6">
                        <h3 className="text-xl font-blackops text-white mb-4 flex items-center gap-2">
                          <Briefcase className="w-5 h-5 text-teal-400" />
                          ROLE & SIZE
                        </h3>
                        {profile.position && (
                          <p className="text-gray-300 mb-2">{profile.position}</p>
                        )}
                        {profile.organization_size && (
                          <p className="text-gray-400 text-sm">{profile.organization_size} employees</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Friends Tab */}
            {activeTab === 'friends' && (
              <ProfileFriendsTab
                isActive={activeTab === 'friends'}
                onCountChange={loadFriendCount}
                targetUserId={userId}
              />
            )}

            {/* GitHub Tab */}
            {activeTab === 'github' && profile.user_primary_type === 'hacker' && (
              <div className="space-y-6">
                {loadingGithub ? (
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-16">
                    <div className="text-center">
                      <Loader2 className="w-16 h-16 text-teal-400 animate-spin mx-auto mb-4" />
                      <p className="text-white text-xl font-mono">Loading GitHub data...</p>
                    </div>
                  </div>
                ) : !hasGithubConnected ? (
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-16">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Github className="w-10 h-10 text-gray-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-400 mb-2">No GitHub Connected</h3>
                      <p className="text-gray-500 font-mono">This user hasn't connected their GitHub account yet</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Contribution Streak Stats */}
                    {githubStats && (
                      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8">
                        <div className="grid grid-cols-3 gap-6">
                          <div className="text-center">
                            <div className="text-4xl font-blackops text-teal-400 mb-2">
                              {githubStats.total_contributions?.toLocaleString() || 0}
                            </div>
                            <div className="text-gray-400 font-mono text-sm">Total Contributions</div>
                            <div className="text-gray-500 font-mono text-xs mt-1">
                              Jan {new Date().getFullYear() - 1} - Present
                            </div>
                          </div>
                          <div className="text-center border-x border-gray-700">
                            <div className="text-4xl font-blackops text-teal-400 mb-2">
                              {githubStats.current_streak || 0}
                            </div>
                            <div className="text-gray-400 font-mono text-sm">Current Streak</div>
                            <div className="text-gray-500 font-mono text-xs mt-1">
                              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-4xl font-blackops text-teal-400 mb-2">
                              {githubStats.longest_streak || 0}
                            </div>
                            <div className="text-gray-400 font-mono text-sm">Longest Streak</div>
                            <div className="text-gray-500 font-mono text-xs mt-1">Days</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* GitHub Stats */}
                    {githubStats && (
                      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <Github className="w-7 h-7 text-white" />
                          <h2 className="text-3xl font-blackops text-white">GITHUB STATISTICS</h2>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/30 rounded-xl p-4 text-center">
                            <div className="text-3xl font-blackops text-blue-400">
                              {githubStats.total_contributions || 0}
                            </div>
                            <div className="text-sm text-gray-400 font-mono mt-1">Contributions</div>
                          </div>
                          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 rounded-xl p-4 text-center">
                            <div className="text-3xl font-blackops text-green-400">
                              {githubStats.public_repos || 0}
                            </div>
                            <div className="text-sm text-gray-400 font-mono mt-1">Repositories</div>
                          </div>
                          <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30 rounded-xl p-4 text-center">
                            <div className="text-3xl font-blackops text-purple-400">
                              {githubStats.followers || 0}
                            </div>
                            <div className="text-sm text-gray-400 font-mono mt-1">Followers</div>
                          </div>
                          <div className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/30 rounded-xl p-4 text-center">
                            <div className="text-3xl font-blackops text-pink-400">
                              {githubStats.following || 0}
                            </div>
                            <div className="text-sm text-gray-400 font-mono mt-1">Following</div>
                          </div>
                          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/30 rounded-xl p-4 text-center">
                            <div className="text-3xl font-blackops text-yellow-400">
                              {githubStats.total_stars || 0}
                            </div>
                            <div className="text-sm text-gray-400 font-mono mt-1">Stars Earned</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Contribution Graph */}
                    {githubStats?.contribution_graph && (
                      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-2xl font-blackops text-white">CONTRIBUTION ACTIVITY</h3>
                          <span className="text-gray-400 font-mono text-sm">
                            {githubStats.total_contributions} contributions in the last year
                          </span>
                        </div>

                        <div className="overflow-x-auto pb-4">
                          <div className="inline-flex gap-1 min-w-full">
                            {githubStats.contribution_graph.map((week: any, weekIdx: number) => (
                              <div key={weekIdx} className="flex flex-col gap-1">
                                {week.map((day: number, dayIdx: number) => (
                                  <div
                                    key={dayIdx}
                                    className={`w-3 h-3 rounded-sm ${getContributionColor(day)} transition-all hover:scale-125 hover:ring-2 hover:ring-teal-400 cursor-pointer`}
                                    title={`${day} contributions`}
                                  />
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-4 text-sm font-mono">
                          <span className="text-gray-400">Less</span>
                          <div className="flex gap-1">
                            {[0, 1, 2, 3, 4].map((level) => (
                              <div key={level} className={`w-3 h-3 rounded-sm ${getContributionColor(level)}`} />
                            ))}
                          </div>
                          <span className="text-gray-400">More</span>
                        </div>
                      </div>
                    )}

                    {/* Top Languages */}
                    {topLanguages.length > 0 && (
                      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <Code2 className="w-7 h-7 text-teal-400" />
                          <h2 className="text-3xl font-blackops text-white">TOP LANGUAGES</h2>
                        </div>

                        <div className="space-y-4">
                          {topLanguages.map((lang, idx) => (
                            <div key={idx}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-300 font-mono text-sm">{lang.name}</span>
                                <span className="text-gray-400 font-mono text-sm">
                                  {lang.percentage.toFixed(2)}%
                                </span>
                              </div>
                              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${lang.percentage}%`,
                                    backgroundColor: lang.color,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pinned Repositories */}
                    {pinnedProjects.length > 0 && (
                      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <Star className="w-7 h-7 text-yellow-400" />
                          <h2 className="text-3xl font-blackops text-white">PINNED REPOSITORIES</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          {pinnedProjects.map((project, idx) => (
                            <a
                              key={idx}
                              href={project.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group p-6 bg-gradient-to-r from-gray-800/50 to-gray-700/30 border-2 border-gray-700/50 rounded-xl hover:border-blue-500/50 transition-all"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <h3 className="text-lg font-blackops text-white group-hover:text-blue-400 transition-colors">
                                  {project.name}
                                </h3>
                                <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs font-mono">
                                  {project.language}
                                </span>
                              </div>
                              <p className="text-gray-300 font-geist text-sm mb-4 line-clamp-2">
                                {project.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm font-mono text-gray-400">
                                <div className="flex items-center gap-1">
                                  <Star
                                    className={`w-4 h-4 ${
                                      project.stars > 0 ? 'fill-yellow-400 text-yellow-400' : ''
                                    }`}
                                  />
                                  <span>{project.stars}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <GitFork className={`w-4 h-4 ${project.forks > 0 ? 'text-cyan-400' : ''}`} />
                                  <span>{project.forks}</span>
                                </div>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Most Starred Repositories */}
                    {topStarredProjects.length > 0 && (
                      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <Trophy className="w-7 h-7 text-yellow-400" />
                          <h2 className="text-3xl font-blackops text-white">MOST STARRED REPOSITORIES</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          {topStarredProjects.map((project, idx) => (
                            <a
                              key={idx}
                              href={project.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group p-6 bg-gradient-to-r from-gray-800/50 to-gray-700/30 border-2 border-gray-700/50 rounded-xl hover:border-yellow-500/50 transition-all"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <h3 className="text-lg font-blackops text-white group-hover:text-yellow-400 transition-colors">
                                  {project.name}
                                </h3>
                                <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs font-mono">
                                  {project.language}
                                </span>
                              </div>
                              <p className="text-gray-300 font-geist text-sm mb-4 line-clamp-2">
                                {project.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm font-mono text-gray-400">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span>{project.stars}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <GitFork className={`w-4 h-4 ${project.forks > 0 ? 'text-cyan-400' : ''}`} />
                                  <span>{project.forks}</span>
                                </div>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Calendar className="w-7 h-7 text-teal-400" />
                  <h2 className="text-3xl font-blackops text-white">RECENT ACTIVITY</h2>
                </div>

                <div className="space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity) => {
                      const getActivityIcon = (type: string) => {
                        switch (type) {
                          case 'registration': return Users
                          case 'win': return Trophy
                          case 'badge': return Award
                          default: return Calendar
                        }
                      }
                      const getActivityColor = (type: string) => {
                        switch (type) {
                          case 'registration': return 'blue'
                          case 'win': return 'yellow'
                          case 'badge': return 'purple'
                          default: return 'gray'
                        }
                      }
                      const Icon = getActivityIcon(activity.type)
                      const color = getActivityColor(activity.type)

                      return (
                        <div
                          key={activity.id}
                          className="flex items-start gap-4 p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl hover:bg-gray-700/30 transition-all"
                        >
                          <div className={`p-3 bg-${color}-500/20 border border-${color}-500/50 rounded-lg`}>
                            <Icon className={`w-5 h-5 text-${color}-400`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-mono">
                              <span className="font-bold">{activity.title}</span>
                            </p>
                            <p className="text-sm text-gray-400 font-mono mt-1">{activity.description}</p>
                            <p className="text-xs text-gray-500 font-mono mt-1">
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 font-mono">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-6">
              <h3 className="text-xl font-blackops text-white mb-4">QUICK STATS</h3>

              <div className="space-y-4">
                {profile.user_primary_type === 'hacker' ? (
                  <>
                    <div className="flex items-center justify-between pb-4 border-b border-gray-700/50">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        <span className="text-gray-300 font-mono text-sm">Hackathons</span>
                      </div>
                      <span className="text-white font-blackops text-lg">{dashboardStats?.totalParticipations || 0}</span>
                    </div>
                    <div className="flex items-center justify-between pb-4 border-b border-gray-700/50">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-400" />
                        <span className="text-gray-300 font-mono text-sm">Wins</span>
                      </div>
                      <span className="text-white font-blackops text-lg">{dashboardStats?.hackathonsWon || 0}</span>
                    </div>
                    <div className="flex items-center justify-between pb-4 border-b border-gray-700/50">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-teal-400" />
                        <span className="text-gray-300 font-mono text-sm">Friends</span>
                      </div>
                      <span className="text-white font-blackops text-lg">{friendCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-pink-400" />
                        <span className="text-gray-300 font-mono text-sm">Projects</span>
                      </div>
                      <span className="text-white font-blackops text-lg">
                        {githubStats?.public_repos || 0}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between pb-4 border-b border-gray-700/50">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        <span className="text-gray-300 font-mono text-sm">Events Organized</span>
                      </div>
                      <span className="text-white font-blackops text-lg">{dashboardStats?.totalHackathons || 0}</span>
                    </div>
                    <div className="flex items-center justify-between pb-4 border-b border-gray-700/50">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-teal-400" />
                        <span className="text-gray-300 font-mono text-sm">Friends</span>
                      </div>
                      <span className="text-white font-blackops text-lg">{friendCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-400" />
                        <span className="text-gray-300 font-mono text-sm">Total Participants</span>
                      </div>
                      <span className="text-white font-blackops text-lg">500+</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Badges Section */}
            {profile.user_primary_type === 'hacker' && earnedBadges.length > 0 && (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-6">
                <h3 className="text-xl font-blackops text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  BADGES
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {earnedBadges.map((badge) => {
                    const getBadgeIcon = (badgeType: string, badgeIcon: string) => {
                      // Use the badge_icon from database if available
                      if (badgeIcon) return badgeIcon;

                      // Fallback to predefined icons
                      const icons: Record<string, string> = {
                        'first_participation': '🎯',
                        'participation_streak_3': '🔥',
                        'participation_streak_10': '⭐',
                        'first_win': '🏆',
                        'win_streak_3': '👑',
                        'win_streak_5': '💎',
                        'team_player': '🤝',
                        'team_leader': '👨‍💼',
                        'early_bird': '🐦',
                        'prize_collector': '💰',
                      }
                      return icons[badgeType] || '🏅'
                    }

                    return (
                      <div
                        key={badge.id}
                        className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 flex items-center justify-center hover:bg-gray-700/50 transition-all"
                        title={`Earned on ${new Date(badge.earned_at).toLocaleDateString()}`}
                      >
                        <span className="text-3xl">{getBadgeIcon(badge.badge_type, badge.badge_icon)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* GitHub Stats Summary - Only for hackers with GitHub connected */}
            {profile.user_primary_type === 'hacker' && hasGithubConnected && githubStats && (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Github className="w-5 h-5 text-white" />
                  <h3 className="text-xl font-blackops text-white">GITHUB STATS</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-mono text-sm">Contributions</span>
                    <span className="text-teal-400 font-blackops">{githubStats.total_contributions || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-mono text-sm">Repositories</span>
                    <span className="text-teal-400 font-blackops">{githubStats.public_repos || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-mono text-sm">Stars</span>
                    <span className="text-teal-400 font-blackops">{githubStats.total_stars || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-mono text-sm">Followers</span>
                    <span className="text-teal-400 font-blackops">{githubStats.followers || 0}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Top Languages Summary - Only for hackers */}
            {profile.user_primary_type === 'hacker' && topLanguages.length > 0 && (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Code2 className="w-5 h-5 text-teal-400" />
                  <h3 className="text-xl font-blackops text-white">TOP LANGUAGES</h3>
                </div>

                <div className="space-y-3">
                  {topLanguages.slice(0, 3).map((lang, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: lang.color }}
                        />
                        <span className="text-gray-300 font-mono text-sm">{lang.name}</span>
                      </div>
                      <span className="text-gray-400 font-mono text-sm">{lang.percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
