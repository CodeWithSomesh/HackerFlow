"use client"

import { useState } from "react"
import { redirect, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgressIndicator } from "./progress-indicator"
import { Code2, Target, Users, Home, Lightbulb, Trophy, BarChart3, Sparkles, Zap, ArrowRight } from "lucide-react"

export function UserTypeSelection() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<"hacker" | "organizer" | null>(null)

  const handleHomeClick = () => {
    router.push("/")
  }

  const handleSelection = (type: "hacker" | "organizer") => {
    setSelectedType(type)
    // Store user type in localStorage for later use
    localStorage.setItem("userType", type)

    // Navigate to appropriate auth page
    setTimeout(() => {
      redirect(`/onboarding/${type}/auth`)
    }, 300)
  }

  return (
    <div className="min-h-screen overflow-hidden bg-black">
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

      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-pink-400 rounded-full animate-bounce opacity-60"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400 rounded-full animate-bounce delay-500 opacity-40"></div>
        <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-cyan-400 rounded-full animate-pulse opacity-30"></div>
      </div>

      <div className="relative flex flex-col items-center justify-center px-4 pt-16">
        <div className="w-full max-w-6xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-">
            <div className="inline-block relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl blur-2xl"></div>
              <h1 className="relative text-5xl md:text-7xl font-black bg-gradient-to-r from-pink-400 to-yellow-400 bg-clip-text text-transparent leading-tight">
                Welcome to HackerFlow!
              </h1>
            </div>
          </div>

          {/* Main Selection Container */}
          <div className="relative max-w-6xl mx-auto mb-16">
            {/* Container background with glassmorphism effect */}
            <div className="relative backdrop-blur-xl bg-slate-800/20 border border-slate-700/50 rounded-3xl p-8 md:p-12 shadow-2xl">
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-cyan-500/5 rounded-3xl"></div>
              
              {/* Content */}
              <div className="relative">
                {/* Progress Indicator */}
                <div className="text-center mb-8">
                  <ProgressIndicator currentStep={1} totalSteps={3} />
                </div>
                
                {/* Section Title and Description */}
                <div className="text-center mb-10">
                  <p className="text-2xl font-semibold text-white mb-2">What best describes you?</p>
                  <p className="text-lg text-slate-300 max-w-3xl mx-auto">
                    Join Malaysia's most innovative hackathon platform and connect with fellow creators
                  </p>
                </div>

                {/* User Type Cards */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Hacker/Participant Card */}
                  <Card
                    className={`group relative overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] border-2 backdrop-blur-xl ${
                      selectedType === "hacker"
                        ? "border-pink-500/50 bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-slate-800/50 shadow-2xl shadow-pink-500/20"
                        : "border-slate-700/50 bg-slate-800/30 hover:border-pink-400/50 hover:bg-gradient-to-br hover:from-pink-500/5 hover:via-purple-500/5 hover:to-slate-800/50 hover:shadow-xl hover:shadow-pink-500/10"
                    }`}
                    onClick={() => handleSelection("hacker")}
                  >
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <CardHeader className="relative text-center pb-6">
                      {/* Icon with enhanced glow */}
                      <div className="relative mx-auto mb-6">
                        <div className="absolute inset-0 w-24 h-24 bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                        <div className="relative w-24 h-24 bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Code2 className="w-12 h-12 text-white" />
                        </div>
                      </div>
                      
                      <CardTitle className="text-3xl font-bold mb-3 text-white group-hover:text-pink-300 transition-colors">
                        I'm a Hacker/Participant
                      </CardTitle>
                      <CardDescription className="text-lg text-slate-300 leading-relaxed">
                        Join hackathons, form teams, and build amazing projects that change the world
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="relative space-y-6">
                      {/* Features list with enhanced styling */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4 group/item">
                          <div className="flex-shrink-0">
                            <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full group-hover/item:scale-125 transition-transform"></div>
                          </div>
                          <span className="text-slate-200 group-hover/item:text-white transition-colors">
                            Discover hackathons across Malaysia
                          </span>
                          <Zap className="w-4 h-4 text-pink-400 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex items-center space-x-4 group/item">
                          <div className="flex-shrink-0">
                            <div className="w-3 h-3 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full group-hover/item:scale-125 transition-transform"></div>
                          </div>
                          <span className="text-slate-200 group-hover/item:text-white transition-colors">
                            AI-powered team matching
                          </span>
                          <Sparkles className="w-4 h-4 text-purple-400 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex items-center space-x-4 group/item">
                          <div className="flex-shrink-0">
                            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full group-hover/item:scale-125 transition-transform"></div>
                          </div>
                          <span className="text-slate-200 group-hover/item:text-white transition-colors">
                            Showcase your GitHub projects
                          </span>
                          <Code2 className="w-4 h-4 text-cyan-400 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      
                      <Button
                        className="w-full mt-8 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-6 rounded-2xl shadow-lg hover:shadow-pink-500/30 transition-all duration-300 group-hover:scale-105"
                        size="lg"
                      >
                        <span className="mr-2">Continue as Hacker</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Organizer Card */}
                  <Card
                    className={`group relative overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] border-2 backdrop-blur-xl ${
                      selectedType === "organizer"
                        ? "border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-800/50 shadow-2xl shadow-emerald-500/20"
                        : "border-slate-700/50 bg-slate-800/30 hover:border-emerald-400/50 hover:bg-gradient-to-br hover:from-emerald-500/5 hover:via-teal-500/5 hover:to-slate-800/50 hover:shadow-xl hover:shadow-emerald-500/10"
                    }`}
                    onClick={() => handleSelection("organizer")}
                  >
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <CardHeader className="relative text-center pb-6">
                      {/* Icon with enhanced glow */}
                      <div className="relative mx-auto mb-6">
                        <div className="absolute inset-0 w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                        <div className="relative w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Target className="w-12 h-12 text-white" />
                        </div>
                      </div>
                      
                      <CardTitle className="text-3xl font-bold mb-3 text-white group-hover:text-emerald-300 transition-colors">
                        I'm an Organizer
                      </CardTitle>
                      <CardDescription className="text-lg text-slate-300 leading-relaxed">
                        Host events, manage participants, and track success with powerful tools
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="relative space-y-6">
                      {/* Features list with enhanced styling */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4 group/item">
                          <div className="flex-shrink-0">
                            <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full group-hover/item:scale-125 transition-transform"></div>
                          </div>
                          <span className="text-slate-200 group-hover/item:text-white transition-colors">
                            Create and manage hackathon events
                          </span>
                          <Target className="w-4 h-4 text-emerald-400 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex items-center space-x-4 group/item">
                          <div className="flex-shrink-0">
                            <div className="w-3 h-3 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full group-hover/item:scale-125 transition-transform"></div>
                          </div>
                          <span className="text-slate-200 group-hover/item:text-white transition-colors">
                            Streamlined registration system
                          </span>
                          <Users className="w-4 h-4 text-teal-400 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex items-center space-x-4 group/item">
                          <div className="flex-shrink-0">
                            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full group-hover/item:scale-125 transition-transform"></div>
                          </div>
                          <span className="text-slate-200 group-hover/item:text-white transition-colors">
                            Real-time participant tracking
                          </span>
                          <BarChart3 className="w-4 h-4 text-blue-400 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      
                      <Button
                        className="w-full mt-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-6 rounded-2xl shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 group-hover:scale-105"
                        size="lg"
                      >
                        <span className="mr-2">Continue as Organizer</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Features Section */}
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-2 text-white bg-clip-text text-transparent">
                Why Choose HackerFlow?
              </h2>
              <p className="text-slate-300 text-lg">
                Experience the future of hackathon participation
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8">
              <div className="group text-center">
                <div className="relative mx-auto mb-4">
                  <div className="absolute inset-0 w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative w-16 h-16 mx-auto bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-xl mb-2 text-white group-hover:text-pink-300 transition-colors">Team Formation</h3>
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                  AI-powered matching algorithm finds your perfect teammates
                </p>
              </div>
              
              <div className="group text-center">
                <div className="relative mx-auto mb-4">
                  <div className="absolute inset-0 w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Lightbulb className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-xl mb-2 text-white group-hover:text-purple-300 transition-colors">Idea Generation</h3>
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                  Built-in AI tools to spark creativity and innovation
                </p>
              </div>
              
              <div className="group text-center">
                <div className="relative mx-auto mb-4">
                  <div className="absolute inset-0 w-16 h-16 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-xl mb-2 text-white group-hover:text-blue-300 transition-colors">Leaderboards</h3>
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                  Track your progress and compete with the best
                </p>
              </div>
              
              <div className="group text-center">
                <div className="relative mx-auto mb-4">
                  <div className="absolute inset-0 w-16 h-16 bg-gradient-to-r from-emerald-500 to-yellow-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative w-16 h-16 mx-auto bg-gradient-to-r from-emerald-500 to-yellow-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-xl mb-2 text-white group-hover:text-emerald-300 transition-colors">Analytics</h3>
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                  Detailed insights to improve your hackathon experience
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}