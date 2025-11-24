"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Users, Target, Trophy, Calendar, Search } from "lucide-react"
import { useRouter } from 'next/navigation'
import { useState } from "react"
import Image from "next/image"
import DiscoverHackathonsImage from '@/assets/landingPage/DiscoverHackathons.png'
import AIMatchingImage from '@/assets/landingPage/AIMatching.png'
import HackathonDetailsImage from '@/assets/landingPage/HackathonDetails.png'
import AnalyticsPageImage from '@/assets/landingPage/AnalyticsPage.png'

const featureTabs = [
  {
    id: 'discover',
    label: 'Discover Events',
    icon: Search,
    description: 'Find hackathons across Malaysia',
    image: '/images/features/discover.png', // You'll need to add these images
    color: 'from-cyan-400 to-teal-500'
  },
  {
    id: 'match',
    label: 'AI Matching',
    icon: Users,
    description: 'Find perfect teammates with AI',
    image: '/images/features/matching.png',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'compete',
    label: 'Compete & Win',
    icon: Trophy,
    description: 'Build projects and win prizes',
    image: '/images/features/compete.png',
    color: 'from-yellow-400 to-orange-500'
  },
  {
    id: 'organize',
    label: 'Host Events',
    icon: Calendar,
    description: 'Manage hackathons effortlessly',
    image: '/images/features/organize.png',
    color: 'from-green-400 to-emerald-500'
  }
]

