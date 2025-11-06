"use client"

import Link from "next/link"
import { Github, Linkedin, Twitter, Mail, Sparkles, Trophy, Users, Zap } from "lucide-react"
import Image from "next/image"
import HackerFlowLogo from '@/assets/hackerflow-logo.png';


export function Footer() {
    return (
        <footer className="relative mt-20 border-t-4 border-teal-400 bg-gradient-to-br bg-black/10 overflow-hidden">
        {/* Animated Background Effects */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 py-12 sm:py-16">
          {/* Top Section - Brand & Features */}
          <div className="grid gap-8 sm:gap-12 lg:gap-16 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-12">
            {/* Brand Column */}
            <div className="space-y-4 lg:col-span-1">
              <Link href="/" className="inline-flex items-center gap-3 group">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-400/50 group-hover:shadow-teal-400/80 transition-all group-hover:scale-110">
                  <Image
                    src={HackerFlowLogo}
                    alt="HackerFlow Logo"
                    className="rounded-lg"/>
                </div>
                <span className="font-blackops text-2xl sm:text-3xl bg-gradient-to-r from-teal-400 via-cyan-400 to-yellow-400 bg-clip-text text-transparent">
                  HackerFlow
                </span>
              </Link>

              <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-mono">
                Revolutionizing hackathon participation in Malaysia&apos;s tech ecosystem with AI-powered innovation.
              </p>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 border-2 border-teal-400 rounded-lg">
                <span className="text-2xl">🇲🇾</span>
                <span className="text-teal-400 font-mono font-bold text-sm">Made in Malaysia</span>
              </div>
            </div>

            {/* Platform Links */}
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-blackops bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-teal-400" />
                Platform
              </h3>
              <ul className="space-y-3 text-sm sm:text-base">
                <li>
                  <Link
                    href="/hackathons"
                    className="text-gray-300 hover:text-teal-400 transition-colors font-mono flex items-center gap-2 group"
                  >
                    <Trophy className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Discover Hackathons
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/hacker/ideas"
                    className="text-gray-300 hover:text-cyan-400 transition-colors font-mono flex items-center gap-2 group"
                  >
                    <Zap className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Generate Ideas
                  </Link>
                </li>
                <li>
                  <Link
                    href="/find-teammates"
                    className="text-gray-300 hover:text-yellow-400 transition-colors font-mono flex items-center gap-2 group"
                  >
                    <Users className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Find Teammates
                  </Link>
                </li>
                <li>
                  <Link
                    href="/leaderboard"
                    className="text-gray-300 hover:text-pink-400 transition-colors font-mono flex items-center gap-2 group"
                  >
                    <Trophy className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Leaderboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-blackops bg-gradient-to-r from-cyan-400 to-yellow-400 bg-clip-text text-transparent">
                Resources
              </h3>
              <ul className="space-y-3 text-sm sm:text-base">
                <li>
                  <Link
                    href="/about"
                    className="text-gray-300 hover:text-teal-400 transition-colors font-mono"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-300 hover:text-cyan-400 transition-colors font-mono"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-300 hover:text-yellow-400 transition-colors font-mono"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            {/* Connect */}
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-blackops bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                Connect
              </h3>
              <ul className="space-y-3 text-sm sm:text-base">
                <li>
                  <a
                    href="https://github.com/codewithsomesh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-teal-400 transition-colors font-mono flex items-center gap-3 group"
                    aria-label="Follow HackerFlow on GitHub"
                  >
                    <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-teal-500/20 transition-colors border-2 border-transparent group-hover:border-teal-400">
                      <Github className="h-4 w-4" />
                    </div>
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://twitter.com/codewithmesh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-cyan-400 transition-colors font-mono flex items-center gap-3 group"
                    aria-label="Follow HackerFlow on Twitter"
                  >
                    <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-cyan-500/20 transition-colors border-2 border-transparent group-hover:border-cyan-400">
                      <Twitter className="h-4 w-4" />
                    </div>
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com/in/someshwar-rao-929050249/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-yellow-400 transition-colors font-mono flex items-center gap-3 group"
                    aria-label="Follow HackerFlow on LinkedIn"
                  >
                    <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-yellow-500/20 transition-colors border-2 border-transparent group-hover:border-yellow-400">
                      <Linkedin className="h-4 w-4" />
                    </div>
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:hello@hackerflow.my"
                    className="text-gray-300 hover:text-pink-400 transition-colors font-mono flex items-center gap-3 group"
                    aria-label="Email HackerFlow"
                  >
                    <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-pink-500/20 transition-colors border-2 border-transparent group-hover:border-pink-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider with gradient */}
          <div className="h-1 w-full bg-gradient-to-r from-teal-500 via-cyan-500 to-yellow-500 rounded-full mb-8"></div>

          {/* Bottom Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 text-center sm:text-left">
            <p className="text-gray-400 font-mono text-xs sm:text-sm">
              © 2025 <span className="text-teal-400 font-bold">HackerFlow</span>. Empowering Malaysia&apos;s tech ecosystem.
            </p>

            <div className="flex items-center gap-2 text-gray-500 font-mono text-xs">
              <span>Built with</span>
              <span className="text-pink-400 animate-pulse">♥</span>
              <span>by developers, for developers</span>
            </div>
          </div>
        </div>
      </footer>
    )
  }
  