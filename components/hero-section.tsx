"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Users, Target } from "lucide-react"
import { redirect } from 'next/navigation'

export function HeroSection() {

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden  dark:from-black dark:via-black dark:to-black">


      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-6xl mx-auto space-y-8 animate-fadeInUp">
          
          {/* Badge */}
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-sm font-medium text-gray-800 dark:bg-white/10 dark:border-white/20 dark:text-white">
            <Zap className="w-4 h-4 mr-2 text-cyan-600 dark:text-cyan-400" />
            Malaysia&lsquo;s #1 AI-Powered Hackathon Platform
          </div>

          {/* Main Headline - UNIQUE AND CREATIVE */}
          <h1 className="text-4xl md:text-[50px] lg:text-6xl xl:text-7xl font-[1000] leading-tight text-gray-800 dark:text-white">
            <span className="block">One Platform For All </span>
            <span className="my-1 md:my-4 block bg-gradient-to-r from-pink-500 via-pink-500 to-yellow-400 bg-clip-text text-transparent">
              Hack Smarter, Host Better!
            </span>
            <span className="block">Build, Connect & Host Events</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed dark:text-gray-300">
            HackerFlow is Malaysia’s smartest hackathon platform to discover events, match with teammates using AI, and build impactful projects.{""}Organizers can host, manage, and scale hackathons with powerful tools for submissions, finances, and talent recruitment.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-700 dark:text-white">
            <div className="flex items-center gap-2 bg-white/30 backdrop-blur-sm rounded-full px-4 py-2 dark:bg-white/10">
              <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span><strong className="text-cyan-600 dark:text-cyan-400">10,000+</strong> Developers</span>
            </div>
            <div className="flex items-center gap-2 bg-white/30 backdrop-blur-sm rounded-full px-4 py-2 dark:bg-white/10">
              <Target className="w-4 h-4 text-pink-600 dark:text-pink-400" />
              <span><strong className="text-pink-600 dark:text-pink-400">500+</strong> Hackathons Hosted</span>
            </div>
            <div className="flex items-center gap-2 bg-white/30 backdrop-blur-sm rounded-full px-4 py-2 dark:bg-white/10">
              <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span><strong className="text-purple-600 dark:text-purple-400">95%</strong> Success Rate</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Button 
              size="lg" 
              onClick={() => redirect("/onboarding/user-type")}
              className="group min-w-[200px] bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Join HackerFlow
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => redirect("/organize")}
              className="min-w-[200px] bg-white/30 backdrop-blur-md border-white/40 text-gray-800 hover:bg-white/40 transition-all duration-300 dark:bg-white/10 dark:border-white/30 dark:text-white"
            >
              Host Hackathon
            </Button>
          </div>

          {/* Trust Indicators
          <div className="pt-12 text-sm text-gray-500 dark:text-gray-400">
            <p className="mb-6">Trusted by developers from Malaysia's top tech companies</p>
            <div className="flex flex-wrap justify-center gap-8 items-center opacity-70">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 dark:bg-white/5">
                <span className="font-semibold text-gray-700 dark:text-white">Grab</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 dark:bg-white/5">
                <span className="font-semibold text-gray-700 dark:text-white">Shopee</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 dark:bg-white/5">
                <span className="font-semibold text-gray-700 dark:text-white">Gojek</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 dark:bg-white/5">
                <span className="font-semibold text-gray-700 dark:text-white">AirAsia</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 dark:bg-white/5">
                <span className="font-semibold text-gray-700 dark:text-white">Maybank</span>
              </div>
            </div>
          </div> */}

          {/* Scroll Indicator */}
          <div className="pt-8">
            <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
              <span className="text-xs">Scroll to explore</span>
              <div className="w-6 h-10 border border-gray-500 dark:border-gray-400 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-gray-500 dark:bg-gray-400 rounded-full mt-2 animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cyan-300 to-transparent " />
    </section>
  )
}