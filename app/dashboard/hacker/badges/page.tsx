'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { checkAndAwardBadges } from '@/lib/actions/dashboard-actions'
import {
  Award,
  Trophy,
  Target,
  Zap,
  Star,
  Users,
  Calendar,
  TrendingUp,
  Lock,
  CheckCircle2,
} from 'lucide-react'

// Define badge types and their requirements
const BADGE_DEFINITIONS = [
  {
    id: 'first_participation',
    name: 'First Steps',
    description: 'Participate in your first hackathon',
    icon: '🎯',
    category: 'participation',
    requirement: 'Participate in 1 hackathon',
    rarity: 'common',
  },
  {
    id: 'participation_streak_3',
    name: 'On a Roll',
    description: 'Participate in 3 hackathons',
    icon: '🔥',
    category: 'participation',
    requirement: 'Participate in 3 hackathons',
    rarity: 'common',
  },
  {
    id: 'participation_streak_10',
    name: 'Veteran Hacker',
    description: 'Participate in 10 hackathons',
    icon: '⭐',
    category: 'participation',
    requirement: 'Participate in 10 hackathons',
    rarity: 'rare',
  },
  {
    id: 'first_win',
    name: 'First Victory',
    description: 'Win your first hackathon',
    icon: '🏆',
    category: 'achievement',
    requirement: 'Win 1 hackathon',
    rarity: 'uncommon',
  },
  {
    id: 'win_streak_3',
    name: 'Champion',
    description: 'Win 3 hackathons',
    icon: '👑',
    category: 'achievement',
    requirement: 'Win 3 hackathons',
    rarity: 'rare',
  },
  {
    id: 'win_streak_5',
    name: 'Legend',
    description: 'Win 5 hackathons',
    icon: '💎',
    category: 'achievement',
    requirement: 'Win 5 hackathons',
    rarity: 'epic',
  },
  {
    id: 'team_player',
    name: 'Team Player',
    description: 'Join a team in a hackathon',
    icon: '🤝',
    category: 'social',
    requirement: 'Join 1 team',
    rarity: 'common',
  },
  {
    id: 'team_leader',
    name: 'Team Leader',
    description: 'Create and lead a team',
    icon: '👨‍💼',
    category: 'social',
    requirement: 'Lead 1 team',
    rarity: 'uncommon',
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Register within 24 hours of hackathon announcement',
    icon: '🐦',
    category: 'special',
    requirement: 'Early registration',
    rarity: 'uncommon',
  },
  {
    id: 'prize_collector',
    name: 'Prize Collector',
    description: 'Earn RM 10,000 in total prize money',
    icon: '💰',
    category: 'achievement',
    requirement: 'Earn RM 10,000',
    rarity: 'rare',
  },
]

