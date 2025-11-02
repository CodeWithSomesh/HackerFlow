'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Heart,
  Star,
  MapPin,
  Briefcase,
  Trophy,
  Github,
  MessageCircle,
  Search,
  Filter,
  ArrowLeft,
  Sparkles,
  Calendar,
  Loader2,
  Database
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { getMatches, MatchProfile } from '@/lib/actions/matchmaking-actions'
import { mockMatchProfiles } from '@/lib/mockMatchmakingData'
import { showCustomToast } from '@/components/toast-notification'
import { triggerFireworks } from '@/lib/confetti'

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchProfile[]>([])
  const [filteredMatches, setFilteredMatches] = useState<MatchProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterScore, setFilterScore] = useState<'all' | 'high' | 'medium'>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'score'>('recent')
  const [useDummyData, setUseDummyData] = useState(false)

  useEffect(() => {
    loadMatches()
  }, [useDummyData])

  useEffect(() => {
    applyFilters()
  }, [matches, searchQuery, filterScore, sortBy])

  const loadMatches = async () => {
    setLoading(true)

    if (useDummyData) {
      // Use dummy data - simulate matched profiles
      const dummyMatches = mockMatchProfiles.slice(0, 3).map(profile => ({
        ...profile,
        matchedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      }))
      setMatches(dummyMatches)
    } else {
      const result = await getMatches()

      if (result.success && result.data) {
        setMatches(result.data)
      } else {
        toast.error(result.error || 'Failed to load matches')
      }
    }

    setLoading(false)
  }

  const toggleDummyData = () => {
    setUseDummyData(!useDummyData)
  }

  const applyFilters = () => {
    let filtered = [...matches]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(match =>
        match.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.programming_languages?.some(lang =>
          lang.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    // Apply score filter
    if (filterScore === 'high') {
      filtered = filtered.filter(match => match.compatibilityScore >= 80)
    } else if (filterScore === 'medium') {
      filtered = filtered.filter(
        match => match.compatibilityScore >= 60 && match.compatibilityScore < 80
      )
    }

    // Apply sorting
    if (sortBy === 'score') {
      filtered.sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    } else {
      // Recent matches (matched_at)
      filtered.sort((a, b) => {
        const dateA = new Date(a.matchedAt || 0).getTime()
        const dateB = new Date(b.matchedAt || 0).getTime()
        return dateB - dateA
      })
    }

    setFilteredMatches(filtered)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-mono font-bold">Loading your matches...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black mt-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-500 to-yellow-400 border-y-4 border-pink-400 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href="/find-teammates">
                <button className="p-2 rounded-lg bg-gray-900/80 backdrop-blur border-2 border-gray-700 hover:border-teal-400 transition-all">
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
              </Link>

              <div>
                <h1 className="text-5xl font-blackops text-white drop-shadow-lg">
                  YOUR MATCHES
                </h1>
                <p className="text-xl text-white/90 font-mono mt-1">
                  {matches.length} mutual {matches.length === 1 ? 'match' : 'matches'}
                </p>
              </div>
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
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

            {useDummyData && (
              <div className="bg-yellow-500/20 border-2 border-yellow-400 rounded-lg px-4 py-2 text-yellow-300 font-mono font-bold text-sm">
                {matches.length} Dummy {matches.length === 1 ? 'Match' : 'Matches'}
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="bg-gray-900/80 backdrop-blur rounded-xl p-4 border-2 border-gray-700">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-black border-2 border-gray-700 text-white placeholder-gray-500 font-mono focus:outline-none focus:border-teal-400 transition-all"
                />
              </div>

              {/* Score Filter */}
              <select
                value={filterScore}
                onChange={(e) => setFilterScore(e.target.value as any)}
                className="px-4 py-2.5 rounded-lg bg-black border-2 border-gray-700 text-white font-mono font-bold focus:outline-none focus:border-teal-400 transition-all"
              >
                <option value="all">All Scores</option>
                <option value="high">High (80%+)</option>
                <option value="medium">Medium (60-79%)</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2.5 rounded-lg bg-black border-2 border-gray-700 text-white font-mono font-bold focus:outline-none focus:border-teal-400 transition-all"
              >
                <option value="recent">Recent Matches</option>
                <option value="score">Highest Score</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Matches Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredMatches.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💔</div>
            <h2 className="text-3xl font-blackops text-white mb-2 uppercase tracking-wide">
              {searchQuery || filterScore !== 'all'
                ? 'No matches found'
                : 'No matches yet'}
            </h2>
            <p className="text-gray-400 font-mono mb-6">
              {searchQuery || filterScore !== 'all'
                ? 'Try adjusting your filters'
                : 'Start swiping to find your perfect teammate!'}
            </p>
            <Link href="/find-teammates">
              <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-mono font-bold hover:shadow-lg hover:shadow-pink-500/50 transition-all">
                Start Swiping
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((match, idx) => (
              <MatchCard key={match.user_id} match={match} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// =====================================================
// MATCH CARD COMPONENT
// =====================================================

function MatchCard({ match, index }: { match: MatchProfile; index: number }) {
  const topSkills = [...(match.programming_languages || []), ...(match.frameworks || [])].slice(0, 3)

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-400 to-emerald-500'
    if (score >= 60) return 'from-yellow-400 to-amber-500'
    return 'from-orange-400 to-red-500'
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-700 hover:border-teal-400 transition-all group"
    >
      {/* Profile Header */}
      <div className="relative h-32 bg-gradient-to-br from-teal-600 via-cyan-500 to-blue-600 flex items-center justify-center">
        <div className="text-white text-5xl font-blackops">
          {match.full_name?.charAt(0).toUpperCase()}
        </div>

        {/* Match Score Badge */}
        <div className={`absolute top-4 right-4 w-16 h-16 rounded-full bg-gradient-to-br ${getScoreColor(match.compatibilityScore)} flex items-center justify-center shadow-lg border-2 border-white`}>
          <div className="text-center">
            <div className="text-lg font-blackops text-white">{Math.round(match.compatibilityScore)}</div>
            <div className="text-[8px] text-white/90 font-mono font-bold">MATCH</div>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-blackops text-white mb-1 uppercase tracking-wide">
            {match.full_name}
            {match.age && <span className="text-lg text-gray-400 ml-2">{match.age}</span>}
          </h3>

          <div className="flex items-center gap-2 text-sm text-gray-300 mb-1 font-mono">
            <Briefcase className="w-4 h-4 text-teal-400" />
            <span className="line-clamp-1">
              {match.position || 'Student'}
              {match.company && ` @ ${match.company}`}
              {match.university && ` @ ${match.university}`}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-300 font-mono">
            <MapPin className="w-4 h-4 text-teal-400" />
            <span>
              {match.city}
              {match.state && `, ${match.state}`}
            </span>
          </div>

          {match.matchedAt && (
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-2 font-mono">
              <Calendar className="w-3 h-3 text-yellow-400" />
              <span>Matched {formatDate(match.matchedAt)}</span>
            </div>
          )}
        </div>

        {/* Skills */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {topSkills.map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-1 rounded-md text-xs font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/50"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-black/50 rounded-xl border border-gray-700">
          <div className="text-center">
            <div className="text-sm font-blackops text-white">
              {match.hackathonStats.participated}
            </div>
            <div className="text-[10px] text-gray-400 uppercase font-mono font-bold">
              Hackathons
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm font-blackops text-white">
              {match.hackathonStats.won}
            </div>
            <div className="text-[10px] text-gray-400 uppercase font-mono font-bold">
              Wins
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm font-blackops text-white">
              {match.githubStats.repositories}
            </div>
            <div className="text-[10px] text-gray-400 uppercase font-mono font-bold">
              Repos
            </div>
          </div>
        </div>

        {/* Match Insight Preview */}
        {match.matchingFactors.whyGreatTogether && match.matchingFactors.whyGreatTogether.length > 0 && (
          <div className="mb-4 p-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl border-2 border-pink-400/50">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-200 font-mono line-clamp-2">
                {match.matchingFactors.whyGreatTogether[0]}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              triggerFireworks()
              showCustomToast('success', `Friend request sent to ${match.full_name}! 🎉`)
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-mono font-bold hover:shadow-lg hover:shadow-pink-500/50 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Message</span>
          </button>

          <button
            onClick={() => toast.info('Profile view coming soon!')}
            className="px-4 py-2.5 bg-gray-700 text-white rounded-lg font-mono font-bold hover:bg-gray-600 transition-all"
          >
            View
          </button>
        </div>
      </div>
    </motion.div>
  )
}
