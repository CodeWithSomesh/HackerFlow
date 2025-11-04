'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getAllHackathonsForAdmin, checkAdminAccess } from '@/lib/actions/admin-actions'
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
} from 'lucide-react'
import { showCustomToast } from '@/components/toast-notification'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
// ===== DUMMY DATA IMPORTS - REMOVE BEFORE PRODUCTION =====
import { DUMMY_PENDING_HACKATHONS, isDummyDataEnabled, mergeDummyData } from '@/lib/dummy-data/admin-dummy-data'
// ========================================================

type FilterStatus = 'all' | 'pending' | 'verified' | 'rejected'
type SortField = 'created_at' | 'title' | 'organization'
type SortOrder = 'asc' | 'desc'

export default function AllHackathonsPage() {
  const router = useRouter()
  const [hackathons, setHackathons] = useState<any[]>([])
  const [filteredHackathons, setFilteredHackathons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  useEffect(() => {
    checkAccess()
  }, [])

  useEffect(() => {
    filterAndSortHackathons()
  }, [hackathons, searchQuery, statusFilter, sortField, sortOrder])

  async function checkAccess() {
    const accessCheck = await checkAdminAccess()

    if (!accessCheck.isAdmin) {
      showCustomToast('error', 'Access denied: Admin only')
      router.push('/admin/dashboard')
      return
    }

    setIsAdmin(true)
    loadHackathons()
  }

  async function loadHackathons() {
    setLoading(true)
    const result = await getAllHackathonsForAdmin()

    if (result.success) {
      // ===== DUMMY DATA MERGE - REMOVE BEFORE PRODUCTION =====
      // Replace the next 2 lines with: setHackathons(result.data || [])
      const realData = result.data || []
      const mergedData = mergeDummyData(realData, DUMMY_PENDING_HACKATHONS)
      setHackathons(mergedData)
      // ========================================================
    } else {
      // ===== DUMMY DATA FALLBACK - REMOVE BEFORE PRODUCTION =====
      // Remove this entire if-else block and keep only the else part
      if (isDummyDataEnabled()) {
        setHackathons(DUMMY_PENDING_HACKATHONS)
      } else {
        showCustomToast('error', 'Failed to load hackathons')
        setHackathons([])
      }
      // ===========================================================
    }

    setLoading(false)
  }

  function filterAndSortHackathons() {
    let filtered = [...hackathons]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (h) =>
          h.title?.toLowerCase().includes(query) ||
          h.organization?.toLowerCase().includes(query) ||
          h.organizer_email?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((h) => {
        if (statusFilter === 'verified') {
          return h.verification_status === 'verified' || h.verification_status === 'confirmed'
        }
        return h.verification_status === statusFilter
      })
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal

      switch (sortField) {
        case 'title':
          aVal = a.title || ''
          bVal = b.title || ''
          break
        case 'organization':
          aVal = a.organization || ''
          bVal = b.organization || ''
          break
        case 'created_at':
          aVal = new Date(a.created_at).getTime()
          bVal = new Date(b.created_at).getTime()
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    setFilteredHackathons(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }

  function clearFilters() {
    setSearchQuery('')
    setStatusFilter('all')
    setSortField('created_at')
    setSortOrder('desc')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
      case 'confirmed':
        return (
          <Badge className="bg-green-500/20 text-green-400 border border-green-400 font-mono text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            VERIFIED
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-500/20 text-red-400 border border-red-400 font-mono text-xs">
            <XCircle className="h-3 w-3 mr-1" />
            REJECTED
          </Badge>
        )
      case 'pending':
      default:
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-400 font-mono text-xs">
            <Clock className="h-3 w-3 mr-1" />
            PENDING
          </Badge>
        )
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  // Pagination
  const indexOfLast = currentPage * itemsPerPage
  const indexOfFirst = indexOfLast - itemsPerPage
  const currentItems = filteredHackathons.slice(indexOfFirst, indexOfLast)
  const totalPages = Math.ceil(filteredHackathons.length / itemsPerPage)

  const stats = {
    total: hackathons.length,
    pending: hackathons.filter((h) => h.verification_status === 'pending').length,
    verified: hackathons.filter(
      (h) => h.verification_status === 'verified' || h.verification_status === 'confirmed'
    ).length,
    rejected: hackathons.filter((h) => h.verification_status === 'rejected').length,
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-blackops text-white">{stats.total}</p>
              <p className="text-xs text-gray-400 font-mono">Total</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-blackops text-yellow-400">{stats.pending}</p>
              <p className="text-xs text-gray-400 font-mono">Pending</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-green-500/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-blackops text-green-400">{stats.verified}</p>
              <p className="text-xs text-gray-400 font-mono">Verified</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-red-500/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-blackops text-red-400">{stats.rejected}</p>
              <p className="text-xs text-gray-400 font-mono">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white font-blackops flex items-center gap-2">
              <Filter className="h-5 w-5 text-purple-400" />
              Filters
            </CardTitle>
            <Button
              onClick={loadHackathons}
              variant="outline"
              size="sm"
              className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 font-mono"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by title, organization, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-black border-gray-700 text-white font-mono"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as FilterStatus)}
            >
              <SelectTrigger className="bg-black border-gray-700 text-white font-mono">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="all" className="text-white font-mono">
                  All Statuses
                </SelectItem>
                <SelectItem value="pending" className="text-white font-mono">
                  Pending
                </SelectItem>
                <SelectItem value="verified" className="text-white font-mono">
                  Verified
                </SelectItem>
                <SelectItem value="rejected" className="text-white font-mono">
                  Rejected
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
              <SelectTrigger className="bg-black border-gray-700 text-white font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="created_at" className="text-white font-mono">
                  Sort by Date
                </SelectItem>
                <SelectItem value="title" className="text-white font-mono">
                  Sort by Title
                </SelectItem>
                <SelectItem value="organization" className="text-white font-mono">
                  Sort by Organization
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {(searchQuery || statusFilter !== 'all') && (
            <div className="mt-4 flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/30 rounded-md">
              <p className="text-purple-400 font-mono text-sm">
                Showing {filteredHackathons.length} of {hackathons.length} hackathons
              </p>
              <Button
                onClick={clearFilters}
                variant="outline"
                size="sm"
                className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 font-mono"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hackathons List */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white font-blackops">
              All Hackathons ({filteredHackathons.length})
            </CardTitle>
            <p className="text-gray-400 font-mono text-sm">
              Page {currentPage} of {totalPages || 1}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {currentItems.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 font-mono text-lg mb-2">No hackathons found</p>
              <p className="text-gray-500 font-mono text-sm">
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {currentItems.map((hackathon) => (
                  <div
                    key={hackathon.id}
                    className="p-4 bg-gray-800/50 rounded-md hover:bg-gray-800/70 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Title & Status */}
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-bold text-white text-lg">{hackathon.title}</h3>
                          {getStatusBadge(hackathon.verification_status)}
                        </div>

                        {/* Organization */}
                        <p className="text-sm text-gray-300 mb-2">{hackathon.organization}</p>

                        {/* Organizer Info */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 font-mono mb-2">
                          <span>By: {hackathon.organizer_name}</span>
                          <span>{hackathon.organizer_email}</span>
                        </div>

                        {/* Dates */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 font-mono">
                          <span>Created: {new Date(hackathon.created_at).toLocaleDateString()}</span>
                          {hackathon.approved_at && (
                            <span className="text-green-400">
                              Approved: {new Date(hackathon.approved_at).toLocaleDateString()}
                            </span>
                          )}
                          {hackathon.rejected_at && (
                            <span className="text-red-400">
                              Rejected: {new Date(hackathon.rejected_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {/* Rejection Reason */}
                        {hackathon.rejection_reason && (
                          <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400 font-mono">
                            Reason: {hackathon.rejection_reason}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <Link href={`/admin/dashboard/hackathon-management/approvals#${hackathon.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 font-mono"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <Button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="border-gray-700 text-gray-300 hover:bg-gray-800 font-mono"
                  >
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          className={
                            currentPage === pageNum
                              ? 'bg-purple-600 hover:bg-purple-700 text-white font-mono'
                              : 'border-gray-700 text-gray-300 hover:bg-gray-800 font-mono'
                          }
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className="border-gray-700 text-gray-300 hover:bg-gray-800 font-mono"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
