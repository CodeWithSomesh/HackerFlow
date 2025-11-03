'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getOrganizerHackathons } from '@/lib/actions/dashboard-actions'
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Eye,
  Users,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Folder,
} from 'lucide-react'
import Image from 'next/image'

export default function OrganizerHackathonsPage() {
  const [hackathons, setHackathons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)

  useEffect(() => {
    loadHackathons()
  }, [page, statusFilter])

  async function loadHackathons() {
    setLoading(true)

    const result = await getOrganizerHackathons(undefined, {
      status: statusFilter as any,
      page,
      limit: 10,
    })

    if (result.success) {
      setHackathons(result.data)
      setPagination(result.pagination)
    }

    setLoading(false)
  }

  const filteredHackathons = hackathons.filter(h =>
    h.title.toLowerCase().includes(search.toLowerCase()) ||
    h.organization.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary" className="bg-gray-700 text-gray-300">Draft</Badge>
      case 'published':
        return <Badge className="bg-green-600 text-white">Published</Badge>
      case 'completed':
        return <Badge className="bg-blue-600 text-white">Completed</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

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
            MANAGE HACKATHONS
          </h1>
          <p className="text-gray-400 font-mono">
            View and manage all your hackathons
          </p>
        </div>
        <Link href="/organize/step1">
          <Button className="bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold">
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-400 font-mono">
              Showing {filteredHackathons.length} of {pagination?.total || 0} hackathons
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardContent className="p-0">
          {filteredHackathons.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800 hover:bg-gray-900">
                      <TableHead className="text-gray-300 font-mono">Hackathon</TableHead>
                      <TableHead className="text-gray-300 font-mono">Status</TableHead>
                      <TableHead className="text-gray-300 font-mono">Participants</TableHead>
                      <TableHead className="text-gray-300 font-mono">Registration Period</TableHead>
                      <TableHead className="text-gray-300 font-mono">Created</TableHead>
                      <TableHead className="text-gray-300 font-mono text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHackathons.map((hackathon) => (
                      <TableRow key={hackathon.id} className="border-gray-800 hover:bg-gray-900/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {hackathon.logo_url ? (
                              <Image
                                src={hackathon.logo_url}
                                alt={hackathon.title}
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
                                {hackathon.title}
                              </p>
                              <p className="text-xs text-gray-400 font-mono">
                                {hackathon.organization}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(hackathon.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-purple-400" />
                            <span className="text-white font-bold">{hackathon.participant_count || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300 font-mono text-sm">
                          {new Date(hackathon.registration_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {' - '}
                          {new Date(hackathon.registration_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </TableCell>
                        <TableCell className="text-gray-300 font-mono text-sm">
                          {new Date(hackathon.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/organizer/hackathons/${hackathon.id}`} className="cursor-pointer">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/organize/step3?id=${hackathon.id}`} className="cursor-pointer">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/organizer/hackathons/${hackathon.id}/participants`} className="cursor-pointer">
                                  <Users className="h-4 w-4 mr-2" />
                                  Manage Participants
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/organizer/hackathons/${hackathon.id}/winners`} className="cursor-pointer">
                                  <Trophy className="h-4 w-4 mr-2" />
                                  Manage Winners
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
              <Folder className="h-16 w-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-blackops text-white mb-2">No Hackathons Found</h3>
              <p className="text-gray-400 font-mono text-sm mb-6 text-center">
                {search ? 'Try adjusting your search or filters' : 'Create your first hackathon to get started'}
              </p>
              {!search && (
                <Link href="/organize/step1">
                  <Button className="bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Hackathon
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
