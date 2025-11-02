'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getUserStats, getAllHackathons, getAllRegistrations, getAllTeams } from '@/lib/actions/admin-actions'
import { Users, Calendar, Trophy, UserCheck } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function AnalyticsPage() {
  const [userStats, setUserStats] = useState<any>(null)
  const [hackathons, setHackathons] = useState<any[]>([])
  const [registrations, setRegistrations] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalyticsData()
  }, [])

  async function loadAnalyticsData() {
    setLoading(true)

    const [userResult, hackathonResult, registrationResult, teamResult] = await Promise.all([
      getUserStats(),
      getAllHackathons(),
      getAllRegistrations(),
      getAllTeams()
    ])

    if (userResult.success) {
      setUserStats(userResult.data)
    }

    if (hackathonResult.success) {
      setHackathons(hackathonResult.data)
    }

    if (registrationResult.success) {
      setRegistrations(registrationResult.data)
    }

    if (teamResult.success) {
      setTeams(teamResult.data)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  // Prepare chart data
  const userTypeData = [
    { name: 'Hackers', value: userStats?.total_hackers || 0, color: '#3B82F6' },
    { name: 'Organizers', value: userStats?.total_organizers || 0, color: '#8B5CF6' }
  ]

  const hackathonStatusData = hackathons.reduce((acc: any, h: any) => {
    const status = h.status || 'draft'
    const existing = acc.find((item: any) => item.name === status)
    if (existing) {
      existing.value++
    } else {
      acc.push({ name: status, value: 1 })
    }
    return acc
  }, [])

  const registrationsByMonth = registrations.reduce((acc: any, reg: any) => {
    const month = new Date(reg.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    const existing = acc.find((item: any) => item.month === month)
    if (existing) {
      existing.count++
    } else {
      acc.push({ month, count: 1 })
    }
    return acc
  }, []).slice(-6) // Last 6 months

  const stats = [
    {
      title: 'Total Users',
      value: userStats?.total_users || 0,
      icon: Users,
      description: `${userStats?.new_users_this_month || 0} new this month`,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30'
    },
    {
      title: 'Total Hackathons',
      value: hackathons.length,
      icon: Calendar,
      description: `${hackathons.filter(h => h.status === 'published').length} published`,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30'
    },
    {
      title: 'Total Registrations',
      value: registrations.length,
      icon: UserCheck,
      description: 'All hackathon registrations',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30'
    },
    {
      title: 'Total Teams',
      value: teams.length,
      icon: Trophy,
      description: 'Formed teams across hackathons',
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30'
    }
  ]

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 mb-2">
          PLATFORM ANALYTICS
        </h1>
        <p className="text-gray-400 font-mono">
          Comprehensive insights into HackerFlow platform activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={index}
              className={`bg-gradient-to-br from-gray-900 to-black border-2 ${stat.borderColor} hover:scale-105 transition-transform`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-mono text-gray-400">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-blackops bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
                  {stat.value}
                </div>
                <p className="text-xs text-gray-500 font-mono">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Type Distribution */}
        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white font-blackops flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              User Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userTypeData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {userTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      fontFamily: 'monospace'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-72 flex items-center justify-center text-gray-400 font-mono">
                No user data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hackathon Status */}
        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white font-blackops flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-400" />
              Hackathon Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hackathonStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hackathonStatusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="name"
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px', fontFamily: 'monospace' }}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px', fontFamily: 'monospace' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      fontFamily: 'monospace'
                    }}
                  />
                  <Bar dataKey="value" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-72 flex items-center justify-center text-gray-400 font-mono">
                No hackathon data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Registrations Over Time */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white font-blackops flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-green-400" />
            Registrations Over Time (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {registrationsByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={registrationsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="month"
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px', fontFamily: 'monospace' }}
                />
                <YAxis
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px', fontFamily: 'monospace' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontFamily: 'monospace'
                  }}
                />
                <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#10B981" radius={[8, 8, 0, 0]} name="Registrations" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-400 font-mono">
              No registration data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white font-blackops">User Growth</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-gray-800/50 rounded-md">
              <p className="text-gray-400 font-mono text-sm">New Users This Month</p>
              <p className="text-2xl font-blackops text-blue-400">{userStats?.new_users_this_month || 0}</p>
            </div>
            <div className="p-3 bg-gray-800/50 rounded-md">
              <p className="text-gray-400 font-mono text-sm">New Users Today</p>
              <p className="text-2xl font-blackops text-blue-400">{userStats?.new_users_today || 0}</p>
            </div>
            <div className="p-3 bg-gray-800/50 rounded-md">
              <p className="text-gray-400 font-mono text-sm">Total Admins</p>
              <p className="text-2xl font-blackops text-purple-400">{userStats?.total_admins || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white font-blackops">Hackathon Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-gray-800/50 rounded-md">
              <p className="text-gray-400 font-mono text-sm">Published</p>
              <p className="text-2xl font-blackops text-green-400">
                {hackathons.filter(h => h.status === 'published').length}
              </p>
            </div>
            <div className="p-3 bg-gray-800/50 rounded-md">
              <p className="text-gray-400 font-mono text-sm">Draft</p>
              <p className="text-2xl font-blackops text-yellow-400">
                {hackathons.filter(h => h.status === 'draft').length}
              </p>
            </div>
            <div className="p-3 bg-gray-800/50 rounded-md">
              <p className="text-gray-400 font-mono text-sm">Waiting Approval</p>
              <p className="text-2xl font-blackops text-orange-400">
                {hackathons.filter(h => h.status === 'waiting_for_approval').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white font-blackops">Engagement Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-gray-800/50 rounded-md">
              <p className="text-gray-400 font-mono text-sm">Total Teams</p>
              <p className="text-2xl font-blackops text-cyan-400">{teams.length}</p>
            </div>
            <div className="p-3 bg-gray-800/50 rounded-md">
              <p className="text-gray-400 font-mono text-sm">Total Registrations</p>
              <p className="text-2xl font-blackops text-cyan-400">{registrations.length}</p>
            </div>
            <div className="p-3 bg-gray-800/50 rounded-md">
              <p className="text-gray-400 font-mono text-sm">Avg Registrations/Hackathon</p>
              <p className="text-2xl font-blackops text-cyan-400">
                {hackathons.length > 0 ? Math.round(registrations.length / hackathons.length) : 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
