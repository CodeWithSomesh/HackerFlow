'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getHackathonWinners, getHackathonParticipants, getHackathonTeams, updateWinnerPaymentStatus, saveHackathonWinners } from '@/lib/actions/dashboard-actions'
import { getHackathonById } from '@/lib/actions/createHackathon-actions'
import { Trophy, DollarSign, Calendar, CheckCircle, Clock, AlertCircle, Users, Search, Award, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function WinnersPage() {
  const params = useParams()
  const hackathonId = params.id as string

  const [winners, setWinners] = useState<any[]>([])
  const [participants, setParticipants] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [hackathon, setHackathon] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [isAddingWinner, setIsAddingWinner] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null)
  const [selectedPrize, setSelectedPrize] = useState<string>('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadData()
  }, [hackathonId])

  async function loadData() {
    setLoading(true)

    // First fetch hackathon and winners
    const [winnersResult, hackathonResult] = await Promise.all([
      getHackathonWinners(hackathonId),
      getHackathonById(hackathonId),
    ])

    if (winnersResult.success) setWinners(winnersResult.data)
    if (hackathonResult.success) setHackathon(hackathonResult.data)

    // Then fetch teams or participants based on hackathon type
    if (hackathonResult.success) {
      const isTeamHackathon = hackathonResult.data.participation_type === 'team'

      if (isTeamHackathon) {
        // Fetch teams for team-based hackathons
        const teamsResult = await getHackathonTeams(hackathonId)
        if (teamsResult.success) setTeams(teamsResult.data)
      } else {
        // Fetch participants for individual hackathons
        const participantsResult = await getHackathonParticipants(hackathonId, { limit: 1000 })
        if (participantsResult.success) setParticipants(participantsResult.data)
      }
    }

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

  function handleSelectParticipant(participant: any) {
    setSelectedParticipant(participant)
    setSelectedPrize('')
    setShowAddDialog(true)
  }

  async function handleAddWinner() {
    if (!selectedParticipant || !selectedPrize) {
      toast.error('Please select a prize')
      return
    }

    setIsAddingWinner(true)

    // Parse the selected prize from database
    const prizes = hackathon?.prizes || []
    const prize = prizes.find((p: any, index: number) => index.toString() === selectedPrize)

    if (!prize) {
      toast.error('Invalid prize selection')
      setIsAddingWinner(false)
      return
    }

    // Extract amount from prize (e.g., "RM8000" -> 8000)
    const amountMatch = prize.amount?.match(/\d+/)
    const prizeAmount = amountMatch ? parseFloat(amountMatch[0]) : 0

    // Handle team vs individual hackathons
    const isTeamHackathon = hackathon?.participation_type === 'team'
    let winnerData

    if (isTeamHackathon) {
      // For team hackathons, use team leader's user_id and team's id
      const leader = selectedParticipant.hackathon_team_members?.find((m: any) => m.is_leader)
      if (!leader) {
        toast.error('Team must have a leader')
        setIsAddingWinner(false)
        return
      }

      winnerData = {
        user_id: leader.user_id || leader.email, // Use team leader's ID
        team_id: selectedParticipant.id, // Team ID
        prize_position: prize.position || 'Winner',
        prize_amount: prizeAmount,
      }
    } else {
      // For individual hackathons
      winnerData = {
        user_id: selectedParticipant.user_id,
        team_id: selectedParticipant.team_id || undefined,
        prize_position: prize.position || 'Winner',
        prize_amount: prizeAmount,
      }
    }

    const result = await saveHackathonWinners(hackathonId, [winnerData])

    if (result.success) {
      toast.success('Winner added successfully')
      setShowAddDialog(false)
      setSelectedParticipant(null)
      setSelectedPrize('')
      await loadData()
    } else {
      toast.error(result.error || 'Failed to add winner')
    }

    setIsAddingWinner(false)
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
    if (position.includes('1st') || position.toLowerCase().includes('winner')) return '🥇'
    if (position.includes('2nd') || position.toLowerCase().includes('first runner')) return '🥈'
    if (position.includes('3rd') || position.toLowerCase().includes('second runner')) return '🥉'
    return '🏆'
  }

  // Determine if this is a team hackathon
  const isTeamHackathon = hackathon?.participation_type === 'team'

  // Filter participants based on search and exclude already selected winners
  const filteredParticipants = participants.filter(p => {
    const matchesSearch = (
      (p.first_name + ' ' + p.last_name).toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
    )
    const isNotWinner = !winners.some(w => w.user_id === p.user_id)
    return matchesSearch && isNotWinner
  })

  // Filter teams based on search and exclude already selected winners
  const filteredTeams = teams.filter(t => {
    const matchesSearch = t.team_name.toLowerCase().includes(search.toLowerCase())
    const isNotWinner = !winners.some(w => w.team_id === t.id)
    return matchesSearch && isNotWinner
  })

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

      {/* Current Winners Section */}
      {winners.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <h2 className="text-2xl font-blackops text-white">Declared Winners</h2>
          </div>

          {/* Winners Table */}
          <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800 hover:bg-gray-900">
                      <TableHead className="text-gray-300 font-mono">Medal</TableHead>
                      <TableHead className="text-gray-300 font-mono">Team/Participant</TableHead>
                      <TableHead className="text-gray-300 font-mono">Prize Position</TableHead>
                      <TableHead className="text-gray-300 font-mono">Prize Amount</TableHead>
                      <TableHead className="text-gray-300 font-mono">Payment Status</TableHead>
                      <TableHead className="text-gray-300 font-mono">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {winners.map((winner) => (
                      <TableRow key={winner.id} className="border-gray-800 hover:bg-gray-900/50">
                        {/* Medal Column */}
                        <TableCell className="text-center">
                          <div className="text-5xl">
                            {getPrizeIcon(winner.prize_position)}
                          </div>
                        </TableCell>

                        {/* Team/Participant Name */}
                        <TableCell className="text-white font-semibold">
                          {isTeamHackathon ? (
                            <div>
                              <div className="font-bold">{winner.hackathon_teams?.team_name || 'Unknown Team'}</div>
                              <div className="text-sm text-gray-400 font-mono">
                                {winner.profile?.full_name || winner.profile?.email || 'Team Leader'}
                              </div>
                            </div>
                          ) : (
                            <Link
                              href={`/profile/${winner.user_id}`}
                              className="hover:text-purple-400 transition-colors underline decoration-dotted"
                            >
                              {winner.profile?.full_name || winner.profile?.email || 'Unknown'}
                            </Link>
                          )}
                        </TableCell>

                        {/* Prize Position */}
                        <TableCell className="text-white font-mono">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white font-blackops">
                              {winner.prize_position}
                            </Badge>
                          </div>
                        </TableCell>

                        {/* Prize Amount */}
                        <TableCell className="text-yellow-400 font-blackops text-lg">
                          RM{(winner.prize_amount || 0).toLocaleString()}
                        </TableCell>

                        {/* Payment Status */}
                        <TableCell>
                          <div className="space-y-1">
                            {getPaymentStatusBadge(winner.payment_status)}
                            {winner.payment_date && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 font-mono">
                                <Calendar className="h-3 w-3" />
                                {new Date(winner.payment_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 font-mono"
                                disabled={updating === winner.id}
                              >
                                Update Status
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-900 border-gray-800">
                              <DialogHeader>
                                <DialogTitle className="text-white font-blackops">Update Payment Status</DialogTitle>
                                <DialogDescription className="text-gray-400 font-mono">
                                  Change the payment status for {isTeamHackathon ? winner.hackathon_teams?.team_name : winner.profile?.full_name}
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

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
      )}

      {/* Select Winner Section */}
      <div className="flex items-center gap-2 mt-8">
        <Award className="h-5 w-5 text-purple-400" />
        <h2 className="text-2xl font-blackops text-white">
          {isTeamHackathon ? 'Select Winning Team' : 'Select Winner from Participants'}
        </h2>
      </div>

      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardContent className="pt-6">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={isTeamHackathon ? "Search by team name..." : "Search by name or email..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <p className="text-sm text-gray-400 font-mono mb-4">
            {isTeamHackathon
              ? `Showing ${filteredTeams.length} available teams`
              : `Showing ${filteredParticipants.length} available participants`
            }
          </p>

          {isTeamHackathon ? (
            // TEAMS TABLE
            filteredTeams.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800 hover:bg-gray-900">
                      <TableHead className="text-gray-300 font-mono">Team Name</TableHead>
                      <TableHead className="text-gray-300 font-mono">Team Members</TableHead>
                      <TableHead className="text-gray-300 font-mono">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeams.map((team) => {
                      const members = team.hackathon_team_members || []
                      const memberCount = members.length

                      return (
                        <TableRow key={team.id} className="border-gray-800 hover:bg-gray-900/50">
                          <TableCell className="text-white font-semibold">
                            {team.team_name}
                            <div className="text-xs text-gray-500 font-mono mt-1">
                              {memberCount} {memberCount === 1 ? 'member' : 'members'}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-300 font-mono text-sm">
                            {members.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {members.map((member: any) => (
                                  <Link
                                    key={member.user_id}
                                    href={`/profile/${member.user_id}`}
                                    className="hover:text-purple-400 transition-colors underline decoration-dotted flex items-center gap-1"
                                  >
                                    {member.first_name} {member.last_name}
                                    {member.is_leader && (
                                      <span className="text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded font-bold">LEADER</span>
                                    )}
                                  </Link>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-500">No members</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={() => handleSelectParticipant(team)}
                              size="sm"
                              className="bg-yellow-600 hover:bg-yellow-500 text-white font-mono"
                            >
                              <Trophy className="h-3 w-3 mr-1" />
                              Select as Winner
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <Users className="h-16 w-16 text-gray-600 mb-4" />
                <h3 className="text-xl font-blackops text-white mb-2">No Teams Available</h3>
                <p className="text-gray-400 font-mono text-sm text-center">
                  {search ? 'No teams match your search' : 'All teams have been declared as winners'}
                </p>
              </div>
            )
          ) : (
            // PARTICIPANTS TABLE
            filteredParticipants.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800 hover:bg-gray-900">
                      <TableHead className="text-gray-300 font-mono">Name</TableHead>
                      <TableHead className="text-gray-300 font-mono">Email</TableHead>
                      <TableHead className="text-gray-300 font-mono">Type</TableHead>
                      <TableHead className="text-gray-300 font-mono">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParticipants.map((participant) => (
                      <TableRow key={participant.id} className="border-gray-800 hover:bg-gray-900/50">
                        <TableCell className="text-white font-semibold">
                          <Link
                            href={`/profile/${participant.user_id}`}
                            className="hover:text-purple-400 transition-colors underline decoration-dotted"
                          >
                            {participant.first_name} {participant.last_name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-gray-300 font-mono text-sm">
                          {participant.email}
                        </TableCell>
                        <TableCell className="text-gray-300 font-mono text-sm capitalize">
                          {participant.participant_type}
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => handleSelectParticipant(participant)}
                            size="sm"
                            className="bg-yellow-600 hover:bg-yellow-500 text-white font-mono"
                          >
                            <Trophy className="h-3 w-3 mr-1" />
                            Select as Winner
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <Users className="h-16 w-16 text-gray-600 mb-4" />
                <h3 className="text-xl font-blackops text-white mb-2">No Participants Available</h3>
                <p className="text-gray-400 font-mono text-sm text-center">
                  {search ? 'No participants match your search' : 'All participants have been declared as winners'}
                </p>
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* Add Winner Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-blackops text-xl">Assign Prize to Winner</DialogTitle>
            <DialogDescription className="text-gray-400 font-mono">
              {isTeamHackathon
                ? `Select a prize position for team: ${selectedParticipant?.team_name}`
                : `Select a prize position for ${selectedParticipant?.first_name} ${selectedParticipant?.last_name}`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {/* Selected Participant/Team Info */}
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <p className="text-sm text-gray-400 font-mono mb-1">
                {isTeamHackathon ? 'Selected Team' : 'Selected Participant'}
              </p>
              {isTeamHackathon ? (
                <>
                  <p className="text-white font-semibold">{selectedParticipant?.team_name}</p>
                  <p className="text-gray-400 font-mono text-sm">
                    Leader: {selectedParticipant?.hackathon_team_members?.find((m: any) => m.is_leader)?.first_name || '-'} {' '}
                    {selectedParticipant?.hackathon_team_members?.find((m: any) => m.is_leader)?.last_name || ''}
                  </p>
                  <p className="text-gray-400 font-mono text-sm">
                    Members: {selectedParticipant?.hackathon_team_members?.length || 0}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-white font-semibold">
                    {selectedParticipant?.first_name} {selectedParticipant?.last_name}
                  </p>
                  <p className="text-gray-400 font-mono text-sm">{selectedParticipant?.email}</p>
                </>
              )}
            </div>

            {/* Prize Selection */}
            {hackathon?.prizes && hackathon.prizes.filter((p: any) => p.type !== 'Certificate').length > 0 ? (
              <>
                <div className="space-y-2">
                  <Label className="text-gray-300 font-mono">Select Prize</Label>
                  <Select value={selectedPrize} onValueChange={setSelectedPrize}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Choose a prize" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {hackathon.prizes
                        .map((prize: any, index: number) => ({ prize, originalIndex: index }))
                        .filter(({ prize }: any) => prize.type !== 'Certificate')
                        .map(({ prize, originalIndex }: any) => (
                          <SelectItem
                            key={originalIndex}
                            value={originalIndex.toString()}
                            className="text-white hover:bg-gray-700"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <span>{getPrizeIcon(prize.position)} {prize.position}</span>
                              <span className="text-yellow-400 font-bold">{prize.amount}</span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Prize Details Preview */}
                {selectedPrize !== '' && hackathon.prizes[parseInt(selectedPrize)] && (
                  <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300 font-mono text-sm">Prize Amount</span>
                      <span className="text-yellow-400 font-blackops text-xl">
                        {hackathon.prizes[parseInt(selectedPrize)].amount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 font-mono text-sm">Type</span>
                      <span className="text-gray-300 font-mono text-sm">
                        {hackathon.prizes[parseInt(selectedPrize)].type}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleAddWinner}
                    disabled={isAddingWinner || !selectedPrize}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-500"
                  >
                    {isAddingWinner ? 'Adding...' : 'Confirm Winner'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowAddDialog(false)
                      setSelectedParticipant(null)
                      setSelectedPrize('')
                    }}
                    variant="outline"
                    className="flex-1"
                    disabled={isAddingWinner}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 font-mono text-sm">
                  No prizes configured for this hackathon
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