export default function BadgesPage() {
  const [earnedBadges, setEarnedBadges] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBadges()
  }, [])

  async function loadBadges() {
    setLoading(true)

    // ============================================================================
    // DUMMY DATA TOGGLE - Check localStorage
    // For production: Remove dummy data section and localStorage check
    // ============================================================================
    const useDummyData = typeof window !== 'undefined'
      ? localStorage.getItem('useDummyData') !== 'false'
      : true

    if (useDummyData) {
      // ============================================================================
      // DUMMY DATA (for development/demo)
      // TO REMOVE FOR PRODUCTION: Delete this entire if block
      // ============================================================================
      await new Promise(resolve => setTimeout(resolve, 500))

      setEarnedBadges([
        {
          id: '1',
          badge_id: 'first_participation',
          earned_at: new Date(Date.now() - 31536000000).toISOString(),
        },
        {
          id: '2',
          badge_id: 'participation_streak_3',
          earned_at: new Date(Date.now() - 15768000000).toISOString(),
        },
        {
          id: '3',
          badge_id: 'first_win',
          earned_at: new Date(Date.now() - 10368000000).toISOString(),
        },
        {
          id: '4',
          badge_id: 'team_player',
          earned_at: new Date(Date.now() - 25920000000).toISOString(),
        },
        {
          id: '5',
          badge_id: 'win_streak_3',
          earned_at: new Date(Date.now() - 2592000000).toISOString(),
        },
      ])

      setStats({
        participations: 8,
        wins: 4,
        teamsJoined: 6,
        teamsLed: 2,
        totalPrize: 25000,
      })
    } else {
      // ============================================================================
      // PRODUCTION CODE
      // This code fetches real data from the database
      // ============================================================================
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      // Check and award any new badges before fetching
      await checkAndAwardBadges()

      // Get earned badges
      const { data: badges } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false })

      if (badges) {
        setEarnedBadges(badges)
      }

      // Get user stats for progress tracking
      const { count: participations } = await supabase
        .from('hackathon_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const { count: wins } = await supabase
        .from('hackathon_winners')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const { count: teamsJoined } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const { count: teamsLed } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_leader', true)

      const { data: prizeData } = await supabase
        .from('hackathon_winners')
        .select('prize_amount')
        .eq('user_id', user.id)

      const totalPrize = prizeData?.reduce((sum, p) => sum + (p.prize_amount || 0), 0) || 0

      setStats({
        participations: participations || 0,
        wins: wins || 0,
        teamsJoined: teamsJoined || 0,
        teamsLed: teamsLed || 0,
        totalPrize,
      })
    }

    setLoading(false)
  }

  const isBadgeEarned = (badgeId: string) => {
    return earnedBadges.some(b => b.badge_type === badgeId)
  }

  const getBadgeProgress = (badgeId: string) => {
    if (!stats) return 0

    switch (badgeId) {
      case 'first_participation':
        return Math.min((stats.participations / 1) * 100, 100)
      case 'participation_streak_3':
        return Math.min((stats.participations / 3) * 100, 100)
      case 'participation_streak_10':
        return Math.min((stats.participations / 10) * 100, 100)
      case 'first_win':
        return Math.min((stats.wins / 1) * 100, 100)
      case 'win_streak_3':
        return Math.min((stats.wins / 3) * 100, 100)
      case 'win_streak_5':
        return Math.min((stats.wins / 5) * 100, 100)
      case 'team_player':
        return Math.min((stats.teamsJoined / 1) * 100, 100)
      case 'team_leader':
        return Math.min((stats.teamsLed / 1) * 100, 100)
      case 'prize_collector':
        return Math.min((stats.totalPrize / 10000) * 100, 100)
      default:
        return 0
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-500 bg-gray-500/10'
      case 'uncommon':
        return 'border-green-500 bg-green-500/10'
      case 'rare':
        return 'border-blue-500 bg-blue-500/10'
      case 'epic':
        return 'border-purple-500 bg-purple-500/10'
      default:
        return 'border-gray-500 bg-gray-500/10'
    }
  }

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return <Badge className="bg-gray-600">Common</Badge>
      case 'uncommon':
        return <Badge className="bg-green-600">Uncommon</Badge>
      case 'rare':
        return <Badge className="bg-blue-600">Rare</Badge>
      case 'epic':
        return <Badge className="bg-purple-600">Epic</Badge>
      default:
        return <Badge variant="secondary">{rarity}</Badge>
    }
  }

  const earnedBadgesList = BADGE_DEFINITIONS.filter(b => isBadgeEarned(b.id))
  const lockedBadgesList = BADGE_DEFINITIONS.filter(b => !isBadgeEarned(b.id))

  const categorizedBadges = {
    participation: BADGE_DEFINITIONS.filter(b => b.category === 'participation'),
    achievement: BADGE_DEFINITIONS.filter(b => b.category === 'achievement'),
    social: BADGE_DEFINITIONS.filter(b => b.category === 'social'),
    special: BADGE_DEFINITIONS.filter(b => b.category === 'special'),
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-purple-400 mb-2">
          MY BADGES
        </h1>
        <p className="text-gray-400 font-mono">
          Collect badges by participating and achieving milestones
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-700/10 border-2 border-yellow-500/50 hover:border-yellow-400 transition-all">
          <CardHeader className="pb-3">
            <CardDescription className="text-yellow-400 font-mono font-bold flex items-center gap-2">
              <Award className="h-4 w-4" />
              Badges Earned
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-blackops text-white mb-1">
              {earnedBadgesList.length}
            </div>
            <p className="text-xs text-gray-400 font-mono">
              of {BADGE_DEFINITIONS.length} total badges
            </p>
            <Progress
              value={(earnedBadgesList.length / BADGE_DEFINITIONS.length) * 100}
              className="mt-3 h-2"
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-700/10 border-2 border-purple-500/50 hover:border-purple-400 transition-all">
          <CardHeader className="pb-3">
            <CardDescription className="text-purple-400 font-mono font-bold flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Completion Rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-blackops text-white mb-1">
              {Math.round((earnedBadgesList.length / BADGE_DEFINITIONS.length) * 100)}%
            </div>
            <p className="text-xs text-gray-400 font-mono">Badge collection progress</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-700/10 border-2 border-blue-500/50 hover:border-blue-400 transition-all">
          <CardHeader className="pb-3">
            <CardDescription className="text-blue-400 font-mono font-bold flex items-center gap-2">
              <Star className="h-4 w-4" />
              Latest Badge
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl mb-1">
              {earnedBadges.length > 0
                ? BADGE_DEFINITIONS.find(b => b.id === earnedBadges[0].badge_type)?.icon || earnedBadges[0].badge_icon || '🏅'
                : '🔒'}
            </div>
            <p className="text-xs text-gray-400 font-mono">
              {earnedBadges.length > 0
                ? new Date(earnedBadges[0].earned_at).toLocaleDateString()
                : 'No badges yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Badges Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="all">All Badges</TabsTrigger>
          <TabsTrigger value="earned">Earned ({earnedBadgesList.length})</TabsTrigger>
          <TabsTrigger value="locked">Locked ({lockedBadgesList.length})</TabsTrigger>
        </TabsList>

        {/* All Badges */}
        <TabsContent value="all" className="mt-6">
          <div className="space-y-8">
            {Object.entries(categorizedBadges).map(([category, badges]) => (
              <div key={category}>
                <h2 className="text-2xl font-blackops text-white mb-4 capitalize flex items-center gap-2">
                  <span className="h-px flex-1 bg-gradient-to-r from-teal-400 to-transparent"></span>
                  {category} Badges
                  <span className="h-px flex-1 bg-gradient-to-l from-teal-400 to-transparent"></span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {badges.map((badge) => {
                    const isEarned = isBadgeEarned(badge.id)
                    const progress = getBadgeProgress(badge.id)

                    return (
                      <Card
                        key={badge.id}
                        className={`bg-gradient-to-br from-gray-900 to-black border-2 ${
                          isEarned ? getRarityColor(badge.rarity) : 'border-gray-800'
                        } transition-all ${isEarned ? 'hover:shadow-lg' : 'opacity-60'}`}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <div
                              className={`text-5xl flex-shrink-0 ${
                                !isEarned ? 'grayscale opacity-50' : ''
                              }`}
                            >
                              {isEarned ? badge.icon : '🔒'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-blackops text-white text-lg mb-1">{badge.name}</h3>
                              <p className="text-sm text-gray-400 font-mono mb-2">
                                {badge.description}
                              </p>
                              {getRarityBadge(badge.rarity)}
                            </div>
                          </div>

                          {isEarned ? (
                            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                              <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                              <span className="text-sm text-green-400 font-mono font-bold">
                                Earned on{' '}
                                {new Date(
                                  earnedBadges.find(b => b.badge_type === badge.id)?.earned_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-400 font-mono">
                                  {badge.requirement}
                                </span>
                                <span className="text-xs text-gray-400 font-mono font-bold">
                                  {Math.round(progress)}%
                                </span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Earned Badges */}
        <TabsContent value="earned" className="mt-6">
          {earnedBadgesList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {earnedBadgesList.map((badge) => (
                <Card
                  key={badge.id}
                  className={`bg-gradient-to-br from-gray-900 to-black border-2 ${getRarityColor(
                    badge.rarity
                  )} hover:shadow-lg transition-all`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-5xl flex-shrink-0">{badge.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-blackops text-white text-lg mb-1">{badge.name}</h3>
                        <p className="text-sm text-gray-400 font-mono mb-2">{badge.description}</p>
                        {getRarityBadge(badge.rarity)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span className="text-sm text-green-400 font-mono font-bold">
                        Earned on{' '}
                        {new Date(
                          earnedBadges.find(b => b.badge_type === badge.id)?.earned_at
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Lock className="h-16 w-16 text-gray-600 mb-4" />
                <h3 className="text-xl font-blackops text-white mb-2">No Badges Earned Yet</h3>
                <p className="text-gray-400 font-mono text-sm text-center">
                  Start participating in hackathons to unlock badges
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Locked Badges */}
        <TabsContent value="locked" className="mt-6">
          {lockedBadgesList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lockedBadgesList.map((badge) => {
                const progress = getBadgeProgress(badge.id)

                return (
                  <Card
                    key={badge.id}
                    className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800 opacity-60 hover:opacity-100 transition-all"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="text-5xl flex-shrink-0 grayscale opacity-50">🔒</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-blackops text-white text-lg mb-1">{badge.name}</h3>
                          <p className="text-sm text-gray-400 font-mono mb-2">{badge.description}</p>
                          {getRarityBadge(badge.rarity)}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400 font-mono">{badge.requirement}</span>
                          <span className="text-xs text-gray-400 font-mono font-bold">
                            {Math.round(progress)}%
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Trophy className="h-16 w-16 text-yellow-400 mb-4" />
                <h3 className="text-xl font-blackops text-white mb-2">All Badges Unlocked!</h3>
                <p className="text-gray-400 font-mono text-sm text-center">
                  Congratulations! You've earned every badge available.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
