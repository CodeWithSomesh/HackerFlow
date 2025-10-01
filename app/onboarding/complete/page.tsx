"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Sparkles, Trophy, Users, Code2, Home } from "lucide-react"

export default function OnboardingComplete() {
  const router = useRouter()
  const [userType, setUserType] = useState<'hacker' | 'organizer' | null>(null)

  useEffect(() => {
    // Get user type from localStorage or check auth
    const storedUserType = localStorage.getItem("userType")
    if (storedUserType === 'hacker' || storedUserType === 'organizer') {
      setUserType(storedUserType)
    } else {
      // If no user type found, redirect to user type selection
      router.push("/onboarding/user-type")
    }
  }, [router])

  const handleGetStarted = () => {
    if (userType === 'hacker') {
      router.push("/hackathons")
    } else {
      router.push("/dashboard") // You might want to create an organizer dashboard
    }
  }

  const handleHomeClick = () => {
    router.push("/")
  }

  if (!userType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-3xl"></div>
      </div>

      {/* Home Button - Floating in top right */}
      <div className="fixed top-6 right-6 z-50">
        <Button
          onClick={handleHomeClick}
          className="group relative backdrop-blur-xl bg-slate-800/30 border border-white hover:border-slate-500/50 text-white hover:text-white rounded-2xl p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          size="sm"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-cyan-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Home className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
          <span className="s-only">Go to Home</span>
        </Button>
      </div>

      <div className="relative flex flex-col items-center justify-center px-4 py-8 min-h-screen">
        <div className="w-full max-w-4xl mx-auto text-center">
          {/* Success Animation */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-teal-500/20 rounded-full blur-2xl"></div>
            <div className="relative w-32 h-32 mx-auto bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
              <CheckCircle className="w-16 h-16 text-white animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Profile Complete!
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              {userType === 'hacker' 
                ? "Your hacker profile is ready! Start exploring hackathons and connecting with amazing teammates."
                : "Your organizer profile is ready! Start creating and managing incredible hackathon events."
              }
            </p>
          </div>

          {/* Features Card */}
          <Card className="backdrop-blur-xl bg-slate-800/50 border border-slate-400 shadow-2xl mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center justify-center gap-3">
                <Sparkles className="w-8 h-8 text-yellow-400" />
                What&lsquo;s Next?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {userType === 'hacker' ? (
                  <>
                    <div className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-xl">
                      <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Discover Hackathons</h3>
                        <p className="text-slate-300 text-sm">
                          Browse upcoming hackathons, filter by your interests, and find the perfect events to participate in.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-xl">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Find Teammates</h3>
                        <p className="text-slate-300 text-sm">
                          Use our AI-powered matching to find compatible teammates based on your skills and interests.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-xl">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Code2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Showcase Projects</h3>
                        <p className="text-slate-300 text-sm">
                          Display your GitHub projects and build a portfolio that attracts recruiters and collaborators.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-xl">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Track Progress</h3>
                        <p className="text-slate-300 text-sm">
                          Monitor your hackathon performance, track achievements, and build your reputation in the community.
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-xl">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Create Events</h3>
                        <p className="text-slate-300 text-sm">
                          Set up hackathons, workshops, and tech events with our comprehensive event management tools.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-xl">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Manage Participants</h3>
                        <p className="text-slate-300 text-sm">
                          Track registrations, communicate with participants, and manage teams throughout your events.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-xl">
                      <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Find Partners</h3>
                        <p className="text-slate-300 text-sm">
                          Connect with other organizers, sponsors, and mentors to create amazing collaborative events.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-xl">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Code2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Analytics & Insights</h3>
                        <p className="text-slate-300 text-sm">
                          Get detailed analytics on your events, participant engagement, and success metrics.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-12 py-4 rounded-2xl shadow-lg hover:shadow-green-500/25 transition-all duration-300"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Get Started
            </Button>
            
            <Button
              onClick={handleHomeClick}
              variant="outline"
              className="border-2 border-slate-600/50 bg-slate-700/30 hover:bg-slate-600/50 text-slate-300 hover:text-white px-12 py-4 rounded-2xl backdrop-blur-sm transition-all duration-300"
              size="lg"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
