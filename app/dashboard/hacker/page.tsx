'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import {
  getHackerDashboardStats,
  getHackerUpcomingDeadlines,
  getHackerRecentActivity,
  getHackerPerformanceAnalytics,
} from '@/lib/actions/dashboard-actions'
import {
  Trophy,
  Calendar,
  TrendingUp,
  Activity as ActivityIcon,
  Clock,
  AlertCircle,
  ChevronRight,
  Target,
  Users,
  ArrowRightLeft,
  Briefcase,
} from 'lucide-react'
import { LineChart, Line, PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

export default function HackerDashboardOverview() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [deadlines, setDeadlines] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hasOrganizerRole, setHasOrganizerRole] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
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
      // ============================================================================

      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500))

      setHasOrganizerRole(true)

      setStats({
        totalParticipations: 12,
        hackathonsWon: 5,
        totalPrizeMoney: 25000,
        activeRegistrations: 3,
        winRate: 41.7
      })

      setDeadlines([
        {
          id: '1',
          hackathon_id: 'h1',
          title: 'AI Innovation Hackathon 2025',
          organization: 'TechCorp Malaysia',
          daysLeft: 2
        },
        {
          id: '2',
          hackathon_id: 'h2',
          title: 'Sustainable Tech Challenge',
          organization: 'GreenTech Inc',
          daysLeft: 5
        },
        {
          id: '3',
          hackathon_id: 'h3',
          title: 'FinTech Revolution',
          organization: 'BankTech Solutions',
          daysLeft: 10
        }
      ])

      setActivities([
        {
          id: '1',
          type: 'win',
          title: 'Won 1st Place',
          description: 'AI Innovation Hackathon 2025',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          link: '/hackathons/h1'
        },
        {
          id: '2',
          type: 'registration',
          title: 'Registered for Hackathon',
          description: 'Sustainable Tech Challenge',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          link: '/hackathons/h2'
        },
        {
          id: '3',
          type: 'badge',
          title: 'Earned Badge',
          description: 'Champion - Won 3 hackathons',
          timestamp: new Date(Date.now() - 259200000).toISOString(),
          link: '/dashboard/hacker/badges'
        }
      ])

      setAnalytics({
        participationsOverTime: [
          { month: 'Jul', count: 1 },
          { month: 'Aug', count: 2 },
          { month: 'Sep', count: 1 },
          { month: 'Oct', count: 3 },
          { month: 'Nov', count: 2 },
          { month: 'Dec', count: 3 }
        ],
        winRate: {
          won: 5,
          participated: 7
        },
        categoriesDistribution: [
          { category: 'AI/ML', count: 4 },
          { category: 'Web Dev', count: 3 },
          { category: 'Mobile', count: 2 },
          { category: 'IoT', count: 2 },
          { category: 'Blockchain', count: 1 }
        ]
      })

    } else {
      // ============================================================================
      // PRODUCTION CODE (uncomment for production)
      // ============================================================================

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      // Check if user has organizer role
      if (user) {
        const { count: organizerCount } = await supabase
          .from('hackathons')
          .select('*', { count: 'exact', head: true })
          .eq('created_by', user.id)

        setHasOrganizerRole((organizerCount || 0) > 0)
      }

      const [statsResult, deadlinesResult, activitiesResult, analyticsResult] = await Promise.all([
        getHackerDashboardStats(),
        getHackerUpcomingDeadlines(undefined, 5),
        getHackerRecentActivity(undefined, 10),
        getHackerPerformanceAnalytics(),
      ])

      if (statsResult.success) setStats(statsResult.data)
      if (deadlinesResult.success) setDeadlines(deadlinesResult.data)
      if (activitiesResult.success) setActivities(activitiesResult.data)
      if (analyticsResult.success) setAnalytics(analyticsResult.data)
    }

    setLoading(false)
  }

  function switchToOrganizer() {
    localStorage.setItem('lastDashboard', 'organizer')
    router.push('/dashboard/organizer')
  }

  const getUrgencyColor = (daysLeft: number) => {
    if (daysLeft <= 3) return 'text-red-400 bg-red-500/10 border-red-400'
    if (daysLeft <= 7) return 'text-yellow-400 bg-yellow-500/10 border-yellow-400'
    return 'text-green-400 bg-green-500/10 border-green-400'
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'registration': return '📝'
      case 'win': return '🏆'
      case 'badge': return '🏅'
      default: return '📌'
    }
  }

  const COLORS = ['#14b8a6', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981']

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-purple-400 mb-2">
            DASHBOARD OVERVIEW
          </h1>
          <p className="text-gray-400 font-mono">
            Welcome back! Here's your hackathon journey at a glance.
          </p>
        </div>
        {hasOrganizerRole && (
          <Button
            onClick={switchToOrganizer}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-mono font-bold border-2 border-purple-400/50 hover:border-purple-300 transition-all shadow-lg hover:shadow-purple-500/50"
          >
            <Briefcase className="h-4 w-4 mr-2" />
            Switch to Organizer
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Participations */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-700/10 border-2 border-blue-500/50 hover:border-blue-400 transition-all hover:shadow-lg hover:shadow-blue-500/20">
          <CardHeader className="pb-3">
            <CardDescription className="text-blue-400 font-mono font-bold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Total Participations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-blackops text-white mb-1">
              {stats?.totalParticipations || 0}
            </div>
            <p className="text-xs text-gray-400 font-mono">Hackathons joined</p>
          </CardContent>
        </Card>

        {/* Hackathons Won */}
        <Card className="bg-gradient-to-br from-green-500/10 to-green-700/10 border-2 border-green-500/50 hover:border-green-400 transition-all hover:shadow-lg hover:shadow-green-500/20">
          <CardHeader className="pb-3">
            <CardDescription className="text-green-400 font-mono font-bold flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Hackathons Won
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-blackops text-white mb-1">
              {stats?.hackathonsWon || 0}
            </div>
            <p className="text-xs text-gray-400 font-mono">
              {stats?.winRate?.toFixed(1) || 0}% win rate
            </p>
          </CardContent>
        </Card>

        {/* Total Prize Money */}
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-700/10 border-2 border-yellow-500/50 hover:border-yellow-400 transition-all hover:shadow-lg hover:shadow-yellow-500/20">
          <CardHeader className="pb-3">
            <CardDescription className="text-yellow-400 font-mono font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Prize Money
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-blackops text-white mb-1">
              RM{((stats?.totalPrizeMoney || 0) / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-gray-400 font-mono">Earnings to date</p>
          </CardContent>
        </Card>

        {/* Active Registrations */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-700/10 border-2 border-purple-500/50 hover:border-purple-400 transition-all hover:shadow-lg hover:shadow-purple-500/20">
          <CardHeader className="pb-3">
            <CardDescription className="text-purple-400 font-mono font-bold flex items-center gap-2">
              <Target className="h-4 w-4" />
              Active Registrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-blackops text-white mb-1">
              {stats?.activeRegistrations || 0}
            </div>
            <p className="text-xs text-gray-400 font-mono">Ongoing hackathons</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Participations Over Time */}
        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white font-blackops flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-cyan-400" />
              Participation Trend
            </CardTitle>
            <CardDescription className="font-mono">
              Your hackathon activity over the last 12 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.participationsOverTime && analytics.participationsOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={analytics.participationsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      border: '2px solid #14b8a6',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      padding: '12px',
                    }}
                    labelStyle={{ color: '#ffffff', fontWeight: 'bold', marginBottom: '4px' }}
                    itemStyle={{ color: '#e5e7eb', padding: '4px 0' }}
                    cursor={{ fill: 'rgba(20, 184, 166, 0.1)' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#14b8a6" strokeWidth={3} dot={{ fill: '#14b8a6', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-400 font-mono text-sm">No data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Win Rate Pie Chart */}
        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white font-blackops flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Win Rate
            </CardTitle>
            <CardDescription className="font-mono">
              Wins vs Participations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.winRate && (analytics.winRate.won > 0 || analytics.winRate.participated > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Won', value: analytics.winRate.won },
                      { name: 'Participated', value: analytics.winRate.participated },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#6b7280" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      border: '2px solid #10b981',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      padding: '12px',
                    }}
                    labelStyle={{ color: '#ffffff', fontWeight: 'bold', marginBottom: '4px' }}
                    itemStyle={{ color: '#e5e7eb', padding: '4px 0' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-400 font-mono text-sm">No data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Categories Distribution */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white font-blackops flex items-center gap-2">
            <ActivityIcon className="h-5 w-5 text-purple-400" />
            Participation by Category
          </CardTitle>
          <CardDescription className="font-mono">
            Your areas of interest
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics?.categoriesDistribution && analytics.categoriesDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.categoriesDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="category"
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '2px solid #8b5cf6',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    padding: '12px',
                  }}
                  labelStyle={{ color: '#ffffff', fontWeight: 'bold', marginBottom: '4px' }}
                  itemStyle={{ color: '#e5e7eb', padding: '4px 0' }}
                  cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                />
                <Bar dataKey="count" fill="#8b5cf6">
                  {analytics.categoriesDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-400 font-mono text-sm">No data available yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Deadlines & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white font-blackops flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-400" />
                Upcoming Deadlines
              </CardTitle>
              <Link
                href="/dashboard/hacker/hackathons"
                className="text-teal-400 hover:text-teal-300 text-sm font-mono font-bold flex items-center gap-1"
              >
                View All
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <CardDescription className="font-mono">
              Don't miss out on these events
            </CardDescription>
          </CardHeader>
          <CardContent>
            {deadlines.length > 0 ? (
              <div className="space-y-3">
                {deadlines.map((deadline) => (
                  <Link
                    key={deadline.id}
                    href={`/hackathons/${deadline.hackathon_id}`}
                    className="block p-3 rounded-lg border-2 border-gray-800 hover:border-teal-400 transition-all bg-gray-900/50 hover:bg-gray-800/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-sm mb-1 truncate">
                          {deadline.title}
                        </h4>
                        <p className="text-xs text-gray-400 font-mono truncate">
                          {deadline.organization}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded-md text-xs font-mono font-bold border-2 ${getUrgencyColor(deadline.daysLeft)}`}>
                        {deadline.daysLeft === 0 ? 'Today' : `${deadline.daysLeft}d left`}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-600 mb-3" />
                <p className="text-gray-400 font-mono text-sm">No upcoming deadlines</p>
                <Link
                  href="/hackathons"
                  className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-mono font-bold text-sm transition-all"
                >
                  Browse Hackathons
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white font-blackops flex items-center gap-2">
                <ActivityIcon className="h-5 w-5 text-cyan-400" />
                Recent Activity
              </CardTitle>
              <Link
                href="/dashboard/hacker/activity"
                className="text-teal-400 hover:text-teal-300 text-sm font-mono font-bold flex items-center gap-1"
              >
                View All
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <CardDescription className="font-mono">
              Your latest actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <Link
                    key={activity.id}
                    href={activity.link || '#'}
                    className="block p-3 rounded-lg border-2 border-gray-800 hover:border-cyan-400 transition-all bg-gray-900/50 hover:bg-gray-800/50"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-sm mb-1">
                          {activity.title}
                        </h4>
                        <p className="text-xs text-gray-400 font-mono">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 font-mono mt-1">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <ActivityIcon className="h-12 w-12 text-gray-600 mb-3" />
                <p className="text-gray-400 font-mono text-sm">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
