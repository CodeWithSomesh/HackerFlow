"use client"

import { motion } from "framer-motion"
import DashboardImage from "@/assets/Dashboard.png"
import ProfileIcon from "@/assets/Profile Privacy.png"
import SecuredIcon from "@/assets/Data Encryption Lock.png"
import CompetitionIcon from "@/assets/Competition.png"
import MaleIcon from "@/assets/MaleAvatar.png"
import FemaleIcon from "@/assets/WomanAvatar.png"
import {
  LayoutDashboard,
  Users,
  DollarSign,
  BarChart3,
  Shield,
  Eye,
  Search,
  TrendingUp,
  Award,
  Sparkles,
  Globe,
  UserCheck,
  Github,
  Trophy
} from "lucide-react"
import { Card } from "@/components/ui/card"
import Image from "next/image"

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

export function OrganizersBentoGrid() {
  return (
    <section className="pt-10 bg-black/10">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 mb-4">
            FOR ORGANIZERS
          </h2>
          <p className="text-xl text-gray-300 font-geist max-w-3xl mx-auto">
            All the tools you need, in a single platform
          </p>
          <p className="text-gray-400 font-geist mt-2">
            From massive discovery reach to talent recruitment, we&apos;ve got everything you need to host a legendary hackathon.
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
          {/* Massive Discovery Platform - LARGE (Most Important Feature - spans 2 columns) */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="group relative h-full bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 hover:border-teal-500/50 p-8 transition-all duration-300 hover:scale-[1.02] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl">
                        <Globe className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-3xl font-blackops text-white">Reach Thousands Daily</h3>
                    </div>
                    <p className="text-gray-300 font-geist text-lg">
                      Get your hackathon featured on HackerFlow&apos;s huge discovery platform. Thousands of impressions every single day. Maximum visibility, maximum participants!
                    </p>
                  </div>
                </div>

                {/* Discovery Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="p-5 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border-2 border-teal-500/30 rounded-xl hover:scale-105 transition-all">
                    <Eye className="w-8 h-8 text-teal-400 mb-3" />
                    <p className="text-teal-400 font-mono text-xs mb-2">DAILY IMPRESSIONS</p>
                    <p className="text-white font-blackops text-4xl mb-1">24.5K</p>
                    <div className="flex items-center gap-1 text-teal-400 text-xs font-mono mt-2">
                      <TrendingUp className="w-3 h-3" />
                      <span>+12% this week</span>
                    </div>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-2 border-blue-500/30 rounded-xl hover:scale-105 transition-all">
                    <Users className="w-8 h-8 text-blue-400 mb-3" />
                    <p className="text-blue-400 font-mono text-xs mb-2">ACTIVE HACKERS</p>
                    <p className="text-white font-blackops text-4xl mb-1">10K+</p>
                    <div className="flex items-center gap-1 text-blue-400 text-xs font-mono mt-2">
                      <Search className="w-3 h-3" />
                      <span>Looking for events</span>
                    </div>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30 rounded-xl hover:scale-105 transition-all">
                    <Award className="w-8 h-8 text-purple-400 mb-3" />
                    <p className="text-purple-400 font-mono text-xs mb-2">AVG REGISTRATIONS</p>
                    <p className="text-white font-blackops text-4xl mb-1">247</p>
                    <div className="flex items-center gap-1 text-purple-400 text-xs font-mono mt-2">
                      <Sparkles className="w-3 h-3" />
                      <span>Per hackathon</span>
                    </div>
                  </div>
                </div>

                {/* Featured Event Preview */}
                <div className="mt-6 p-5 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-2 border-teal-500/20 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-teal-400 font-mono font-bold text-sm">FEATURED ON HOMEPAGE</p>
                  </div>
                  <div className="flex justify-between w-full items-center">
                    <div>
                      <p className="text-white font-mono text-lg mb-2">Your Hackathon Name Here</p>
                      <div className="flex gap-3 text-xs font-mono text-gray-400">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" /> 3,247 views
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> 156 interested
                        </span>
                      </div>
                    </div>

                    <motion.div
                      className="w-48 h-20 items-center justify-end  -mt-4  flex"
                      drag
                      initial={{ translateY: 0 }}
                      dragSnapToOrigin={true}
                    >
                      <Image
                        src={CompetitionIcon}
                        alt="3D Illustration of Dashboard"
                        className=" hover:rotate-6 transition-all"
                        draggable="false"
                      />
                    </motion.div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Audited and Secured */}
          <motion.div variants={itemVariants}>
            <Card className="group relative h-full bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 hover:border-green-500/50 p-8 transition-all duration-300 hover:scale-[1.02] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl w-fit mb-4">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-blackops text-white mb-3">Fort Knox Secure</h3>
                </div>
                <p className="text-gray-300 font-geist mb-4 flex-">
                  Bank-level security and compliance. Your data and participant information protected with military-grade encryption.
                </p>

                <div className="flex w-full gap-3 justify-end items-center">
                  <motion.div
                    className="w-32 h-32 mr-7 -mt-12 flex"
                    drag
                    initial={{ translateY: 0 }}
                    dragSnapToOrigin={true}
                  >
                    <Image
                      src={SecuredIcon}
                      alt="3D Illustration of Dashboard"
                      className="rotate-6 hover:rotate-0 transition-all"
                      draggable="false"
                    />
                  </motion.div>
                </div>

                {/* Security Badges */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-center hover:scale-105 transition-all">
                      <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-green-400 font-mono text-xs font-bold">SSL/TLS</p>
                      <p className="text-gray-400 text-sm font-mono mt-1">Encrypted</p>
                    </div>
                    <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-center hover:scale-105 transition-all">
                      <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-green-400 font-mono text-xs font-bold">GDPR</p>
                      <p className="text-gray-400 text-sm font-mono mt-1">Compliant</p>
                    </div>
                  </div>

                  <div className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/30 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-400 font-mono text-xs mb-1">SECURITY SCORE</p>
                        <p className="text-white font-blackops text-2xl">A+</p>
                      </div>
                      <motion.div
                        className="w-24 h-20 items-center justify-between flex"
                        drag
                        initial={{ translateY: 0 }}
                        dragSnapToOrigin={true}
                      >
                        <Image
                          src={ProfileIcon}
                          alt="3D Illustration of Dashboard"
                          className=" hover:-rotate-12 transition-all"
                          draggable="false"
                        />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Revenue & Analytics Dashboard - LARGE (Important Feature - spans 2 columns) */}
          {/* <motion.div variants={itemVariants} className="md:col-span-3">
            <Card className="group relative h-full bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 hover:border-yellow-500/50 p-8 transition-all duration-300 hover:scale-[1.02] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                        <BarChart3 className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-3xl font-blackops text-white">Money Talks, We Track</h3>
                    </div>
                    <p className="text-gray-300 font-geist text-lg">
                      Real-time revenue tracking, registration analytics, and participant insights. Every metric that matters, beautifully visualized.
                    </p>
                  </div>
                </div>

                {/* Analytics Grid */}
                {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <div className="p-5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/30 rounded-xl hover:scale-105 transition-all">
                    <DollarSign className="w-7 h-7 text-green-400 mb-2" />
                    <p className="text-green-400 font-mono text-xs mb-1">TOTAL REVENUE</p>
                    <p className="text-white font-blackops text-3xl">RM 45.2K</p>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/30 rounded-xl hover:scale-105 transition-all">
                    <Users className="w-7 h-7 text-blue-400 mb-2" />
                    <p className="text-blue-400 font-mono text-xs mb-1">PARTICIPANTS</p>
                    <p className="text-white font-blackops text-3xl">1,247</p>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30 rounded-xl hover:scale-105 transition-all">
                    <TrendingUp className="w-7 h-7 text-purple-400 mb-2" />
                    <p className="text-purple-400 font-mono text-xs mb-1">GROWTH</p>
                    <p className="text-white font-blackops text-3xl">+34%</p>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-orange-500/20 to-red-500/20 border-2 border-orange-500/30 rounded-xl hover:scale-105 transition-all">
                    <Award className="w-7 h-7 text-orange-400 mb-2" />
                    <p className="text-orange-400 font-mono text-xs mb-1">AVG RATING</p>
                    <p className="text-white font-blackops text-3xl">4.9★</p>
                  </div>
                </div> */}

                {/* Chart Mock */}
                {/* <div className="mt-6 p-5 bg-gray-800/50 border-2 border-gray-700 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-white font-mono font-bold">Revenue Trend</p>
                    <span className="text-green-400 font-mono text-sm flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" /> +24%
                    </span>
                  </div>
                  <div className="flex items-end gap-2 h-24">
                    {[40, 65, 45, 80, 95, 70, 100].map((height, idx) => (
                      <div key={idx} className="flex-1 bg-gradient-to-t from-yellow-500 to-orange-500 rounded-t-lg hover:opacity-80 transition-opacity" style={{ height: `${height}%` }}></div>
                    ))}
                  </div>
                </div>
              </div> */}
            {/* </Card>
          </motion.div>  */}

          {/* Talent Discovery & Recruitment - LARGE (Unique Feature - spans 2 columns) */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="group relative h-full bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 hover:border-indigo-500/50 p-8 transition-all duration-300 hover:scale-[1.02] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                        <UserCheck className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-3xl font-blackops text-white">Scout Future Unicorns</h3>
                    </div>
                    <p className="text-gray-300 font-geist text-lg">
                      Discover and recruit rising stars. Analyze HackerFlow achievements, GitHub contributions, prize money, and badges. Find your next rockstar engineer!
                    </p>
                  </div>
                </div>

                {/* Talent Cards */}
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  {/* Talent Card 1 */}
                  <div className="p-5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-2 border-indigo-500/30 rounded-xl hover:scale-105 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      {/* <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Users className="w-7 h-7 text-white" />
                      </div> */}

                      <motion.div
                        className="w-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center"
                        drag
                        initial={{ translateY: 0 }}
                        dragSnapToOrigin={true}
                      >
                        <Image
                          src={MaleIcon}
                          alt="3D Illustration of Dashboard"
                          className="transition-all"
                          draggable="false"
                        />
                      </motion.div>
                      <div>
                        <p className="text-white font-blackops text-lg">Top Performer</p>
                        <p className="text-indigo-300 font-mono text-sm">Someshwar Rao</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                        <span className="text-gray-400 font-mono text-xs flex items-center gap-1">
                          <Trophy className="w-3 h-3" /> Wins
                        </span>
                        <span className="text-white font-bold font-mono text-sm">12</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                        <span className="text-gray-400 font-mono text-xs flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> Prize Money
                        </span>
                        <span className="text-green-400 font-bold font-mono text-sm">RM 24K</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                        <span className="text-gray-400 font-mono text-xs flex items-center gap-1">
                          <Github className="w-3 h-3" /> Stars
                        </span>
                        <span className="text-yellow-400 font-bold font-mono text-sm">547</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-indigo-400 font-mono text-xs mb-2">Top Skills</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-300 text-xs font-mono">React</span>
                        <span className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-xs font-mono">AI/ML</span>
                        <span className="px-2 py-1 bg-pink-500/20 border border-pink-500/30 rounded-full text-pink-300 text-xs font-mono">Python</span>
                      </div>
                    </div>
                  </div>

                  {/* Talent Card 2 */}
                  <div className="p-5 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/30 rounded-xl hover:scale-105 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      {/* <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <Users className="w-7 h-7 text-white" />
                      </div> */}

                      <motion.div
                        className="w-32 h-28 px-5  bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center"
                        drag
                        initial={{ translateY: 0 }}
                        dragSnapToOrigin={true}
                      >
                        <Image
                          src={FemaleIcon}
                          alt="3D Illustration of Dashboard"
                          className=" transition-all "
                          draggable="false"
                        />
                      </motion.div>

                      <div>
                        <p className="text-white font-blackops text-lg">Rising Star</p>
                        <p className="text-cyan-400 font-mono text-sm">Sarah Majdi</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                        <span className="text-gray-400 font-mono text-xs flex items-center gap-1">
                          <Trophy className="w-3 h-3" /> Wins
                        </span>
                        <span className="text-white font-bold font-mono text-sm">8</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                        <span className="text-gray-400 font-mono text-xs flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> Prize Money
                        </span>
                        <span className="text-green-400 font-bold font-mono text-sm">RM 16K</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                        <span className="text-gray-400 font-mono text-xs flex items-center gap-1">
                          <Github className="w-3 h-3" /> Stars
                        </span>
                        <span className="text-yellow-400 font-bold font-mono text-sm">392</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-cyan-400 font-mono text-xs mb-2">Top Skills</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-cyan-300 text-xs font-mono">Design</span>
                        <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-xs font-mono">Figma</span>
                        <span className="px-2 py-1 bg-teal-500/20 border border-teal-500/30 rounded-full text-teal-300 text-xs font-mono">UX</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recruitment CTA */}
                <div className="mt-6 p-5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-2 border-indigo-500/20 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-mono font-bold mb-1">Talent Pool Access</p>
                      <p className="text-gray-400 font-mono text-xs">Browse 10,000+ verified profiles</p>
                    </div>
                    <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white font-blackops hover:opacity-90 transition-opacity flex items-center gap-2">
                      Explore Talent <Search className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          

          {/* Organizer Dashboard Highlight */}
          <motion.div variants={itemVariants}>
            <Card className="group relative h-full bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 hover:border-pink-500/50 p-8 transition-all duration-300 hover:scale-[1.02] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl w-fit mb-4">
                    <LayoutDashboard className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-blackops text-white mb-3">Mission Control</h3>
                </div>
                <p className="text-gray-300 font-geist flex-">
                  Your all-in-one organizer dashboard. Manage registrations, track payments, monitor submissions, and analyze success—all from one place.
                </p>

                <motion.div
                  className="w-72 h-72 mx-auto -mt-4"
                  drag
                  initial={{ translateY: 0 }}
                  dragSnapToOrigin={true}
                >
                  <Image
                    src={DashboardImage}
                    alt="3D Illustration of Dashboard"
                    className=" hover:rotate-12 transition-all"
                    draggable="false"
                  />
                </motion.div>

                {/* Dashboard Preview */}
                <div className="space-y-2">
                  <div className="p-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-pink-400 font-mono text-sm">Active Events</span>
                      <span className="text-white font-blackops text-xl">3</span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-mono text-sm">Pending Reviews</span>
                      <span className="text-white font-mono text-sm font-bold">12</span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-mono text-sm">Total Hosted</span>
                      <span className="text-white font-mono text-sm font-bold">24</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Revenue & Analytics Dashboard - LARGE (Important Feature - spans 2 columns) */}
          <motion.div variants={itemVariants} className="md:col-span-3">
            <Card className="group relative h-full bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 hover:border-yellow-500/50 p-8 transition-all duration-300 hover:scale-[1.02] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                        <BarChart3 className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-3xl font-blackops text-white">Money Talks, We Track</h3>
                    </div>
                    <p className="text-gray-300 font-geist text-lg">
                      Real-time revenue tracking, registration analytics, and participant insights. Every metric that matters, beautifully visualized.
                    </p>
                  </div>
                </div>

                {/* Analytics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <div className="p-5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/30 rounded-xl hover:scale-105 transition-all">
                    <DollarSign className="w-7 h-7 text-green-400 mb-2" />
                    <p className="text-green-400 font-mono text-xs mb-1">TOTAL REVENUE</p>
                    <p className="text-white font-blackops text-3xl">RM 45.2K</p>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/30 rounded-xl hover:scale-105 transition-all">
                    <Users className="w-7 h-7 text-blue-400 mb-2" />
                    <p className="text-blue-400 font-mono text-xs mb-1">PARTICIPANTS</p>
                    <p className="text-white font-blackops text-3xl">1,247</p>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30 rounded-xl hover:scale-105 transition-all">
                    <TrendingUp className="w-7 h-7 text-purple-400 mb-2" />
                    <p className="text-purple-400 font-mono text-xs mb-1">GROWTH</p>
                    <p className="text-white font-blackops text-3xl">+34%</p>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-orange-500/20 to-red-500/20 border-2 border-orange-500/30 rounded-xl hover:scale-105 transition-all">
                    <Award className="w-7 h-7 text-orange-400 mb-2" />
                    <p className="text-orange-400 font-mono text-xs mb-1">AVG RATING</p>
                    <p className="text-white font-blackops text-3xl">4.9★</p>
                  </div>
                </div>

                {/* Chart Mock */}
                <div className="mt-6 p-5 bg-gray-800/50 border-2 border-gray-700 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-5 h-5 text-yellow-400" />
                      <p className="text-white font-mono font-bold">Revenue Trend</p>
                    </div>
                    <span className="text-green-400 font-mono text-sm flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" /> +24%
                    </span>
                  </div>
                  <div className="flex items-end gap-2 h-24">
                    {[40, 65, 45, 80, 95, 70, 100].map((height, idx) => (
                      <div key={idx} className="flex-1 bg-gradient-to-t from-yellow-500 to-orange-500 rounded-t-lg hover:opacity-80 transition-opacity" style={{ height: `${height}%` }}></div>
                    ))}
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
