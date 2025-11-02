'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getHackerRecentActivity } from '@/lib/actions/dashboard-actions'
import { Activity as ActivityIcon } from 'lucide-react'

export default function ActivityPage() {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadActivities()
  }, [])

  async function loadActivities() {
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

      setActivities([
        {
          id: '1',
          type: 'win',
          title: 'Won 1st Place',
          description: 'AI Innovation Hackathon 2024 - Received RM 10,000',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          link: '/hackathons/h1',
        },
        {
          id: '2',
          type: 'badge',
          title: 'Earned Badge: Champion',
          description: 'Unlocked by winning 3 hackathons',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          link: '/dashboard/hacker/badges',
        },
        {
          id: '3',
          type: 'registration',
          title: 'Registered for Hackathon',
          description: 'Mobile Dev Challenge - Team Registration',
          timestamp: new Date(Date.now() - 432000000).toISOString(),
          link: '/hackathons/h3',
        },
        {
          id: '4',
          type: 'win',
          title: 'Won 3rd Place',
          description: 'IoT Innovation Sprint - Received RM 2,000',
          timestamp: new Date(Date.now() - 1296000000).toISOString(),
          link: '/hackathons/h4',
        },
        {
          id: '5',
          type: 'badge',
          title: 'Earned Badge: Team Player',
          description: 'Unlocked by joining a team',
          timestamp: new Date(Date.now() - 2592000000).toISOString(),
          link: '/dashboard/hacker/badges',
        },
        {
          id: '6',
          type: 'registration',
          title: 'Registered for Hackathon',
          description: 'Web3 Summit Challenge - Individual Registration',
          timestamp: new Date(Date.now() - 5184000000).toISOString(),
          link: '/hackathons/h2',
        },
        {
          id: '7',
          type: 'badge',
          title: 'Earned Badge: First Steps',
          description: 'Unlocked by participating in first hackathon',
          timestamp: new Date(Date.now() - 10368000000).toISOString(),
          link: '/dashboard/hacker/badges',
        },
      ])
    } else {
      // ============================================================================
      // PRODUCTION CODE
      // This code fetches real data from the database
      // ============================================================================
      const result = await getHackerRecentActivity(undefined, 50)
      if (result.success) {
        setActivities(result.data)
      }
    }

    setLoading(false)
  }

  const filteredActivities = filter === 'all'
    ? activities
    : activities.filter(a => a.type === filter)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'registration': return '📝'
      case 'win': return '🏆'
      case 'badge': return '🏅'
      default: return '📌'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'registration': return 'border-blue-500/50 bg-blue-500/5'
      case 'win': return 'border-yellow-500/50 bg-yellow-500/5'
      case 'badge': return 'border-purple-500/50 bg-purple-500/5'
      default: return 'border-gray-700 bg-gray-800/30'
    }
  }

  const groupActivitiesByDate = (activities: any[]) => {
    const groups: Record<string, any[]> = {}
    const now = new Date()
    const today = now.toDateString()
    const yesterday = new Date(now.getTime() - 86400000).toDateString()

    activities.forEach(activity => {
      const activityDate = new Date(activity.timestamp)
      const dateString = activityDate.toDateString()

      let label = ''
      if (dateString === today) {
        label = 'Today'
      } else if (dateString === yesterday) {
        label = 'Yesterday'
      } else {
        label = activityDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: activityDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        })
      }

      if (!groups[label]) {
        groups[label] = []
      }
      groups[label].push(activity)
    })

    return groups
  }

  const groupedActivities = groupActivitiesByDate(filteredActivities)

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-purple-400 mb-2">
            ACTIVITY FEED
          </h1>
          <p className="text-gray-400 font-mono">
            Your complete activity timeline
          </p>
        </div>

        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activities</SelectItem>
            <SelectItem value="registration">Registrations</SelectItem>
            <SelectItem value="win">Wins</SelectItem>
            <SelectItem value="badge">Badges</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activity Timeline */}
      {Object.keys(groupedActivities).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedActivities).map(([date, dateActivities]) => (
            <div key={date}>
              <h2 className="text-xl font-blackops text-white mb-4 flex items-center gap-2">
                <span className="h-px flex-1 bg-gradient-to-r from-teal-400 to-transparent"></span>
                {date}
                <span className="h-px flex-1 bg-gradient-to-l from-teal-400 to-transparent"></span>
              </h2>

              <div className="space-y-3">
                {dateActivities.map((activity) => (
                  <Link
                    key={activity.id}
                    href={activity.link || '#'}
                    className="block"
                  >
                    <Card className={`bg-gradient-to-br from-gray-900 to-black border-2 ${getActivityColor(activity.type)} hover:border-teal-400 transition-all`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="text-3xl flex-shrink-0">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white text-base mb-1">
                              {activity.title}
                            </h3>
                            <p className="text-sm text-gray-400 font-mono mb-2">
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-500 font-mono">
                              {new Date(activity.timestamp).toLocaleString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ActivityIcon className="h-16 w-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-blackops text-white mb-2">No Activities Found</h3>
            <p className="text-gray-400 font-mono text-sm mb-6 text-center">
              {filter !== 'all' ? 'Try changing the filter' : 'Your activity will appear here as you participate'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
