'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Inbox,
  Send,
  User,
  MapPin,
  Code2,
  Building,
  Loader2,
  Check,
  X,
  Clock,
  UserPlus
} from 'lucide-react'
import {
  getPendingFriendRequests,
  getSentFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest
} from '@/lib/actions/friend-actions'
import { toast } from 'sonner'
import Link from 'next/link'
import { FriendCelebrationModal } from './friend-celebration-modal'
import { triggerStars } from '@/lib/confetti'

interface FriendRequest {
  id: string
  sender_id: string
  receiver_id: string
  status: string
  created_at: string
  sender?: any
  receiver?: any
}

interface ProfileRequestsTabProps {
  isActive?: boolean
  onCountChange?: () => void
}

export function ProfileRequestsTab({ isActive = true, onCountChange }: ProfileRequestsTabProps = {}) {
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([])
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [activeSubTab, setActiveSubTab] = useState<'received' | 'sent'>('received')
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationFriend, setCelebrationFriend] = useState<{ name: string; image?: string; id: string } | null>(null)

  useEffect(() => {
    loadRequests()
  }, [])

  useEffect(() => {
    if (isActive) {
      loadRequests()
    }
  }, [isActive])

  const loadRequests = async () => {
    setLoading(true)

    console.log('🔄 Loading friend requests...')

    const [receivedResult, sentResult] = await Promise.all([
      getPendingFriendRequests(),
      getSentFriendRequests()
    ])

    console.log('📥 Received requests:', receivedResult.data?.length || 0)
    console.log('📤 Sent requests:', sentResult.data?.length || 0)

    if (receivedResult.success && receivedResult.data) {
      setReceivedRequests(receivedResult.data as FriendRequest[])
    } else {
      console.error('❌ Failed to load received requests:', receivedResult.error)
    }

    if (sentResult.success && sentResult.data) {
      setSentRequests(sentResult.data as FriendRequest[])
    } else {
      console.error('❌ Failed to load sent requests:', sentResult.error)
    }

    setLoading(false)
  }

  const handleAccept = async (requestId: string, senderName: string, senderImage?: string, senderId?: string) => {
    setActionLoading(requestId)
    const result = await acceptFriendRequest(requestId)

    if (result.success) {
      // Trigger star confetti effect
      triggerStars()

      toast.success('Friend request accepted!')

      // Remove from local state immediately
      setReceivedRequests(prev => prev.filter(r => r.id !== requestId))

      // Reload all requests to ensure counts are accurate
      await loadRequests()

      // Notify parent to reload friend counts
      onCountChange?.()

      // Show celebration modal
      if (senderId) {
        setCelebrationFriend({ name: senderName, image: senderImage, id: senderId })
        setShowCelebration(true)
      }
    } else {
      toast.error(result.error || 'Failed to accept request')
    }

    setActionLoading(null)
  }

  const handleReject = async (requestId: string) => {
    setActionLoading(requestId)
    const result = await rejectFriendRequest(requestId)

    if (result.success) {
      toast.info('Friend request rejected')

      // Remove from local state immediately
      setReceivedRequests(prev => prev.filter(r => r.id !== requestId))

      // Reload all requests to ensure counts are accurate
      await loadRequests()

      // Notify parent to reload friend counts
      onCountChange?.()
    } else {
      toast.error(result.error || 'Failed to reject request')
    }

    setActionLoading(null)
  }

  const handleCancel = async (requestId: string) => {
    setActionLoading(requestId)
    const result = await cancelFriendRequest(requestId)

    if (result.success) {
      toast.info('Friend request cancelled')

      // Remove from local state immediately
      setSentRequests(prev => prev.filter(r => r.id !== requestId))

      // Reload all requests to ensure counts are accurate
      await loadRequests()

      // Notify parent to reload friend counts
      onCountChange?.()
    } else {
      toast.error(result.error || 'Failed to cancel request')
    }

    setActionLoading(null)
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-16">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-teal-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-mono">Loading requests...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header with Sub-tabs */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Inbox className="w-8 h-8 text-pink-400" />
              <div>
                <h2 className="text-3xl font-blackops text-white">FRIEND REQUESTS</h2>
                <p className="text-gray-400 font-mono text-sm">
                  Manage your incoming and outgoing requests
                </p>
              </div>
            </div>

            <Link href="/search-friends">
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 border-2 border-pink-400 rounded-lg text-white font-mono font-bold hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-500/30 transition-all">
                <UserPlus className="w-4 h-4" />
                Find Friends
              </button>
            </Link>
          </div>

          {/* Sub-tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSubTab('received')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-mono font-bold transition-all ${
                activeSubTab === 'received'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <Inbox className="w-4 h-4" />
              Received
              {receivedRequests.length > 0 && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {receivedRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('sent')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-mono font-bold transition-all ${
                activeSubTab === 'sent'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <Send className="w-4 h-4" />
              Sent
              {sentRequests.length > 0 && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {sentRequests.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Received Requests */}
        {activeSubTab === 'received' && (
          <div className="space-y-4">
            {receivedRequests.length > 0 ? (
              <AnimatePresence mode="popLayout">
                {receivedRequests.map((request, index) => {
                  const sender = request.sender
                  if (!sender) return null

                  return (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border-2 border-gray-700 p-6 hover:border-pink-400/50 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        {/* Profile Image */}
                        <Link href={`/profile/${sender.user_id}`}>
                          {sender.profile_image ? (
                            <img
                              src={sender.profile_image}
                              alt={sender.full_name}
                              className="w-16 h-16 rounded-full border-2 border-pink-400 object-cover cursor-pointer hover:border-pink-300 transition-colors"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full border-2 border-pink-400 bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center cursor-pointer hover:border-pink-300 transition-colors">
                              <User className="w-8 h-8 text-white" />
                            </div>
                          )}
                        </Link>

                        {/* Request Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <Link href={`/profile/${sender.user_id}`}>
                                <h3 className="text-xl font-bold text-white hover:text-pink-400 transition-colors cursor-pointer">
                                  {sender.full_name}
                                </h3>
                              </Link>
                              <p className="text-gray-400 font-mono text-sm">{sender.email}</p>
                            </div>
                            <span className="text-gray-500 font-mono text-xs flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {getTimeAgo(request.created_at)}
                            </span>
                          </div>

                          {/* Type Badge */}
                          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono font-bold mb-2 ${
                            sender.user_primary_type === 'hacker'
                              ? 'bg-purple-500/10 text-purple-400'
                              : 'bg-orange-500/10 text-orange-400'
                          }`}>
                            {sender.user_primary_type === 'hacker' ? (
                              <Code2 className="w-3 h-3" />
                            ) : (
                              <Building className="w-3 h-3" />
                            )}
                            {sender.user_primary_type}
                          </div>

                          {sender.bio && (
                            <p className="text-gray-300 mb-3 line-clamp-2">{sender.bio}</p>
                          )}

                          {/* Skills (for hackers) */}
                          {sender.programming_languages && sender.programming_languages.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {sender.programming_languages.slice(0, 4).map((lang: string, i: number) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-teal-500/10 border border-teal-500/30 rounded text-teal-400 text-xs font-mono"
                                >
                                  {lang}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAccept(request.id, sender.full_name, sender.profile_image, sender.user_id)}
                              disabled={actionLoading === request.id}
                              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 border-2 border-teal-400 rounded-lg text-white font-mono font-bold hover:from-teal-600 hover:to-cyan-600 shadow-lg shadow-teal-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading === request.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                              Accept
                            </button>

                            <button
                              onClick={() => handleReject(request.id)}
                              disabled={actionLoading === request.id}
                              className="flex items-center gap-2 px-6 py-2.5 bg-gray-800 border-2 border-gray-700 rounded-lg text-gray-400 font-mono font-bold hover:bg-red-500/10 hover:border-red-500 hover:text-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <X className="w-4 h-4" />
                              Reject
                            </button>

                            <Link href={`/profile/${sender.user_id}`}>
                              <button className="px-6 py-2.5 bg-gray-800 border-2 border-gray-700 rounded-lg text-gray-400 font-mono font-bold hover:text-white hover:border-gray-600 transition-all">
                                View Profile
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            ) : (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-16">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Inbox className="w-10 h-10 text-gray-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-400 mb-2">No pending requests</h3>
                  <p className="text-gray-500 font-mono">
                    You don't have any friend requests at the moment
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sent Requests */}
        {activeSubTab === 'sent' && (
          <div className="space-y-4">
            {sentRequests.length > 0 ? (
              <AnimatePresence mode="popLayout">
                {sentRequests.map((request, index) => {
                  const receiver = request.receiver
                  if (!receiver) return null

                  return (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border-2 border-gray-700 p-6 hover:border-yellow-400/50 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        {/* Profile Image */}
                        <Link href={`/profile/${receiver.user_id}`}>
                          {receiver.profile_image ? (
                            <img
                              src={receiver.profile_image}
                              alt={receiver.full_name}
                              className="w-16 h-16 rounded-full border-2 border-yellow-400 object-cover cursor-pointer hover:border-yellow-300 transition-colors"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full border-2 border-yellow-400 bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center cursor-pointer hover:border-yellow-300 transition-colors">
                              <User className="w-8 h-8 text-white" />
                            </div>
                          )}
                        </Link>

                        {/* Request Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <Link href={`/profile/${receiver.user_id}`}>
                                <h3 className="text-xl font-bold text-white hover:text-yellow-400 transition-colors cursor-pointer">
                                  {receiver.full_name}
                                </h3>
                              </Link>
                              <p className="text-gray-400 font-mono text-sm">{receiver.email}</p>
                            </div>
                            <span className="text-gray-500 font-mono text-xs flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {getTimeAgo(request.created_at)}
                            </span>
                          </div>

                          {/* Status Badge */}
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono font-bold mb-3 bg-yellow-500/10 text-yellow-400">
                            <Clock className="w-3 h-3" />
                            Pending Response
                          </div>

                          {receiver.bio && (
                            <p className="text-gray-300 mb-3 line-clamp-2">{receiver.bio}</p>
                          )}

                          {/* Action Button */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCancel(request.id)}
                              disabled={actionLoading === request.id}
                              className="flex items-center gap-2 px-6 py-2.5 bg-gray-800 border-2 border-gray-700 rounded-lg text-gray-400 font-mono font-bold hover:bg-red-500/10 hover:border-red-500 hover:text-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading === request.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Cancelling...
                                </>
                              ) : (
                                <>
                                  <X className="w-4 h-4" />
                                  Cancel Request
                                </>
                              )}
                            </button>

                            <Link href={`/profile/${receiver.user_id}`}>
                              <button className="px-6 py-2.5 bg-gray-800 border-2 border-gray-700 rounded-lg text-gray-400 font-mono font-bold hover:text-white hover:border-gray-600 transition-all">
                                View Profile
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            ) : (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-16">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-10 h-10 text-gray-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-400 mb-2">No sent requests</h3>
                  <p className="text-gray-500 font-mono mb-6">
                    You haven't sent any friend requests yet
                  </p>
                  <Link href="/search-friends">
                    <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 border-2 border-pink-400 rounded-lg text-white font-mono font-bold hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-500/30 transition-all">
                      Find Friends
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Celebration Modal */}
      {celebrationFriend && (
        <FriendCelebrationModal
          isOpen={showCelebration}
          onClose={() => {
            setShowCelebration(false)
            setCelebrationFriend(null)
          }}
          friendName={celebrationFriend.name}
          friendImage={celebrationFriend.image}
          friendId={celebrationFriend.id}
        />
      )}
    </>
  )
}
