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
  getOrganizerDashboardStats,
  getOrganizerHackathons,
  getOrganizerAnalytics,
} from '@/lib/actions/dashboard-actions'
import {
  Folder,
  Users,
  Activity as ActivityIcon,
  TrendingUp,
  DollarSign,
  ChevronRight,
  Plus,
  BarChart3,
  UserCircle,
  ArrowRightLeft,
} from 'lucide-react'
import { LineChart, Line, PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

export default function OrganizerDashboardOverview() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [recentHackathons, setRecentHackathons] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hasHackerRole, setHasHackerRole] = useState(false)

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

      setHasHackerRole(true)

      setStats({
        totalHackathons: 8,
        totalParticipants: 245,
        activeHackathons: 3,
        totalPrizePoolDistributed: 85000,
        avgParticipantsPerHackathon: 31
      })

      setRecentHackathons([
        {
          id: 'h1',
          title: 'AI Innovation Hackathon 2025',
          organization: 'TechCorp Malaysia',
          status: 'published',
          participant_count: 45,
          start_date: new Date(Date.now() + 604800000).toISOString(),
          end_date: new Date(Date.now() + 1209600000).toISOString()
        },
        {
          id: 'h2',
          title: 'Sustainable Tech Challenge',
          organization: 'GreenTech Inc',
          status: 'published',
          participant_count: 38,
          start_date: new Date(Date.now() + 1209600000).toISOString(),
          end_date: new Date(Date.now() + 1814400000).toISOString()
        },
        {
          id: 'h3',
          title: 'FinTech Revolution',
          organization: 'BankTech Solutions',
          status: 'completed',
          participant_count: 52,
          start_date: new Date(Date.now() - 2592000000).toISOString(),
          end_date: new Date(Date.now() - 1987200000).toISOString()
        },
        {
          id: 'h4',
          title: 'Healthcare Innovation Summit',
          organization: 'MedTech Alliance',
          status: 'completed',
          participant_count: 41,
          start_date: new Date(Date.now() - 5184000000).toISOString(),
          end_date: new Date(Date.now() - 4579200000).toISOString()
        },
        {
          id: 'h5',
          title: 'Smart City Challenge',
          organization: 'Urban Tech Labs',
          status: 'draft',
          participant_count: 0,
          start_date: new Date(Date.now() + 2592000000).toISOString(),
          end_date: new Date(Date.now() + 3196800000).toISOString()
        }
      ])

      setAnalytics({
        registrationsOverTime: [
          { month: 'Jul', count: 25 },
          { month: 'Aug', count: 32 },
          { month: 'Sep', count: 28 },
          { month: 'Oct', count: 45 },
          { month: 'Nov', count: 38 },
          { month: 'Dec', count: 52 }
        ],
        participantDistribution: {
          team: 165,
          individual: 80
        },
        participantsPerHackathon: [
          { hackathon: 'AI Innov...', participants: 45 },
          { hackathon: 'Sustain...', participants: 38 },
          { hackathon: 'FinTech...', participants: 52 },
          { hackathon: 'Healthca...', participants: 41 },
          { hackathon: 'Smart Ci...', participants: 35 }
        ]
      })

    } else {
      // ============================================================================
      // PRODUCTION CODE (uncomment for production)
      // ============================================================================

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      // Check if user has hacker role
      if (user) {
        const { count: hackerCount } = await supabase
          .from('hackathon_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        setHasHackerRole((hackerCount || 0) > 0)
      }

      const [statsResult, hackathonsResult, analyticsResult] = await Promise.all([
        getOrganizerDashboardStats(),
        getOrganizerHackathons(undefined, { page: 1, limit: 5 }),
        getOrganizerAnalytics(),
      ])

      if (statsResult.success) setStats(statsResult.data)
      if (hackathonsResult.success) setRecentHackathons(hackathonsResult.data)
      if (analyticsResult.success) setAnalytics(analyticsResult.data)
    }

    setLoading(false)
  }

  function switchToHacker() {
    localStorage.setItem('lastDashboard', 'hacker')
    router.push('/dashboard/hacker')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary" className="bg-gray-700">Draft</Badge>
      case 'published':
        return <Badge className="bg-green-600">Published</Badge>
      case 'completed':
        return <Badge className="bg-blue-600">Completed</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const COLORS = ['#14b8a6', '#06b6d4']

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 mb-2">
            ORGANIZER DASHBOARD
          </h1>
          <p className="text-gray-400 font-mono">
            Manage your hackathons and track participant engagement
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {hasHackerRole && (
            <Button
              onClick={switchToHacker}
              className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-mono font-bold border-2 border-teal-400/50 hover:border-teal-300 transition-all shadow-lg hover:shadow-teal-500/50"
            >
              <UserCircle className="h-4 w-4 mr-2" />
              Switch to Hacker
            </Button>
          )}
          <Link href="/organize/step1">
            <Button className="bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold">
              <Plus className="h-4 w-4 mr-2" />
              Create Hackathon
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-700/10 border-2 border-purple-500/50 hover:border-purple-400 transition-all">
          <CardHeader className="pb-3">
            <CardDescription className="text-purple-400 font-mono font-bold flex items-center gap-2">
              <Folder className="h-4 w-4" />
              Total Hackathons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-blackops text-white mb-1">
              {stats?.totalHackathons || 0}
            </div>
            <p className="text-xs text-gray-400 font-mono">Events created</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-700/10 border-2 border-blue-500/50 hover:border-blue-400 transition-all">
          <CardHeader className="pb-3">
            <CardDescription className="text-blue-400 font-mono font-bold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Participants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-blackops text-white mb-1">
              {stats?.totalParticipants || 0}
            </div>
            <p className="text-xs text-gray-400 font-mono">Across all events</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-700/10 border-2 border-green-500/50 hover:border-green-400 transition-all">
          <CardHeader className="pb-3">
            <CardDescription className="text-green-400 font-mono font-bold flex items-center gap-2">
              <ActivityIcon className="h-4 w-4" />
              Active Hackathons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-blackops text-white mb-1">
              {stats?.activeHackathons || 0}
            </div>
            <p className="text-xs text-gray-400 font-mono">Currently open</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-700/10 border-2 border-yellow-500/50 hover:border-yellow-400 transition-all">
          <CardHeader className="pb-3">
            <CardDescription className="text-yellow-400 font-mono font-bold flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Prize Pool Distributed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-blackops text-white mb-1">
              RM{((stats?.totalPrizePoolDistributed || 0) / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-gray-400 font-mono">Total awarded</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-700/10 border-2 border-cyan-500/50 hover:border-cyan-400 transition-all">
          <CardHeader className="pb-3">
            <CardDescription className="text-cyan-400 font-mono font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg Participants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-blackops text-white mb-1">
              {stats?.avgParticipantsPerHackathon || 0}
            </div>
            <p className="text-xs text-gray-400 font-mono">Per hackathon</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registrations Over Time */}
        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white font-blackops flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              Registration Trend
            </CardTitle>
            <CardDescription className="font-mono">
              Last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.registrationsOverTime && analytics.registrationsOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={analytics.registrationsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      border: '2px solid #a855f7',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      padding: '12px',
                    }}
                    labelStyle={{ color: '#ffffff', fontWeight: 'bold', marginBottom: '4px' }}
                    itemStyle={{ color: '#e5e7eb', padding: '4px 0' }}
                    cursor={{ fill: 'rgba(168, 85, 247, 0.1)' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#a855f7" strokeWidth={3} dot={{ fill: '#a855f7', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-400 font-mono text-sm">No data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team vs Individual */}
        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white font-blackops flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-400" />
              Participation Type
            </CardTitle>
            <CardDescription className="font-mono">
              Team vs Individual distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.participantDistribution && (analytics.participantDistribution.team > 0 || analytics.participantDistribution.individual > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Team', value: analytics.participantDistribution.team },
                      { name: 'Individual', value: analytics.participantDistribution.individual },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
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

      {/* Participants Per Hackathon */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white font-blackops flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            Top Hackathons by Participants
          </CardTitle>
          <CardDescription className="font-mono">
            Most popular events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics?.participantsPerHackathon && analytics.participantsPerHackathon.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.participantsPerHackathon}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="hackathon"
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
                    border: '2px solid #10b981',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    padding: '12px',
                  }}
                  labelStyle={{ color: '#ffffff', fontWeight: 'bold', marginBottom: '4px' }}
                  itemStyle={{ color: '#e5e7eb', padding: '4px 0' }}
                  cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                />
                <Bar dataKey="participants" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-400 font-mono text-sm">No data available yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Hackathons */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white font-blackops">Recent Hackathons</CardTitle>
            <Link
              href="/dashboard/organizer/hackathons"
              className="text-purple-400 hover:text-purple-300 text-sm font-mono font-bold flex items-center gap-1"
            >
              View All
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentHackathons.length > 0 ? (
            <div className="space-y-3">
              {recentHackathons.map((hackathon) => (
                <Link
                  key={hackathon.id}
                  href={`/dashboard/organizer/hackathons/${hackathon.id}`}
                  className="block p-4 rounded-lg border-2 border-gray-800 hover:border-purple-400 transition-all bg-gray-900/50 hover:bg-gray-800/50"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white text-base mb-1">{hackathon.title}</h4>
                      <p className="text-sm text-gray-400 font-mono">{hackathon.organization}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <p className="text-2xl font-blackops text-purple-400">{hackathon.participant_count || 0}</p>
                        <p className="text-xs text-gray-500 font-mono">Participants</p>
                      </div>
                      {getStatusBadge(hackathon.status)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Folder className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 font-mono text-sm mb-4">No hackathons yet</p>
              <Link href="/organize/step1">
                <Button className="bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Hackathon
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