export function HeroSection() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(featureTabs[0].id)

  const activeFeature = featureTabs.find(tab => tab.id === activeTab) || featureTabs[0]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-transparent">
      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 pt-14">
        <div className="max-w-7xl mx-auto space-y-12">

          {/* Badge */}
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/20 to-teal-500/20 backdrop-blur-md border-2 border-purple-500/30 text-sm font-mono font-bold text-white">
              <Zap className="w-4 h-4 mr-2 text-cyan-400" />
              Malaysia&apos;s #1 AI-Powered Hackathon Platform
            </div>
          </div>

          {/* Main Headline */}
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-blackops leading-tight">
              <span className="block text-white">One Platform For All</span>
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent py-2">
                HACK SMARTER, HOST BETTER!
              </span>
              <span className="block text-white">Build, Connect & Host Events</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-geist">
              HackerFlow is Malaysia&apos;s smartest hackathon platform to discover events, match with teammates using AI, and build impactful projects. Organizers can host, manage, and scale hackathons with powerful tools.
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-2 border-cyan-500/30 rounded-xl px-6 py-3 backdrop-blur-sm">
              <Users className="w-5 h-5 text-cyan-400" />
              <span className="font-mono text-white">
                <strong className="text-cyan-400">10,000+</strong> Developers
              </span>
            </div>
            <div className="flex items-center gap-3 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-2 border-pink-500/30 rounded-xl px-6 py-3 backdrop-blur-sm">
              <Target className="w-5 h-5 text-pink-400" />
              <span className="font-mono text-white">
                <strong className="text-pink-400">500+</strong> Hackathons
              </span>
            </div>
            <div className="flex items-center gap-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-xl px-6 py-3 backdrop-blur-sm">
              <Zap className="w-5 h-5 text-purple-400" />
              <span className="font-mono text-white">
                <strong className="text-purple-400">95%</strong> Success Rate
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={() => router.push("/onboarding/user-type")}
              className="group min-w-[200px] bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 font-blackops text-lg"
            >
              JOIN HACKERFLOW
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              onClick={() => router.push("/organize/step1")}
              className="min-w-[200px] bg-gray-800/50 backdrop-blur-md border-2 border-gray-700 text-white hover:bg-gray-700/50 hover:border-gray-600 transition-all duration-300 font-blackops text-lg"
            >
              HOST HACKATHON
            </Button>
          </div>

          {/* Feature Tabs Section */}
          <div className="pt-2">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-8 shadow-2xl">
              {/* Tab Navigation */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {featureTabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`group relative px-6 py-4 rounded-xl font-mono font-bold text-sm transition-all duration-300 ${
                        activeTab === tab.id
                          ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                          : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 border-2 border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5" />
                        <span>{tab.label}</span>
                      </div>
                      {activeTab !== tab.id && (
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-purple-500/10 to-pink-500/10"></div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Tab Content */}
              <div className="relative rounded-xl overflow-hidden bg-gray-800/30 border-2 border-gray-700 min-h-[400px]">
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${activeFeature.color} opacity-10`}></div>

                <div className="relative z-10 p-8">
                  <div className="flex flex-col lg:flex-row items-center gap-8">
                    {/* Feature Info */}
                    <div className="flex-1 text-center lg:text-left">
                      <div className="inline-flex items-center gap-3 mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${activeFeature.color}`}>
                          <activeFeature.icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-3xl font-blackops text-white">{activeFeature.label}</h3>
                      </div>
                      <p className="text-xl text-gray-300 font-geist mb-6">{activeFeature.description}</p>

                      {/* Feature-specific details */}
                      <div className="space-y-3 text-left">
                        {activeFeature.id === 'discover' && (
                          <>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2"></div>
                              <p className="text-gray-300 font-geist">Browse all hackathons in Malaysia in one place</p>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2"></div>
                              <p className="text-gray-300 font-geist">Filter by location, date, and prize pool</p>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2"></div>
                              <p className="text-gray-300 font-geist">Get notifications for new events</p>
                            </div>
                          </>
                        )}
                        {activeFeature.id === 'match' && (
                          <>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-purple-400 mt-2"></div>
                              <p className="text-gray-300 font-geist">AI analyzes GitHub profiles and skills</p>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-purple-400 mt-2"></div>
                              <p className="text-gray-300 font-geist">Swipe-based teammate matching system</p>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-purple-400 mt-2"></div>
                              <p className="text-gray-300 font-geist">Chat with potential teammates before events</p>
                            </div>
                          </>
                        )}
                        {activeFeature.id === 'compete' && (
                          <>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2"></div>
                              <p className="text-gray-300 font-geist">Submit projects and track progress</p>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2"></div>
                              <p className="text-gray-300 font-geist">Compete for prizes and recognition</p>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2"></div>
                              <p className="text-gray-300 font-geist">Build your hackathon portfolio</p>
                            </div>
                          </>
                        )}
                        {activeFeature.id === 'organize' && (
                          <>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-green-400 mt-2"></div>
                              <p className="text-gray-300 font-geist">Manage registrations and participants</p>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-green-400 mt-2"></div>
                              <p className="text-gray-300 font-geist">Track revenue and payment processing</p>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-green-400 mt-2"></div>
                              <p className="text-gray-300 font-geist">Analytics and insights dashboard</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Feature Image Placeholder */}
                    <div className="flex-1 w-full lg:w-auto">
                      <div className={`relative rounded-xl overflow-hidden border-2 ${activeTab === activeFeature.id ? 'border-white/20' : 'border-gray-700'} bg-gradient-to-br ${activeFeature.color} p-1`}>
                        <div className="bg-gray-900 rounded-lg min-h-[300px] flex items-center justify-center px-1">
                          <div className="text-center">
                            {activeFeature.id === 'discover' && (
                              <Image
                                src={DiscoverHackathonsImage}
                                alt="HackerFlow Logo"
                                className="rounded-md"
                              />
                            )}

                            {activeFeature.id === 'match' && (
                              <Image
                                src={AIMatchingImage}
                                alt="HackerFlow Logo"
                                className="rounded-md"
                              />
                            )}

                            {activeFeature.id === 'compete' && (
                              <Image
                                src={HackathonDetailsImage}
                                alt="HackerFlow Logo"
                                className="rounded-md"
                              />
                            )}

                            {activeFeature.id === 'organize' && (
                              <Image
                                src={AnalyticsPageImage}
                                alt="HackerFlow Logo"
                                className="rounded-md"
                              />
                            )}

                            {!activeFeature.id && (
                              <div>
                                <activeFeature.icon className="w-24 h-24 text-gray-700 mx-auto mb-4" />
                                <p className="text-gray-600 font-mono text-sm">Feature Screenshot</p>
                                <p className="text-gray-700 font-mono text-xs mt-2">Add your feature image here</p> 
                              </div>
                            )}
                            
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="pt-2">
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <span className="text-xs font-mono">Scroll to explore</span>
              <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-gray-500 rounded-full mt-2 animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}