'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getAllUsers, promoteToAdmin, demoteToUser, checkAdminAccess } from '@/lib/actions/admin-actions'
import { Shield, ShieldCheck, User, ChevronUp, ChevronDown } from 'lucide-react'
import { showCustomToast } from '@/components/toast-notification'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'

export default function AdminManagementPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSuperadmin, setIsSuperadmin] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [actionType, setActionType] = useState<'promote' | 'demote' | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    checkSuperadminAccess()
  }, [])

  async function checkSuperadminAccess() {
    const accessCheck = await checkAdminAccess()

    if (!accessCheck.isSuperadmin) {
      showCustomToast('error', 'Access denied: Superadmin only')
      router.push('/admin/dashboard')
      return
    }

    setIsSuperadmin(true)
    loadUsers()
  }

  async function loadUsers() {
    setLoading(true)
    const result = await getAllUsers()

    if (result.success) {
      setUsers(result.data)
    } else {
      showCustomToast('error', 'Failed to load users')
    }

    setLoading(false)
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

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superadmin':
        return (
          <Badge className="bg-purple-500/20 text-purple-400 border border-purple-400 font-mono">
            <ShieldCheck className="h-3 w-3 mr-1" />
            SUPERADMIN
          </Badge>
        )
      case 'admin':
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border border-blue-400 font-mono">
            <Shield className="h-3 w-3 mr-1" />
            ADMIN
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-500/20 text-gray-400 border border-gray-400 font-mono">
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
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  const adminUsers = users.filter(u => u.role === 'admin' || u.role === 'superadmin')
  const regularUsers = users.filter(u => u.role === 'user')

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 mb-2">
          ADMIN MANAGEMENT
        </h1>
        <p className="text-gray-400 font-mono">
          Manage admin roles and permissions (Superadmin Only)
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-purple-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-3xl font-blackops text-purple-400">
                  {adminUsers.filter(u => u.role === 'superadmin').length}
                </p>
                <p className="text-gray-400 font-mono text-sm">Superadmins</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-blue-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-3xl font-blackops text-blue-400">
                  {adminUsers.filter(u => u.role === 'admin').length}
                </p>
                <p className="text-gray-400 font-mono text-sm">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-gray-400" />
              <div>
                <p className="text-3xl font-blackops text-gray-400">{regularUsers.length}</p>
                <p className="text-gray-400 font-mono text-sm">Regular Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Admins */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white font-blackops flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-400" />
            Current Administrators
          </CardTitle>
        </CardHeader>
        <CardContent>
          {adminUsers.length === 0 ? (
            <p className="text-center text-gray-400 font-mono py-4">No administrators found</p>
          ) : (
            <div className="space-y-3">
              {adminUsers.map((user) => (
                <div
                  key={user.user_id}
                  className="p-4 bg-gray-800/50 rounded-md flex items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-bold text-white">{user.full_name || 'N/A'}</p>
                      {getRoleBadge(user.role)}
                    </div>
                    <p className="text-sm text-gray-400 font-mono">{user.email}</p>
                    <p className="text-xs text-gray-500 font-mono mt-1">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Regular Users */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white font-blackops flex items-center gap-2">
            <User className="h-5 w-5 text-gray-400" />
            Regular Users (Promote to Admin)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {regularUsers.length === 0 ? (
            <p className="text-center text-gray-400 font-mono py-4">No regular users found</p>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {regularUsers.map((user) => (
                <div
                  key={user.user_id}
                  className="p-4 bg-gray-800/50 rounded-md flex items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-bold text-white">{user.full_name || 'N/A'}</p>
                      {getRoleBadge(user.role)}
                      <Badge className="bg-gray-700/50 text-gray-400 font-mono text-xs">
                        {user.user_primary_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 font-mono">{user.email}</p>
                    <p className="text-xs text-gray-500 font-mono mt-1">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    onClick={() => openActionDialog(user, 'promote')}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white font-mono"
                  >
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Promote to Admin
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Promote Dialog */}
      <Dialog open={actionType === 'promote'} onOpenChange={closeActionDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-green-400 font-blackops">Promote to Admin</DialogTitle>
            <DialogDescription className="text-gray-400 font-mono">
              Are you sure you want to promote this user to admin? They will have access to the admin dashboard and all admin features.
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
              Are you sure you want to demote this admin to a regular user? They will lose access to the admin dashboard.
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
