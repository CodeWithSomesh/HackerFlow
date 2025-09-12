"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ProgressIndicator } from "./progress-indicator"
import { 
  Users, 
  Loader2, 
  Building, 
  Briefcase,
  Calendar,
  MapPin,
  Award,
  Target,
  Link,
  Twitter,
  Linkedin,
  Globe,
  Instagram,
  DollarSign,
  Clock,
  UserCheck,
  Sparkles,
  Trophy,
  Home
} from "lucide-react"

export function OrganizerProfileSetup() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
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

  useEffect(() => {
    // Get user's full name if available from auth
    const userFullName = localStorage.getItem("userFullName")
    if (userFullName) {
      setFormData(prev => ({ ...prev, fullName: userFullName }))
    }
  }, [])

  const organizationTypes = [
    { value: "individual", label: "Individual", icon: Users },
    { value: "company", label: "Company/Startup", icon: Building },
    { value: "university", label: "University/School", icon: Trophy },
    { value: "non-profit", label: "Non-Profit/NGO", icon: Award }
  ]

  const eventTypes = [
    "Hackathons", "Coding Bootcamps", "Tech Conferences", "Workshops", 
    "Networking Events", "Startup Competitions", "Game Jams", "Design Sprints",
    "AI/ML Competitions", "Blockchain Events", "Mobile Development", "Web Development",
    "Cybersecurity", "Data Science", "IoT Events", "Student Competitions"
  ]

  const primaryGoals = [
    "Foster Innovation", "Build Community", "Education & Learning", "Networking",
    "Talent Discovery", "Product Development", "Social Impact", "Brand Awareness",
    "Market Research", "Partnership Building", "Skill Development", "Career Growth"
  ]

  const targetAudience = [
    "Students", "Fresh Graduates", "Working Professionals", "Startups", 
    "Experienced Developers", "Designers", "Product Managers", "Data Scientists",
    "AI/ML Engineers", "Mobile Developers", "Web Developers", "DevOps Engineers",
    "Entrepreneurs", "Researchers"
  ]

  const budgetRanges = [
    "< RM 5,000", "RM 5,000 - RM 15,000", "RM 15,000 - RM 50,000", 
    "RM 50,000 - RM 100,000", "RM 100,000 - RM 300,000", "> RM 300,000"
  ]

  const handleSkillToggle = (
    skill: string,
    category: "preferredEventTypes" | "primaryGoals" | "targetAudience"
  ) => {
    setFormData((prev) => ({
      ...prev,
      [category]: prev[category].includes(skill)
        ? prev[category].filter((s) => s !== skill)
        : [...prev[category], skill],
    }))
  }

  const addPreviousEvent = () => {
    setFormData(prev => ({
      ...prev,
      previousEvents: [...prev.previousEvents, {
        id: Date.now().toString(),
        eventName: "",
        eventType: "",
        participantCount: "",
        date: "",
        description: "",
        role: "Lead Organizer"
      }]
    }))
  }
  
  const updatePreviousEvent = (id: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      previousEvents: prev.previousEvents.map(event => 
        event.id === id ? { ...event, [field]: value } : event
      )
    }))
  }
  
  const removePreviousEvent = (id: string) => {
    setFormData(prev => ({
      ...prev,
      previousEvents: prev.previousEvents.filter(event => event.id !== id)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Save profile data
    localStorage.setItem("organizerProfile", JSON.stringify(formData))

    setTimeout(() => {
      router.push("/onboarding/complete")
    }, 1500)
  }

  const handleSkip = () => {
    router.push("/onboarding/complete")
  }

  const handleHomeClick = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen">
      {/* Home Button - Floating in top right */}
      <div className="fixed top-6 right-6 z-50">
        <Button
          onClick={handleHomeClick}
          className="group relative backdrop-blur-xl bg-slate-800/30 border border-white hover:border-slate-500/50 text-white hover:text-white rounded-2xl p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          size="sm"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-green-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Home className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
          <span className="s-only">Go to Home</span>
        </Button>
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl mx-auto mt-12">
          <div className="text-center mb-8">
            <ProgressIndicator currentStep={3} totalSteps={3} />
          </div>

          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-green-500/20 rounded-2xl blur-xl"></div>
              <h1 className="relative text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-green-400 bg-clip-text text-transparent">
                Complete Your Organizer Profile
              </h1>
            </div>
            <p className="text-white text-lg">Build your profile to attract the best hackers and partners</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card className="backdrop-blur-xl bg-slate-800/50 border border-slate-400 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl text-white">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-slate-300 font-medium">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="John Doe"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl py-3"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300 font-medium">Organization Type *</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {organizationTypes.map((type) => (
                        <Button
                          key={type.value}
                          type="button"
                          variant={formData.organizationType === type.value ? "default" : "outline"}
                          onClick={() => setFormData({ ...formData, organizationType: type.value })}
                          className={`py-3 rounded-xl text-sm ${
                            formData.organizationType === type.value
                              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                              : "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-emerald-500/10 hover:border-emerald-500/50"
                          }`}
                        >
                          <type.icon className="w-4 h-4 mr-1" />
                          {type.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-slate-300 font-medium">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Kuala Lumpur"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl py-3"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-slate-300 font-medium">State *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="Selangor"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl py-3"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-slate-300 font-medium">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl py-3"
                      readOnly
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-slate-300 font-medium">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about your passion for organizing events, your vision, and what drives you to create amazing hackathons..."
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl resize-none"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Organization Details */}
            {formData.organizationType && (
              <Card className="backdrop-blur-xl bg-slate-800/50 border border-slate-400 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl text-white">
                    <div className="w-10 h-10 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl flex items-center justify-center">
                      <Building className="w-5 h-5 text-white" />
                    </div>
                    Organization Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="organizationName" className="text-slate-300 font-medium">
                        {formData.organizationType === "individual" ? "Brand/Personal Name" : 
                         formData.organizationType === "company" ? "Company Name" :
                         formData.organizationType === "university" ? "Institution Name" : "Organization Name"} *
                      </Label>
                      <Input
                        id="organizationName"
                        value={formData.organizationName}
                        onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                        placeholder={
                          formData.organizationType === "individual" ? "Your Brand Name" :
                          formData.organizationType === "company" ? "Tech Company Sdn Bhd" :
                          formData.organizationType === "university" ? "University of Malaya" : "Your Organization"
                        }
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl py-3"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position" className="text-slate-300 font-medium">Your Position/Role *</Label>
                      <Input
                        id="position"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        placeholder="Event Manager, Co-founder, Student Leader"
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl py-3"
                        required
                      />
                    </div>
                  </div>
                  
                  {formData.organizationType !== "individual" && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="organizationSize" className="text-slate-300 font-medium">Organization Size</Label>
                        <select
                          id="organizationSize"
                          value={formData.organizationSize}
                          onChange={(e) => setFormData({ ...formData, organizationSize: e.target.value })}
                          className="w-full py-3 px-3 text-sm bg-slate-700/50 border border-slate-600 rounded-xl text-white"
                        >
                          <option value="">Select size</option>
                          <option value="1-10">1-10 people</option>
                          <option value="11-50">11-50 people</option>
                          <option value="51-200">51-200 people</option>
                          <option value="201-1000">201-1000 people</option>
                          <option value="1000+">1000+ people</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="organizationWebsite" className="text-slate-300 font-medium">Organization Website</Label>
                        <Input
                          id="organizationWebsite"
                          value={formData.organizationWebsite}
                          onChange={(e) => setFormData({ ...formData, organizationWebsite: e.target.value })}
                          placeholder="https://company.com"
                          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl py-3"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="organizationDescription" className="text-slate-300 font-medium">Organization Description</Label>
                    <Textarea
                      id="organizationDescription"
                      value={formData.organizationDescription}
                      onChange={(e) => setFormData({ ...formData, organizationDescription: e.target.value })}
                      placeholder="Describe your organization, its mission, and focus areas..."
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl resize-none"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Event Experience */}
            <Card className="backdrop-blur-xl bg-slate-800/50 border border-slate-400 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl text-white">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  Event Organizing Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-slate-300 font-medium">Experience Level *</Label>
                  <select
                    value={formData.eventOrganizingExperience}
                    onChange={(e) => setFormData({ ...formData, eventOrganizingExperience: e.target.value })}
                    className="w-full py-3 px-3 text-sm bg-slate-700/50 border border-slate-600 rounded-xl text-white"
                    required
                  >
                    <option value="">Select your experience level</option>
                    <option value="first-time">First-time organizer</option>
                    <option value="beginner">Beginner (1-3 events)</option>
                    <option value="intermediate">Intermediate (4-10 events)</option>
                    <option value="experienced">Experienced (11+ events)</option>
                    <option value="expert">Expert (50+ events)</option>
                  </select>
                </div>

                {/* Previous Events */}
                <div className="space-y-4 pt-4 border-t border-slate-700">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300 font-medium">Previous Events</Label>
                    <Button
                      type="button"
                      onClick={addPreviousEvent}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm px-4 py-2 rounded-lg"
                    >
                      + Add Event
                    </Button>
                  </div>
                  
                  {formData.previousEvents.map((event, index) => (
                    <div key={event.id} className="p-4 bg-slate-700/30 border border-slate-600/50 rounded-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-medium">Event #{index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => removePreviousEvent(event.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm px-3 py-1"
                        >
                          Remove
                        </Button>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-300 text-sm">Event Name</Label>
                          <Input
                            value={event.eventName}
                            onChange={(e) => updatePreviousEvent(event.id, "eventName", e.target.value)}
                            placeholder="Hackathon Malaysia 2024"
                            className="bg-slate-600/50 border-slate-500 text-white placeholder:text-slate-400 rounded-lg py-2"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300 text-sm">Event Type</Label>
                          <select
                            value={event.eventType}
                            onChange={(e) => updatePreviousEvent(event.id, "eventType", e.target.value)}
                            className="w-full py-2 px-3 text-sm bg-slate-600/50 border border-slate-500 rounded-lg text-white"
                          >
                            <option value="">Select type</option>
                            {eventTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-300 text-sm">Participant Count</Label>
                          <Input
                            value={event.participantCount}
                            onChange={(e) => updatePreviousEvent(event.id, "participantCount", e.target.value)}
                            placeholder="e.g., 200, 50-100"
                            className="bg-slate-600/50 border-slate-500 text-white placeholder:text-slate-400 rounded-lg py-2"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300 text-sm">Date</Label>
                          <Input
                            value={event.date}
                            onChange={(e) => updatePreviousEvent(event.id, "date", e.target.value)}
                            placeholder="March 2024, Q1 2024"
                            className="bg-slate-600/50 border-slate-500 text-white placeholder:text-slate-400 rounded-lg py-2"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-slate-300 text-sm">Your Role</Label>
                        <select
                          value={event.role}
                          onChange={(e) => updatePreviousEvent(event.id, "role", e.target.value)}
                          className="w-full py-2 px-3 text-sm bg-slate-600/50 border border-slate-500 rounded-lg text-white"
                        >
                          <option value="Lead Organizer">Lead Organizer</option>
                          <option value="Co-Organizer">Co-Organizer</option>
                          <option value="Committee Member">Committee Member</option>
                          <option value="Volunteer Coordinator">Volunteer Coordinator</option>
                          <option value="Sponsorship Manager">Sponsorship Manager</option>
                          <option value="Technical Lead">Technical Lead</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-slate-300 text-sm">Description & Achievements</Label>
                        <Textarea
                          value={event.description}
                          onChange={(e) => updatePreviousEvent(event.id, "description", e.target.value)}
                          placeholder="Describe the event, your role, achievements, and key learnings..."
                          className="bg-slate-600/50 border-slate-500 text-white placeholder:text-slate-400 rounded-lg resize-none"
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}
                  
                  {formData.previousEvents.length === 0 && (
                    <p className="text-slate-400 text-sm italic text-center py-4">
                      Click "Add Event" to showcase your event organizing experience
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Goals & Target Audience */}
            {/* <Card className="backdrop-blur-xl bg-slate-800/50 border border-slate-400 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl text-white">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  Goals & Target Audience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                <div className="space-y-3">
                  <Label className="text-slate-300 font-medium">Primary Goals</Label>
                  <div className="flex flex-wrap gap-2">
                    {primaryGoals.map((goal) => (
                      <Badge
                        key={goal}
                        variant={formData.primaryGoals.includes(goal) ? "default" : "outline"}
                        className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                          formData.primaryGoals.includes(goal)
                            ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
                            : "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-emerald-500/10 hover:border-emerald-500/50"
                        }`}
                        onClick={() => handleSkillToggle(goal, "primaryGoals")}
                      >
                        {goal}
                      </Badge>
                    ))}
                  </div>
                </div>


                <div className="space-y-3">
                  <Label className="text-slate-300 font-medium">Target Audience</Label>
                  <div className="flex flex-wrap gap-2">
                    {targetAudience.map((audience) => (
                      <Badge
                        key={audience}
                        variant={formData.targetAudience.includes(audience) ? "default" : "outline"}
                        className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                        formData.targetAudience.includes(audience)
                          ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
                          : "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-emerald-500/10 hover:border-emerald-500/50"
                      }`}
                      onClick={() => handleSkillToggle(audience, "targetAudience")}
                    >
                      {audience}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card> */}


          <Card className="backdrop-blur-xl bg-slate-800/50 border border-slate-400 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl text-white">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                Budget & Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="typicalBudgetRange" className="text-slate-300 font-medium">Typical Budget Range</Label>
                <select
                  id="typicalBudgetRange"
                  value={formData.typicalBudgetRange}
                  onChange={(e) => setFormData({ ...formData, typicalBudgetRange: e.target.value })}
                  className="w-full py-3 px-3 text-sm bg-slate-700/50 border border-slate-600 rounded-xl text-white"
                >
                  <option value="">Select budget range</option>
                  {budgetRanges.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="hasVenue"
                    checked={formData.hasVenue}
                    onChange={(e) => setFormData({ ...formData, hasVenue: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500"
                  />
                  <Label htmlFor="hasVenue" className="text-slate-300">
                    I have access to venues or spaces
                  </Label>
                </div>
                
                {formData.hasVenue && (
                  <div className="space-y-2">
                    <Label htmlFor="venueDetails" className="text-slate-300 text-sm">Venue Details</Label>
                    <Textarea
                      id="venueDetails"
                      value={formData.venueDetails}
                      onChange={(e) => setFormData({ ...formData, venueDetails: e.target.value })}
                      placeholder="Describe your venue access, capacity, facilities, etc..."
                      className="bg-slate-600/50 border-slate-500 text-white placeholder:text-slate-400 rounded-lg resize-none"
                      rows={3}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="hasSponsorConnections"
                    checked={formData.hasSponsorConnections}
                    onChange={(e) => setFormData({ ...formData, hasSponsorConnections: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500"
                  />
                  <Label htmlFor="hasSponsorConnections" className="text-slate-300">
                    I have sponsor connections or partnerships
                  </Label>
                </div>
                
                {formData.hasSponsorConnections && (
                  <div className="space-y-2">
                    <Label htmlFor="sponsorDetails" className="text-slate-300 text-sm">Sponsor Connection Details</Label>
                    <Textarea
                      id="sponsorDetails"
                      value={formData.sponsorDetails}
                      onChange={(e) => setFormData({ ...formData, sponsorDetails: e.target.value })}
                      placeholder="Describe your sponsor connections, types of partnerships, etc..."
                      className="bg-slate-600/50 border-slate-500 text-white placeholder:text-slate-400 rounded-lg resize-none"
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Technical & Marketing Capabilities */}
          <Card className="backdrop-blur-xl bg-slate-800/50 border border-slate-400 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl text-white">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                Technical & Marketing Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="techSetupCapability" className="text-slate-300 font-medium">Technical Setup Capability</Label>
                <select
                  id="techSetupCapability"
                  value={formData.techSetupCapability}
                  onChange={(e) => setFormData({ ...formData, techSetupCapability: e.target.value })}
                  className="w-full py-3 px-3 text-sm bg-slate-700/50 border border-slate-600 rounded-xl text-white"
                >
                  <option value="">Select your technical capability</option>
                  <option value="beginner">Basic (WiFi setup, basic AV)</option>
                  <option value="intermediate">Intermediate (Network setup, streaming)</option>
                  <option value="advanced">Advanced (Full tech infrastructure)</option>
                  <option value="expert">Expert (Complex setups, custom solutions)</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="livestreamCapability"
                      checked={formData.livestreamCapability}
                      onChange={(e) => setFormData({ ...formData, livestreamCapability: e.target.checked })}
                      className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                    />
                    <Label htmlFor="livestreamCapability" className="text-slate-300">
                      Livestreaming capability
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="photographyCapability"
                      checked={formData.photographyCapability}
                      onChange={(e) => setFormData({ ...formData, photographyCapability: e.target.checked })}
                      className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                    />
                    <Label htmlFor="photographyCapability" className="text-slate-300">
                      Photography/videography
                    </Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="marketingCapability"
                      checked={formData.marketingCapability}
                      onChange={(e) => setFormData({ ...formData, marketingCapability: e.target.checked })}
                      className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                    />
                    <Label htmlFor="marketingCapability" className="text-slate-300">
                      Marketing & social media
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="backdrop-blur-xl bg-slate-800/50 border border-slate-400 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl text-white">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center">
                  <Link className="w-5 h-5 text-white" />
                </div>
                Social Links & Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl" className="text-slate-300 font-medium flex items-center gap-2">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn Profile
                  </Label>
                  <Input
                    id="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/johndoe"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl py-3"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl" className="text-slate-300 font-medium flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Website/Portfolio
                  </Label>
                  <Input
                    id="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    placeholder="https://yoursite.com"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl py-3"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="twitterUsername" className="text-slate-300 font-medium flex items-center gap-2">
                    <Twitter className="w-4 h-4" />
                    Twitter Username
                  </Label>
                  <Input
                    id="twitterUsername"
                    value={formData.twitterUsername}
                    onChange={(e) => setFormData({ ...formData, twitterUsername: e.target.value })}
                    placeholder="@johndoe"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl py-3"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagramUsername" className="text-slate-300 font-medium flex items-center gap-2">
                    <Instagram className="w-4 h-4" />
                    Instagram Username
                  </Label>
                  <Input
                    id="instagramUsername"
                    value={formData.instagramUsername}
                    onChange={(e) => setFormData({ ...formData, instagramUsername: e.target.value })}
                    placeholder="johndoe"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl py-3"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Collaboration & Mentorship */}
          {/* <Card className="backdrop-blur-xl bg-slate-800/50 border border-slate-400 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl text-white">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                Collaboration & Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="lookingForCoOrganizers"
                    checked={formData.lookingForCoOrganizers}
                    onChange={(e) => setFormData({ ...formData, lookingForCoOrganizers: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500"
                  />
                  <Label htmlFor="lookingForCoOrganizers" className="text-slate-300">
                    I'm looking for co-organizers for future events
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="willingToMentor"
                    checked={formData.willingToMentor}
                    onChange={(e) => setFormData({ ...formData, willingToMentor: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500"
                  />
                  <Label htmlFor="willingToMentor" className="text-slate-300">
                    I'm willing to mentor new organizers
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="availableForConsulting"
                    checked={formData.availableForConsulting}
                    onChange={(e) => setFormData({ ...formData, availableForConsulting: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500"
                  />
                  <Label htmlFor="availableForConsulting" className="text-slate-300">
                    Available for event organizing consulting
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card> */}

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              type="submit"
              disabled={isLoading || !formData.fullName || !formData.organizationType}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-12 py-4 rounded-2xl shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Completing Profile...
                </>
              ) : (
                <>
                  <Trophy className="w-5 h-5 mr-2" />
                  Complete Organizer Profile
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              className="border-2 border-slate-600/50 bg-slate-700/30 hover:bg-slate-600/50 text-slate-300 hover:text-white px-12 py-4 rounded-2xl backdrop-blur-sm transition-all duration-300"
              size="lg"
            >
              Skip for Now
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
)
}

export default OrganizerProfileSetup
