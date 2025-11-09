'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { getAllUsers, promoteToAdmin, demoteToUser, checkAdminAccess } from '@/lib/actions/admin-actions'
import {
  Users,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  Shield,
  ShieldCheck,
  User,
  RefreshCw,
  ArrowUpDown
} from 'lucide-react'
import { showCustomToast } from '@/components/toast-notification'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'
// ===== DUMMY DATA IMPORTS - REMOVE BEFORE PRODUCTION =====
import { DUMMY_USERS, isDummyDataEnabled, mergeDummyData } from '@/lib/dummy-data/admin-dummy-data'
// ========================================================

type SortField = 'name' | 'email' | 'role' | 'created_at'
type SortOrder = 'asc' | 'desc'
type RoleFilter = 'all' | 'user' | 'admin' | 'superadmin'
type TypeFilter = 'all' | 'hacker' | 'organizer'

export default function UserManagementPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [actionType, setActionType] = useState<'promote' | 'demote' | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const usersPerPage = 20

  // ===== DUMMY DATA STATE - REMOVE BEFORE PRODUCTION =====
  const [useDummyData, setUseDummyData] = useState(false)
  // ========================================================

  useEffect(() => {
    // ===== DUMMY DATA INITIALIZATION - REMOVE BEFORE PRODUCTION =====
    setUseDummyData(isDummyDataEnabled())
    // ================================================================
    checkAccess()
  }, [])

  useEffect(() => {
    filterAndSortUsers()
  }, [users, searchQuery, roleFilter, typeFilter, sortField, sortOrder])

  async function checkAccess() {
    const accessCheck = await checkAdminAccess()

    if (!accessCheck.isAdmin) {
      showCustomToast('error', 'Access denied: Admin only')
      router.push('/admin/dashboard')
      return
    }

    setIsAdmin(true)
    loadUsers()
  }

  async function loadUsers() {
    setLoading(true)
    const result = await getAllUsers()

    if (result.success) {
      // ===== DUMMY DATA MERGE - REMOVE BEFORE PRODUCTION =====
      // Replace the next 2 lines with: setUsers(result.data || [])
      const realData = result.data || []
      const mergedData = mergeDummyData(realData, DUMMY_USERS)
      setUsers(mergedData)
      // ========================================================
    } else {
      // ===== DUMMY DATA FALLBACK - REMOVE BEFORE PRODUCTION =====
      // Remove this entire if-else block and keep only the else part
      if (isDummyDataEnabled()) {
        setUsers(DUMMY_USERS)
      } else {
        showCustomToast('error', 'Failed to load users')
        setUsers([])
      }
      // ===========================================================
    }

    setLoading(false)
  }

  function filterAndSortUsers() {
    let filtered = [...users]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (u) =>
          u.email?.toLowerCase().includes(query) ||
          u.full_name?.toLowerCase().includes(query)
      )
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((u) => u.role === roleFilter)
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((u) => u.user_primary_type === typeFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal

      switch (sortField) {
        case 'name':
          aVal = a.full_name || ''
          bVal = b.full_name || ''
          break
        case 'email':
          aVal = a.email || ''
          bVal = b.email || ''
          break
        case 'role':
          aVal = a.role || ''
          bVal = b.role || ''
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

    setFilteredUsers(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }

  function openActionDialog(user: any, type: 'promote' | 'demote') {
    setSelectedUser(user)
    setActionType(type)
  }

  function closeActionDialog() {
    setSelectedUser(null)
    setActionType(null)
  }

  async function handlePromote() {
    if (!selectedUser) return

    setIsProcessing(true)
    const result = await promoteToAdmin(selectedUser.user_id)

    if (result.success) {
      showCustomToast('success', 'User promoted to admin successfully')
      closeActionDialog()
      loadUsers()
    } else {
      showCustomToast('error', result.message || 'Failed to promote user')
    }

    setIsProcessing(false)
  }

  async function handleDemote() {
    if (!selectedUser) return

    setIsProcessing(true)
    const result = await demoteToUser(selectedUser.user_id)

    if (result.success) {
      showCustomToast('success', 'Admin demoted to user successfully')
      closeActionDialog()
      loadUsers()
    } else {
      showCustomToast('error', result.message || 'Failed to demote admin')
    }

    setIsProcessing(false)
  }

  function clearFilters() {
    setSearchQuery('')
    setRoleFilter('all')
    setTypeFilter('all')
    setSortField('created_at')
    setSortOrder('desc')
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superadmin':
        return (
          <Badge className="bg-purple-500/20 text-purple-400 border border-purple-400 font-mono text-xs">
            <ShieldCheck className="h-3 w-3 mr-1" />
            SUPERADMIN
          </Badge>
        )
      case 'admin':
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border border-blue-400 font-mono text-xs">
            <Shield className="h-3 w-3 mr-1" />
            ADMIN
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-500/20 text-gray-400 border border-gray-400 font-mono text-xs">
            <User className="h-3 w-3 mr-1" />
            USER
          </Badge>
        )
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    )
  }

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  const stats = {
    total: users.length,
    superadmins: users.filter((u) => u.role === 'superadmin').length,
    admins: users.filter((u) => u.role === 'admin').length,
    regularUsers: users.filter((u) => u.role === 'user').length,
    hackers: users.filter((u) => u.user_primary_type === 'hacker').length,
    organizers: users.filter((u) => u.user_primary_type === 'organizer').length,
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 mb-2">
            USER MANAGEMENT
          </h1>
          <p className="text-gray-400 font-mono">
            Comprehensive user management and administration
          </p>
        </div>
        <Button
          onClick={loadUsers}
          variant="outline"
          className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 font-mono"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-6 w-6 text-gray-400 mx-auto mb-2" />
              <p className="text-2xl font-blackops text-white">{stats.total}</p>
              <p className="text-xs text-gray-400 font-mono">Total Users</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-purple-500/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <ShieldCheck className="h-6 w-6 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-blackops text-purple-400">{stats.superadmins}</p>
              <p className="text-xs text-gray-400 font-mono">Superadmins</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-blue-500/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-blackops text-blue-400">{stats.admins}</p>
              <p className="text-xs text-gray-400 font-mono">Admins</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-500/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <User className="h-6 w-6 text-gray-400 mx-auto mb-2" />
              <p className="text-2xl font-blackops text-gray-400">{stats.regularUsers}</p>
              <p className="text-xs text-gray-400 font-mono">Regular</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-green-500/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-blackops text-green-400">{stats.hackers}</p>
              <p className="text-xs text-gray-400 font-mono">Hackers</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-orange-500/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-6 w-6 text-orange-400 mx-auto mb-2" />
              <p className="text-2xl font-blackops text-orange-400">{stats.organizers}</p>
              <p className="text-xs text-gray-400 font-mono">Organizers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white font-blackops flex items-center gap-2">
            <Filter className="h-5 w-5 text-purple-400" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-black border-gray-700 text-white font-mono"
                />
              </div>
            </div>

            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as RoleFilter)}>
              <SelectTrigger className="bg-black border-gray-700 text-white font-mono">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="all" className="text-white font-mono">All Roles</SelectItem>
                <SelectItem value="user" className="text-white font-mono">User</SelectItem>
                <SelectItem value="admin" className="text-white font-mono">Admin</SelectItem>
                <SelectItem value="superadmin" className="text-white font-mono">Superadmin</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as TypeFilter)}>
              <SelectTrigger className="bg-black border-gray-700 text-white font-mono">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="all" className="text-white font-mono">All Types</SelectItem>
                <SelectItem value="hacker" className="text-white font-mono">Hacker</SelectItem>
                <SelectItem value="organizer" className="text-white font-mono">Organizer</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <div className="flex gap-2">
              <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
                <SelectTrigger className="bg-black border-gray-700 text-white font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="name" className="text-white font-mono">Sort by Name</SelectItem>
                  <SelectItem value="email" className="text-white font-mono">Sort by Email</SelectItem>
                  <SelectItem value="role" className="text-white font-mono">Sort by Role</SelectItem>
                  <SelectItem value="created_at" className="text-white font-mono">Sort by Date</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                variant="outline"
                size="icon"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchQuery || roleFilter !== 'all' || typeFilter !== 'all') && (
            <div className="mt-4 flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/30 rounded-md">
              <p className="text-purple-400 font-mono text-sm">
                Showing {filteredUsers.length} of {users.length} users
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

      {/* Users Table */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white font-blackops flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-400" />
              All Users ({filteredUsers.length})
            </CardTitle>
            <p className="text-gray-400 font-mono text-sm">
              Page {currentPage} of {totalPages || 1}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {currentUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 font-mono text-lg mb-2">No users found</p>
              <p className="text-gray-500 font-mono text-sm">
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {currentUsers.map((user) => (
                  <div
                    key={user.user_id}
                    className="p-4 bg-gray-800/50 rounded-md hover:bg-gray-800/70 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* User Info */}
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <p className="font-bold text-white truncate">{user.full_name || 'N/A'}</p>
                          {getRoleBadge(user.role)}
                          {user.user_primary_type && (
                            <Badge className="bg-gray-700/50 text-gray-400 font-mono text-xs">
                              {user.user_primary_type}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 font-mono truncate">{user.email}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 font-mono">
                          <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                          {user.organization_name && <span>Org: {user.organization_name}</span>}
                        </div>
                      </div>

                      {/* Actions */}
                      {/* <div className="flex gap-2">
                        {user.role === 'user' && (
                          <Button
                            onClick={() => openActionDialog(user, 'promote')}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white font-mono"
                          >
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Promote
                          </Button>
                        )}
                        {user.role === 'admin' && (
                          <Button
                            onClick={() => openActionDialog(user, 'demote')}
                            size="sm"
                            variant="outline"
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10 font-mono"
                          >
                            <ChevronDown className="h-4 w-4 mr-1" />
                            Demote
                          </Button>
                        )}
                        {user.role === 'superadmin' && (
                          <Badge className="bg-purple-500/20 text-purple-400 border border-purple-400 font-mono">
                            Protected
                          </Badge>
                        )}
                      </div> */}
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

      {/* Promote Dialog */}
      <Dialog open={actionType === 'promote'} onOpenChange={closeActionDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-green-400 font-blackops">Promote to Admin</DialogTitle>
            <DialogDescription className="text-gray-400 font-mono">
              Are you sure you want to promote this user to admin? They will have access to the
              admin dashboard and all admin features.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="p-4 bg-gray-800 rounded-md">
              <p className="font-bold text-white mb-1">{selectedUser.full_name}</p>
              <p className="text-sm text-gray-400 font-mono">{selectedUser.email}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={closeActionDialog}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePromote}
              className="bg-green-600 hover:bg-green-700 text-white font-bold"
              disabled={isProcessing}
            >
              {isProcessing ? 'Promoting...' : 'Confirm Promotion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Demote Dialog */}
      <Dialog open={actionType === 'demote'} onOpenChange={closeActionDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-400 font-blackops">Demote to User</DialogTitle>
            <DialogDescription className="text-gray-400 font-mono">
              Are you sure you want to demote this admin to a regular user? They will lose access to
              the admin dashboard.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="p-4 bg-gray-800 rounded-md">
              <p className="font-bold text-white mb-1">{selectedUser.full_name}</p>
              <p className="text-sm text-gray-400 font-mono">{selectedUser.email}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={closeActionDialog}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDemote}
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
              disabled={isProcessing}
            >
              {isProcessing ? 'Demoting...' : 'Confirm Demotion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
