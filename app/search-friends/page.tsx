'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  User,
  MapPin,
  Briefcase,
  Code2,
  Building,
  UserPlus,
  UserCheck,
  UserX,
  Clock,
  Loader2,
  Users,
  Sparkles
} from 'lucide-react'
import { searchUsersDirect as searchUsers, type SearchUserResult } from '@/lib/actions/friend-actions-direct'
import { sendFriendRequest, cancelFriendRequest } from '@/lib/actions/friend-actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SearchFriendsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchUserResult[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Debounced search
  const performSearch = useCallback(async (query: string) => {
    if (!query || query.trim().length === 0) {
      setSearchResults([])
      return
    }

    setLoading(true)
    const result = await searchUsers(query)

    if (result.success && result.data) {
      setSearchResults(result.data)
    } else {
      toast.error(result.error || 'Search failed')
      setSearchResults([])
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, performSearch])

  const handleSendRequest = async (userId: string) => {
    setActionLoading(userId)
    const result = await sendFriendRequest(userId)

    if (result.success) {
      toast.success('Friend request sent!')
      // Update the local state
      setSearchResults(prevResults =>
        prevResults.map(user =>
          user.user_id === userId
            ? { ...user, friend_request_status: 'pending', friend_request_direction: 'sent' }
            : user
        )
      )
    } else {
      toast.error(result.error || 'Failed to send request')
    }

    setActionLoading(null)
  }

  const handleCancelRequest = async (userId: string) => {
    // Find the request (we'd need to store requestId in SearchUserResult or make another query)
    // For now, we'll just show an error message
    toast.info('Please cancel the request from your profile page')
  }

  const getButtonContent = (user: SearchUserResult) => {
    if (actionLoading === user.user_id) {
      return (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </>
      )
    }

    if (user.is_friend) {
      return (
        <>
          <UserCheck className="w-4 h-4" />
          <span>Friends</span>
        </>
      )
    }

    if (user.friend_request_status === 'pending') {
      if (user.friend_request_direction === 'sent') {
        return (
          <>
            <Clock className="w-4 h-4" />
            <span>Pending</span>
          </>
        )
      } else {
        return (
          <>
            <Clock className="w-4 h-4" />
            <span>Respond</span>
          </>
        )
      }
    }

    return (
      <>
        <UserPlus className="w-4 h-4" />
        <span>Add Friend</span>
      </>
    )
  }

  const handleButtonClick = (user: SearchUserResult) => {
    if (user.is_friend) {
      router.push(`/profile/${user.user_id}`)
    } else if (user.friend_request_status === 'pending') {
      if (user.friend_request_direction === 'received') {
        router.push('/profile?tab=requests')
      } else {
        toast.info('Request already sent')
      }
    } else {
      handleSendRequest(user.user_id)
    }
  }

  return (
    <div className="min-h-screen bg-black mt-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-500 to-yellow-400 border-y-4 border-pink-400 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-blackops text-white drop-shadow-lg">
                Find Friends
              </h1>
              <p className="text-xl text-white/90 font-mono">
                Search and connect with other hackers and organizers
              </p>
            </div>
            <Link href="/profile?tab=friends">
              <button className="flex items-center gap-2 px-6 py-3 bg-gray-900/80 backdrop-blur border-2 border-gray-700 rounded-lg text-white font-mono font-bold hover:border-teal-400 transition-all">
                <Users className="w-5 h-5" />
                My Friends
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-lg blur-xl" />
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-6 h-6 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-14 pr-4 py-4 bg-gray-900 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 font-mono focus:outline-none focus:border-teal-400 transition-colors"
              />
              {loading && (
                <Loader2 className="absolute right-4 w-6 h-6 text-teal-400 animate-spin" />
              )}
            </div>
          </div>
          <p className="text-center text-gray-500 font-mono text-sm mt-2">
            Start typing to search for users
          </p>
        </div>

        {/* Search Results */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {searchResults.length > 0 ? (
              searchResults.map((user, index) => (
                <motion.div
                  key={user.user_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-900 border-2 border-gray-800 rounded-lg p-6 hover:border-teal-400/50 transition-all"
                >
                  <div className="flex items-start gap-6">
                    {/* Profile Image */}
                    <Link href={`/profile/${user.user_id}`}>
                      {user.profile_image ? (
                        <img
                          src={user.profile_image}
                          alt={user.full_name}
                          className="w-40 h-40 rounded-2xl border-2 border-teal-400 object-cover cursor-pointer hover:border-teal-300 transition-colors"
                        />
                      ) : (
                        <div className="w-40 h-40 rounded-2xl border-2 border-teal-400 bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center cursor-pointer hover:border-teal-300 transition-colors">
                          <User className="w-10 h-10 text-white" />
                        </div>
                      )}
                    </Link>

                    {/* User Info */}
                    <div className="flex-1">
                      <Link href={`/profile/${user.user_id}`}>
                        <h3 className="text-2xl font-blackops text-white hover:text-teal-400 transition-colors cursor-pointer">
                          {user.full_name}
                        </h3>
                      </Link>
                      <p className="text-gray-400 font-mono text-sm mb-2">{user.email}</p>

                      {user.bio && (
                        <p className="text-gray-300 mb-3 font-geist line-clamp-2">{user.bio}</p>
                      )}

                      <div className="flex flex-wrap gap-3 mb-3">
                        {/* User Type Badge */}
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 ${
                          user.user_primary_type === 'hacker'
                            ? 'bg-purple-500/10 border-purple-500 text-purple-400'
                            : 'bg-orange-500/10 border-orange-500 text-orange-400'
                        }`}>
                          {user.user_primary_type === 'hacker' ? (
                            <Code2 className="w-4 h-4" />
                          ) : (
                            <Building className="w-4 h-4" />
                          )}
                          <span className="font-mono text-sm font-bold capitalize">
                            {user.user_primary_type}
                          </span>
                        </div>

                        {/* Location */}
                        {(user.city || user.state || user.country) && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 border-2 border-gray-700 rounded-lg text-gray-300">
                            <MapPin className="w-4 h-4" />
                            <span className="font-mono text-sm">
                              {[user.city, user.state, user.country].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}

                        {/* Position/Role */}
                        {(user.position || user.organization_name) && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 border-2 border-gray-700 rounded-lg text-gray-300">
                            <Briefcase className="w-4 h-4" />
                            <span className="font-mono text-sm">
                              {user.position || user.organization_name}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Skills (for hackers) */}
                      {user.programming_languages && user.programming_languages.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {user.programming_languages.slice(0, 5).map((lang, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-teal-500/10 border border-teal-500/30 rounded text-teal-400 text-xs font-mono"
                            >
                              {lang}
                            </span>
                          ))}
                          {user.programming_languages.length > 5 && (
                            <span className="px-2 py-1 text-gray-500 text-xs font-mono">
                              +{user.programming_languages.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div>
                      <button
                        onClick={() => handleButtonClick(user)}
                        disabled={actionLoading === user.user_id}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-mono font-bold transition-all border-2 ${
                          user.is_friend
                            ? 'bg-teal-500/10 border-teal-500 text-teal-400 hover:bg-teal-500/20'
                            : user.friend_request_status === 'pending'
                            ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400 hover:bg-yellow-500/20'
                            : 'bg-gradient-to-r from-pink-500 to-rose-500 border-pink-400 text-white hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-500/30'
                        } ${actionLoading === user.user_id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {getButtonContent(user)}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              !loading && searchQuery.trim().length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-gray-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-400 mb-2">No users found</h3>
                  <p className="text-gray-500 font-mono">
                    Try searching with a different name or email
                  </p>
                </motion.div>
              )
            )}
          </AnimatePresence>

          {/* Empty state */}
          {!loading && searchQuery.trim().length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Start Your Search</h3>
              <p className="text-gray-400 font-mono">
                Type in the search bar above to find hackers and organizers
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
