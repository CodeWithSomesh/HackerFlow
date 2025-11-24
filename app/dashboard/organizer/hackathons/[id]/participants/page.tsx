'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getHackathonParticipants, getHackathonTeams, exportParticipants, getHackathonWinners } from '@/lib/actions/dashboard-actions'
import { Search, Download, Users, ChevronLeft, ChevronRight, UserCheck, Trophy, Badge, Crown } from 'lucide-react'

export default function ParticipantsPage() {
  const params = useParams()
  const hackathonId = params.id as string

  const [participants, setParticipants] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [winners, setWinners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [hackathonId, typeFilter, page])

  async function loadData() {
    setLoading(true)

    // Fetch winners for all tabs
    const winnersResult = await getHackathonWinners(hackathonId)
    if (winnersResult.success) {
      setWinners(winnersResult.data)
    }

    if (typeFilter === 'team') {
      // Fetch teams from hackathon_teams table
      const result = await getHackathonTeams(hackathonId)
      if (result.success) {
        setTeams(result.data)
        setPagination({
          page: 1,
          limit: result.data.length,
          total: result.data.length,
          totalPages: 1,
        })
      }
    } else {
      // Fetch participants from hackathon_registrations table
      const result = await getHackathonParticipants(hackathonId, {
        type: typeFilter as any,
        search,
        page,
        limit: 20,
      })

      if (result.success) {
        setParticipants(result.data)
        setPagination(result.pagination)
      }
    }

    setLoading(false)
  }

  const getPrizeIcon = (position: string) => {
    if (position.includes('1st') || position.toLowerCase().includes('winner')) return '🥇'
    if (position.includes('2nd') || position.toLowerCase().includes('first runner')) return '🥈'
    if (position.includes('3rd') || position.toLowerCase().includes('second runner')) return '🥉'
    return '🏆'
  }

  // Create a map of user_id to winner data for quick lookup (for individual winners)
  const winnersMap = new Map(winners.map(w => [w.user_id, w]))

  // Create a map of team_id to winner data for team-based winners
  const teamWinnersMap = new Map(winners.filter(w => w.team_id).map(w => [w.team_id, w]))

  async function handleExport() {
    const result = await exportParticipants(hackathonId, 'csv')
    if (result.success) {
      const blob = new Blob([result.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = result.filename || 'participants.csv'
      a.click()
    }
  }

  const filteredParticipants = participants.filter(p =>
    (p.first_name + ' ' + p.last_name).toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  )

  const filteredTeams = teams.filter(t =>
    t.team_name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 mb-2">
            PARTICIPANTS
          </h1>
          <p className="text-gray-400 font-mono">
            Manage hackathon participants
          </p>
        </div>
        <Button onClick={handleExport} className="bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={typeFilter} onValueChange={setTypeFilter} className="w-full">
        <TabsList className="bg-gray-900 border border-gray-800">
          <TabsTrigger value="all" className="data-[state=active]:bg-purple-600">All Participants</TabsTrigger>
          <TabsTrigger value="team" className="data-[state=active]:bg-purple-600">Teams</TabsTrigger>
        </TabsList>

        <TabsContent value={typeFilter} className="mt-6">
          {/* Search */}
          <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800 mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={typeFilter === 'team' ? "Search by team name..." : "Search by name or email..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <p className="text-sm text-gray-400 font-mono mt-3">
                {typeFilter === 'team'
                  ? `Showing ${filteredTeams.length} of ${pagination?.total || 0} teams`
                  : `Showing ${filteredParticipants.length} of ${pagination?.total || 0} participants`
                }
              </p>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
            <CardContent className="p-0">
              {typeFilter === 'team' ? (
                // TEAMS TABLE
                filteredTeams.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-800 hover:bg-gray-900">
                          <TableHead className="text-gray-300 font-mono">Team Name</TableHead>
                          <TableHead className="text-gray-300 font-mono">Team Members</TableHead>
                          <TableHead className="text-gray-300 font-mono">Size</TableHead>
                          <TableHead className="text-gray-300 font-mono">Prize/Status</TableHead>
                          <TableHead className="text-gray-300 font-mono">Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTeams.map((team) => {
                          const members = team.hackathon_team_members || []
                          const memberCount = members.length
                          // Check if any team member is a winner (teams are identified by team_id in winners table)
                          const teamWinner = winners.find(w => w.team_id === team.id)

                          return (
                            <TableRow key={team.id} className="border-gray-800 hover:bg-gray-900/50">
                              <TableCell className="text-white font-semibold">
                                {team.team_name}
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
                                          <div className="bg-yellow-600 text-white border-yellow-400 flex justify-center items-center px-1.5 py-0.5 gap-1 rounded">
                                            <Crown className="h-3 w-3" />
                                            <span className='text-xs font-bold'>Leader</span>
                                          </div>
                                        )}
                                      </Link>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-500">No members</span>
                                )}
                              </TableCell>
                              <TableCell className="text-gray-300 font-mono text-sm">
                                <div className="flex items-center gap-2">
                                  <span>{memberCount} / {team.team_size_max || 0}</span>
                                  <UserCheck className="h-4 w-4 text-green-400" />
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  {teamWinner ? (
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-3xl">{getPrizeIcon(teamWinner.prize_position)}</span>
                                      <span className="text-xs text-yellow-400 font-bold font-mono">{teamWinner.prize_position}</span>
                                    </div>
                                  ) : (
                                    <span className="text-gray-500 text-sm font-mono">-</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-300 font-mono text-sm">
                                {new Date(team.created_at).toLocaleDateString()}
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
                    <h3 className="text-xl font-blackops text-white mb-2">No Teams Found</h3>
                    <p className="text-gray-400 font-mono text-sm text-center">
                      {search ? 'Try adjusting your search' : 'No teams have been formed yet'}
                    </p>
                  </div>
                )
              ) : (
                // PARTICIPANTS TABLE
                filteredParticipants.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-800 hover:bg-gray-900">
                            <TableHead className="text-gray-300 font-mono ">Name</TableHead>
                            <TableHead className="text-gray-300 font-mono ">Email</TableHead>
                            <TableHead className="text-gray-300 font-mono ">Mobile</TableHead>
                            <TableHead className="text-gray-300 font-mono ">Type</TableHead>
                            <TableHead className="text-gray-300 font-mono ">Team</TableHead>
                            <TableHead className="text-gray-300 font-mono ">Prize/Status</TableHead>
                            <TableHead className="text-gray-300 font-mono ">Registered</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredParticipants.map((participant) => {
                            // Check if participant is an individual winner
                            const individualWinner = winnersMap.get(participant.user_id)

                            // Check if participant's team is a winner (for team-based hackathons)
                            const teamWinner = participant.team_id ? teamWinnersMap.get(participant.team_id) : null

                            // Use either individual or team winner data
                            const winner = individualWinner || teamWinner

                            return (
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
                                <TableCell className="text-gray-300 font-mono text-sm">
                                  {participant.mobile || '-'}
                                </TableCell>
                                <TableCell className="text-gray-300 font-mono text-sm capitalize">
                                  {participant.participant_type}
                                </TableCell>
                                <TableCell className="text-gray-300 font-mono text-sm">
                                  {participant.hackathon_teams?.team_name || '-'}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    {winner ? (
                                      <div className="flex flex-col items-center gap-1">
                                        <span className="text-3xl">{getPrizeIcon(winner.prize_position)}</span>
                                        <span className="text-xs text-yellow-400 font-bold font-mono">{winner.prize_position}</span>
                                      </div>
                                    ) : (
                                      <span className="text-gray-500 text-sm font-mono">-</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-gray-300 font-mono text-sm">
                                  {new Date(participant.created_at).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                      <div className="flex items-center justify-between p-4 border-t border-gray-800">
                        <p className="text-sm text-gray-400 font-mono">
                          Page {pagination.page} of {pagination.totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="text-gray-300 border-gray-700"
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                            disabled={page === pagination.totalPages}
                            className="text-gray-300 border-gray-700"
                          >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Users className="h-16 w-16 text-gray-600 mb-4" />
                    <h3 className="text-xl font-blackops text-white mb-2">No Participants Found</h3>
                    <p className="text-gray-400 font-mono text-sm text-center">
                      {search ? 'Try adjusting your search' : 'No participants have registered yet'}
                    </p>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
