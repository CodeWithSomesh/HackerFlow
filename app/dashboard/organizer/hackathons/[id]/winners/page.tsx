'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getHackathonWinners, getHackathonParticipants, updateWinnerPaymentStatus } from '@/lib/actions/dashboard-actions'
import { Trophy, DollarSign, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function WinnersPage() {
  const params = useParams()
  const hackathonId = params.id as string

  const [winners, setWinners] = useState<any[]>([])
  const [participants, setParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [hackathonId])

  async function loadData() {
    setLoading(true)

    const [winnersResult, participantsResult] = await Promise.all([
      getHackathonWinners(hackathonId),
      getHackathonParticipants(hackathonId, { limit: 100 }),
    ])

    if (winnersResult.success) setWinners(winnersResult.data)
    if (participantsResult.success) setParticipants(participantsResult.data)

    setLoading(false)
  }

  async function handleUpdatePaymentStatus(winnerId: string, status: string) {
    setUpdating(winnerId)

    const result = await updateWinnerPaymentStatus(
      winnerId,
      status as any,
      status === 'credited' ? new Date().toISOString() : undefined,
      undefined
    )

    if (result.success) {
      toast.success('Payment status updated successfully')
      await loadData()
    } else {
      toast.error(result.error || 'Failed to update payment status')
    }

    setUpdating(null)
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-600 text-white">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case 'processing':
        return (
          <Badge className="bg-blue-600 text-white">
            <AlertCircle className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        )
      case 'credited':
        return (
          <Badge className="bg-green-600 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            Credited
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPrizeIcon = (position: string) => {
    if (position.includes('1st')) return '🥇'
    if (position.includes('2nd')) return '🥈'
    if (position.includes('3rd')) return '🥉'
    return '🏆'
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 mb-2">
          WINNERS MANAGEMENT
        </h1>
        <p className="text-gray-400 font-mono">
          Manage winners and track prize payments
        </p>
      </div>

      {winners.length > 0 ? (
        <>
          {/* Winners Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {winners.map((winner) => (
              <Card key={winner.id} className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/50 hover:border-yellow-400 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{getPrizeIcon(winner.prize_position)}</span>
                      <div>
                        <CardTitle className="text-white font-blackops text-lg">
                          {winner.prize_position}
                        </CardTitle>
                        <p className="text-sm text-gray-400 font-mono">
                          {winner.profile?.full_name || winner.profile?.email || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Prize Amount */}
                  <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                    <span className="text-sm text-gray-400 font-mono flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-yellow-400" />
                      Prize Amount
                    </span>
                    <span className="text-xl font-blackops text-yellow-400">
                      RM{(winner.prize_amount || 0).toLocaleString()}
                    </span>
                  </div>

                  {/* Payment Status */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400 font-mono">Payment Status</span>
                      {getPaymentStatusBadge(winner.payment_status)}
                    </div>

                    {winner.payment_date && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 font-mono">
                        <Calendar className="h-3 w-3" />
                        {new Date(winner.payment_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Update Payment Status */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                        disabled={updating === winner.id}
                      >
                        Update Payment Status
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-800">
                      <DialogHeader>
                        <DialogTitle className="text-white font-blackops">Update Payment Status</DialogTitle>
                        <DialogDescription className="text-gray-400 font-mono">
                          Change the payment status for this winner
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <Button
                          onClick={() => handleUpdatePaymentStatus(winner.id, 'processing')}
                          className="w-full bg-blue-600 hover:bg-blue-500"
                          disabled={updating === winner.id}
                        >
                          Mark as Processing
                        </Button>
                        <Button
                          onClick={() => handleUpdatePaymentStatus(winner.id, 'credited')}
                          className="w-full bg-green-600 hover:bg-green-500"
                          disabled={updating === winner.id}
                        >
                          Mark as Credited
                        </Button>
                        <Button
                          onClick={() => handleUpdatePaymentStatus(winner.id, 'pending')}
                          variant="outline"
                          className="w-full"
                          disabled={updating === winner.id}
                        >
                          Mark as Pending
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Payment Summary */}
          <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white font-blackops">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                  <p className="text-sm text-gray-400 font-mono mb-1">Total Prize Pool</p>
                  <p className="text-2xl font-blackops text-yellow-400">
                    RM{winners.reduce((sum, w) => sum + (Number(w.prize_amount) || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                  <p className="text-sm text-gray-400 font-mono mb-1">Credited</p>
                  <p className="text-2xl font-blackops text-green-400">
                    RM{winners
                      .filter(w => w.payment_status === 'credited')
                      .reduce((sum, w) => sum + (Number(w.prize_amount) || 0), 0)
                      .toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <p className="text-sm text-gray-400 font-mono mb-1">Processing</p>
                  <p className="text-2xl font-blackops text-blue-400">
                    RM{winners
                      .filter(w => w.payment_status === 'processing')
                      .reduce((sum, w) => sum + (Number(w.prize_amount) || 0), 0)
                      .toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-yellow-600/10 rounded-lg border border-yellow-600/30">
                  <p className="text-sm text-gray-400 font-mono mb-1">Pending</p>
                  <p className="text-2xl font-blackops text-yellow-500">
                    RM{winners
                      .filter(w => w.payment_status === 'pending')
                      .reduce((sum, w) => sum + (Number(w.prize_amount) || 0), 0)
                      .toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Trophy className="h-16 w-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-blackops text-white mb-2">No Winners Declared</h3>
            <p className="text-gray-400 font-mono text-sm text-center mb-6">
              Winners have not been declared for this hackathon yet
            </p>
            <p className="text-gray-500 font-mono text-xs text-center">
              Use the hackathon management system to declare winners
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
