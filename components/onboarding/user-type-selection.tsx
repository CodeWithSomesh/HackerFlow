"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Code2, Target, Users, Home, Zap, Sparkles, BarChart3, Github } from "lucide-react"
import { ProgressIndicator } from "./progress-indicator"

export function UserTypeSelection() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<"hacker" | "organizer" | null>(null)

  const handleHomeClick = () => {
    router.push("/")
  }

  const handleSelection = (type: "hacker" | "organizer") => {
    setSelectedType(type)
    localStorage.setItem("userType", type)
    setTimeout(() => {
      router.push(`/onboarding/${type}/auth`)
    }, 300)
  }

  return (
    <div className="min-h-screen">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-96 left-2 w-96 h-96 bg-pink-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-96 right-2 w-96 h-96 bg-teal-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-teal-500/15 rounded-full blur-3xl"></div>
      </div>

      {/* Home Button */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={handleHomeClick}
          className="backdrop-blur-xl bg-gray-800/50 border border-gray-700 hover:border-pink-500/50 text-white rounded-md p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <Home className="w-5 h-5" />
        </button>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-5xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-400">
              WELCOME TO HACKERFLOW
            </h1>
            <p className="text-gray-300 font-mono text-lg mt-2">
              Join Malaysia&apos;s most innovative hackathon platform
            </p>
            
            {/* Progress Indicator */}
            <div className="flex items-center justify-center gap-3 pt-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-yellow-400 border-2 border-gray-600 flex items-center justify-center font-bold text-white">
                  1
                </div>
                <span className="text-white font-mono text-sm font-bold">User Type</span>
              </div>
              <div className="h-px w-12 bg-gray-600"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-600 flex items-center justify-center">
                  <span className="text-gray-400 font-bold">2</span>
                </div>
                <span className="text-gray-400 font-mono text-sm">Account</span>
              </div>
              <div className="h-px w-12 bg-gray-600"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-600 flex items-center justify-center">
                  <span className="text-gray-400 font-bold">3</span>
                </div>
                <span className="text-gray-400 font-mono text-sm">Profile</span>
              </div>
            </div>

            {/* Progress Bar Component */}
            <div className="text-center flex mx-auto max-w-2xl mt-6">
              <ProgressIndicator currentStep={1} totalSteps={3} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-blackops text-white mb-3">CHOOSE YOUR PATH</h2>
          <p className="text-gray-300 font-mono text-lg">
            Select the option that best describes you
          </p>
        </div>

        {/* User Type Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Hacker Card */}
          <button
            onClick={() => handleSelection("hacker")} 
            className={`group relative overflow-hidden transition-all duration-300 hover:scale-105 ${
              selectedType === "hacker" ? 'scale-105' : 'hover:scale-102'
            }`}
          >
            <div className={`bg-gradient-to-br from-gray-900 to-gray-800 border-2 rounded-md p-8 transition-all duration-300 ${
              selectedType === "hacker" 
                ? 'border-pink-500 shadow-2xl shadow-pink-500/20' 
                : 'border-gray-700 hover:border-pink-500/50 hover:shadow-xl hover:shadow-pink-500/10'
            }`}>
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative">
                {/* Icon */}
                <div className="mb-6">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative w-full h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Code2 className="w-10 h-10 text-white" />
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-blackops text-white mb-3 group-hover:text-pink-300 transition-colors">
                  I&apos;M A HACKER
                </h3>
                <p className="text-gray-300 font-mono text-sm mb-6 leading-relaxed">
                  Join hackathons, form teams, and build amazing projects
                </p>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-gray-300 font-mono text-sm group-hover:text-white transition-colors">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span>Discover hackathons across Malaysia</span>
                    <Zap className="w-4 h-4 text-pink-400" />
                  </div>
                  <div className="flex items-center gap-3 text-gray-300 font-mono text-sm group-hover:text-white transition-colors">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>AI-powered team matching</span>
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex items-center gap-3 text-gray-300 font-mono text-sm group-hover:text-white transition-colors">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Showcase your GitHub projects</span>
                    <Github className="w-4 h-4 text-yellow-400" />
                  </div>
                </div>

                {/* Button */}
                <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 text-white font-mono font-bold py-4 rounded-md hover:opacity-90 transition-opacity">
                  Continue as Hacker
                </div>
              </div>
            </div>
          </button>

          {/* Organizer Card */}
          <button
            onClick={() => handleSelection("organizer")}
            className={`group relative overflow-hidden transition-all duration-300 hover:scale-105  ${
              selectedType === "organizer" ? 'scale-105' : 'hover:scale-102'
            }`}
          >
            <div className={`bg-gradient-to-br from-gray-900 to-gray-800 border-2 rounded-md p-8 transition-all duration-300 ${
              selectedType === "organizer" 
                ? 'border-teal-500 shadow-2xl shadow-teal-500/20' 
                : 'border-gray-700 hover:border-teal-500/50 hover:shadow-xl hover:shadow-teal-500/10'
            }`}>
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative">
                {/* Icon */}
                <div className="mb-6">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative w-full h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <Target className="w-10 h-10 text-white" />
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-blackops text-white mb-3 group-hover:text-teal-300 transition-colors">
                  I&apos;M AN ORGANIZER
                </h3>
                <p className="text-gray-300 font-mono text-sm mb-6 leading-relaxed">
                  Host events, manage participants, and track success
                </p>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-gray-300 font-mono text-sm group-hover:text-white transition-colors">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span>Create and manage hackathon events</span>
                    <Target className="w-4 h-4 text-teal-400" />
                  </div>
                  <div className="flex items-center gap-3 text-gray-300 font-mono text-sm group-hover:text-white transition-colors">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                    <span>Streamlined registration system</span>
                    <Users className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="flex items-center gap-3 text-gray-300 font-mono text-sm group-hover:text-white transition-colors">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Real-time participant tracking</span>
                    <BarChart3 className="w-4 h-4 text-green-400" />
                  </div>
                </div>

                {/* Button */}
                <div className="bg-gradient-to-r from-green-500 via-cyan-500 to-teal-500 text-white font-mono font-bold py-4 rounded-md hover:opacity-90 transition-opacity">
                  Continue as Organizer
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}