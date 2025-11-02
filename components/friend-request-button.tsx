'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  UserPlus,
  UserCheck,
  UserX,
  Clock,
  Loader2,
  Check,
  X
} from 'lucide-react'
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  checkFriendshipStatus,
  removeFriend
} from '@/lib/actions/friend-actions'
import { toast } from 'sonner'
import { FriendCelebrationModal } from './friend-celebration-modal'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface FriendRequestButtonProps {
  userId: string
  userName: string
  userImage?: string
  onStatusChange?: () => void
}

export function FriendRequestButton({
  userId,
  userName,
  userImage,
  onStatusChange
}: FriendRequestButtonProps) {
  const [status, setStatus] = useState<'none' | 'friends' | 'request_pending'>('none')
  const [direction, setDirection] = useState<'sent' | 'received' | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [friendshipId, setFriendshipId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showUnfriendDialog, setShowUnfriendDialog] = useState(false)

  useEffect(() => {
    loadStatus()
  }, [userId])

  const loadStatus = async () => {
    setLoading(true)
    const result = await checkFriendshipStatus(userId)

    if (result.success) {
      setStatus(result.status as any)
      setDirection((result.direction as 'sent' | 'received') || null)
      setRequestId(result.requestId || null)
      setFriendshipId(result.friendshipId || null)
    }

    setLoading(false)
  }

  const handleSendRequest = async () => {
    setActionLoading(true)
    const result = await sendFriendRequest(userId)

    if (result.success) {
      toast.success('Friend request sent!')
      setStatus('request_pending')
      setDirection('sent')
      onStatusChange?.()
    } else {
      toast.error(result.error || 'Failed to send request')
    }

    setActionLoading(false)
  }

  const handleAcceptRequest = async () => {
    if (!requestId) return

    setActionLoading(true)
    const result = await acceptFriendRequest(requestId)

    if (result.success) {
      toast.success('Friend request accepted!')
      setStatus('friends')
      setDirection(null)
      setShowCelebration(true)
      onStatusChange?.()
    } else {
      toast.error(result.error || 'Failed to accept request')
    }

    setActionLoading(false)
  }

  const handleRejectRequest = async () => {
    if (!requestId) return

    setActionLoading(true)
    const result = await rejectFriendRequest(requestId)

    if (result.success) {
      toast.info('Friend request rejected')
      setStatus('none')
      setDirection(null)
      setRequestId(null)
      onStatusChange?.()
    } else {
      toast.error(result.error || 'Failed to reject request')
    }

    setActionLoading(false)
  }

  const handleCancelRequest = async () => {
    if (!requestId) return

    setActionLoading(true)
    const result = await cancelFriendRequest(requestId)

    if (result.success) {
      toast.info('Friend request cancelled')
      setStatus('none')
      setDirection(null)
      setRequestId(null)
      onStatusChange?.()
    } else {
      toast.error(result.error || 'Failed to cancel request')
    }

    setActionLoading(false)
  }

  const handleUnfriend = () => {
    setShowUnfriendDialog(true)
  }

  const confirmUnfriend = async () => {
    if (!friendshipId) return

    setShowUnfriendDialog(false)
    setActionLoading(true)
    const result = await removeFriend(friendshipId)

    if (result.success) {
      toast.info('Removed from friends')
      setStatus('none')
      setFriendshipId(null)
      onStatusChange?.()
    } else {
      toast.error(result.error || 'Failed to remove friend')
    }

    setActionLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-6 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg">
        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
        <span className="text-gray-400 font-mono">Loading...</span>
      </div>
    )
  }

  // Friends - show unfriend option on hover
  if (status === 'friends') {
    return (
      <>
        <div className="relative group">
          <button
            onClick={handleUnfriend}
            disabled={actionLoading}
            className="flex items-center gap-2 px-6 py-3 bg-teal-500 border-4 border-black rounded-lg text-white font-mono font-bold hover:bg-red-500/80   transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 group-hover:hidden" />
                <UserX className="w-4 h-4 hidden group-hover:block" />
                <span className="group-hover:hidden">Friends</span>
                <span className="hidden group-hover:block">Unfriend</span>
              </>
            )}
          </button>
        </div>

        <FriendCelebrationModal
          isOpen={showCelebration}
          onClose={() => setShowCelebration(false)}
          friendName={userName}
          friendImage={userImage}
          friendId={userId}
        />

        {/* Unfriend Confirmation Dialog */}
        <AlertDialog open={showUnfriendDialog} onOpenChange={setShowUnfriendDialog}>
          <AlertDialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-blackops text-2xl text-white flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                  <UserX className="w-6 h-6 text-white" />
                </div>
                Remove Friend?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300 font-mono text-sm space-y-3 pt-4">
                <p>
                  Are you sure you want to unfriend <span className="text-white font-bold">{userName}</span>?
                </p>
                <p className="text-gray-400">
                  This action cannot be undone. You'll need to send a new friend request to reconnect.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel className="bg-gray-800 py-6 hover:bg-black border-gray-600 text-white font-mono">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmUnfriend}
                className="bg-gradient-to-r py-6 from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-mono font-bold"
              >
                Remove Friend
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  // Pending request - sent by current user
  if (status === 'request_pending' && direction === 'sent') {
    return (
      <button
        onClick={handleCancelRequest}
        disabled={actionLoading}
        className="flex items-center gap-2 px-6 py-3 bg-yellow-400 border-4 border-black rounded-lg text-white font-mono font-bold hover:bg-red-500/80   transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {actionLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            <Clock className="w-4 h-4" />
            <span>Cancel Request</span>
          </>
        )}
      </button>
    )
  }

  // Pending request - received by current user
  if (status === 'request_pending' && direction === 'received') {
    return (
      <>
        <div className="flex gap-2">
          <button
            onClick={handleAcceptRequest}
            disabled={actionLoading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 border-4 border-black rounded-lg text-white font-mono font-bold hover:from-teal-600 hover:to-cyan-600 shadow-lg shadow-teal-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Accept</span>
              </>
            )}
          </button>

          <button
            onClick={handleRejectRequest}
            disabled={actionLoading}
            className="flex items-center gap-2 px-6 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-gray-400 font-mono font-bold hover:bg-red-500/80  hover:text-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-4 h-4" />
            <span>Reject</span>
          </button>
        </div>

        <FriendCelebrationModal
          isOpen={showCelebration}
          onClose={() => setShowCelebration(false)}
          friendName={userName}
          friendImage={userImage}
          friendId={userId}
        />
      </>
    )
  }

  // No relationship - show add friend button
  return (
    <button
      onClick={handleSendRequest}
      disabled={actionLoading}
      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 border-4 border-black rounded-lg text-white font-mono font-bold hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {actionLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Sending...</span>
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          <span>Add Friend</span>
        </>
      )}
    </button>
  )
}
