'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  User,
  MapPin,
  Code2,
  Building,
  Loader2,
  UserX,
  ExternalLink,
  Search
} from 'lucide-react'
import { getFriendsList, getFriendsListForUser, removeFriend, type Friendship } from '@/lib/actions/friend-actions'
import { toast } from 'sonner'
import Link from 'next/link'
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

interface ProfileFriendsTabProps {
  isActive?: boolean
  onCountChange?: () => void
  targetUserId?: string  // Optional: if provided, shows this user's friends instead of logged-in user's friends
}

export function ProfileFriendsTab({ isActive = true, onCountChange, targetUserId }: ProfileFriendsTabProps = {}) {
  const [friends, setFriends] = useState<Friendship[]>([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showUnfriendDialog, setShowUnfriendDialog] = useState(false)
  const [friendToRemove, setFriendToRemove] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    loadFriends()
  }, [])

  // Reload friends when tab becomes active
  useEffect(() => {
    if (isActive) {
      loadFriends()
    }
  }, [isActive])

  const loadFriends = async () => {
    setLoading(true)

    // If targetUserId is provided, get that user's friends; otherwise get logged-in user's friends
    const result = targetUserId
      ? await getFriendsListForUser(targetUserId)
      : await getFriendsList()

    if (result.success && result.data) {
      setFriends(result.data as Friendship[])
    } else {
      toast.error(result.error || 'Failed to load friends')
    }

    setLoading(false)
  }

  const handleRemoveFriend = (friendshipId: string, friendName: string) => {
    setFriendToRemove({ id: friendshipId, name: friendName })
    setShowUnfriendDialog(true)
  }

  const confirmRemoveFriend = async () => {
    if (!friendToRemove) return

    setRemovingId(friendToRemove.id)
    setShowUnfriendDialog(false)

    const result = await removeFriend(friendToRemove.id)

    if (result.success) {
      toast.success('Removed from friends')
      setFriends(prev => prev.filter(f => f.id !== friendToRemove.id))

      // Notify parent to reload friend counts
      onCountChange?.()
    } else {
      toast.error(result.error || 'Failed to remove friend')
    }

    setRemovingId(null)
    setFriendToRemove(null)
  }

  const filteredFriends = friends.filter(friendship => {
    if (!searchQuery) return true
    const friend = friendship.friend
    if (!friend) return false

    const searchLower = searchQuery.toLowerCase()
    return (
      friend.full_name?.toLowerCase().includes(searchLower) ||
      friend.email?.toLowerCase().includes(searchLower) ||
      friend.city?.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-16">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-teal-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-mono">Loading friends...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-teal-400" />
            <div>
              <h2 className="text-3xl font-blackops text-white">
                {targetUserId ? 'FRIENDS' : 'MY FRIENDS'}
              </h2>
              <p className="text-gray-400 font-mono text-sm">
                {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
              </p>
            </div>
          </div>

          {!targetUserId && (
            <Link href="/search-friends">
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 border-2 border-pink-400 rounded-lg text-white font-mono font-bold hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-500/30 transition-all">
                <Search className="w-4 h-4" />
                Find Friends
              </button>
            </Link>
          )}
        </div>

        {/* Search */}
        {friends.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search friends by name or location..."
              className="w-full pl-11 pr-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 font-mono focus:outline-none focus:border-teal-400 transition-colors"
            />
          </div>
        )}
      </div>

      {/* Friends List */}
      {filteredFriends.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredFriends.map((friendship, index) => {
              const friend = friendship.friend
              if (!friend) return null

              return (
                <motion.div
                  key={friendship.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border-2 border-gray-700 p-6 hover:border-teal-400/50 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    {/* Profile Image */}
                    <Link href={`/profile/${friend.user_id}`}>
                      {friend.profile_image ? (
                        <img
                          src={friend.profile_image}
                          alt={friend.full_name}
                          className="w-16 h-16 rounded-full border-2 border-teal-400 object-cover cursor-pointer group-hover:border-teal-300 transition-colors"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full border-2 border-teal-400 bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center cursor-pointer group-hover:border-teal-300 transition-colors">
                          <User className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </Link>

                    {/* Friend Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/profile/${friend.user_id}`}>
                        <h3 className="text-xl font-bold text-white hover:text-teal-400 transition-colors cursor-pointer truncate">
                          {friend.full_name}
                        </h3>
                      </Link>
                      <p className="text-gray-400 font-mono text-sm mb-2 truncate">{friend.email}</p>

                      {/* Type Badge */}
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono font-bold mb-2 ${
                        friend.user_primary_type === 'hacker'
                          ? 'bg-purple-500/10 text-purple-400'
                          : 'bg-orange-500/10 text-orange-400'
                      }`}>
                        {friend.user_primary_type === 'hacker' ? (
                          <Code2 className="w-3 h-3" />
                        ) : (
                          <Building className="w-3 h-3" />
                        )}
                        {friend.user_primary_type}
                      </div>

                      {/* Location or Skills */}
                      {friend.city || friend.state || friend.country ? (
                        <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                          <MapPin className="w-3 h-3" />
                          <span className="font-mono truncate">
                            {[friend.city, friend.state, friend.country].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      ) : null}

                      {/* Skills (for hackers) */}
                      {friend.programming_languages && friend.programming_languages.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {friend.programming_languages.slice(0, 3).map((lang, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-teal-500/10 border border-teal-500/30 rounded text-teal-400 text-xs font-mono"
                            >
                              {lang}
                            </span>
                          ))}
                          {friend.programming_languages.length > 3 && (
                            <span className="px-2 py-0.5 text-gray-500 text-xs font-mono">
                              +{friend.programming_languages.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Link href={`/profile/${friend.user_id}`}>
                        <button className="p-2 bg-gray-800 border border-gray-700 rounded-lg hover:border-teal-400 hover:text-teal-400 text-gray-400 transition-all">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </Link>
                      {!targetUserId && (
                        <button
                          onClick={() => handleRemoveFriend(friendship.id, friend.full_name)}
                          disabled={removingId === friendship.id}
                          className="p-2 bg-gray-800 border border-gray-700 rounded-lg hover:border-red-500 hover:text-red-400 text-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {removingId === friendship.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <UserX className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-gray-700 p-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">
              {searchQuery ? 'No friends found' : 'No friends yet'}
            </h3>
            <p className="text-gray-500 font-mono mb-6">
              {searchQuery
                ? 'Try a different search query'
                : targetUserId
                  ? 'This user has no friends yet'
                  : 'Start connecting with other hackers and organizers'}
            </p>
            {!searchQuery && !targetUserId && (
              <Link href="/search-friends">
                <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 border-2 border-pink-400 rounded-lg text-white font-mono font-bold hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-500/30 transition-all">
                  Find Friends
                </button>
              </Link>
            )}
          </div>
        </div>
      )}

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
                Are you sure you want to unfriend <span className="text-white font-bold">{friendToRemove?.name}</span>?
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
              onClick={confirmRemoveFriend}
              className="bg-gradient-to-r py-6 from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-mono font-bold"
            >
              Remove Friend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
