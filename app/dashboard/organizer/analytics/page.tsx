'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getOrganizerHackathons, getOrganizerAnalytics } from '@/lib/actions/dashboard-actions'
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Target,
  Award,
  DollarSign,
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

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [hackathons, setHackathons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedHackathon, setSelectedHackathon] = useState<string>('all')

  useEffect(() => {
    loadAnalytics()
  }, [])

  async function loadAnalytics() {
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

      setAnalytics({
        totalRegistrations: 245,
        completionRate: 87,
        avgTeamSize: 4,
        totalWinners: 24,
        registrationsOverTime: [
          { month: 'Jun', count: 25 },
          { month: 'Jul', count: 35 },
          { month: 'Aug', count: 42 },
          { month: 'Sep', count: 38 },
          { month: 'Oct', count: 52 },
          { month: 'Nov', count: 53 },
        ],
        participantDistribution: {
          team: 175,
          individual: 70,
        },
        participantsPerHackathon: [
          { hackathon: 'AI Innovation', participants: 52 },
          { hackathon: 'Web3 Summit', participants: 48 },
          { hackathon: 'Mobile Challenge', participants: 45 },
          { hackathon: 'Blockchain Hack', participants: 41 },
          { hackathon: 'IoT Sprint', participants: 35 },
        ],
      })

      setHackathons([
        {
          id: 'h1',
          title: 'AI Innovation Hackathon',
          status: 'published',
          participant_count: 52,
          team_count: 13,
          prize_pool: 15000,
        },
        {
          id: 'h2',
          title: 'Web3 Summit',
          status: 'published',
          participant_count: 48,
          team_count: 12,
          prize_pool: 12000,
        },
        {
          id: 'h3',
          title: 'Mobile Dev Challenge',
          status: 'completed',
          participant_count: 45,
          team_count: 11,
          prize_pool: 10000,
        },
        {
          id: 'h4',
          title: 'Blockchain Hackathon',
          status: 'completed',
          participant_count: 41,
          team_count: 10,
          prize_pool: 18000,
        },
        {
          id: 'h5',
          title: 'IoT Innovation Sprint',
          status: 'draft',
          participant_count: 35,
          team_count: 9,
          prize_pool: 8000,
        },
      ])
    } else {
      // ============================================================================
      // PRODUCTION CODE
      // This code fetches real data from the database
      // ============================================================================
      const [analyticsResult, hackathonsResult] = await Promise.all([
        getOrganizerAnalytics(),
        getOrganizerHackathons(),
      ])

      if (analyticsResult.success) setAnalytics(analyticsResult.data)
      if (hackathonsResult.success) setHackathons(hackathonsResult.data)
    }

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

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 mb-2">
            ANALYTICS
          </h1>
          <p className="text-gray-400 font-mono">
            Deep insights into your hackathon performance
          </p>
        </div>

        <Select value={selectedHackathon} onValueChange={setSelectedHackathon}>
          <SelectTrigger className="w-64 bg-gray-800 border-gray-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Hackathons</SelectItem>
            {hackathons.map((h) => (
              <SelectItem key={h.id} value={h.id}>
                {h.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
            <p className="text-xs text-gray-400 font-mono">All time participants</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-700/10 border-2 border-green-500/50 hover:border-green-400 transition-all">
          <CardHeader className="pb-3">
            <CardDescription className="text-green-400 font-mono font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Completion Rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-blackops text-white mb-1">
              {analytics?.completionRate || 0}%
            </div>
            <p className="text-xs text-gray-400 font-mono">Participants who completed</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-700/10 border-2 border-blue-500/50 hover:border-blue-400 transition-all">
          <CardHeader className="pb-3">
            <CardDescription className="text-blue-400 font-mono font-bold flex items-center gap-2">
              <Target className="h-4 w-4" />
              Avg Team Size
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-blackops text-white mb-1">
              {analytics?.avgTeamSize || 0}
            </div>
            <p className="text-xs text-gray-400 font-mono">Members per team</p>
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
            <p className="text-xs text-gray-400 font-mono">Across all events</p>
          </CardContent>
        </Card>
      </div>

      {/* Registration Trend */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white font-blackops flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-400" />
            Registration Trend Over Time
          </CardTitle>
          <CardDescription className="font-mono">
            Last 12 months registration activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics?.registrationsOverTime && analytics.registrationsOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={analytics.registrationsOverTime}>
                <defs>
                  <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
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
                  fill="url(#colorRegistrations)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-400 font-mono text-sm">No data available yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Participants Per Hackathon */}
        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white font-blackops flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-400" />
              Participants by Hackathon
            </CardTitle>
            <CardDescription className="font-mono">
              Comparison across your events
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
                    style={{ fontSize: '10px' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="participants" fill="#14b8a6">
                    {analytics.participantsPerHackathon.map((entry: any, index: number) => (
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

        {/* Team vs Individual */}
        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white font-blackops flex items-center gap-2">
              <Target className="h-5 w-5 text-teal-400" />
              Participation Type Distribution
            </CardTitle>
            <CardDescription className="font-mono">
              Team vs Individual breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.participantDistribution &&
            (analytics.participantDistribution.team > 0 || analytics.participantDistribution.individual > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Team Participants', value: analytics.participantDistribution.team },
                      { name: 'Individual Participants', value: analytics.participantDistribution.individual },
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
      </div>

      {/* Prize Distribution */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white font-blackops flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-yellow-400" />
            Prize Pool Distribution
          </CardTitle>
          <CardDescription className="font-mono">
            Prize money awarded across hackathons
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hackathons && hackathons.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={hackathons
                  .filter(h => h.prize_pool > 0)
                  .map(h => ({
                    name: h.title.length > 20 ? h.title.substring(0, 20) + '...' : h.title,
                    prize: h.prize_pool,
                  }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="name"
                  stroke="#9ca3af"
                  style={{ fontSize: '10px' }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  formatter={(value: any) => `RM ${value.toLocaleString()}`}
                />
                <Bar dataKey="prize" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-400 font-mono text-sm">No prize data available yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Summary Table */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white font-blackops flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-400" />
            Hackathon Performance Summary
          </CardTitle>
          <CardDescription className="font-mono">
            Detailed performance metrics for each event
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hackathons && hackathons.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-3 text-gray-400 font-mono text-sm">Hackathon</th>
                    <th className="text-center p-3 text-gray-400 font-mono text-sm">Participants</th>
                    <th className="text-center p-3 text-gray-400 font-mono text-sm">Teams</th>
                    <th className="text-center p-3 text-gray-400 font-mono text-sm">Prize Pool</th>
                    <th className="text-center p-3 text-gray-400 font-mono text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {hackathons.map((hackathon) => (
                    <tr key={hackathon.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                      <td className="p-3 text-white font-mono text-sm">{hackathon.title}</td>
                      <td className="p-3 text-center text-cyan-400 font-bold">{hackathon.participant_count || 0}</td>
                      <td className="p-3 text-center text-teal-400 font-bold">{hackathon.team_count || 0}</td>
                      <td className="p-3 text-center text-yellow-400 font-bold">
                        RM {(hackathon.prize_pool || 0).toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            hackathon.status === 'published'
                              ? 'bg-green-600 text-white'
                              : hackathon.status === 'completed'
                              ? 'bg-blue-600 text-white'
                              : hackathon.status === 'draft'
                              ? 'bg-gray-700 text-white'
                              : 'bg-red-600 text-white'
                          }`}
                        >
                          {hackathon.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-mono text-sm">No hackathons to analyze yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
