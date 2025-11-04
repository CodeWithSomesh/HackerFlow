'use client'

import { motion, PanInfo } from 'framer-motion'
import {
  Star,
  MapPin,
  Briefcase,
  Github,
  Trophy,
  Code2,
  Sparkles,
  TrendingUp,
  Award,
  MessageCircle,
  ExternalLink,
  GitBranch,
  Check,
  Loader2,
  Heart,
  User,
  Building
} from 'lucide-react'
import Link from 'next/link'
import { MatchProfile } from '@/lib/actions/matchmaking-actions'

// =====================================================
// PROFILE CARD COMPONENT
// =====================================================

interface ProfileCardProps {
  profile: MatchProfile
  swipeDirection: 'left' | 'right' | null
  onPan: (event: any, info: PanInfo) => void
}

export function ProfileCard({ profile, swipeDirection, onPan }: ProfileCardProps) {
  const cardVariants = {
    initial: { scale: 0.95, opacity: 0, y: 20, x: 0, rotate: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      y: 0,
      x: 0,
      rotate: 0,
      transition: { duration: 0.3 }
    },
    exitLeft: {
      x: -400,
      rotate: -20,
      opacity: 0,
      transition: { duration: 0.3 }
    },
    exitRight: {
      x: 400,
      rotate: 20,
      opacity: 0,
      transition: { duration: 0.3 }
    }
  }

  const getExitVariant = () => {
    if (swipeDirection === 'left') return 'exitLeft'
    if (swipeDirection === 'right') return 'exitRight'
    return 'animate'
  }

  const topSkills = [...(profile.programming_languages || []), ...(profile.frameworks || [])].slice(0, 5)

  return (
    <motion.div
      key={profile.user_id}
      variants={cardVariants}
      initial="initial"
      animate={getExitVariant()}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onPanEnd={onPan}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-700 hover:border-teal-400 transition-all cursor-grab active:cursor-grabbing"
    >
      {/* Profile Image/Avatar */}
      <div className="relative h-80 bg-gradient-to-br from-teal-600 via-cyan-500 to-blue-600 flex items-center justify-center">
        <div className="text-white text-8xl font-blackops">
          {profile.full_name?.charAt(0).toUpperCase()}
        </div>

        {/* Compatibility Score Badge - Top Right (OkCupid style) - Responsive */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 block lg:hidden">
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-2xl border-2  border-white p-8  ${
            profile.compatibilityScore >= 80 ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
            profile.compatibilityScore >= 60 ? 'bg-gradient-to-br from-yellow-500 to-amber-600' :
            'bg-gradient-to-br from-orange-500 to-red-600'
          }`}>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-blackops text-white leading-none">
                {Math.round(profile.compatibilityScore)}%
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-yellow-400 to-amber-500 border-t-2 border-yellow-300 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-blackops text-gray-900">
                {profile.full_name}
                {profile.age && <span className="text-xl ml-2">{profile.age}</span>}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-800 font-mono font-semibold">
                <Briefcase className="w-4 h-4" />
                <span className="line-clamp-1">
                  {profile.position || 'Student'}
                  {profile.company && ` @ ${profile.company}`}
                  {profile.university && ` @ ${profile.university}`}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-800 font-mono font-semibold">
                <MapPin className="w-4 h-4" />
                <span>
                  {profile.city}
                  {profile.state && `, ${profile.state}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-sm font-blackops text-teal-400 uppercase tracking-wide mb-3">
            Top Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {topSkills.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-md text-sm font-mono font-bold bg-gray-800/50 border-2 border-teal-400 text-teal-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* GitHub Contributions */}
        {profile.githubStats && profile.githubStats.contributions > 0 && (
          <div>
            <h3 className="text-sm font-blackops text-teal-400 uppercase tracking-wide mb-3">
              GitHub Activity
            </h3>
            <p className="text-gray-300 font-mono">
              <span className="text-2xl font-bold text-teal-400">{profile.githubStats.contributions}</span>
              <span className="text-sm text-gray-400 ml-2">contributions this year</span>
            </p>
          </div>
        )}

        {/* About */}
        {profile.bio && (
          <div>
            <h3 className="text-sm font-blackops text-teal-400 uppercase tracking-wide mb-3">
              About
            </h3>
            <p className="text-gray-300 text-sm font-mono leading-relaxed ">
              {profile.bio}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// =====================================================
// HACKATHON EXPERIENCE COMPONENT
// =====================================================

export function HackathonExperience({ profile }: { profile: MatchProfile }) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border-2 border-purple-500/50 shadow-xl shadow-purple-500/20">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-blackops text-purple-300 uppercase tracking-wide">
          Hackathon Experience
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-3xl font-blackops text-purple-400">
            {profile.hackathonStats.participated}
          </div>
          <div className="text-xs text-gray-400 font-mono font-bold uppercase">
            Participated
          </div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-blackops text-purple-400">
            {profile.hackathonStats.won}
          </div>
          <div className="text-xs text-gray-400 font-mono font-bold uppercase">
            Won
          </div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-blackops text-purple-400">
            {Math.round(profile.hackathonStats.winRate)}%
          </div>
          <div className="text-xs text-gray-400 font-mono font-bold uppercase">
            Win Rate
          </div>
        </div>
      </div>

      {profile.hackathonStats.recentHackathon && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 font-mono font-bold uppercase mb-1">
            Most Recent
          </p>
          <p className="text-sm text-gray-300 font-mono font-bold line-clamp-1">
            {profile.hackathonStats.recentHackathon}
          </p>
        </div>
      )}
    </div>
  )
}

// =====================================================
// GITHUB ACTIVITY COMPONENT
// =====================================================

export function GitHubActivity({ profile }: { profile: MatchProfile }) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border-2 border-cyan-500/50 shadow-xl shadow-cyan-500/20">
      <div className="flex items-center gap-2 mb-4">
        <Github className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-blackops text-cyan-300 uppercase tracking-wide">
          GitHub Activity
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-cyan-500/20 border-2 border-cyan-400 rounded-xl p-3 text-center">
          <div className="text-2xl font-blackops text-cyan-300">
            {profile.githubStats.repositories}
          </div>
          <div className="text-xs text-cyan-400 font-mono font-bold uppercase">
            Repos
          </div>
        </div>

        <div className="bg-green-500/20 border-2 border-green-400 rounded-xl p-3 text-center">
          <div className="text-2xl font-blackops text-green-300">
            {profile.githubStats.contributions}
          </div>
          <div className="text-xs text-green-400 font-mono font-bold uppercase">
            Commits
          </div>
        </div>

        <div className="bg-purple-500/20 border-2 border-purple-400 rounded-xl p-3 text-center">
          <div className="text-2xl font-blackops text-purple-300">
            {profile.githubStats.followers}
          </div>
          <div className="text-xs text-purple-400 font-mono font-bold uppercase">
            Followers
          </div>
        </div>
      </div>
    </div>
  )
}

