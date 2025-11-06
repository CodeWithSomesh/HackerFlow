"use client"

import { motion } from "framer-motion"
import {
  Search,
  Users,
  Trophy,
  Github,
  Sparkles,
  UserPlus,
  Award,
  BarChart3,
  Briefcase,
  Lightbulb,
  Heart,
  TrendingUp,
  Zap,
  Star,
  ArrowRight
} from "lucide-react"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import TeammatesImage from "@/assets/TeammatesImage.webp"
import AIChatIcon from "@/assets/AI Chat Operator.png"
import AIChatIcon2 from "@/assets/Ai Chat.png"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
}

export function HackersBentoGrid() {
  return (
    <section className="py-10 bg-black/10">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 mb-4">
            FOR HACKERS
          </h2>
          <p className="text-xl text-gray-300 font-geist max-w-3xl mx-auto">
            It&apos;s time to build that cool project you&apos;ve always wanted
          </p>
          <p className="text-gray-400 font-geist mt-2">
            Collaborate in prestigious global hackathons, connect your skills, meet your team, and win prizes—all while having fun.
          </p>
        </div>

        {/* Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
        >
          {/* AI Teammate Matchmaking - LARGE (Most Interesting Feature - spans 2 columns) */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="group relative h-full bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 hover:border-purple-500/50 p-8 transition-all duration-300 hover:scale-[1.02] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                        <Heart className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-3xl font-blackops text-white">Swipe Right for Your Dream Team</h3>
                    </div>
                    <p className="text-gray-300 font-geist text-lg">
                      Find your perfect teammates with just a swipe! Our AI-powered matchmaking algorithm analyzes profiles and gives you compatibility scores with match insights.
                    </p>
                  </div>
                </div>

                {/* Mock Matchmaking Interface */}
                <div className="grid grid-cols-2 gap-4 mt-8">
                  {/* Profile Card 1 */}
                  <div className="relative bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-5 border-2 border-purple-500/30 hover:scale-105 transition-all">
                    <div className="absolute top-3 right-3 px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full">
                      <p className="text-green-400 font-mono text-xs font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3" /> 94% Match
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-mono font-bold text-sm">Alex Chen</p>
                        <p className="text-purple-400 font-mono text-xs">Full-Stack Dev</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-1 bg-purple-500/20 rounded text-purple-300 text-xs font-mono">React</span>
                      <span className="px-2 py-1 bg-pink-500/20 rounded text-pink-300 text-xs font-mono">Node.js</span>
                      <span className="px-2 py-1 bg-orange-500/20 rounded text-orange-300 text-xs font-mono">AI/ML</span>
                    </div>
                    <p className="text-gray-400 text-xs font-geist mb-3">
                      💡 <span className="text-purple-300 font-semibold">AI Insight:</span> Complementary skills in backend development
                    </p>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-mono text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-1">
                        <Heart className="w-4 h-4" /> Match
                      </button>
                    </div>
                  </div>

                  {/* Profile Card 2 */}
                  <div className="relative bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl p-5 border-2 border-cyan-500/30 hover:scale-105 transition-all">
                    <div className="absolute top-3 right-3 px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-full">
                      <p className="text-yellow-400 font-mono text-xs font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3" /> 87% Match
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-mono font-bold text-sm">Sarah Lee</p>
                        <p className="text-cyan-400 font-mono text-xs">UI/UX Designer</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-1 bg-cyan-500/20 rounded text-cyan-300 text-xs font-mono">Figma</span>
                      <span className="px-2 py-1 bg-blue-500/20 rounded text-blue-300 text-xs font-mono">Design</span>
                      <span className="px-2 py-1 bg-teal-500/20 rounded text-teal-300 text-xs font-mono">UX</span>
                    </div>
                    <p className="text-gray-400 text-xs font-geist mb-3">
                      💡 <span className="text-cyan-300 font-semibold">AI Insight:</span> Strong design background, 3 hackathon wins
                    </p>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white font-mono text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-1">
                        <Heart className="w-4 h-4" /> Match
                      </button>
                    </div>
                  </div>
                </div>

                {/* bg-gradient-to-br from-indigo-500 to-purple-600 */}
                <motion.div
                  className="mt-4 w-full 
                  rounded-xl flex items-center justify-center"
                  drag
                  initial={{ translateY: 0 }}
                  dragSnapToOrigin={true}
                >
                  <Image
                    src={TeammatesImage}
                    alt="3D Illustration of Dashboard"
                    className="transition-all"
                    draggable="false"
                    unoptimized
                  />
                </motion.div>
              </div>
            </Card>
          </motion.div>

          {/* AI Idea Generator */}
          <motion.div variants={itemVariants}>
            <Card className="group relative h-full bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 hover:border-sky-500 p-8 transition-all duration-300 hover:scale-[1.02] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-r from-blue-400 to-sky-300  rounded-xl w-fit mb-4">
                    <Lightbulb className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-blackops text-white mb-3">AI Idea Generator</h3>
                </div>
                <p className="text-gray-300 font-geist mb-4">
                  Stuck on ideas? Our AI generates innovative hackathon project ideas tailored to the event theme and your skills!
                </p>

                <motion.div
                  className="-mt-4 rounded-xl flex items-center justify-center"
                  drag
                  initial={{ translateY: 0 }}
                  dragSnapToOrigin={true}
                >
                  <Image
                    src={AIChatIcon2}
                    alt="3D Illustration of Dashboard"
                    className="w-80 h-80 transition-all"
                    draggable="false"
                    unoptimized
                  />
                </motion.div>

                {/* Idea Mock */}
                <div className="p-4 bg-gradient-to-r from-sky-500/20 to-teal-500/20 border-2 border-sky-500/30 rounded-xl">
                  <div className="flex items-start gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-sky-400 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-white font-mono font-bold text-sm mb-2">AI-Powered Budget Tracker</p>
                      <p className="text-gray-300 text-xs font-geist">
                        Build a personal finance app using ML to predict spending patterns and suggest savings...
                      </p>
                    </div>
                  </div>
                  <button className="w-full mt-3 py-2 bg-gradient-to-r from-sky-500 to-teal-500 rounded-lg text-white font-mono text-xs hover:opacity-90 transition-opacity">
                    Generate New Idea
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Discover Hackathons */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="group relative h-full bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 hover:border-teal-500/50 p-8 transition-all duration-300 hover:scale-[1.02] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10 h-full flex flex-col">
                <div className="p-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl w-fit mb-4">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-blackops text-white mb-3">Discover Epic Hackathons</h3>
                <p className="text-gray-300 font-geist mb-4 flex-grow">
                  Browse thousands of hackathons across Malaysia. Filter by prize pool, location, and themes. Your next big win awaits!
                </p>

                {/* Event Cards Mock */}
                <div className="space-y-2">
                  <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-teal-500/50 transition-all">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="text-white font-mono text-sm font-bold">FinTech Challenge 2025</p>
                    </div>
                    <p className="text-gray-400 text-xs font-mono">RM 50K Prize • 2 days left</p>
                  </div>
                  <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-teal-500/50 transition-all">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <p className="text-white font-mono text-sm font-bold">AI Innovation Fest</p>
                    </div>
                    <p className="text-gray-400 text-xs font-mono">RM 30K Prize • 5 days left</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Showcase to Recruiters - LARGE*/}
          <motion.div variants={itemVariants} >
            <Card className="group relative h-full bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 hover:border-blue-500/50 p-8 transition-all duration-300 hover:scale-[1.02] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
                        <Briefcase className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-3xl font-blackops text-white">Land Your Dream Job</h3>
                    </div>
                    <p className="text-gray-300 font-geist text-lg">
                      Showcase your GitHub contributions, HackerFlow achievements, prize money, and badges to recruiters. Make them come to you!
                    </p>
                  </div>
                </div>

                {/* Mock Recruiter Profile View */}
                <div className="grid  gap-4 mt-6">
                  <div className="p-6 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-2 border-blue-500/30 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <Briefcase className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-blackops text-lg">Public Profile</p>
                        <p className="text-blue-400 font-mono text-xs">Visible to recruiters</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                        <span className="text-gray-400 font-mono text-xs">Total Wins</span>
                        <span className="text-white font-bold font-mono text-sm">8</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                        <span className="text-gray-400 font-mono text-xs">Prize Money</span>
                        <span className="text-green-400 font-bold font-mono text-sm">RM 12.5K</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                        <span className="text-gray-400 font-mono text-xs">GitHub Stars</span>
                        <span className="text-yellow-400 font-bold font-mono text-sm">324</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <div className="p-4 bg-gray-800/50 border-2 border-gray-700 rounded-xl mb-3">
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="w-5 h-5 text-yellow-400" />
                        <p className="text-white font-mono font-bold text-sm">Top Skills</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-xs font-mono">React</span>
                        <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-xs font-mono">Node.js</span>
                        <span className="px-3 py-1 bg-pink-500/20 border border-pink-500/30 rounded-full text-pink-300 text-xs font-mono">AI/ML</span>
                        <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-cyan-300 text-xs font-mono">Python</span>
                      </div>
                    </div>
                    <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white font-blackops hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                      View Full Profile <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Hacker Dashboard - LARGE (Important Analytics Feature - spans 2 columns) */}
          <motion.div variants={itemVariants} className="md:col-span-2">
            <Card className="group relative h-full bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 hover:border-cyan-500/50 p-8 transition-all duration-300 hover:scale-[1.02] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl">
                        <BarChart3 className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-3xl font-blackops text-white">Your Hacker Command Center</h3>
                    </div>
                    <p className="text-gray-300 font-geist text-lg">
                      Track every hackathon, analyze your wins, count your prize money, and showcase your badges. Your journey, visualized.
                    </p>
                  </div>
                </div>

                {/* Dashboard Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="p-5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/30 rounded-xl hover:scale-105 transition-all">
                    <Trophy className="w-8 h-8 text-green-400 mb-3" />
                    <p className="text-green-400 font-mono text-xs mb-2">TOTAL PRIZE MONEY</p>
                    <p className="text-white font-blackops text-4xl mb-1">RM 12.5K</p>
                    <div className="flex items-center gap-1 text-green-400 text-xs font-mono mt-2">
                      <TrendingUp className="w-3 h-3" />
                      <span>+RM 3.2K this month</span>
                    </div>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30 rounded-xl hover:scale-105 transition-all">
                    <Zap className="w-8 h-8 text-purple-400 mb-3" />
                    <p className="text-purple-400 font-mono text-xs mb-2">HACKATHONS JOINED</p>
                    <p className="text-white font-blackops text-4xl mb-1">24</p>
                    <div className="flex items-center gap-1 text-purple-400 text-xs font-mono mt-2">
                      <Award className="w-3 h-3" />
                      <span>8 wins, 5 runner-ups</span>
                    </div>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/30 rounded-xl hover:scale-105 transition-all">
                    <Award className="w-8 h-8 text-yellow-400 mb-3" />
                    <p className="text-yellow-400 font-mono text-xs mb-2">BADGES EARNED</p>
                    <p className="text-white font-blackops text-4xl mb-1">47</p>
                    <div className="flex gap-1 mt-3">
                      <div className="w-8 h-8 bg-yellow-500/30 rounded-full flex items-center justify-center text-lg">🏆</div>
                      <div className="w-8 h-8 bg-orange-500/30 rounded-full flex items-center justify-center text-lg">🔥</div>
                      <div className="w-8 h-8 bg-red-500/30 rounded-full flex items-center justify-center text-lg">⚡</div>
                      <div className="w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center text-lg">💎</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* GitHub Showcase - MEDIUM */}
          <motion.div variants={itemVariants}>
            <Card className="group relative h-full bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 hover:border-green-500/50 p-8 transition-all duration-300 hover:scale-[1.02] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl w-fit mb-4">
                    <Github className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-blackops text-white mb-3">GitHub Power User</h3>
                </div>
                <p className="text-gray-300 font-geist mb-4 flex-grow">
                  Connect your GitHub and flex your contributions, badges, and coding stats. Let your code speak for itself!
                </p>

                {/* GitHub Stats Mock */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-center">
                      <p className="text-green-400 font-mono text-xs mb-1">REPOS</p>
                      <p className="text-white font-blackops text-xl">47</p>
                    </div>
                    <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-center">
                      <p className="text-green-400 font-mono text-xs mb-1">STARS</p>
                      <p className="text-white font-blackops text-xl">324</p>
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/30 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-green-400 font-mono font-bold text-xs">CONTRIBUTIONS</p>
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    </div>
                    <p className="text-white font-blackops text-3xl mb-1">2,547</p>
                    <div className="flex gap-1 mt-2">
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 h-8 bg-green-500/30 rounded"
                          style={{ height: `${Math.random() * 30 + 10}px` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Earn Prizes & Badges */}
          <motion.div variants={itemVariants}>
            <Card className="group relative h-full bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 hover:border-yellow-500/50 p-8 transition-all duration-300 hover:scale-[1.02] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10 h-full flex flex-col">
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl w-fit mb-4">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-blackops text-white mb-3">Stack Cash & Badges</h3>
                <p className="text-gray-300 font-geist mb-4 flex-grow">
                  Win cash prizes and earn exclusive badges by participating and crushing milestones. Level up your hacker status!
                </p>

                {/* Prize Display */}
                <div className="space-y-3">
                  <div className="p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/30 rounded-xl">
                    <div className="text-center mb-3">
                      <div className="text-4xl mb-2">💰</div>
                      <p className="text-yellow-400 font-mono text-xs mb-1">LATEST WIN</p>
                      <p className="text-white font-blackops text-3xl">RM 5,000</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div className="aspect-square bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg flex items-center justify-center text-2xl">
                      🏆
                    </div>
                    <div className="aspect-square bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-lg flex items-center justify-center text-2xl">
                      🔥
                    </div>
                    <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center text-2xl">
                      💎
                    </div>
                    <div className="aspect-square bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center text-2xl">
                      ⚡
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Search & Add Friends */}
          <motion.div variants={itemVariants}>
            <Card className="group relative h-full bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 hover:border-pink-500/50 p-8 transition-all duration-300 hover:scale-[1.02] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10 h-full flex flex-col">
                <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl w-fit mb-4">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-blackops text-white mb-3">Build Your Network</h3>
                <p className="text-gray-300 font-geist mb-4 flex-grow">
                  Search and connect with like-minded hackers. Who knows? Your next friend could be your next co-founder!
                </p>

                {/* Friend Request Mock */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-pink-500/50 transition-all">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-mono text-sm font-bold">John Doe</p>
                      <p className="text-gray-400 font-mono text-xs">Backend wizard</p>
                    </div>
                    <button className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg hover:opacity-90 transition-opacity">
                      <UserPlus className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  <div className="p-3 bg-pink-500/10 border-2 border-pink-500/30 rounded-xl text-center">
                    <p className="text-pink-400 font-mono text-xs font-bold">247 FRIENDS</p>
                    <p className="text-white font-blackops text-xl mt-1">Connected</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Friendly UI */}
          <motion.div variants={itemVariants}>
            <Card className="group relative h-full bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 hover:border-indigo-500/50 p-8 transition-all duration-300 hover:scale-[1.02] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10 h-full flex flex-col">
                <div className="p-3 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl w-fit mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-blackops text-white mb-3">Beautifully Simple</h3>
                <p className="text-gray-300 font-geist mb-4 flex-grow">
                  Clean, modern interface designed for hackers. Everything you need, nothing you don&apos;t. Just pure focus.
                </p>

                {/* UI Element Preview */}
                <div className="space-y-2">
                  <div className="h-3 bg-gradient-to-r from-indigo-500/30 to-blue-500/30 rounded-full w-full"></div>
                  <div className="h-3 bg-gradient-to-r from-indigo-500/30 to-blue-500/30 rounded-full w-4/5"></div>
                  <div className="h-3 bg-gradient-to-r from-indigo-500/30 to-blue-500/30 rounded-full w-3/5"></div>

                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="aspect-square bg-indigo-500/20 border border-indigo-500/30 rounded-lg"></div>
                    <div className="aspect-square bg-blue-500/20 border border-blue-500/30 rounded-lg"></div>
                    <div className="aspect-square bg-purple-500/20 border border-purple-500/30 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
