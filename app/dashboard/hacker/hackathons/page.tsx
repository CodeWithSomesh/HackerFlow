'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getHackerParticipationHistory } from '@/lib/actions/dashboard-actions'
import { Search, Calendar, Users, Trophy, ChevronLeft, ChevronRight, Download, ExternalLink } from 'lucide-react'
import Image from 'next/image'

export default function HackerHackathonsPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [resultFilter, setResultFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [page, statusFilter, resultFilter])

  async function loadData() {
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

      const dummyData = [
        {
          id: '1',
          hackathon_id: 'h1',
          hackathon_title: 'Educ-A-Thon 2.0',
          organization: 'TechCorp Malaysia',
          participation_type: 'team',
          registration_status: 'confirmed',
          end_date: new Date(2024, 9, 15).toISOString(),
          result: 'won',
          prize_position: '1st',
          prize_amount: 10000,
        },
        {
          id: '2',
          hackathon_id: 'h2',
          hackathon_title: 'Web3 Summit Challenge',
          organization: 'Blockchain Alliance',
          participation_type: 'team',
          registration_status: 'confirmed',
          end_date: new Date(2024, 8, 20).toISOString(),
          result: 'participated',
          prize_position: null,
          prize_amount: 0,
        },
        {
          id: '3',
          hackathon_id: 'h3',
          hackathon_title: 'Mobile Dev Challenge',
          organization: 'AppDev Studios',
          participation_type: 'individual',
          registration_status: 'confirmed',
          end_date: new Date(2025, 11, 5).toISOString(),
          result: 'ongoing',
          prize_position: null,
          prize_amount: 0,
        },
        {
          id: '4',
          hackathon_id: 'h4',
          hackathon_title: 'IoT Innovation Sprint',
          organization: 'Smart Tech Labs',
          participation_type: 'team',
          registration_status: 'confirmed',
          end_date: new Date(2024, 7, 10).toISOString(),
          result: 'won',
          prize_position: '3rd',
          prize_amount: 2000,
        },
      ]

      setData(dummyData)
      setPagination({
        total: dummyData.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      })
    } else {
      // ============================================================================
      // PRODUCTION CODE
      // This code fetches real data from the database
      // ============================================================================
      const result = await getHackerParticipationHistory(undefined, {
        status: statusFilter as any,
        result: resultFilter as any,
        page,
        limit: 10,
      })

      if (result.success) {
        setData(result.data)
        setPagination(result.pagination)
      }
    }

    setLoading(false)
  }

  const filteredData = data.filter(item =>
    item.hackathon_title.toLowerCase().includes(search.toLowerCase()) ||
    item.organization.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const now = new Date()
    const endDate = new Date(status)

    if (now > endDate) {
      return <Badge variant="secondary" className="bg-gray-700 text-gray-300">Completed</Badge>
    }
    if (now < endDate) {
      return <Badge className="bg-green-600 text-white">Ongoing</Badge>
    }
    return <Badge variant="outline">Unknown</Badge>
  }

  const getResultBadge = (result: string, prizePosition: string | null) => {
    if (result === 'won') {
      return (
        <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black border-yellow-300">
          <Trophy className="h-3 w-3 mr-1" />
          {prizePosition || 'Winner'}
        </Badge>
      )
    }
    return <Badge variant="outline" className="text-gray-400">Participated</Badge>
  }

  const exportToCSV = () => {
    const headers = ['Hackathon', 'Organization', 'Date', 'Type', 'Team', 'Status', 'Result']
    const rows = filteredData.map(item => [
      item.hackathon_title,
      item.organization,
      new Date(item.start_date).toLocaleDateString(),
      item.participant_type,
      item.team_name || 'N/A',
      item.registration_status,
      item.result === 'won' ? `Won - ${item.prize_position}` : 'Participated'
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hackathons_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-purple-400 mb-2">
          MY HACKATHONS
        </h1>
        <p className="text-gray-400 font-mono">
          Your complete hackathon participation history
        </p>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white font-blackops">Filter & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search hackathons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            {/* Result Filter */}
            <Select value={resultFilter} onValueChange={setResultFilter}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Result" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="participated">Participated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-400 font-mono">
              Showing {filteredData.length} of {pagination?.total || 0} hackathons
            </p>
            <Button
              onClick={exportToCSV}
              variant="outline"
              size="sm"
              className="text-teal-400 border-teal-400 hover:bg-teal-400 hover:text-black"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : filteredData.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800 hover:bg-gray-900">
                      <TableHead className="text-gray-300 font-mono">Hackathon</TableHead>
                      <TableHead className="text-gray-300 font-mono">Date</TableHead>
                      <TableHead className="text-gray-300 font-mono">Type</TableHead>
                      <TableHead className="text-gray-300 font-mono">Team</TableHead>
                      <TableHead className="text-gray-300 font-mono">Status</TableHead>
                      <TableHead className="text-gray-300 font-mono">Result</TableHead>
                      <TableHead className="text-gray-300 font-mono text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item) => (
                      <TableRow key={item.id} className="border-gray-800 hover:bg-gray-900/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {item.hackathon_logo ? (
                              <Image
                                src={item.hackathon_logo}
                                alt={item.hackathon_title}
                                width={40}
                                height={40}
                                className="rounded-lg"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-2xl">
                                🚀
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-white text-sm">
                                {item.hackathon_title}
                              </p>
                              <p className="text-xs text-gray-400 font-mono">
                                {item.organization}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300 font-mono text-sm">
                          {new Date(item.start_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={item.participant_type === 'team' ? 'text-purple-400 border-purple-400' : 'text-blue-400 border-blue-400'}>
                            {item.participant_type === 'team' ? (
                              <>
                                <Users className="h-3 w-3 mr-1" />
                                Team
                              </>
                            ) : (
                              <>
                                <Calendar className="h-3 w-3 mr-1" />
                                Individual
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300 font-mono text-sm">
                          {item.team_name || '-'}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(item.end_date)}
                        </TableCell>
                        <TableCell>
                          {getResultBadge(item.result, item.prize_position)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/hackathons/${item.hackathon_id}`}>
                            <Button variant="ghost" size="sm" className="text-teal-400 hover:text-teal-300 hover:bg-gray-800">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
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
              <Calendar className="h-16 w-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-blackops text-white mb-2">No Hackathons Found</h3>
              <p className="text-gray-400 font-mono text-sm mb-6">
                {search ? 'Try adjusting your search or filters' : 'You haven\'t participated in any hackathons yet'}
              </p>
              {!search && (
                <Link href="/hackathons">
                  <Button className="bg-teal-600 hover:bg-teal-500 text-white font-mono font-bold">
                    Browse Hackathons
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
