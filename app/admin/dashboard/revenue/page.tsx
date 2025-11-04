'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getRevenueStats, getRevenueOverTime } from '@/lib/actions/admin-actions'
import { DollarSign, TrendingUp, Calendar, Wallet } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
// ===== DUMMY DATA IMPORT - REMOVE BEFORE PRODUCTION =====
import { isDummyDataEnabled, DUMMY_REVENUE_STATS, DUMMY_REVENUE_OVER_TIME } from '@/lib/dummy-data/admin-dummy-data'
// ========================================================

export default function RevenuePage() {
  const [revenueStats, setRevenueStats] = useState<any>(null)
  const [revenueOverTime, setRevenueOverTime] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRevenueData()
  }, [])

  async function loadRevenueData() {
    setLoading(true)

    // ===== DUMMY DATA LOGIC - REMOVE BEFORE PRODUCTION =====
    if (isDummyDataEnabled()) {
      setRevenueStats(DUMMY_REVENUE_STATS)
      setRevenueOverTime(DUMMY_REVENUE_OVER_TIME)
      setLoading(false)
      return
    }
    // ========================================================

    const [statsResult, overTimeResult] = await Promise.all([
      getRevenueStats(),
      getRevenueOverTime()
    ])

    if (statsResult.success) {
      setRevenueStats(statsResult.data)
    }

    if (overTimeResult.success) {
      setRevenueOverTime(overTimeResult.data)
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
        <Skeleton className="h-96" />
      </div>
    )
  }

  const stats = [
    {
      title: 'Total Revenue',
      value: `RM ${(revenueStats?.total_revenue || 0).toFixed(2)}`,
      icon: DollarSign,
      description: `From ${revenueStats?.total_paid_hackathons || 0} hackathons`,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30'
    },
    {
      title: 'Last 6 Months',
      value: `RM ${(revenueStats?.revenue_last_6_months || 0).toFixed(2)}`,
      icon: TrendingUp,
      description: 'Revenue in last 6 months',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30'
    },
    {
      title: 'This Month',
      value: `RM ${(revenueStats?.revenue_this_month || 0).toFixed(2)}`,
      icon: Calendar,
      description: 'Current month revenue',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30'
    },
    {
      title: 'Today',
      value: `RM ${(revenueStats?.revenue_today || 0).toFixed(2)}`,
      icon: Wallet,
      description: 'Revenue earned today',
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
          REVENUE ANALYTICS
        </h1>
        <p className="text-gray-400 font-mono">
          Track hackathon posting fees and revenue generation
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
                  <Icon className={`h-5 w-5 text-green-400`} />
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

      {/* Revenue Over Time - Line Chart */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white font-blackops flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            Revenue Over Time (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {revenueOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={revenueOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="month"
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px', fontFamily: 'monospace' }}
                />
                <YAxis
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px', fontFamily: 'monospace' }}
                  tickFormatter={(value) => `RM ${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontFamily: 'monospace'
                  }}
                  labelStyle={{ color: '#F9FAFB' }}
                  formatter={(value: any) => [`RM ${value.toFixed(2)}`, 'Revenue']}
                />
                <Legend
                  wrapperStyle={{ fontFamily: 'monospace', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: '#10B981', r: 6 }}
                  activeDot={{ r: 8 }}
                  name="Revenue (RM)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-400 font-mono">
              No revenue data available for the last 6 months
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue Over Time - Bar Chart */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white font-blackops flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-400" />
            Monthly Revenue Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {revenueOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={revenueOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="month"
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px', fontFamily: 'monospace' }}
                />
                <YAxis
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px', fontFamily: 'monospace' }}
                  tickFormatter={(value) => `RM ${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontFamily: 'monospace'
                  }}
                  labelStyle={{ color: '#F9FAFB' }}
                  formatter={(value: any) => [`RM ${value.toFixed(2)}`, 'Revenue']}
                />
                <Legend
                  wrapperStyle={{ fontFamily: 'monospace', fontSize: '12px' }}
                />
                <Bar
                  dataKey="revenue"
                  fill="#8B5CF6"
                  radius={[8, 8, 0, 0]}
                  name="Revenue (RM)"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-400 font-mono">
              No revenue data available for the last 6 months
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white font-blackops">Revenue Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-gray-800/50 rounded-md">
            <p className="text-gray-400 font-mono text-sm mb-2">Posting Fee per Hackathon</p>
            <p className="text-2xl font-blackops text-green-400">RM 20.00</p>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-md">
            <p className="text-gray-400 font-mono text-sm mb-2">Total Paid Hackathons</p>
            <p className="text-2xl font-blackops text-blue-400">
              {revenueStats?.total_paid_hackathons || 0}
            </p>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-md">
            <p className="text-gray-400 font-mono text-sm mb-2">Average Revenue per Month</p>
            <p className="text-2xl font-blackops text-purple-400">
              RM {((revenueStats?.revenue_last_6_months || 0) / 6).toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