// =====================================================
// CONTRIBUTION GRAPH COMPONENT
// =====================================================

export function ContributionGraph({ profile }: { profile: MatchProfile }) {
  const weeks = 52
  const days = 7

  // Mock contribution data
  const mockData = Array(weeks).fill(0).map(() =>
    Array(days).fill(0).map(() => Math.floor(Math.random() * 10))
  )

  const getColor = (count: number) => {
    if (count === 0) return 'bg-gray-800'
    if (count < 3) return 'bg-green-900'
    if (count < 6) return 'bg-green-700'
    if (count < 9) return 'bg-green-500'
    return 'bg-green-400'
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border-2 border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-blackops text-gray-300 uppercase tracking-wide">
            Contribution Graph
          </h3>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-[2px] min-w-max">
          {mockData.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-[2px]">
              {week.map((count, dayIdx) => (
                <div
                  key={dayIdx}
                  className={`w-2 h-2 rounded-sm ${getColor(count)}`}
                  title={`${count} contributions`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 text-xs text-gray-500 font-mono">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-800" />
          <div className="w-3 h-3 rounded-sm bg-green-900" />
          <div className="w-3 h-3 rounded-sm bg-green-700" />
          <div className="w-3 h-3 rounded-sm bg-green-500" />
          <div className="w-3 h-3 rounded-sm bg-green-400" />
        </div>
        <span>More</span>
      </div>

      <p className="text-center text-sm text-gray-400 font-mono mt-3">
        <span className="font-bold">{profile.githubStats.contributions}</span> contributions in 2024
      </p>
    </div>
  )
}

// =====================================================
// UNIFIED MATCH INSIGHTS COMPONENT (for right column)
// =====================================================

export function MatchInsights({ profile }: { profile: MatchProfile }) {
  const getScoreLabel = () => {
    if (profile.compatibilityScore >= 90) return 'Perfect Match'
    if (profile.compatibilityScore >= 80) return 'Great Match'
    if (profile.compatibilityScore >= 70) return 'Good Match'
    if (profile.compatibilityScore >= 60) return 'Decent Match'
    return 'Potential Match'
  }

  const getScoreColor = () => {
    if (profile.compatibilityScore >= 80) return 'from-green-500 to-emerald-600'
    if (profile.compatibilityScore >= 60) return 'from-yellow-500 to-amber-600'
    return 'from-orange-500 to-red-600'
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border-2 border-green-500/50 shadow-xl shadow-green-500/20">
      {/* Score Badge */}
      <div className="flex flex-col items-center mb-6">
        <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${getScoreColor()} flex items-center justify-center shadow-2xl mb-3 border-4 border-white/10`}>
          <div className="text-4xl font-blackops text-white">
            {Math.round(profile.compatibilityScore)}%
          </div>
        </div>

        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-green-400" />
          <h3 className="text-xl font-blackops text-green-300">
            {getScoreLabel()}
          </h3>
        </div>

        <p className="text-xs text-gray-400 font-mono text-center">
          Based on skills, hackathon activity, and GitHub contributions
        </p>
      </div>

      {/* Match Insights */}
      {profile.matchingFactors?.whyGreatTogether && profile.matchingFactors.whyGreatTogether.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-green-500/20">
          <p className="text-sm font-blackops text-green-400 uppercase tracking-wide">
            Why You'll Work Great Together
          </p>
          {profile.matchingFactors.whyGreatTogether.map((insight: string, idx: number) => (
            <div key={idx} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-300 font-mono leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      )}

      {/* Shared Skills Tags */}
      {profile.matchingFactors?.sharedLanguages && profile.matchingFactors.sharedLanguages.length > 0 && (
        <div className="pt-4 border-t border-green-500/20 mt-4">
          <p className="text-xs font-blackops text-green-400 uppercase tracking-wide mb-2">
            Shared Skills
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.matchingFactors.sharedLanguages.slice(0, 6).map((lang: string, idx: number) => (
              <span
                key={idx}
                className="px-2 py-1 rounded-md text-xs font-mono font-bold bg-green-500/20 border border-green-400/40 text-green-300"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// =====================================================
// RECENT PROJECTS COMPONENT
// =====================================================

export function RecentProjects({ projects }: { projects: any[] }) {
  if (!projects || projects.length === 0) {
    return null
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border-2 border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Code2 className="w-5 h-5 text-gray-400" />
        <h3 className="text-lg font-blackops text-gray-300 uppercase tracking-wide">
          Recent Projects
        </h3>
      </div>

      <div className="space-y-4">
        {projects.slice(0, 2).map((project, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-gray-800/50 border-2 border-gray-700 hover:border-teal-400 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-mono font-bold text-gray-200">{project.name}</h4>
              {project.awards && project.awards.length > 0 && (
                <span className="px-2 py-1 rounded-md text-xs font-mono font-bold bg-yellow-500/20 border border-yellow-400 text-yellow-300 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {project.awards[0]}
                </span>
              )}
            </div>

            <p className="text-sm text-gray-400 font-mono mb-3 line-clamp-2">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-1 mb-3">
              {project.techStack?.slice(0, 3).map((tech: string, techIdx: number) => (
                <span
                  key={techIdx}
                  className="px-2 py-0.5 rounded-md text-xs font-mono bg-gray-700 border border-gray-600 text-gray-300"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500 font-mono">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{project.stars}</span>
              </div>
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-teal-400 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>View</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// =====================================================
// MATCH MODAL COMPONENT
// =====================================================

interface MatchModalProps {
  isOpen: boolean
  onClose: () => void
  profile: MatchProfile | null
}

export function MatchModal({ isOpen, onClose, profile }: MatchModalProps) {
  if (!isOpen || !profile) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 10 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-teal-400 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-teal-400/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 15 }}
            className="mb-6"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-4xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400 mb-2">
              It's a Match!
            </h2>
            <p className="text-gray-400 font-mono">
              You and {profile.full_name} liked each other!
            </p>
          </motion.div>

          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-3xl text-white font-blackops shadow-lg">
              YOU
            </div>

            <div className="relative">
              <Heart className="w-8 h-8 text-pink-500 fill-pink-500 animate-pulse" />
            </div>

            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl text-white font-blackops shadow-lg">
              {profile.full_name?.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="bg-gray-800/50 border-2 border-teal-400 rounded-xl p-4 mb-6">
            <div className="text-3xl font-blackops text-teal-400 mb-1">
              {Math.round(profile.compatibilityScore)}%
            </div>
            <div className="text-sm text-gray-400 font-mono">Compatibility Score</div>
          </div>

          <div className="flex gap-3">
            <Link href="/find-teammates/matches" className="flex-1">
              <button className="w-full px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-blackops hover:shadow-lg hover:shadow-teal-500/50 transition-all">
                <MessageCircle className="w-4 h-4 inline mr-2" />
                View Matches
              </button>
            </Link>

            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-800 border-2 border-gray-700 text-gray-300 rounded-xl font-mono font-bold hover:bg-gray-700 hover:border-gray-600 transition-all"
            >
              Keep Swiping
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// =====================================================
// LOADING STATE COMPONENT
// =====================================================

export function LoadingState() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-teal-400 animate-spin mx-auto mb-4" />
        <p className="text-gray-400 font-mono font-semibold">Finding your perfect teammate...</p>
      </div>
    </div>
  )
}

// =====================================================
// EMPTY STATE COMPONENT
// =====================================================

export function EmptyState({ onReload, useDummyData }: { onReload: () => void; useDummyData: boolean }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">😔</div>
        <h2 className="text-3xl font-blackops text-white mb-4">
          No More Profiles
        </h2>
        <p className="text-gray-400 font-mono mb-6">
          {useDummyData
            ? "You've seen all dummy profiles! Toggle off dummy data to see real profiles."
            : "You've seen everyone! Check back later or adjust your preferences to see more people."}
        </p>

        <div className="flex gap-3 justify-center">
          <Link href="/find-teammates/matches">
            <button className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-mono font-bold hover:shadow-lg hover:shadow-teal-500/50 transition-all">
              View Matches
            </button>
          </Link>

          <Link href="/find-teammates/preferences">
            <button className="px-6 py-3 bg-gray-900 border-2 border-gray-700 text-gray-300 rounded-xl font-mono font-bold hover:bg-gray-800 hover:border-gray-600 transition-all">
              Adjust Preferences
            </button>
          </Link>
        </div>

        <button
          onClick={onReload}
          className="mt-4 text-teal-400 hover:text-teal-300 text-sm font-mono font-bold transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
