'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getRevenueStats, getUserStats, getPendingHackathons } from '@/lib/actions/admin-actions'
import { DollarSign, Users, FileCheck, TrendingUp, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AdminDashboardPage() {
  const [revenueStats, setRevenueStats] = useState<any>(null)
  const [userStats, setUserStats] = useState<any>(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    setLoading(true)

    const [revenueResult, userResult, pendingResult] = await Promise.all([
      getRevenueStats(),
      getUserStats(),
      getPendingHackathons()
    ])

    if (revenueResult.success) {
      setRevenueStats(revenueResult.data)
    }

    if (userResult.success) {
      setUserStats(userResult.data)
    }

    if (pendingResult.success) {
      setPendingCount(pendingResult.data.length)
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

  const stats = [
    {
      title: 'Total Revenue',
      value: `RM ${(revenueStats?.total_revenue || 0).toFixed(2)}`,
      icon: DollarSign,
      description: `${revenueStats?.total_paid_hackathons || 0} paid hackathons`,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30'
    },
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
      title: 'Pending Approvals',
      value: pendingCount,
      icon: FileCheck,
      description: 'Hackathons awaiting review',
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30'
    },
    {
      title: 'This Month Revenue',
      value: `RM ${(revenueStats?.revenue_this_month || 0).toFixed(2)}`,
      icon: TrendingUp,
      description: 'Revenue for current month',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30'
    }
  ]

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 mb-2">
          ADMIN DASHBOARD
        </h1>
        <p className="text-gray-400 font-mono">
          Manage HackerFlow platform and monitor activities
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
                  <Icon className={`h-5 w-5 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} style={{
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }} />
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

      {/* Quick Actions */}
      {pendingCount > 0 && (
        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-yellow-400" />
              <CardTitle className="text-white font-blackops">ACTION REQUIRED</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 font-mono mb-4">
              You have <span className="font-bold text-yellow-400">{pendingCount}</span> hackathon{pendingCount !== 1 ? 's' : ''} awaiting approval. Please review and approve or reject them.
            </p>
            <Link href="/admin/dashboard/approvals">
              <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90 text-white font-mono font-bold">
                Review Pending Approvals
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white font-blackops flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-md">
              <span className="text-gray-400 font-mono text-sm">Last 6 Months</span>
              <span className="text-green-400 font-bold font-mono">
                RM {(revenueStats?.revenue_last_6_months || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-md">
              <span className="text-gray-400 font-mono text-sm">This Month</span>
              <span className="text-green-400 font-bold font-mono">
                RM {(revenueStats?.revenue_this_month || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-md">
              <span className="text-gray-400 font-mono text-sm">Today</span>
              <span className="text-green-400 font-bold font-mono">
                RM {(revenueStats?.revenue_today || 0).toFixed(2)}
              </span>
            </div>
            <Link href="/admin/dashboard/revenue">
              <Button variant="outline" className="w-full border-green-500/50 text-green-400 hover:bg-green-500/10 font-mono">
                View Detailed Revenue Report
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* User Statistics */}
        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white font-blackops flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              User Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-md">
              <span className="text-gray-400 font-mono text-sm">Total Hackers</span>
              <span className="text-blue-400 font-bold font-mono">
                {userStats?.total_hackers || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-md">
              <span className="text-gray-400 font-mono text-sm">Total Organizers</span>
              <span className="text-blue-400 font-bold font-mono">
                {userStats?.total_organizers || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-md">
              <span className="text-gray-400 font-mono text-sm">New Users Today</span>
              <span className="text-blue-400 font-bold font-mono">
                {userStats?.new_users_today || 0}
              </span>
            </div>
            <Link href="/admin/dashboard/analytics">
              <Button variant="outline" className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10 font-mono">
                View Detailed Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Hackathon Status Overview */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white font-blackops flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-purple-400" />
            Hackathon Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
              <p className="text-yellow-400 font-mono text-sm mb-2">Pending Approval</p>
              <p className="text-3xl font-blackops text-yellow-400">
                {revenueStats?.pending_approvals || 0}
              </p>
            </div>
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-md">
              <p className="text-green-400 font-mono text-sm mb-2">Approved</p>
              <p className="text-3xl font-blackops text-green-400">
                {revenueStats?.approved_hackathons || 0}
              </p>
            </div>
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-md">
              <p className="text-red-400 font-mono text-sm mb-2">Rejected</p>
              <p className="text-3xl font-blackops text-red-400">
                {revenueStats?.rejected_hackathons || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
