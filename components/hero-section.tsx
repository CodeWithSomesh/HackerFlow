"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Users, Target } from "lucide-react"
import heroImage from "@/assets/hero-bg.jpg"
import { redirect } from 'next/navigation'

export function HeroSection() {

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="AI-powered hackathon platform background"
          className="w-full h-full object-cover opacity-20 dark:opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/80 to-background/90" />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 opacity-30">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent animate-float" />
      </div>
      <div className="absolute top-40 right-16 opacity-20">
        <div className="w-8 h-8 rounded-full bg-accent animate-float" style={{ animationDelay: '2s' }} />
      </div>
      <div className="absolute bottom-32 left-20 opacity-25">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-accent to-primary animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeInUp">
          
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full glass-effect text-sm font-medium">
            <Zap className="w-4 h-4 mr-2 text-accent" />
            AI-Powered Team Formation
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            <span className="block">Build the</span>
            <span className="block gradient-text">Perfect Team</span>
            <span className="block">for Every Hackathon</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Stop struggling with team formation. HackerFlow uses AI to match you with the perfect teammates based on your tech stack, experience, and project goals.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-accent" />
              <span><strong>50%</strong> Better Team Matches</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-accent" />
              <span><strong>40%</strong> Less Registration Dropout</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              <span><strong>Malaysia's</strong> #1 Hackathon Platform</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              variant="hero" 
              size="lg" 
              onClick={() => redirect("/onboarding")}
              className="group min-w-[200px]"
            >
              Join HackerFlow
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="glass" 
              size="lg" 
              onClick={() => redirect("/organize")}
              className="min-w-[200px]"
            >
              Organize Event
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="pt-8 text-sm text-muted-foreground">
            <p>Trusted by developers from</p>
            <div className="flex flex-wrap justify-center gap-6 mt-4 opacity-60">
              <span className="font-mono">Grab</span>
              <span className="font-mono">Shopee</span>
              <span className="font-mono">Gojek</span>
              <span className="font-mono">AirAsia</span>
              <span className="font-mono">Maybank</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}