"use client"

import { useState, useEffect } from "react"
import { getUserProfile, saveHackerProfile, saveOrganizerProfile, getUserGitHubProjects, uploadProfileImage } from "@/lib/actions/profile-actions"
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
  Edit2,
  Camera,
  Code2,
  Trophy,
  Users,
  Calendar,
  Star,
  GitFork,
  Book,
  Award,
  Sparkles,
  Building,
  Phone,
  Link as LinkIcon,
  X,
  Save,
  Upload
} from "lucide-react"
import { showCustomToast } from "@/components/toast-notification"
import { connectGitHub, fetchGitHubRepositories, fetchGitHubStats, disconnectGitHub } from "@/lib/actions/github-actions"


export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [userType, setUserType] = useState<"hacker" | "organizer" | null>(null)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Mock user data - replace with real data from your backend
  const [userData, setUserData] = useState({
    // Common fields
    fullName: "",
    email: "",
    bio: "",
    city: "",
    state: "",
    country: "Malaysia",
    profileImage: "/api/placeholder/150/150",
    
    // Hacker specific
    profileType: "",
    university: "",
    course: "",
    yearOfStudy: "",
    graduationYear: "",
    programmingLanguages: [] as string[],
    frameworks: [] as string[],
    otherSkills: [] as string[],
    experienceLevel: "",
    githubUsername: "",
    linkedinUrl: "",
    twitterUsername: "",
    portfolioUrl: "",
    instagramUsername: "",
    openToRecruitment: false,
    githubConnected: false,
    workExperiences: [] as any[],
    
    // Organizer specific
    organizationType: "",
    organizationName: "",
    position: "",
    organizationSize: "",
    organizationWebsite: "",
    organizationDescription: "",
    eventOrganizingExperience: "",
    previousEvents: "",
    typicalBudgetRange: "",
    hasVenue: false,
    venueDetails: "",
    sponsorDetails: "",
    techSetupCapability: "",
    hasSponsorConnections: false,
    livestreamCapability: false,
    photographyCapability: false,
    marketingCapability: false
  })

  // Load user profile on mount
  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    setLoading(true)
    try {
      // Try loading hacker profile first
      const hackerResult = await getUserProfile('hacker')
      
      if (hackerResult.success && hackerResult.profile) {
        setUserType('hacker')
        const profile = hackerResult.profile
        setUserData({
          fullName: profile.full_name || "",
          email: profile.email || "",
          bio: profile.bio || "",
          city: profile.city || "",
          state: profile.state || "",
          country: profile.country || "Malaysia",
          profileImage: profile.profile_image || "/api/placeholder/150/150",
          profileType: profile.profile_type || "",
          university: profile.university || "",
          course: profile.course || "",
          yearOfStudy: profile.year_of_study || "",
          graduationYear: profile.graduation_year?.toString() || "",
          programmingLanguages: profile.programming_languages || [],
          frameworks: profile.frameworks || [],
          otherSkills: profile.other_skills || [],
          experienceLevel: profile.experience_level || "",
          githubUsername: profile.github_username || "",
          linkedinUrl: profile.linkedin_url || "",
          twitterUsername: profile.twitter_username || "",
          portfolioUrl: profile.portfolio_url || "",
          instagramUsername: profile.instagram_username || "",
          openToRecruitment: profile.open_to_recruitment || false,
          githubConnected: !!profile.github_username,
          workExperiences: profile.work_experiences || [],
          organizationType: "",
          organizationName: "",
          position: "",
          organizationSize: "",
          organizationWebsite: "",
          organizationDescription: "",
          eventOrganizingExperience: "",
          previousEvents: "",
          typicalBudgetRange: "",
          hasVenue: false,
          venueDetails: "",
          sponsorDetails: "",
          techSetupCapability: "",
          hasSponsorConnections: false,
          livestreamCapability: false,
          photographyCapability: false,
          marketingCapability: false
        })
        
        // Load GitHub projects if connected
        if (profile.github_username) {
          await loadGitHubData()
        }
        } else {
            // Try organizer profile
            const organizerResult = await getUserProfile('organizer')

            if (organizerResult.success && organizerResult.profile) {
            setUserType('organizer')
            const profile = organizerResult.profile
            setUserData({
                fullName: profile.full_name || "",
                email: profile.email || "",
                bio: profile.bio || "",
                city: profile.city || "",
                state: profile.state || "",
                country: profile.country || "Malaysia",
                profileImage: profile.profile_image || "/api/placeholder/150/150",
                organizationType: profile.organization_type || "",
                organizationName: profile.organization_name || "",
                position: profile.position || "",
                organizationSize: profile.organization_size || "",
                organizationWebsite: profile.organization_website || "",
                organizationDescription: profile.organization_description || "",
                eventOrganizingExperience: profile.event_organizing_experience || "",
                previousEvents: profile.previous_events || [],
                typicalBudgetRange: profile.typical_budget_range || "",
                hasVenue: profile.has_venue || false,
                venueDetails: profile.venue_details || "",
                hasSponsorConnections: profile.has_sponsor_connections || false,
                sponsorDetails: profile.sponsor_details || "",
                techSetupCapability: profile.tech_setup_capability || "",
                livestreamCapability: profile.livestream_capability || false,
                photographyCapability: profile.photography_capability || false,
                marketingCapability: profile.marketing_capability || false,
                linkedinUrl: profile.linkedin_url || "",
                twitterUsername: profile.twitter_username || "",
                portfolioUrl: profile.website_url || "",
                instagramUsername: profile.instagram_username || "",
                // Set unused hacker fields to empty/default
                profileType: "",
                university: "",
                course: "",
                yearOfStudy: "",
                graduationYear: "",
                programmingLanguages: [],
                frameworks: [],
                otherSkills: [],
                experienceLevel: "",
                githubUsername: "",
                openToRecruitment: false,
                githubConnected: false,
                workExperiences: []
            })
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      if (userType === 'hacker') {
        const result = await saveHackerProfile({
          fullName: userData.fullName,
          bio: userData.bio,
          profileType: userData.profileType,
          city: userData.city,
          state: userData.state,
          country: userData.country,
          university: userData.university,
          course: userData.course,
          yearOfStudy: userData.yearOfStudy,
          graduationYear: userData.graduationYear,
          programmingLanguages: userData.programmingLanguages,
          frameworks: userData.frameworks,
          otherSkills: userData.otherSkills,
          experienceLevel: userData.experienceLevel,
          hasWorkExperience: userData.workExperiences.length > 0,
          workExperiences: userData.workExperiences,
          githubUsername: userData.githubUsername,
          linkedinUrl: userData.linkedinUrl,
          twitterUsername: userData.twitterUsername,
          portfolioUrl: userData.portfolioUrl,
          instagramUsername: userData.instagramUsername,
          openToRecruitment: userData.openToRecruitment
        })
        
        if (result.success) {
          setIsEditing(false)
          showCustomToast('success', 'Profile updated successfully!')
        } else {
          showCustomToast('error', 'Failed to update profile: ' + result.error)
        }
      } else if (userType === 'organizer') {
        const result = await saveOrganizerProfile({
          fullName: userData.fullName,
          bio: userData.bio,
          organizationType: userData.organizationType,
          organizationName: userData.organizationName,
          position: userData.position,
          organizationSize: userData.organizationSize,
          organizationWebsite: userData.organizationWebsite,
          organizationDescription: userData.bio,
          eventOrganizingExperience: userData.eventOrganizingExperience,
          previousEvents: [],
          city: userData.city,
          state: userData.state,
          country: userData.country,
          willingToTravelFor: false,
          preferredEventTypes: [],
          typicalBudgetRange: userData.typicalBudgetRange,
          hasVenue: userData.hasVenue,
          venueDetails: "",
          hasSponsorConnections: userData.hasSponsorConnections,
          sponsorDetails: "",
          techSetupCapability: "",
          livestreamCapability: userData.livestreamCapability,
          photographyCapability: userData.photographyCapability,
          marketingCapability: userData.marketingCapability,
          primaryGoals: [],
          targetAudience: [],
          linkedinUrl: userData.linkedinUrl,
          twitterUsername: userData.twitterUsername,
          websiteUrl: userData.portfolioUrl,
          instagramUsername: userData.instagramUsername,
          lookingForCoOrganizers: false,
          willingToMentor: false,
          availableForConsulting: false
        })
        
        if (result.success) {
          setIsEditing(false)
          showCustomToast('success', 'Profile updated successfully!')
        } else {
          showCustomToast('error', 'Failed to update profile: ' + result.error)
        }
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      showCustomToast('error', 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  // Mock GitHub data
  const [githubStats, setGithubStats] = useState({
    contributions: 0,
    repositories: 0,
    followers: 0,
    following: 0,
    stars: 0,
    contributionGraph: Array(52).fill(0).map(() => 
      Array(7).fill(0).map(() => 0)
    )
  })

  const [pinnedProjects, setPinnedProjects] = useState<Array<{
    name: string
    description: string
    language: string
    stars: number
    forks: number
    url: string
  }>>([])

  const badges = [
    { name: "Arctic Code Vault Contributor", icon: "🏔️" },
    { name: "Pull Shark", icon: "🦈" },
    { name: "Quickdraw", icon: "⚡" },
    { name: "YOLO", icon: "🎯" }
  ]

  const getContributionColor = (count: number) => {
    if (count === 0) return "bg-gray-800"
    if (count === 1) return "bg-green-900"
    if (count === 2) return "bg-green-700"
    if (count === 3) return "bg-green-500"
    return "bg-green-400"
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        // Show loading state
        setShowImageUpload(false)
        setSaving(true)
        
        // Upload image
        const result = await uploadProfileImage(file)
        
        if (result.success && result.url) {
          // Update local state
          setUserData(prev => ({ ...prev, profileImage: result.url }))
          showCustomToast('success', 'Profile image updated successfully!')
        } else {
          showCustomToast('error', result.error || 'Failed to upload image')
        }
      } catch (error) {
        console.error('Error uploading image:', error)
        showCustomToast('error', 'Failed to upload image')
      } finally {
        setSaving(false)
      }
    }
  }

  const handleConnectGitHub = async () => {
    const result = await connectGitHub()
    if (result.success && result.authUrl) {
      window.location.href = result.authUrl
    } else {
      showCustomToast('error', result.error || 'Failed to connect GitHub')
    }
  }
  
  // Update the loadGitHubData function
  const loadGitHubData = async () => {
    try {
        // Fetch GitHub projects
        const projectsResult = await getUserGitHubProjects()
        if (projectsResult.success && projectsResult.projects) {
        setPinnedProjects(projectsResult.projects.slice(0, 3).map((p: any) => ({
            name: p.name,
            description: p.description || "No description",
            language: p.language || "Unknown",
            stars: p.stars_count,
            forks: p.forks_count,
            url: p.html_url
        })))
        } else {
        console.error('Failed to fetch projects:', projectsResult.error)
        }

        // Fetch repositories
        const reposResult = await fetchGitHubRepositories()
        if (reposResult.success && reposResult.repositories) {
            const pinned = reposResult.repositories
            .sort((a, b) => b.stars_count - a.stars_count)
            .slice(0, 3)
            .map((repo) => ({
                name: repo.name,
                description: repo.description || "",
                language: repo.language || "Unknown",
                stars: repo.stars_count,
                forks: repo.forks_count,
                url: repo.html_url
            }))
            setPinnedProjects(pinned)
        }
  
      // Fetch stats
      const statsResult = await fetchGitHubStats()
      if (statsResult.success && statsResult.stats) {
        setGithubStats(statsResult.stats)
      }
    } catch (error) {
      console.error('Error loading GitHub data:', error)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-xl font-mono">Loading profile...</p>
          </div>
        </div>
      ) : !userType ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-white text-xl font-mono">No profile found</p>
          </div>
        </div>
      ) : (
        <div>
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-20 left-10 w-96 h-96 bg-pink-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Profile Header */}
                <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 overflow-hidden mb-6">
                <div className="relative px-8 py-8">
                    {/* Profile Image */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                    <div className="flex flex-col md:flex-row md:items-end gap-6">
                        <div className="relative group">
                        <div className="w-36 h-36 rounded-2xl border-4 border-gray-700 overflow-hidden bg-gray-800 shadow-2xl">
                            <img 
                            src={userData.profileImage} 
                            alt={userData.fullName}
                            className="w-full h-full object-cover"
                            />
                        </div>
                        <button 
                            onClick={() => setShowImageUpload(true)}
                            className="absolute bottom-2 right-2 p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                        </div>

                        <div className="space-y-2 mb-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-blackops text-white">{userData.fullName}</h1>
                            {userData.openToRecruitment && (
                            <span className="px-3 py-1.5 bg-green-500/30 border-2 border-green-400 text-green-300 rounded-lg text-sm font-mono font-bold">
                                OPEN TO WORK
                            </span>
                            )}
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-gray-300">
                            <div className="flex items-center gap-2 font-mono">
                            <MapPin className="w-4 h-4 text-pink-400" />
                            <span>{userData.city}, {userData.state}</span>
                            </div>
                            {userType === "hacker" ? (
                            <div className="flex items-center gap-2 font-mono">
                                <GraduationCap className="w-4 h-4 text-purple-400" />
                                <span>{userData.university}</span>
                            </div>
                            ) : (
                            <div className="flex items-center gap-2 font-mono">
                                <Building className="w-4 h-4 text-teal-400" />
                                <span>{userData.organizationName}</span>
                            </div>
                            )}
                        </div>
                        </div>
                    </div>

                    <button
                        onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                        disabled={saving}
                        className={`mt-4 md:mt-0 flex items-center gap-2 px-6 py-3 rounded-xl font-mono font-bold transition-all ${
                        isEditing 
                            ? "bg-green-500/20 border-2 border-green-500 text-green-400 hover:bg-green-500/30" 
                            : "bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90"
                        }`}
                    >
                        {saving ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            SAVING...
                        </>
                        ) : isEditing ? (
                        <>
                            <Save className="w-4 h-4" />
                            SAVE CHANGES
                        </>
                        ) : (
                        <>
                            <Edit2 className="w-4 h-4" />
                            EDIT PROFILE
                        </>
                        )}
                    </button>
                    </div>

                    {/* Bio */}
                    <p className="text-gray-300 font-geist text-lg leading-relaxed max-w-3xl mb-6">
                    {userData.bio}
                    </p>

                    {/* Social Links */}
                    <div className="flex flex-wrap gap-3">
                    {userData.githubUsername && (
                        <a href={`https://github.com/${userData.githubUsername}`} target="_blank" rel="noopener noreferrer" 
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-600 transition-all font-mono">
                        <Github className="w-4 h-4" />
                        <span>@{userData.githubUsername}</span>
                        </a>
                    )}
                    {userData.linkedinUrl && (
                        <a href={userData.linkedinUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300 hover:text-blue-400 hover:border-blue-500/50 transition-all font-mono">
                        <Linkedin className="w-4 h-4" />
                        <span>LinkedIn</span>
                        </a>
                    )}
                    {userData.twitterUsername && (
                        <a href={`https://twitter.com/${userData.twitterUsername.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300 hover:text-blue-400 hover:border-blue-500/50 transition-all font-mono">
                        <Twitter className="w-4 h-4" />
                        <span>{userData.twitterUsername}</span>
                        </a>
                    )}
                    {userData.portfolioUrl && (
                        <a href={userData.portfolioUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300 hover:text-pink-400 hover:border-pink-500/50 transition-all font-mono">
                        <Globe className="w-4 h-4" />
                        <span>Portfolio</span>
                        </a>
                    )}
                    {userData.instagramUsername && (
                        <a href={`https://instagram.com/${userData.instagramUsername}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300 hover:text-pink-400 hover:border-pink-500/50 transition-all font-mono">
                        <Instagram className="w-4 h-4" />
                        <span>@{userData.instagramUsername}</span>
                        </a>
                    )}
                    </div>
                </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto">
                {["overview", "github", "activity"].map((tab) => (
                    <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 rounded-xl font-mono font-bold capitalize transition-all whitespace-nowrap ${
                        activeTab === tab
                        ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                        : "bg-gray-800/50 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600"
                    }`}
                    >
                    {tab}
                    </button>
                ))}
                </div>

                {/* Content */}
                <div className="grid lg:grid-cols-[65%_33%] gap-6">
                {/* Main Content */}
                <div className="space-y-6">
                {activeTab === "overview" && (
                    <>
                        {/* Profile Info */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <User className="w-7 h-7 text-pink-400" />
                            <h2 className="text-3xl font-blackops text-white">PROFILE INFORMATION</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                            <label className="text-gray-400 text-sm font-mono">Full Name</label>
                            {isEditing ? (
                                <input
                                type="text"
                                value={userData.fullName}
                                onChange={(e) => setUserData(prev => ({ ...prev, fullName: e.target.value }))}
                                className="w-full bg-black border border-gray-700 text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500"
                                />
                            ) : (
                                <p className="text-white font-mono text-lg">{userData.fullName}</p>
                            )}
                            </div>

                            <div className="space-y-2">
                            <label className="text-gray-400 text-sm font-mono">Email</label>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <p className="text-white font-mono">{userData.email}</p>
                            </div>
                            </div>

                            <div className="space-y-2">
                            <label className="text-gray-400 text-sm font-mono">City</label>
                            {isEditing ? (
                                <input
                                type="text"
                                value={userData.city}
                                onChange={(e) => setUserData(prev => ({ ...prev, city: e.target.value }))}
                                className="w-full bg-black border border-gray-700 text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500"
                                />
                            ) : (
                                <p className="text-white font-mono">{userData.city}</p>
                            )}
                            </div>

                            <div className="space-y-2">
                            <label className="text-gray-400 text-sm font-mono">State</label>
                            {isEditing ? (
                                <input
                                type="text"
                                value={userData.state}
                                onChange={(e) => setUserData(prev => ({ ...prev, state: e.target.value }))}
                                className="w-full bg-black border border-gray-700 text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500"
                                />
                            ) : (
                                <p className="text-white font-mono">{userData.state}</p>
                            )}
                            </div>
                        </div>

                        <div className="mt-6 space-y-2">
                            <label className="text-gray-400 text-sm font-mono">Bio</label>
                            {isEditing ? (
                            <textarea
                                value={userData.bio}
                                onChange={(e) => setUserData(prev => ({ ...prev, bio: e.target.value }))}
                                rows={4}
                                className="w-full bg-black border border-gray-700 text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500 resize-none"
                            />
                            ) : (
                            <p className="text-gray-300 font-geist leading-relaxed">{userData.bio}</p>
                            )}
                        </div>
                        </div>

                        {/* Academic/Professional Info */}
                        {userType === "hacker" ? (
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8">
                            <div className="flex items-center gap-3 mb-6">
                            <GraduationCap className="w-7 h-7 text-purple-400" />
                            <h2 className="text-3xl font-blackops text-white">ACADEMIC INFORMATION</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-gray-400 text-sm font-mono">University</label>
                                {isEditing ? (
                                <input
                                    type="text"
                                    value={userData.university}
                                    onChange={(e) => setUserData(prev => ({ ...prev, university: e.target.value }))}
                                    className="w-full bg-black border border-gray-700 text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500"
                                />
                                ) : (
                                <p className="text-white font-mono">{userData.university}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-gray-400 text-sm font-mono">Course</label>
                                {isEditing ? (
                                <input
                                    type="text"
                                    value={userData.course}
                                    onChange={(e) => setUserData(prev => ({ ...prev, course: e.target.value }))}
                                    className="w-full bg-black border border-gray-700 text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500"
                                />
                                ) : (
                                <p className="text-white font-mono">{userData.course}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-gray-400 text-sm font-mono">Year of Study</label>
                                {isEditing ? (
                                <input
                                    type="text"
                                    value={userData.yearOfStudy}
                                    onChange={(e) => setUserData(prev => ({ ...prev, yearOfStudy: e.target.value }))}
                                    className="w-full bg-black border border-gray-700 text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500"
                                />
                                ) : (
                                <p className="text-white font-mono">{userData.yearOfStudy}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-gray-400 text-sm font-mono">Expected Graduation</label>
                                {isEditing ? (
                                <input
                                    type="text"
                                    value={userData.graduationYear}
                                    onChange={(e) => setUserData(prev => ({ ...prev, graduationYear: e.target.value }))}
                                    className="w-full bg-black border border-gray-700 text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500"
                                />
                                ) : (
                                <p className="text-white font-mono">{userData.graduationYear}</p>
                                )}
                            </div>
                            </div>
                        </div>
                        ) : (
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8">
                            <div className="flex items-center gap-3 mb-6">
                            <Building className="w-7 h-7 text-teal-400" />
                            <h2 className="text-3xl font-blackops text-white">ORGANIZATION DETAILS</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-gray-400 text-sm font-mono">Organization</label>
                                {isEditing ? (
                                <input
                                    type="text"
                                    value={userData.organizationName}
                                    onChange={(e) => setUserData(prev => ({ ...prev, organizationName: e.target.value }))}
                                    className="w-full bg-black border border-gray-700 text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500"
                                />
                                ) : (
                                <p className="text-white font-mono">{userData.organizationName}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-gray-400 text-sm font-mono">Position</label>
                                {isEditing ? (
                                <input
                                    type="text"
                                    value={userData.position}
                                    onChange={(e) => setUserData(prev => ({ ...prev, position: e.target.value }))}
                                    className="w-full bg-black border border-gray-700 text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500"
                                />
                                ) : (
                                <p className="text-white font-mono">{userData.position}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-gray-400 text-sm font-mono">Organization Size</label>
                                {isEditing ? (
                                <input
                                    type="text"
                                    value={userData.organizationSize}
                                    onChange={(e) => setUserData(prev => ({ ...prev, organizationSize: e.target.value }))}
                                    className="w-full bg-black border border-gray-700 text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500"
                                />
                                ) : (
                                <p className="text-white font-mono">{userData.organizationSize} people</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-gray-400 text-sm font-mono">Experience Level</label>
                                {isEditing ? (
                                <input
                                    type="text"
                                    value={userData.eventOrganizingExperience}
                                    onChange={(e) => setUserData(prev => ({ ...prev, eventOrganizingExperience: e.target.value }))}
                                    className="w-full bg-black border border-gray-700 text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500"
                                />
                                ) : (
                                <p className="text-white font-mono capitalize">{userData.eventOrganizingExperience}</p>
                                )}
                            </div>
                            </div>
                        </div>
                        )}

                        {/* Social Links Section */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <LinkIcon className="w-7 h-7 text-blue-400" />
                            <h2 className="text-3xl font-blackops text-white">SOCIAL LINKS</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                            <label className="text-gray-400 text-sm font-mono">GitHub Username</label>
                            {isEditing ? (
                                <input
                                type="text"
                                value={userData.githubUsername}
                                onChange={(e) => setUserData(prev => ({ ...prev, githubUsername: e.target.value }))}
                                className="w-full bg-black border border-gray-700 text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500"
                                placeholder="username"
                                />
                            ) : (
                                <p className="text-white font-mono">{userData.githubUsername || 'Not set'}</p>
                            )}
                            </div>

                            <div className="space-y-2">
                            <label className="text-gray-400 text-sm font-mono">LinkedIn URL</label>
                            {isEditing ? (
                                <input
                                type="url"
                                value={userData.linkedinUrl}
                                onChange={(e) => setUserData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                                className="w-full bg-black border border-gray-700 text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500"
                                placeholder="https://linkedin.com/in/username"
                                />
                            ) : (
                                <p className="text-white font-mono break-all">{userData.linkedinUrl || 'Not set'}</p>
                            )}
                            </div>

                            <div className="space-y-2">
                            <label className="text-gray-400 text-sm font-mono">Twitter Username</label>
                            {isEditing ? (
                                <input
                                type="text"
                                value={userData.twitterUsername}
                                onChange={(e) => setUserData(prev => ({ ...prev, twitterUsername: e.target.value }))}
                                className="w-full bg-black border border-gray-700 text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500"
                                placeholder="@username"
                                />
                            ) : (
                                <p className="text-white font-mono">{userData.twitterUsername || 'Not set'}</p>
                            )}
                            </div>

                            <div className="space-y-2">
                            <label className="text-gray-400 text-sm font-mono">Portfolio URL</label>
                            {isEditing ? (
                                <input
                                type="url"
                                value={userData.portfolioUrl}
                                onChange={(e) => setUserData(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                                className="w-full bg-black border border-gray-700 text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500"
                                placeholder="https://yoursite.com"
                                />
                            ) : (
                                <p className="text-white font-mono break-all">{userData.portfolioUrl || 'Not set'}</p>
                            )}
                            </div>

                            <div className="space-y-2">
                            <label className="text-gray-400 text-sm font-mono">Instagram Username</label>
                            {isEditing ? (
                                <input
                                type="text"
                                value={userData.instagramUsername}
                                onChange={(e) => setUserData(prev => ({ ...prev, instagramUsername: e.target.value }))}
                                className="w-full bg-black border border-gray-700 text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500"
                                placeholder="username"
                                />
                            ) : (
                                <p className="text-white font-mono">{userData.instagramUsername || 'Not set'}</p>
                            )}
                            </div>

                            {userType === "hacker" && (
                            <div className="space-y-2">
                                <label className="text-gray-400 text-sm font-mono">Open to Recruitment</label>
                                {isEditing ? (
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                    type="checkbox"
                                    checked={userData.openToRecruitment}
                                    onChange={(e) => setUserData(prev => ({ ...prev, openToRecruitment: e.target.checked }))}
                                    className="w-5 h-5 text-pink-500 bg-gray-900 border-gray-600 rounded focus:ring-pink-500"
                                    />
                                    <span className="text-gray-300 font-mono">Yes, I'm open to opportunities</span>
                                </label>
                                ) : (
                                <p className="text-white font-mono">{userData.openToRecruitment ? 'Yes' : 'No'}</p>
                                )}
                            </div>
                            )}
                        </div>
                        </div>

                        {/* Skills Section for Hackers */}
                        {userType === "hacker" && (
                        <>
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <Code2 className="w-7 h-7 text-pink-400" />
                                <h2 className="text-3xl font-blackops text-white">PROGRAMMING LANGUAGES</h2>
                            </div>
                            {isEditing ? (
                                <div className="space-y-3">
                                <p className="text-gray-400 text-sm font-mono">Select your programming languages:</p>
                                <div className="flex flex-wrap gap-3">
                                    {["JavaScript", "Python", "Java", "C++", "C#", "Go", "Rust", "TypeScript", "PHP", "Swift", "Kotlin", "Dart", "Ruby"].map((lang) => (
                                    <button
                                        key={lang}
                                        type="button"
                                        onClick={() => {
                                        setUserData(prev => ({
                                            ...prev,
                                            programmingLanguages: prev.programmingLanguages.includes(lang)
                                            ? prev.programmingLanguages.filter(l => l !== lang)
                                            : [...prev.programmingLanguages, lang]
                                        }))
                                        }}
                                        className={`px-4 py-2 rounded-lg font-mono font-bold transition-all ${
                                        userData.programmingLanguages.includes(lang)
                                            ? 'bg-pink-500/20 border-2 border-pink-400 text-pink-300'
                                            : 'bg-gray-800/50 border-2 border-gray-700 text-gray-400 hover:border-pink-500/50'
                                        }`}
                                    >
                                        {lang}
                                    </button>
                                    ))}
                                </div>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-3">
                                {userData.programmingLanguages.map((lang, idx) => (
                                    <span key={idx} className="px-4 py-2 bg-pink-500/20 border-2 border-pink-400 text-pink-300 rounded-lg font-mono font-bold">
                                    {lang}
                                    </span>
                                ))}
                                </div>
                            )}
                            </div>

                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <Trophy className="w-7 h-7 text-purple-400" />
                                <h2 className="text-3xl font-blackops text-white">FRAMEWORKS & TOOLS</h2>
                            </div>
                            {isEditing ? (
                                <div className="space-y-3">
                                <p className="text-gray-400 text-sm font-mono">Select your frameworks:</p>
                                <div className="flex flex-wrap gap-3">
                                    {["React", "Vue", "Angular", "Node.js", "Django", "Flask", "Spring", "Docker", "Kubernetes", "Next.js", "Express"].map((framework) => (
                                    <button
                                        key={framework}
                                        type="button"
                                        onClick={() => {
                                        setUserData(prev => ({
                                            ...prev,
                                            frameworks: prev.frameworks.includes(framework)
                                            ? prev.frameworks.filter(f => f !== framework)
                                            : [...prev.frameworks, framework]
                                        }))
                                        }}
                                        className={`px-4 py-2 rounded-lg font-mono font-bold transition-all ${
                                        userData.frameworks.includes(framework)
                                            ? 'bg-purple-500/20 border-2 border-purple-400 text-purple-300'
                                            : 'bg-gray-800/50 border-2 border-gray-700 text-gray-400 hover:border-purple-500/50'
                                        }`}
                                    >
                                        {framework}
                                    </button>
                                    ))}
                                </div>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-3">
                                {userData.frameworks.map((framework, idx) => (
                                    <span key={idx} className="px-4 py-2 bg-purple-500/20 border-2 border-purple-400 text-purple-300 rounded-lg font-mono font-bold">
                                    {framework}
                                    </span>
                                ))}
                                </div>
                            )}
                            </div>

                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <Sparkles className="w-7 h-7 text-yellow-400" />
                                <h2 className="text-3xl font-blackops text-white">OTHER SKILLS</h2>
                            </div>
                            {isEditing ? (
                                <div className="space-y-3">
                                <p className="text-gray-400 text-sm font-mono">Select your other skills:</p>
                                <div className="flex flex-wrap gap-3">
                                    {["UI/UX Design", "Graphic Design", "Video Editing", "Figma", "3D Modeling", "Data Analysis", "Project Management"].map((skill) => (
                                    <button
                                        key={skill}
                                        type="button"
                                        onClick={() => {
                                        setUserData(prev => ({
                                            ...prev,
                                            otherSkills: prev.otherSkills.includes(skill)
                                            ? prev.otherSkills.filter(s => s !== skill)
                                            : [...prev.otherSkills, skill]
                                        }))
                                        }}
                                        className={`px-4 py-2 rounded-lg font-mono font-bold transition-all ${
                                        userData.otherSkills.includes(skill)
                                            ? 'bg-yellow-500/20 border-2 border-yellow-400 text-yellow-300'
                                            : 'bg-gray-800/50 border-2 border-gray-700 text-gray-400 hover:border-yellow-500/50'
                                        }`}
                                    >
                                        {skill}
                                    </button>
                                    ))}
                                </div>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-3">
                                {userData.otherSkills.map((skill, idx) => (
                                    <span key={idx} className="px-4 py-2 bg-yellow-500/20 border-2 border-yellow-400 text-yellow-300 rounded-lg font-mono font-bold">
                                    {skill}
                                    </span>
                                ))}
                                </div>
                            )}
                            </div>
                        </>
                        )}
                    </>
                    )}


                    {activeTab === "skills" && userType === "hacker" && (
                    <div className="space-y-6">
                        {/* Programming Languages */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Code2 className="w-7 h-7 text-pink-400" />
                            <h2 className="text-3xl font-blackops text-white">PROGRAMMING LANGUAGES</h2>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {userData.programmingLanguages.map((lang, idx) => (
                            <span key={idx} className="px-4 py-2 bg-pink-500/20 border-2 border-pink-400 text-pink-300 rounded-lg font-mono font-bold">
                                {lang}
                            </span>
                            ))}
                        </div>
                        </div>

                        {/* Frameworks */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Trophy className="w-7 h-7 text-purple-400" />
                            <h2 className="text-3xl font-blackops text-white">FRAMEWORKS & TOOLS</h2>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {userData.frameworks.map((framework, idx) => (
                            <span key={idx} className="px-4 py-2 bg-purple-500/20 border-2 border-purple-400 text-purple-300 rounded-lg font-mono font-bold">
                                {framework}
                            </span>
                            ))}
                        </div>
                        </div>

                        {/* Other Skills */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Sparkles className="w-7 h-7 text-yellow-400" />
                            <h2 className="text-3xl font-blackops text-white">OTHER SKILLS</h2>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {userData.otherSkills.map((skill, idx) => (
                            <span key={idx} className="px-4 py-2 bg-yellow-500/20 border-2 border-yellow-400 text-yellow-300 rounded-lg font-mono font-bold">
                                {skill}
                            </span>
                            ))}
                        </div>
                        </div>
                    </div>
                    )}

                    {activeTab === "github" && userData.githubConnected && (
                    <div className="space-y-6">
                        {/* GitHub Stats */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Github className="w-7 h-7 text-white" />
                            <h2 className="text-3xl font-blackops text-white">GITHUB STATISTICS</h2>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/30 rounded-xl p-4 text-center">
                            <div className="text-3xl font-blackops text-blue-400">{githubStats.contributions}</div>
                            <div className="text-sm text-gray-400 font-mono mt-1">Contributions</div>
                            </div>
                            <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 rounded-xl p-4 text-center">
                            <div className="text-3xl font-blackops text-green-400">{githubStats.repositories}</div>
                            <div className="text-sm text-gray-400 font-mono mt-1">Repositories</div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30 rounded-xl p-4 text-center">
                            <div className="text-3xl font-blackops text-purple-400">{githubStats.followers}</div>
                            <div className="text-sm text-gray-400 font-mono mt-1">Followers</div>
                            </div>
                            <div className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/30 rounded-xl p-4 text-center">
                            <div className="text-3xl font-blackops text-pink-400">{githubStats.following}</div>
                            <div className="text-sm text-gray-400 font-mono mt-1">Following</div>
                            </div>
                            <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/30 rounded-xl p-4 text-center">
                            <div className="text-3xl font-blackops text-yellow-400">{githubStats.stars}</div>
                            <div className="text-sm text-gray-400 font-mono mt-1">Stars</div>
                            </div>
                        </div>
                        </div>

                        {/* Contribution Graph */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-blackops text-white">CONTRIBUTION GRAPH</h3>
                            <span className="text-gray-400 font-mono text-sm">{githubStats.contributions} contributions in the last year</span>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <div className="inline-flex gap-1">
                            {githubStats.contributionGraph.map((week, weekIdx) => (
                                <div key={weekIdx} className="flex flex-col gap-1">
                                {week.map((day, dayIdx) => (
                                    <div
                                    key={dayIdx}
                                    className={`w-3 h-3 rounded-sm ${getContributionColor(day)} transition-all hover:scale-125 cursor-pointer`}
                                    title={`${day} contributions`}
                                    />
                                ))}
                                </div>
                            ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mt-6 text-sm font-mono">
                            <span className="text-gray-400">Less</span>
                            <div className="flex gap-1">
                            {[0, 1, 2, 3, 4].map((level) => (
                                <div key={level} className={`w-3 h-3 rounded-sm ${getContributionColor(level)}`} />
                            ))}
                            </div>
                            <span className="text-gray-400">More</span>
                        </div>
                        </div>

                        {/* Pinned Projects */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Star className="w-7 h-7 text-yellow-400" />
                            <h2 className="text-3xl font-blackops text-white">PINNED REPOSITORIES</h2>
                        </div>

                        <div className="grid gap-4">
                            {pinnedProjects.map((project, idx) => (
                            <a
                                key={idx}
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group p-6 bg-gradient-to-r from-gray-800/50 to-gray-700/30 border-2 border-gray-700/50 rounded-xl hover:border-blue-500/50 transition-all"
                            >
                                <div className="flex items-start justify-between mb-3">
                                <h3 className="text-xl font-blackops text-white group-hover:text-blue-400 transition-colors">
                                    {project.name}
                                </h3>
                                <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg font-mono text-sm">
                                    {project.language}
                                </span>
                                </div>
                                <p className="text-gray-300 font-geist mb-4">{project.description}</p>
                                <div className="flex items-center gap-4 text-sm font-mono text-gray-400">
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4" />
                                    <span>{project.stars}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <GitFork className="w-4 h-4" />
                                    <span>{project.forks}</span>
                                </div>
                                </div>
                            </a>
                            ))}
                        </div>
                        </div>

                        {/* GitHub Badges */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Award className="w-7 h-7 text-pink-400" />
                            <h2 className="text-3xl font-blackops text-white">ACHIEVEMENTS</h2>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {badges.map((badge, idx) => (
                            <div key={idx} className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-700/30 border-2 border-gray-700/50 rounded-xl text-center hover:border-pink-500/50 hover:scale-105 transition-all">
                                <div className="text-4xl mb-3">{badge.icon}</div>
                                <div className="text-sm font-mono text-white font-bold">{badge.name}</div>
                            </div>
                            ))}
                        </div>
                        </div>
                    </div>
                    )}

                    {activeTab === "activity" && (
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8">
                        <div className="flex items-center gap-3 mb-6">
                        <Calendar className="w-7 h-7 text-teal-400" />
                        <h2 className="text-3xl font-blackops text-white">RECENT ACTIVITY</h2>
                        </div>

                        <div className="space-y-4">
                        {[
                            { action: "Registered for", event: "HackMalaysia 2025", time: "2 days ago", icon: Users, color: "blue" },
                            { action: "Completed profile", event: "Added 15 new skills", time: "5 days ago", icon: Trophy, color: "purple" },
                            { action: "Joined team", event: "Code Warriors", time: "1 week ago", icon: Users, color: "green" },
                            { action: "Won prize", event: "Best Innovation Award", time: "2 weeks ago", icon: Trophy, color: "yellow" }
                        ].map((activity, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl hover:bg-gray-700/30 transition-all">
                            <div className={`p-3 bg-${activity.color}-500/20 border border-${activity.color}-500/50 rounded-lg`}>
                                <activity.icon className={`w-5 h-5 text-${activity.color}-400`} />
                            </div>
                            <div className="flex-1">
                                <p className="text-white font-mono">
                                <span className="text-gray-400">{activity.action}</span> <span className="font-bold">{activity.event}</span>
                                </p>
                                <p className="text-sm text-gray-500 font-mono mt-1">{activity.time}</p>
                            </div>
                            </div>
                        ))}
                        </div>
                    </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-4">
                        <p className="text-white font-mono mb-2">Debug: GitHub Status</p>
                        <p className="text-gray-300 text-sm font-mono mb-2">
                            Connected: {userData.githubConnected ? 'Yes' : 'No'}
                        </p>
                        <p className="text-gray-300 text-sm font-mono mb-4">
                            Username: {userData.githubUsername || 'Not set'}
                        </p>
                        <button
                            onClick={handleConnectGitHub}
                            className="w-full bg-purple-500 text-white font-mono px-4 py-2 rounded-lg"
                        >
                            Force Connect GitHub
                        </button>
                    </div>

                    <button
                        onClick={async () => {
                            // First disconnect
                            await disconnectGitHub()
                            // Then reconnect
                            const result = await connectGitHub()
                            if (result.success && result.authUrl) {
                            window.location.href = result.authUrl
                            }
                        }}
                        className="w-full bg-purple-500 text-white font-mono px-4 py-2 rounded-lg"
                        >
                        {userData.githubConnected ? 'Reconnect GitHub' : 'Connect GitHub'}
                    </button> */}

                    {/* Quick Stats */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-6">
                    <h3 className="text-xl font-blackops text-white mb-4">QUICK STATS</h3>
                    
                    <div className="space-y-4">
                        {userType === "hacker" ? (
                        <>
                            <div className="flex items-center justify-between pb-4 border-b border-gray-700/50">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-400" />
                                <span className="text-gray-300 font-mono text-sm">Hackathons</span>
                            </div>
                            <span className="text-white font-blackops text-lg">12</span>
                            </div>
                            <div className="flex items-center justify-between pb-4 border-b border-gray-700/50">
                            <div className="flex items-center gap-2">
                                <Award className="w-5 h-5 text-purple-400" />
                                <span className="text-gray-300 font-mono text-sm">Wins</span>
                            </div>
                            <span className="text-white font-blackops text-lg">4</span>
                            </div>
                            <div className="flex items-center justify-between pb-4 border-b border-gray-700/50">
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-400" />
                                <span className="text-gray-300 font-mono text-sm">Teams</span>
                            </div>
                            <span className="text-white font-blackops text-lg">8</span>
                            </div>
                            <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Code2 className="w-5 h-5 text-pink-400" />
                                <span className="text-gray-300 font-mono text-sm">Projects</span>
                            </div>
                            <span className="text-white font-blackops text-lg">24</span>
                            </div>
                        </>
                        ) : (
                        <>
                            <div className="flex items-center justify-between pb-4 border-b border-gray-700/50">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-teal-400" />
                                <span className="text-gray-300 font-mono text-sm">Events Organized</span>
                            </div>
                            <span className="text-white font-blackops text-lg">18</span>
                            </div>
                            <div className="flex items-center justify-between pb-4 border-b border-gray-700/50">
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-400" />
                                <span className="text-gray-300 font-mono text-sm">Total Participants</span>
                            </div>
                            <span className="text-white font-blackops text-lg">2.4K</span>
                            </div>
                            <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-400" />
                                <span className="text-gray-300 font-mono text-sm">Prize Pool Distributed</span>
                            </div>
                            <span className="text-white font-blackops text-lg">RM 500K</span>
                            </div>
                        </>
                        )}
                    </div>
                    </div>

                    {/* GitHub Integration */}
                    {!userData.githubConnected && (
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-6">
                            <div className="text-center space-y-4">
                            <Github className="w-12 h-12 text-gray-400 mx-auto" />
                            <h3 className="text-xl font-blackops text-white">CONNECT GITHUB</h3>
                            <p className="text-gray-400 font-mono text-sm">
                                Showcase your repositories and contributions
                            </p>
                            <button 
                                onClick={handleConnectGitHub}
                                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-mono font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all"
                            >
                                Connect GitHub
                            </button>
                            </div>
                        </div>
                    )}

                    {/* Contact Card */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-6">
                    <h3 className="text-xl font-blackops text-white mb-4">CONTACT INFO</h3>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-gray-300 font-mono text-sm pb-4 border-b border-gray-700/50">
                        <Mail className="w-4 h-4 text-pink-400" />
                        <span className="break-all">{userData.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300 font-mono text-sm pb-4 border-b border-gray-700/50">
                        <MapPin className="w-4 h-4 text-purple-400" />
                        <span>{userData.city}, {userData.state}</span>
                        </div>
                        {userType === "organizer" && (
                        <>
                            <div className="flex items-center gap-3 text-gray-300 font-mono text-sm pb-4 border-b border-gray-700/50">
                            <Phone className="w-4 h-4 text-blue-400" />
                            <span>+60 12-345 6789</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-300 font-mono text-sm">
                            <LinkIcon className="w-4 h-4 text-teal-400" />
                            <a href={userData.organizationWebsite} className="hover:text-white transition-colors break-all">
                                {userData.organizationWebsite}
                            </a>
                            </div>
                        </>
                        )}
                        {userType === "hacker" && (
                        <div className="pt-0"></div>
                        )}
                    </div>
                    </div>

                    {/* Skills Summary for Hackers */}
                    {userType === "hacker" && (
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-6">
                        <h3 className="text-xl font-blackops text-white mb-4">SKILLS SUMMARY</h3>
                        
                        <div className="space-y-3">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 font-mono text-sm">Languages</span>
                            <span className="text-pink-400 font-blackops">{userData.programmingLanguages.length}</span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" style={{width: '85%'}}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 font-mono text-sm">Frameworks</span>
                            <span className="text-purple-400 font-blackops">{userData.frameworks.length}</span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{width: '70%'}}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 font-mono text-sm">Other Skills</span>
                            <span className="text-yellow-400 font-blackops">{userData.otherSkills.length}</span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" style={{width: '60%'}}></div>
                            </div>
                        </div>
                        </div>
                    </div>
                    )}

                    {/* Capabilities for Organizers */}
                    {userType === "organizer" && (
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-6">
                        <h3 className="text-xl font-blackops text-white mb-4">CAPABILITIES</h3>
                        
                        <div className="space-y-3">
                        {[
                            { label: "Livestreaming", enabled: userData.livestreamCapability },
                            { label: "Photography", enabled: userData.photographyCapability },
                            { label: "Marketing", enabled: userData.marketingCapability },
                            { label: "Venue Access", enabled: userData.hasVenue },
                            { label: "Sponsor Network", enabled: userData.hasSponsorConnections }
                        ].map((capability, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                            <span className="text-gray-300 font-mono text-sm">{capability.label}</span>
                            {capability.enabled ? (
                                <div className="w-6 h-6 bg-green-500/20 border border-green-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                </div>
                            ) : (
                                <div className="w-6 h-6 bg-gray-800 border border-gray-700 rounded-full"></div>
                            )}
                            </div>
                        ))}
                        </div>
                    </div>
                    )}
                </div>
                </div>
            </div>

            {/* Image Upload Modal */}
            {showImageUpload && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 rounded-2xl p-8 max-w-md w-full">
                        <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-blackops text-white">UPLOAD PROFILE IMAGE</h3>
                        <button 
                            onClick={() => setShowImageUpload(false)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                        </div>

                        <div className="space-y-4">
                        <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-pink-500/50 transition-all cursor-pointer">
                            <input 
                            type="file" 
                            id="imageUpload" 
                            accept="image/*" 
                            onChange={handleImageUpload}
                            className="hidden"
                            />
                            <label htmlFor="imageUpload" className="cursor-pointer">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-white font-mono font-bold mb-1">Click to upload</p>
                            <p className="text-gray-400 text-sm font-mono">PNG, JPG or GIF (max. 5MB)</p>
                            </label>
                        </div>

                        <button 
                            onClick={() => setShowImageUpload(false)}
                            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-mono font-bold px-6 py-3 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  )
}