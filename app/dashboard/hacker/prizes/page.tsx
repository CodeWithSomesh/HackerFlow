'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import {
  Trophy,
  DollarSign,
  Calendar,
  Award,
  TrendingUp,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react'

export default function PrizesPage() {
  const [prizes, setPrizes] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadPrizes()
  }, [])

  async function loadPrizes() {
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

      const dummyPrizes = [
        {
          id: '1',
          position: '1st',
          prize_amount: 10000,
          payment_status: 'paid',
          payment_date: new Date(Date.now() - 5184000000).toISOString(),
          notes: 'Outstanding performance in AI category',
          created_at: new Date(Date.now() - 7776000000).toISOString(),
          hackathons: {
            id: 'h1',
            title: 'AI Innovation Hackathon 2024',
            organization: 'TechCorp Malaysia',
          },
        },
        {
          id: '2',
          position: '2nd',
          prize_amount: 5000,
          payment_status: 'paid',
          payment_date: new Date(Date.now() - 10368000000).toISOString(),
          notes: 'Creative blockchain solution',
          created_at: new Date(Date.now() - 12960000000).toISOString(),
          hackathons: {
            id: 'h2',
            title: 'Web3 Summit Challenge',
            organization: 'Blockchain Alliance',
          },
        },
        {
          id: '3',
          position: '1st',
          prize_amount: 8000,
          payment_status: 'pending',
          payment_date: null,
          notes: 'Innovative mobile app concept',
          created_at: new Date(Date.now() - 2592000000).toISOString(),
          hackathons: {
            id: 'h3',
            title: 'Mobile Dev Challenge',
            organization: 'AppDev Studios',
          },
        },
        {
          id: '4',
          position: '3rd',
          prize_amount: 2000,
          payment_status: 'paid',
          payment_date: new Date(Date.now() - 15552000000).toISOString(),
          notes: 'Great teamwork and execution',
          created_at: new Date(Date.now() - 18144000000).toISOString(),
          hackathons: {
            id: 'h4',
            title: 'IoT Innovation Sprint',
            organization: 'Smart Tech Labs',
          },
        },
      ]

      setPrizes(dummyPrizes)

      const totalPrize = dummyPrizes.reduce((sum, win) => sum + (win.prize_amount || 0), 0)
      const paidPrizes = dummyPrizes.filter(w => w.payment_status === 'paid').length
      const pendingPrizes = dummyPrizes.filter(w => w.payment_status === 'pending').length

      setStats({
        totalPrize,
        totalWins: dummyPrizes.length,
        paidPrizes,
        pendingPrizes,
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

      // Get all wins for the user
      const { data: wins, error } = await supabase
        .from('hackathon_winners')
        .select(`
          *,
          hackathons (
            id,
            title,
            organization,
            start_date,
            end_date
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && wins) {
        setPrizes(wins)

        // Calculate stats
        const totalPrize = wins.reduce((sum, win) => sum + (win.prize_amount || 0), 0)
        const paidPrizes = wins.filter(w => w.payment_status === 'paid').length
        const pendingPrizes = wins.filter(w => w.payment_status === 'pending').length

        setStats({
          totalPrize,
          totalWins: wins.length,
          paidPrizes,
          pendingPrizes,
        })
      }
    }

    setLoading(false)
  }

  const filteredPrizes = prizes.filter(prize => {
    const matchesSearch =
      prize.hackathons?.title.toLowerCase().includes(search.toLowerCase()) ||
      prize.position.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' || prize.payment_status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getPositionBadge = (position: string) => {
    switch (position.toLowerCase()) {
      case '1st':
      case 'first':
        return <Badge className="bg-yellow-600 border-yellow-400 text-white">🥇 1st Place</Badge>
      case '2nd':
      case 'second':
        return <Badge className="bg-gray-400 border-gray-300 text-white">🥈 2nd Place</Badge>
      case '3rd':
      case 'third':
        return <Badge className="bg-orange-700 border-orange-600 text-white">🥉 3rd Place</Badge>
      default:
        return <Badge className="bg-purple-600 border-purple-400 text-white">{position}</Badge>
    }
  }

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className="h-4 w-4 text-green-400" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-600">Paid</Badge>
      case 'pending':
        return <Badge className="bg-yellow-600">Pending</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-40" />
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
          MY PRIZES
        </h1>
        <p className="text-gray-400 font-mono">
          Track your winnings and prize money from hackathons
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-700/10 border-2 border-yellow-500/50 hover:border-yellow-400 transition-all">
          <CardHeader className="pb-3">
            <CardDescription className="text-yellow-400 font-mono font-bold flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Prize Money
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-blackops text-white mb-1">
              RM{((stats?.totalPrize || 0) / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-gray-400 font-mono">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-700/10 border-2 border-green-500/50 hover:border-green-400 transition-all">
          <CardHeader className="pb-3">
            <CardDescription className="text-green-400 font-mono font-bold flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Total Wins
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-blackops text-white mb-1">
              {stats?.totalWins || 0}
            </div>
            <p className="text-xs text-gray-400 font-mono">Hackathons won</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-700/10 border-2 border-blue-500/50 hover:border-blue-400 transition-all">
          <CardHeader className="pb-3">
            <CardDescription className="text-blue-400 font-mono font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Paid Prizes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-blackops text-white mb-1">
              {stats?.paidPrizes || 0}
            </div>
            <p className="text-xs text-gray-400 font-mono">Prizes received</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-700/10 border-2 border-orange-500/50 hover:border-orange-400 transition-all">
          <CardHeader className="pb-3">
            <CardDescription className="text-orange-400 font-mono font-bold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Prizes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-blackops text-white mb-1">
              {stats?.pendingPrizes || 0}
            </div>
            <p className="text-xs text-gray-400 font-mono">Awaiting payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search prizes or hackathons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Prizes List */}
      {filteredPrizes.length > 0 ? (
        <div className="space-y-4">
          {filteredPrizes.map((prize) => (
            <Card
              key={prize.id}
              className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800 hover:border-teal-400 transition-all"
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Left Section - Hackathon Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                        <Trophy className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-blackops text-white mb-1">
                          {prize.hackathons?.title || 'Unknown Hackathon'}
                        </h3>
                        <p className="text-sm text-gray-400 font-mono mb-2">
                          {prize.hackathons?.organization}
                        </p>
                        <div className="flex flex-wrap gap-2 items-center">
                          {getPositionBadge(prize.position)}
                          {getPaymentStatusBadge(prize.payment_status)}
                        </div>
                      </div>
                    </div>

                    {prize.notes && (
                      <p className="text-sm text-gray-400 font-mono mt-3 p-3 bg-gray-800/50 rounded-lg">
                        {prize.notes}
                      </p>
                    )}
                  </div>

                  {/* Right Section - Prize Info */}
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <div className="text-3xl font-blackops text-yellow-400 mb-1">
                        RM {(prize.prize_amount || 0).toLocaleString()}
                      </div>
                      <p className="text-xs text-gray-400 font-mono">Prize Amount</p>
                    </div>

                    {prize.hackathons?.id && (
                      <Link href={`/hackathons/${prize.hackathons.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-gray-800 border-gray-700 text-teal-400 hover:bg-gray-700 hover:text-teal-300 font-mono"
                        >
                          View Hackathon
                          <ExternalLink className="h-3 w-3 ml-2" />
                        </Button>
                      </Link>
                    )}

                    {prize.payment_date && (
                      <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                        <Calendar className="h-3 w-3" />
                        Paid on {new Date(prize.payment_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Trophy className="h-16 w-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-blackops text-white mb-2">No Prizes Found</h3>
            <p className="text-gray-400 font-mono text-sm mb-6 text-center">
              {search || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Win your first hackathon to see your prizes here'}
            </p>
            {!search && statusFilter === 'all' && (
              <Link href="/hackathons">
                <Button className="bg-teal-600 hover:bg-teal-500 text-white font-mono font-bold">
                  Browse Hackathons
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Card */}
      {filteredPrizes.length > 0 && (
        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white font-blackops flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-teal-400" />
              Prize Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-yellow-400" />
                  <span className="text-sm text-gray-400 font-mono">Highest Prize</span>
                </div>
                <p className="text-2xl font-blackops text-yellow-400">
                  RM {Math.max(...prizes.map(p => p.prize_amount || 0)).toLocaleString()}
                </p>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  <span className="text-sm text-gray-400 font-mono">Average Prize</span>
                </div>
                <p className="text-2xl font-blackops text-green-400">
                  RM{' '}
                  {prizes.length > 0
                    ? Math.round(
                        prizes.reduce((sum, p) => sum + (p.prize_amount || 0), 0) / prizes.length
                      ).toLocaleString()
                    : 0}
                </p>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  <span className="text-sm text-gray-400 font-mono">Latest Win</span>
                </div>
                <p className="text-sm font-bold text-blue-400">
                  {prizes.length > 0
                    ? new Date(prizes[0].created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
