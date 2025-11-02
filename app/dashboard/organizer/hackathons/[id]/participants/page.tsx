'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
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
import { getHackathonParticipants, exportParticipants } from '@/lib/actions/dashboard-actions'
import { Search, Download, Users, ChevronLeft, ChevronRight } from 'lucide-react'

export default function ParticipantsPage() {
  const params = useParams()
  const hackathonId = params.id as string

  const [participants, setParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)

  useEffect(() => {
    loadParticipants()
  }, [hackathonId, typeFilter, page])

  async function loadParticipants() {
    setLoading(true)

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

    setLoading(false)
  }

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
          <TabsTrigger value="individual" className="data-[state=active]:bg-purple-600">Individuals</TabsTrigger>
        </TabsList>

        <TabsContent value={typeFilter} className="mt-6">
          {/* Search */}
          <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800 mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <p className="text-sm text-gray-400 font-mono mt-3">
                Showing {filteredParticipants.length} of {pagination?.total || 0} participants
              </p>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
            <CardContent className="p-0">
              {filteredParticipants.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-800 hover:bg-gray-900">
                          <TableHead className="text-gray-300 font-mono">Name</TableHead>
                          <TableHead className="text-gray-300 font-mono">Email</TableHead>
                          <TableHead className="text-gray-300 font-mono">Mobile</TableHead>
                          <TableHead className="text-gray-300 font-mono">Type</TableHead>
                          <TableHead className="text-gray-300 font-mono">Team</TableHead>
                          <TableHead className="text-gray-300 font-mono">Registered</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredParticipants.map((participant) => (
                          <TableRow key={participant.id} className="border-gray-800 hover:bg-gray-900/50">
                            <TableCell className="text-white font-semibold">
                              {participant.first_name} {participant.last_name}
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
                            <TableCell className="text-gray-300 font-mono text-sm">
                              {new Date(participant.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
