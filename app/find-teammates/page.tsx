'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import {
  Heart,
  X,
  Star,
  MapPin,
  Briefcase,
  Github,
  Trophy,
  Users,
  Code2,
  Sparkles,
  TrendingUp,
  Calendar,
  Award,
  Settings,
  MessageCircle,
  Zap,
  ExternalLink,
  GitBranch,
  Check,
  Undo2,
  Filter,
  Database,
  ChevronDown
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  getNextMatch,
  swipeRight,
  swipeLeft,
  undoLastSwipe,
  MatchProfile
} from '@/lib/actions/matchmaking-actions'
import {
  ProfileCard,
  HackathonExperience,
  GitHubActivity,
  ContributionGraph,
  MatchInsights,
  RecentProjects,
  MatchModal,
  LoadingState,
  EmptyState
} from './components'
import { mockMatchProfiles } from '@/lib/mockMatchmakingData'

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function FindTeammatesPage() {
  const [currentProfile, setCurrentProfile] = useState<MatchProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  const [matchModal, setMatchModal] = useState(false)
  const [matchedUser, setMatchedUser] = useState<MatchProfile | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [canUndo, setCanUndo] = useState(false)
  const [useDummyData, setUseDummyData] = useState(false)
  const [dummyProfileIndex, setDummyProfileIndex] = useState(0)

  // Load next profile
  const loadNextProfile = useCallback(async () => {
    setLoading(true)

    if (useDummyData) {
      // Use dummy data
      if (dummyProfileIndex < mockMatchProfiles.length) {
        setCurrentProfile(mockMatchProfiles[dummyProfileIndex])
        setCanUndo(false)
      } else {
        setCurrentProfile(null)
        toast.info("You've seen all dummy profiles!")
      }
    } else {
      // Use real data
      const result = await getNextMatch()

      if (result.success && result.data) {
        setCurrentProfile(result.data)
        setCanUndo(false)
      } else if (result.message) {
        setCurrentProfile(null)
        toast.info(result.message)
      } else {
        toast.error(result.error || 'Failed to load profile')
      }
    }

    setLoading(false)
  }, [useDummyData, dummyProfileIndex])

  useEffect(() => {
    loadNextProfile()
  }, [loadNextProfile])

  // Handle swipe right (like)
  const handleSwipeRight = async () => {
    if (!currentProfile || isAnimating) return

    setIsAnimating(true)
    setSwipeDirection('right')
    setCanUndo(true)

    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 300))

    if (useDummyData) {
      // Dummy mode: simulate match randomly (30% chance)
      const matched = Math.random() > 0.7

      if (matched) {
        setMatchedUser(currentProfile)
        setMatchModal(true)
        triggerConfetti()
        toast.success("It's a Match!")
      } else {
        toast.success('Liked!')
      }

      setDummyProfileIndex(prev => prev + 1)
      await loadNextProfile()
    } else {
      // Real mode
      const result = await swipeRight(currentProfile.user_id)

      if (result.success) {
        if (result.matched) {
          setMatchedUser(currentProfile)
          setMatchModal(true)
          triggerConfetti()
          toast.success("It's a Match!")
        } else {
          toast.success('Liked!')
        }

        await loadNextProfile()
      } else {
        toast.error(result.error || 'Failed to like')
      }
    }

    setSwipeDirection(null)
    setIsAnimating(false)
  }

  // Handle swipe left (pass)
  const handleSwipeLeft = async () => {
    if (!currentProfile || isAnimating) return

    setIsAnimating(true)
    setSwipeDirection('left')
    setCanUndo(true)

    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 300))

    if (useDummyData) {
      toast.info('Passed')
      setDummyProfileIndex(prev => prev + 1)
      await loadNextProfile()
    } else {
      const result = await swipeLeft(currentProfile.user_id)

      if (result.success) {
        toast.info('Passed')
        await loadNextProfile()
      } else {
        toast.error(result.error || 'Failed to pass')
      }
    }

    setSwipeDirection(null)
    setIsAnimating(false)
  }

  // Handle undo
  const handleUndo = async () => {
    if (!canUndo) return

    if (useDummyData) {
      // Go back one profile
      if (dummyProfileIndex > 0) {
        setDummyProfileIndex(prev => prev - 1)
        toast.success('Undone!')
        await loadNextProfile()
        setCanUndo(false)
      }
    } else {
      const result = await undoLastSwipe()

      if (result.success) {
        toast.success('Undone!')
        await loadNextProfile()
        setCanUndo(false)
      } else {
        toast.error(result.error || 'Cannot undo')
      }
    }
  }

  // Toggle dummy data mode
  const toggleDummyData = () => {
    setUseDummyData(!useDummyData)
    setDummyProfileIndex(0)
    setCurrentProfile(null)
    setLoading(true)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isAnimating) return

      if (e.key === 'ArrowLeft') {
        handleSwipeLeft()
      } else if (e.key === 'ArrowRight') {
        handleSwipeRight()
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        handleUndo()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentProfile, isAnimating, canUndo])

  // Confetti animation
  const triggerConfetti = () => {
    const count = 200
    const defaults = {
      origin: { y: 0.7 }
    }

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        spread: 100,
        decay: 0.91,
        scalar: 1.2,
        drift: 0,
        gravity: 1,
        ticks: 500,
        colors: ['#EC4899', '#A855F7', '#14B8A6', '#FACC15', '#F43F5E']
      })
    }

    fire(0.25, { spread: 26, startVelocity: 55 })
    fire(0.2, { spread: 60 })
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
    fire(0.1, { spread: 120, startVelocity: 45 })
  }

  // Pan handlers for drag to swipe
  const handlePan = (event: any, info: PanInfo) => {
    const threshold = 150
    if (Math.abs(info.offset.x) > threshold && !isAnimating) {
      if (info.offset.x > 0) {
        handleSwipeRight()
      } else {
        handleSwipeLeft()
      }
    }
  }

  if (loading && !currentProfile) {
    return <LoadingState />
  }

  // Render header function for reuse
  const renderHeader = () => (
    <div className="bg-gradient-to-r from-teal-600 via-cyan-500 to-yellow-400 border-y-4 border-pink-400 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-blackops text-white drop-shadow-lg">
              Find Your Hackathon Buddy
            </h1>
            <p className="text-sm sm:text-lg lg:text-xl text-white/90 font-mono">
              Discover amazing teammates with AI-powered matching 🚀
            </p>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Dummy Data Toggle */}
          <button
            onClick={toggleDummyData}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-mono font-bold text-sm transition-all border-2 ${
              useDummyData
                ? 'bg-teal-500 border-teal-300 text-white shadow-lg'
                : 'bg-gray-900/80 border-gray-700 text-white hover:border-teal-400'
            }`}
          >
            <Database className="w-4 h-4" />
            {useDummyData ? 'Using Dummy Data' : 'Use Dummy Data'}
          </button>

          <Link href="/find-teammates/preferences">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-900/80 backdrop-blur border-2 border-gray-700 rounded-lg text-white font-mono font-bold text-sm hover:border-teal-400 transition-all">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </Link>

          <Link href="/find-teammates/matches">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-900/80 backdrop-blur border-2 border-gray-700 rounded-lg text-white font-mono font-bold text-sm hover:border-teal-400 transition-all">
              <Users className="w-4 h-4" />
              Matches
            </button>
          </Link>

          {useDummyData && currentProfile && (
            <div className="ml-auto bg-yellow-500/20 border-2 border-yellow-400 rounded-lg px-4 py-2 text-yellow-300 font-mono font-bold text-sm">
              Profile {dummyProfileIndex + 1} / {mockMatchProfiles.length}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-black mt-4">
        {renderHeader()}
        <EmptyState onReload={loadNextProfile} useDummyData={useDummyData} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black mt-4">
      {/* Header */}
      {renderHeader()}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-32 lg:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Center Section - Profile Card (shown first on mobile) */}
          <div className="lg:col-span-1 lg:order-2 order-1 space-y-6">
            <ProfileCard
              profile={currentProfile}
              swipeDirection={swipeDirection}
              onPan={handlePan}
            />

            {/* Desktop Controls - Below Card */}
            <div className="hidden lg:flex flex-col items-center gap-4">
              <div className="flex justify-center items-center gap-6">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSwipeLeft}
                  disabled={isAnimating}
                  className="w-16 h-16 rounded-full bg-gray-900 border-4 border-red-500 flex items-center justify-center shadow-xl hover:shadow-2xl hover:shadow-red-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-8 h-8 text-red-500" />
                </motion.button>

                {canUndo && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleUndo}
                    className="w-12 h-12 rounded-full bg-gray-900 border-2 border-gray-700 flex items-center justify-center shadow-lg hover:shadow-xl hover:border-teal-400 transition-all"
                  >
                    <Undo2 className="w-5 h-5 text-gray-400 hover:text-teal-400" />
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSwipeRight}
                  disabled={isAnimating}
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center shadow-xl hover:shadow-2xl hover:shadow-pink-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Heart className="w-8 h-8 text-white" fill="white" />
                </motion.button>
              </div>

              {/* Keyboard Shortcuts Hint */}
              <div className="text-center text-sm text-gray-500 font-mono">
                Use <kbd className="px-2 py-1 bg-gray-900 border border-gray-700 rounded">←</kbd> and{' '}
                <kbd className="px-2 py-1 bg-gray-900 border border-gray-700 rounded">→</kbd> keys to swipe
              </div>
            </div>
          </div>

          {/* Right Section - Match Insights & Recent Projects (shown second on mobile, after card) */}
          <div className="lg:col-span-1 lg:order-3 order-2 space-y-6">
            <MatchInsights profile={currentProfile} />
            <RecentProjects projects={currentProfile.recentProjects} />
          </div>

          {/* Left Section - Stats (shown third on mobile, after match insights) */}
          <div className="lg:col-span-1 lg:order-1 order-3 space-y-6">
            <HackathonExperience profile={currentProfile} />
            <GitHubActivity profile={currentProfile} />
            <div className="hidden lg:block">
              <ContributionGraph profile={currentProfile} />
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Controls (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-gradient-to-t from-black via-black/95 to-transparent pt-8 pb-6 px-6 z-50">
        <div className="flex justify-center items-center gap-6 mb-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSwipeLeft}
            disabled={isAnimating}
            className="w-16 h-16 rounded-full bg-gray-900 border-4 border-red-500 flex items-center justify-center shadow-xl hover:shadow-2xl hover:shadow-red-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-8 h-8 text-red-500" />
          </motion.button>

          {canUndo && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUndo}
              className="w-12 h-12 rounded-full bg-gray-900 border-2 border-gray-700 flex items-center justify-center shadow-lg hover:shadow-xl hover:border-teal-400 transition-all"
            >
              <Undo2 className="w-5 h-5 text-gray-400 hover:text-teal-400" />
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSwipeRight}
            disabled={isAnimating}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center shadow-xl hover:shadow-2xl hover:shadow-pink-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Heart className="w-8 h-8 text-white" fill="white" />
          </motion.button>
        </div>
      </div>

      {/* Match Modal */}
      <MatchModal
        isOpen={matchModal}
        onClose={() => setMatchModal(false)}
        profile={matchedUser}
      />
    </div>
  )
}
