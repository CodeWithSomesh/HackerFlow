"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Users, Target, Github, Code, Rocket } from "lucide-react"
import { redirect } from 'next/navigation'

export function HeroSection() {

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Large colored rectangles - matching your reference image */}
        <div className="absolute top-20 right-32 w-48 h-32 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl opacity-80 animate-float rotate-12" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-2xl opacity-90 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-32 right-16 w-40 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl opacity-85 animate-float rotate-6" style={{ animationDelay: '2s' }} />
        <div className="absolute top-60 right-40 w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl opacity-70 animate-float -rotate-12" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-40 right-60 w-36 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-2xl opacity-60 animate-float rotate-3" style={{ animationDelay: '1.5s' }} />
        
        {/* Small floating code elements */}
        <div className="absolute top-32 left-20 opacity-40">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-teal-500 flex items-center justify-center animate-bounce">
            <Code className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="absolute bottom-48 left-32 opacity-30">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center animate-pulse">
            <Github className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="absolute top-80 left-16 opacity-35">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center animate-spin" style={{ animationDuration: '8s' }}>
            <Rocket className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeInUp">
          
          {/* Badge */}
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-sm font-medium text-gray-800 dark:bg-white/10 dark:border-white/20 dark:text-white">
            <Zap className="w-4 h-4 mr-2 text-cyan-600 dark:text-cyan-400" />
            Malaysia's #1 AI-Powered Hackathon Platform
          </div>

          {/* Main Headline - UNIQUE AND CREATIVE */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-gray-800 dark:text-white">
            <span className="block">Where Ideas Meet</span>
            <span className="block bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              Perfect Teams
            </span>
            <span className="block">AI-Powered Hackathons</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed dark:text-gray-300">
            Malaysia's smartest hackathon platform that uses AI to create dream teams. 
            Connect with like-minded developers, build groundbreaking projects, and turn your innovative ideas into reality.
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
              onClick={() => redirect("/onboarding")}
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

          {/* Trust Indicators */}
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
          </div>

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
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cyan-50 to-transparent dark:from-slate-900" />
    </section>
  )
}