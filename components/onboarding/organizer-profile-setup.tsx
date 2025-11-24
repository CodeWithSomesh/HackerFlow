"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { saveOrganizerProfile } from "@/lib/actions/profile-actions"
import { createClient } from "@/lib/supabase/client"
import { ProgressIndicator } from "./progress-indicator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  Building, 
  Link,
  Twitter,
  Linkedin,
  Globe,
  Instagram,
  DollarSign,
  Sparkles,
  Trophy,
  TriangleAlert,
  CheckCircle,
  CalendarClock,
  X
} from "lucide-react"
import { showCustomToast } from "@/components/toast-notification"
import { triggerSideCannons, 
  // triggerFireworks, triggerCustomShapes, triggerEmoji, triggerStars 
} from "@/lib/confetti"
import { ProfileSetupToastHandler } from "../toasts/profileSetup-toastHandler"

export function OrganizerProfileSetup() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isProfileComplete, setIsProfileComplete] = useState(false)

  console.log(`Debugging ${isLoading} and ${error}`)

  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    organizationType: "", // "individual", "company", "university", "non-profit"
    
    // Organization details
    organizationName: "",
    position: "",
    organizationSize: "",
    organizationWebsite: "",
    organizationDescription: "",
    
    // Experience
    eventOrganizingExperience: "",
    previousEvents: [] as Array<{
      id: string;
      eventName: string;
      eventType: string;
      participantCount: string;
      date: string;
      description: string;
      role: string;
    }>,
    
    // Location & Preferences
    city: "",
    state: "",
    country: "Malaysia",
    willingToTravelFor: false,
    preferredEventTypes: [] as string[],
    
    // Budget & Resources
    typicalBudgetRange: "",
    hasVenue: false,
    venueDetails: "",
    hasSponsorConnections: false,
    sponsorDetails: "",
    
    // Technical capabilities
    techSetupCapability: "",
    livestreamCapability: false,
    photographyCapability: false,
    marketingCapability: false,
    
    // Goals & Focus
    primaryGoals: [] as string[],
    targetAudience: [] as string[],
    
    // Social links
    linkedinUrl: "",
    twitterUsername: "",
    websiteUrl: "",
    instagramUsername: "",
    
    // Other
    lookingForCoOrganizers: false,
    willingToMentor: false,
    availableForConsulting: false,
  })
  type PreviousEvent = {
    id: number;
    eventName: string;
    eventType: string;
    participantCount: string;
    date: string;
    description: string;
    role: string;
  };
  
  const [previousEvents, setPreviousEvents] = useState<PreviousEvent[]>([])

  // Check if all required fields are filled
  useEffect(() => {
    const requiredFieldsFilled = 
      formData.fullName.trim() !== '' &&
      formData.organizationType !== '' &&
      formData.organizationName.trim() !== '' &&
      formData.position.trim() !== '' &&
      formData.city.trim() !== '' &&
      formData.state.trim() !== '' &&
      formData.eventOrganizingExperience !== '';
    
    setIsProfileComplete(requiredFieldsFilled)
  }, [formData])

  // Prevent browser back/close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isProfileComplete) {
        e.preventDefault()
        e.returnValue = 'Please complete your profile registration before leaving.'
        return 'Please complete your profile registration before leaving.'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isProfileComplete])

  // Prevent browser back button
  useEffect(() => {
    if (!isProfileComplete) {
      window.history.pushState(null, '', window.location.href)
      
      const handlePopState = () => {
        window.history.pushState(null, '', window.location.href)
        showCustomToast('warning', 'Please complete your profile registration before leaving this page.')
      }

      window.addEventListener('popstate', handlePopState)
      return () => window.removeEventListener('popstate', handlePopState)
    }
  }, [isProfileComplete])

  useEffect(() => {
    // Get user's full name if available from auth
    const userFullName = localStorage.getItem("userFullName")
    if (userFullName) {
      setFormData(prev => ({ ...prev, fullName: userFullName }))
    }
  }, [])

  // Check if user is already registered (has a profile record) and redirect if so
  useEffect(() => {
    const checkProfileExists = async () => {
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        console.log('No authenticated user, redirecting to Login Page')
        router.push('/auth/login')
        return
      }

      // Check if profile record exists (user is already registered)
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      // If profile exists, user is already registered - redirect to hackathons
      if (profile && !profileError) {
        console.log('User already registered, redirecting to hackathons')
        showCustomToast('info', "You're already registered!")
        router.push('/hackathons')
        return
      }

      console.log('New user - allowing access to profile setup')
    }

    checkProfileExists()
  }, [router])

  const organizationTypes = [
    { value: "individual", label: "Individual", icon: Users },
    { value: "company", label: "Company/Startup", icon: Building },
    { value: "university", label: "University/School", icon: Trophy },
    { value: "non-profit", label: "Non-Profit/NGO", icon: Sparkles }
  ]

  const budgetRanges = [
    "< RM 5,000", 
    "RM 5,000 - RM 15,000", 
    "RM 15,000 - RM 50,000", 
    "RM 50,000 - RM 100,000", 
    "RM 100,000 - RM 300,000", 
    "> RM 300,000"
  ]

  // const eventTypes = [
  //   "Hackathons", "Coding Bootcamps", "Tech Conferences", "Workshops", 
  //   "Networking Events", "Startup Competitions", "Game Jams", "Design Sprints",
  //   "AI/ML Competitions", "Blockchain Events", "Mobile Development", "Web Development",
  //   "Cybersecurity", "Data Science", "IoT Events", "Student Competitions"
  // ]

  // const primaryGoals = [
  //   "Foster Innovation", "Build Community", "Education & Learning", "Networking",
  //   "Talent Discovery", "Product Development", "Social Impact", "Brand Awareness",
  //   "Market Research", "Partnership Building", "Skill Development", "Career Growth"
  // ]

  // const targetAudience = [
  //   "Students", "Fresh Graduates", "Working Professionals", "Startups", 
  //   "Experienced Developers", "Designers", "Product Managers", "Data Scientists",
  //   "AI/ML Engineers", "Mobile Developers", "Web Developers", "DevOps Engineers",
  //   "Entrepreneurs", "Researchers"
  // ]

  // const handleSkillToggle = (
  //   skill: string,
  //   category: "preferredEventTypes" | "primaryGoals" | "targetAudience"
  // ) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     [category]: prev[category].includes(skill)
  //       ? prev[category].filter((s) => s !== skill)
  //       : [...prev[category], skill],
  //   }))
  // }

  const addPreviousEvent = () => {
    setPreviousEvents([...previousEvents, {
      id: Date.now(),
      eventName: "",
      eventType: "",
      participantCount: "",
      date: "",
      description: "",
      role: "Lead Organizer"
    }])
  }
  
  const removePreviousEvent = (id: number) => {
    setPreviousEvents(previousEvents.filter(event => event.id !== id))
  }
  
  const updatePreviousEvent = (id: number, field: keyof PreviousEvent, value: string) => {
    setPreviousEvents(previousEvents.map(event => 
      event.id === id ? { ...event, [field]: value } : event
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    // Validation - only crucial fields
    if (!formData.fullName.trim()) {
      showCustomToast('warning', 'Please enter your full name')
      setIsLoading(false)
      return
    }
    
    if (!formData.organizationType) {
      showCustomToast('warning', 'Please select your organization type')
      setIsLoading(false)
      return
    }
    
    if (!formData.organizationName.trim()) {
      showCustomToast('warning', 'Please enter your organization name')
      setIsLoading(false)
      return
    }
    
    if (!formData.position.trim()) {
      showCustomToast('warning', 'Please enter your position/role')
      setIsLoading(false)
      return
    }
    
    if (!formData.city.trim()) {
      showCustomToast('warning', 'Please enter your city')
      setIsLoading(false)
      return
    }
    
    if (!formData.state.trim()) {
      showCustomToast('warning', 'Please enter your state')
      setIsLoading(false)
      return
    }
    
    if (!formData.eventOrganizingExperience) {
      showCustomToast('warning', 'Please select your event organizing experience level')
      setIsLoading(false)
      return
    }
  
    try {
      console.log('Submitting organizer profile:', formData)
      
      const result = await saveOrganizerProfile(formData)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save profile')
      }

      // Mark profile as complete to allow navigation
      setIsProfileComplete(true)
      
      showCustomToast('success', "Successfully Created Your Profile!")
      triggerSideCannons(); //Trigger Confetti
      router.push("/hackathons") //Redirect to Hackathon Page 
    } catch (err) {
      console.error('Error saving profile:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to save profile'
      setError(errorMessage)
      showCustomToast('error', "Failed To Create Your Profile")
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <div className="min-h-screen">
      <ProfileSetupToastHandler />
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-96 left-2 w-96 h-96 bg-emerald-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-4 w-96 h-96 bg-teal-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-green-500/15 to-emerald-500/15 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-5xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-teal-400">
              ORGANIZER PROFILE SETUP
            </h1>
            <p className="text-gray-300 font-mono text-lg mt-2">
              Build your profile to attract the best hackers and partners
            </p>
            
            {/* Progress Indicator */}
            <div className="flex items-center justify-center gap-3 pt-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-teal-500 border-2 border-teal-300 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-black" />
                </div>
                <span className="text-gray-400 font-mono text-sm">Account</span>
              </div>
              <div className="h-px w-12 bg-gray-600"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-teal-500 border-2 border-teal-300 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-black" />
                </div>
                <span className="text-gray-400 font-mono text-sm">Role</span>
              </div>
              <div className="h-px w-12 bg-gray-600"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-teal-500 border-2 border-teal-300 flex items-center justify-center font-bold text-black">
                  3
                </div>
                <span className="text-white font-mono text-sm font-bold">Profile</span>
              </div>
            </div>

            <div className="text-center flex mx-auto max-w-2xl mt-8">
              <ProgressIndicator currentStep={3} totalSteps={3} />
            </div>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <TriangleAlert className="text-yellow-400" />
          </div>
          <p className="text-yellow-300 text-sm font-mono">
            Complete all required fields (*) before leaving this page to ensure your account is properly set up.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
       <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-md">
          <div className="px-8 py-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <Users className="w-7 h-7 text-teal-400" />
              <h2 className="text-2xl font-blackops text-white">BASIC INFORMATION</h2>
            </div>
          </div>
          
          <div className="px-8 py-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-gray-200 font-mono text-sm">Full Name *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  placeholder="John Doe"
                  className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 focus:outline-none focus:border-teal-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-gray-200 font-mono text-sm">Organization Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  {organizationTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({...formData, organizationType: type.value})}
                        className={`flex items-center gap-2 p-3 rounded-md border transition-colors ${
                          formData.organizationType === type.value
                            ? 'border-teal-400 bg-teal-500/10'
                            : 'border-gray-700 bg-gray-900/40 hover:bg-gray-800/40'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-teal-400" />
                        <span className="text-white text-sm font-mono">{type.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-gray-200 font-mono text-sm">City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  placeholder="Kuala Lumpur"
                  className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-gray-200 font-mono text-sm">State *</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  placeholder="Selangor"
                  className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-gray-200 font-mono text-sm">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  readOnly
                  className="w-full bg-gray-800 border border-gray-700 text-gray-400 rounded-md px-4 py-3"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-gray-200 font-mono text-sm">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Tell us about your passion for organizing events..."
                className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 resize-none focus:outline-none focus:border-teal-500"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Organization Details */}
        {formData.organizationType && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-md">
            <div className="px-8 py-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <Building className="w-7 h-7 text-teal-400" />
                <h2 className="text-2xl font-blackops text-white">ORGANIZATION DETAILS</h2>
              </div>
            </div>
            
            <div className="px-8 py-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-gray-200 font-mono text-sm">
                    {formData.organizationType === "individual" ? "Brand/Personal Name *" : "Organization Name *"}
                  </label>
                  <input
                    type="text"
                    value={formData.organizationName}
                    onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
                    placeholder="Your Organization"
                    className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-gray-200 font-mono text-sm">Your Position/Role *</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    placeholder="Event Manager, Co-founder"
                    className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {formData.organizationType !== "individual" && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-gray-200 font-mono text-sm">Organization Size</label>
                    <Select value={formData.organizationSize} onValueChange={(value) => setFormData({...formData, organizationSize: value})}>
                      <SelectTrigger className="bg-black border-gray-700 text-gray-200 py-6 text-md">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-gray-700">
                        <SelectItem value="1-10">1-10 people</SelectItem>
                        <SelectItem value="11-50">11-50 people</SelectItem>
                        <SelectItem value="51-200">51-200 people</SelectItem>
                        <SelectItem value="201-1000">201-1000 people</SelectItem>
                        <SelectItem value="1000+">1000+ people</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-200 font-mono text-sm">Organization Website</label>
                    <input
                      type="url"
                      value={formData.organizationWebsite}
                      onChange={(e) => setFormData({...formData, organizationWebsite: e.target.value})}
                      placeholder="https://company.com"
                      className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-gray-200 font-mono text-sm">Organization Description</label>
                <textarea
                  value={formData.organizationDescription}
                  onChange={(e) => setFormData({...formData, organizationDescription: e.target.value})}
                  placeholder="Describe your organization, its mission, and focus areas..."
                  className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 resize-none focus:outline-none focus:border-teal-500"
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        {/* Event Experience */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-md">
          <div className="px-8 py-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <CalendarClock className="w-7 h-7 text-teal-400" />
              <h2 className="text-2xl font-blackops text-white">EVENT ORGANIZING EXPERIENCE</h2>
            </div>
          </div>
          
          <div className="px-8 py-6 space-y-6">
            <div className="space-y-2">
              <label className="text-gray-200 font-mono text-sm">Experience Level *</label>
              <Select value={formData.eventOrganizingExperience} onValueChange={(value) => setFormData({...formData, eventOrganizingExperience: value})}>
                <SelectTrigger className="bg-black border-gray-700 text-gray-200 py-6 text-md">
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-700">
                  <SelectItem value="first-time">First-time organizer</SelectItem>
                  <SelectItem value="beginner">Beginner (1-3 events)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (4-10 events)</SelectItem>
                  <SelectItem value="experienced">Experienced (11+ events)</SelectItem>
                  <SelectItem value="expert">Expert (50+ events)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <label className="text-gray-200 font-mono text-sm">Previous Events</label>
                <button
                  type="button"
                  onClick={addPreviousEvent}
                  className="bg-gradient-to-r from-green-500 via-cyan-500 to-teal-500 text-white font-mono font-bold text-sm px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
                >
                  + Add Event
                </button>
              </div>

              {previousEvents.map((event, index) => (
                <div key={event.id} className="p-4 bg-gray-800/30 border border-gray-700/50 rounded-md space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-mono">Event #{index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removePreviousEvent(event.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-gray-300 font-mono text-xs">Event Name</label>
                      <input
                        type="text"
                        value={event.eventName}
                        onChange={(e) => updatePreviousEvent(event.id, "eventName", e.target.value)}
                        placeholder="Hackathon Malaysia 2024"
                        className="w-full bg-gray-900 border border-gray-600 text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-gray-300 font-mono text-xs">Participant Count</label>
                      <input
                        type="text"
                        value={event.participantCount}
                        onChange={(e) => updatePreviousEvent(event.id, "participantCount", e.target.value)}
                        placeholder="e.g., 200"
                        className="w-full bg-gray-900 border border-gray-600 text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-gray-300 font-mono text-xs">Description</label>
                    <textarea
                      value={event.description}
                      onChange={(e) => updatePreviousEvent(event.id, "description", e.target.value)}
                      placeholder="Describe the event, your role, and achievements..."
                      className="w-full bg-gray-900 border border-gray-600 text-gray-100 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:border-teal-500"
                      rows={2}
                    />
                  </div>
                </div>
              ))}

              {previousEvents.length === 0 && (
                <p className="text-gray-400 font-mono text-sm text-center py-4 italic">
                  Click &apos;Add Event&apos; to showcase your event organizing experience
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Budget & Resources */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-md">
          <div className="px-8 py-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <DollarSign className="w-7 h-7 text-teal-400" />
              <h2 className="text-2xl font-blackops text-white">BUDGET & RESOURCES</h2>
            </div>
          </div>
          
          <div className="px-8 py-6 space-y-6">
            <div className="space-y-2">
              <label className="text-gray-200 font-mono text-sm">Typical Budget Range</label>
              <Select value={formData.typicalBudgetRange} onValueChange={(value) => setFormData({...formData, typicalBudgetRange: value})}>
                <SelectTrigger className="bg-black border-gray-700 text-gray-200 py-6 text-md">
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-700">
                  {budgetRanges.map(range => (
                    <SelectItem key={range} value={range}>{range}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasVenue}
                  onChange={(e) => setFormData({...formData, hasVenue: e.target.checked})}
                  className="w-4 h-4 text-teal-500 bg-gray-900 border-gray-600 rounded focus:ring-teal-500"
                />
                <span className="text-gray-200 font-mono text-sm">I have access to venues or spaces</span>
              </label>

              {formData.hasVenue && (
                <textarea
                  value={formData.venueDetails}
                  onChange={(e) => setFormData({...formData, venueDetails: e.target.value})}
                  placeholder="Describe your venue access, capacity, facilities..."
                  className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 resize-none focus:outline-none focus:border-teal-500"
                  rows={2}
                />
              )}
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasSponsorConnections}
                  onChange={(e) => setFormData({...formData, hasSponsorConnections: e.target.checked})}
                  className="w-4 h-4 text-teal-500 bg-gray-900 border-gray-600 rounded focus:ring-teal-500"
                />
                <span className="text-gray-200 font-mono text-sm">I have sponsor connections or partnerships</span>
              </label>

              {formData.hasSponsorConnections && (
                <textarea
                  value={formData.sponsorDetails}
                  onChange={(e) => setFormData({...formData, sponsorDetails: e.target.value})}
                  placeholder="Describe your sponsor connections..."
                  className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 resize-none focus:outline-none focus:border-teal-500"
                  rows={2}
                />
              )}
            </div>
          </div>
        </div>

        {/* Technical Capabilities */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-md">
          <div className="px-8 py-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <Sparkles className="w-7 h-7 text-teal-400" />
              <h2 className="text-2xl font-blackops text-white">TECHNICAL & MARKETING CAPABILITIES</h2>
            </div>
          </div>
          
          <div className="px-8 py-6 space-y-6">
            <div className="space-y-2">
              <label className="text-gray-200 font-mono text-sm">Technical Setup Capability</label>
              <Select value={formData.techSetupCapability} onValueChange={(value) => setFormData({...formData, techSetupCapability: value})}>
                <SelectTrigger className="bg-black border-gray-700 text-gray-200 py-6 text-md">
                  <SelectValue placeholder="Select your technical capability" />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-700">
                  <SelectItem value="beginner">Basic (WiFi setup, basic AV)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (Network setup, streaming)</SelectItem>
                  <SelectItem value="advanced">Advanced (Full tech infrastructure)</SelectItem>
                  <SelectItem value="expert">Expert (Complex setups, custom solutions)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.livestreamCapability}
                  onChange={(e) => setFormData({...formData, livestreamCapability: e.target.checked})}
                  className="w-4 h-4 text-teal-500 bg-gray-900 border-gray-600 rounded focus:ring-teal-500"
                />
                <span className="text-gray-200 font-mono text-sm">Livestreaming</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.photographyCapability}
                  onChange={(e) => setFormData({...formData, photographyCapability: e.target.checked})}
                  className="w-4 h-4 text-teal-500 bg-gray-900 border-gray-600 rounded focus:ring-teal-500"
                />
                <span className="text-gray-200 font-mono text-sm">Photography</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.marketingCapability}
                  onChange={(e) => setFormData({...formData, marketingCapability: e.target.checked})}
                  className="w-4 h-4 text-teal-500 bg-gray-900 border-gray-600 rounded focus:ring-teal-500"
                />
                <span className="text-gray-200 font-mono text-sm">Marketing</span>
              </label>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-md">
          <div className="px-8 py-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <Link className="w-7 h-7 text-teal-400" />
              <h2 className="text-2xl font-blackops text-white">SOCIAL LINKS & CONTACT</h2>
            </div>
          </div>
          
          <div className="px-8 py-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-gray-200 font-mono text-sm flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-blue-400" />
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})}
                  placeholder="https://linkedin.com/in/johndoe"
                  className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-gray-200 font-mono text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4 text-teal-400" />
                  Website/Portfolio
                </label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
                  placeholder="https://yoursite.com"
                  className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-gray-200 font-mono text-sm flex items-center gap-2">
                  <Twitter className="w-4 h-4 text-blue-400" />
                  Twitter Username
                </label>
                <input
                  type="text"
                  value={formData.twitterUsername}
                  onChange={(e) => setFormData({...formData, twitterUsername: e.target.value})}
                  placeholder="@johndoe"
                  className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-gray-200 font-mono text-sm flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-400" />
                  Instagram Username
                </label>
                <input
                  type="text"
                  value={formData.instagramUsername}
                  onChange={(e) => setFormData({...formData, instagramUsername: e.target.value})}
                  placeholder="johndoe"
                  className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center py-4 ">
          <button
            type="submit"
            className="bg-gradient-to-r from-green-500 via-cyan-500 to-teal-500 text-white font-mono font-bold px-12 py-4 rounded-md hover:opacity-90 transition-opacity shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Complete Organizer Profile
            </div>
          </button>
          
          {/* <button
            type="button"
            className="border border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 font-mono px-12 py-4 rounded-md transition-colors"
          >
            Skip for Now
          </button> */}
        </div>
        </form>
      </div>
  </div>
)
}

export default OrganizerProfileSetup
