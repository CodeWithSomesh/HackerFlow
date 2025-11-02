'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Target,
  Award,
  DollarSign,
  ArrowLeft,
  Clock,
  UserCheck,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'

export default function HackathonAnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const hackathonId = params.id as string

  const [hackathon, setHackathon] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [hackathonId])

  async function loadAnalytics() {
    setLoading(true)
    const supabase = createClient()

    // Get hackathon details
    const { data: hackathonData } = await supabase
      .from('hackathons')
      .select('*')
      .eq('id', hackathonId)
      .single()

    if (hackathonData) {
      setHackathon(hackathonData)
    }

    // Get registrations
    const { data: registrations, count: totalRegistrations } = await supabase
      .from('hackathon_registrations')
      .select('*', { count: 'exact' })
      .eq('hackathon_id', hackathonId)

    // Get teams
    const { data: teams, count: totalTeams } = await supabase
      .from('hackathon_teams')
      .select('*', { count: 'exact' })
      .eq('hackathon_id', hackathonId)

    // Get winners
    const { data: winners, count: totalWinners } = await supabase
      .from('hackathon_winners')
      .select('*', { count: 'exact' })
      .eq('hackathon_id', hackathonId)

    // Calculate analytics
    const teamRegistrations = registrations?.filter(r => r.participation_type === 'team').length || 0
    const individualRegistrations = registrations?.filter(r => r.participation_type === 'individual').length || 0

    // Registration timeline (group by day)
    const registrationTimeline = registrations?.reduce((acc: any[], reg: any) => {
      const date = new Date(reg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const existing = acc.find(item => item.date === date)
      if (existing) {
        existing.count += 1
      } else {
        acc.push({ date, count: 1 })
      }
      return acc
    }, []) || []

    // Registration status breakdown
    const statusBreakdown = registrations?.reduce((acc: any, reg: any) => {
      acc[reg.registration_status] = (acc[reg.registration_status] || 0) + 1
      return acc
    }, {}) || {}

    // Team size distribution
    const teamSizeDistribution = teams?.reduce((acc: any[], team: any) => {
      const size = team.team_size_current
      const existing = acc.find(item => item.size === size)
      if (existing) {
        existing.count += 1
      } else {
        acc.push({ size: `${size} members`, count: 1 })
      }
      return acc
    }, []) || []

    // Payment status for winners
    const paymentStatus = winners?.reduce((acc: any, winner: any) => {
      acc[winner.payment_status] = (acc[winner.payment_status] || 0) + 1
      return acc
    }, {}) || {}

    setAnalytics({
      totalRegistrations: totalRegistrations || 0,
      totalTeams: totalTeams || 0,
      totalWinners: totalWinners || 0,
      teamRegistrations,
      individualRegistrations,
      registrationTimeline,
      statusBreakdown,
      teamSizeDistribution,
      paymentStatus,
      registrations,
      teams,
      winners,
    })

    setLoading(false)
  }

  const COLORS = ['#14b8a6', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981']

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
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

  if (!hackathon) {
    return (
      <div className="p-4 md:p-6">
        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-gray-400 font-mono">Hackathon not found</p>
            <Button onClick={() => router.back()} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/organizer/hackathons')}
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Hackathons
          </Button>
          <Link href={`/dashboard/organizer/hackathons/${hackathonId}`}>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              View Details
            </Button>
          </Link>
        </div>
        <h1 className="text-4xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 mb-2">
          {hackathon.title} - ANALYTICS
        </h1>
        <p className="text-gray-400 font-mono">
          Detailed performance metrics and insights
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-700/10 border-2 border-purple-500/50 hover:border-purple-400 transition-all">
          <CardHeader className="pb-3">
            <CardDescription className="text-purple-400 font-mono font-bold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Registrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-blackops text-white mb-1">
              {analytics?.totalRegistrations || 0}
            </div>
            <p className="text-xs text-gray-400 font-mono">Participants registered</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-700/10 border-2 border-cyan-500/50 hover:border-cyan-400 transition-all">
          <CardHeader className="pb-3">
            <CardDescription className="text-cyan-400 font-mono font-bold flex items-center gap-2">
              <Target className="h-4 w-4" />
              Total Teams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-blackops text-white mb-1">
              {analytics?.totalTeams || 0}
            </div>
            <p className="text-xs text-gray-400 font-mono">Teams formed</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-700/10 border-2 border-yellow-500/50 hover:border-yellow-400 transition-all">
          <CardHeader className="pb-3">
            <CardDescription className="text-yellow-400 font-mono font-bold flex items-center gap-2">
              <Award className="h-4 w-4" />
              Winners Declared
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-blackops text-white mb-1">
              {analytics?.totalWinners || 0}
            </div>
            <p className="text-xs text-gray-400 font-mono">Winners announced</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-700/10 border-2 border-green-500/50 hover:border-green-400 transition-all">
          <CardHeader className="pb-3">
            <CardDescription className="text-green-400 font-mono font-bold flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Prize Pool
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-blackops text-white mb-1">
              RM{((hackathon.prize_pool || 0) / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-gray-400 font-mono">Total prize money</p>
          </CardContent>
        </Card>
      </div>

      {/* Registration Timeline */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white font-blackops flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            Registration Timeline
          </CardTitle>
          <CardDescription className="font-mono">
            Daily registration activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics?.registrationTimeline && analytics.registrationTimeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.registrationTimeline}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#a855f7"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-400 font-mono text-sm">No registration data yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team vs Individual */}
        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white font-blackops flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-400" />
              Participation Type
            </CardTitle>
            <CardDescription className="font-mono">
              Team vs Individual breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(analytics?.teamRegistrations > 0 || analytics?.individualRegistrations > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Team', value: analytics.teamRegistrations },
                      { name: 'Individual', value: analytics.individualRegistrations },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#14b8a6" />
                    <Cell fill="#06b6d4" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
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

        {/* Team Size Distribution */}
        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white font-blackops flex items-center gap-2">
              <Target className="h-5 w-5 text-teal-400" />
              Team Size Distribution
            </CardTitle>
            <CardDescription className="font-mono">
              How teams are sized
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.teamSizeDistribution && analytics.teamSizeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.teamSizeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="size" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="#14b8a6">
                    {analytics.teamSizeDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-400 font-mono text-sm">No team data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Registration Status */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white font-blackops flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-green-400" />
            Registration Status Breakdown
          </CardTitle>
          <CardDescription className="font-mono">
            Current status of all registrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics?.statusBreakdown && Object.keys(analytics.statusBreakdown).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(analytics.statusBreakdown).map(([status, count]: [string, any]) => (
                <div key={status} className="p-4 bg-gray-800/50 rounded-lg border-2 border-gray-700">
                  <div className="text-3xl font-blackops text-white mb-2">{count}</div>
                  <p className="text-sm text-gray-400 font-mono capitalize">{status}</p>
                  <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500"
                      style={{
                        width: `${(count / analytics.totalRegistrations) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-400 font-mono text-sm">No registration data yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hackathon Info Summary */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white font-blackops flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-400" />
            Hackathon Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm text-gray-400 font-mono mb-2">Duration</h4>
              <p className="text-white font-bold">
                {new Date(hackathon.start_date).toLocaleDateString()} -{' '}
                {new Date(hackathon.end_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h4 className="text-sm text-gray-400 font-mono mb-2">Location</h4>
              <p className="text-white font-bold">{hackathon.location || 'Not specified'}</p>
            </div>
            <div>
              <h4 className="text-sm text-gray-400 font-mono mb-2">Category</h4>
              <Badge className="bg-purple-600">{hackathon.category}</Badge>
            </div>
            <div>
              <h4 className="text-sm text-gray-400 font-mono mb-2">Status</h4>
              <Badge
                className={
                  hackathon.status === 'published'
                    ? 'bg-green-600'
                    : hackathon.status === 'completed'
                    ? 'bg-blue-600'
                    : hackathon.status === 'draft'
                    ? 'bg-gray-600'
                    : 'bg-red-600'
                }
              >
                {hackathon.status}
              </Badge>
            </div>
            <div>
              <h4 className="text-sm text-gray-400 font-mono mb-2">Max Participants</h4>
              <p className="text-white font-bold">
                {hackathon.max_participants || 'Unlimited'}
              </p>
            </div>
            <div>
              <h4 className="text-sm text-gray-400 font-mono mb-2">Registration Deadline</h4>
              <p className="text-white font-bold">
                {hackathon.registration_deadline
                  ? new Date(hackathon.registration_deadline).toLocaleDateString()
                  : 'Not set'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
