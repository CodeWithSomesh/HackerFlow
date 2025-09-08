"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgressIndicator } from "./progress-indicator"
import { Code2, Target, Users, Lightbulb, Trophy, BarChart3 } from "lucide-react"
import { ContainerTextFlip } from "@/components/ui/container-text-flip";

export function UserTypeSelection() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<"hacker" | "organizer" | null>(null)

  const handleSelection = (type: "hacker" | "organizer") => {
    setSelectedType(type)
    // Store user type in localStorage for later use
    localStorage.setItem("userType", type)

    // Navigate to appropriate auth page
    setTimeout(() => {
      router.push(`/onboarding/${type}/auth`)
    }, 300)
  }

  return (
    <div className=" flex flex-col items-center justify-center px-4 mt-4">
      <div className="w-full max-w-4xl mx-auto">
        
        <div className="text-center mb-6">
          <ContainerTextFlip
            words={["Welcome To HackerFlow", "Welcome To HackerFlow"]} interval={300}
          />
          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-pink-500 via-yellow-600 to-pink-500 bg-clip-text text-transparent">
            
            Welcome to HackerFlow!
          </h1>
          <p className="text-xl font-bold text-muted-foreground">What best describes you?</p>
        </div>

        <div className="text-center mb-8">
        
          <ProgressIndicator currentStep={1} totalSteps={3} />
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Hacker/Participant Card */}
          <Card
            className={`liquid-glass bg-slate-800 border-s-violet-300 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-4 ${
              selectedType === "hacker"
                ? "border-pink-600 shadow-pink-500/20"
                : "border-transparent hover:border-pink-400"
            }`}
            onClick={() => handleSelection("hacker")}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Code2 className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">I'm a Hacker/Participant</CardTitle>
              <CardDescription className="text-lg">
                Join hackathons, form teams, and build amazing projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"></div>
                  <span className="text-sm">Discover hackathons across Malaysia</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full"></div>
                  <span className="text-sm">AI-powered team matching</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"></div>
                  <span className="text-sm">Showcase your GitHub projects</span>
                </div>
              </div>
              <Button
                className="w-full mt-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3"
                size="lg"
              >
                Continue as Hacker
              </Button>
            </CardContent>
          </Card>

          {/* Organizer Card */}
          <Card
            className={`liquid-glass bg-slate-800 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-4 ${
              selectedType === "organizer"
                ? "border-green-600 shadow-green-500/20"
                : "border-transparent hover:border-green-400"
            }`}
            onClick={() => handleSelection("organizer")}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center">
                <Target className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">I'm an Organizer</CardTitle>
              <CardDescription className="text-lg">Host events, manage participants, and track success</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-full"></div>
                  <span className="text-sm">Create and manage hackathon events</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"></div>
                  <span className="text-sm">Streamlined registration system</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                  <span className="text-sm">Real-time participant tracking</span>
                </div>
              </div>
              <Button
                className="w-full mt-6 border-2 border-green-500 bg-green-500 text-white font-semibold py-3 transition-all duration-300"
                size="lg"
              >
                Continue as Organizer
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 mb-8 grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-1">Team Formation</h3>
            <p className="text-sm text-muted-foreground">AI-powered matching</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-1">Idea Generation</h3>
            <p className="text-sm text-muted-foreground">Built-in AI tools</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-1">Leaderboards</h3>
            <p className="text-sm text-muted-foreground">Track your progress</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-green-500 to-yellow-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-1">Analytics</h3>
            <p className="text-sm text-muted-foreground">Detailed insights</p>
          </div>
        </div>
      </div>
    </div>
  )
}
