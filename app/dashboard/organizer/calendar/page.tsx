'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getOrganizerHackathons } from '@/lib/actions/dashboard-actions'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CalendarPage() {
  const [hackathons, setHackathons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    loadHackathons()
  }, [])

  async function loadHackathons() {
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

      setHackathons([
        {
          id: 'h1',
          title: 'AI Innovation Hackathon',
          status: 'published',
          start_date: new Date(2025, 10, 5).toISOString(),
          end_date: new Date(2025, 10, 7).toISOString(),
        },
        {
          id: 'h2',
          title: 'Web3 Summit',
          status: 'published',
          start_date: new Date(2025, 10, 12).toISOString(),
          end_date: new Date(2025, 10, 14).toISOString(),
        },
        {
          id: 'h3',
          title: 'Mobile Dev Challenge',
          status: 'completed',
          start_date: new Date(2025, 9, 20).toISOString(),
          end_date: new Date(2025, 9, 22).toISOString(),
        },
        {
          id: 'h4',
          title: 'Blockchain Hackathon',
          status: 'published',
          start_date: new Date(2025, 10, 25).toISOString(),
          end_date: new Date(2025, 10, 27).toISOString(),
        },
        {
          id: 'h5',
          title: 'IoT Innovation Sprint',
          status: 'draft',
          start_date: new Date(2025, 11, 10).toISOString(),
          end_date: new Date(2025, 11, 12).toISOString(),
        },
      ])
    } else {
      // ============================================================================
      // PRODUCTION CODE
      // This code fetches real data from the database
      // ============================================================================
      const result = await getOrganizerHackathons(undefined, { limit: 1000 })
      if (result.success) {
        setHackathons(result.data)
      }
    }

    setLoading(false)
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, firstDay, lastDay }
  }

  const getHackathonsForDate = (date: Date) => {
    return hackathons.filter(hackathon => {
      const startDate = new Date(hackathon.registration_start_date || hackathon.start_date)
      const endDate = new Date(hackathon.registration_end_date || hackathon.end_date)
      const checkDate = new Date(date)

      return checkDate >= new Date(startDate.setHours(0, 0, 0, 0)) &&
             checkDate <= new Date(endDate.setHours(23, 59, 59, 999))
    })
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const goToToday = () => {
    setCurrentMonth(new Date())
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth)
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-600'
      case 'published': return 'bg-green-600'
      case 'completed': return 'bg-blue-600'
      case 'cancelled': return 'bg-red-600'
      default: return 'bg-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-[600px]" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 mb-2">
          CALENDAR
        </h1>
        <p className="text-gray-400 font-mono">
          View all your hackathons in a calendar format
        </p>
      </div>

      {/* Calendar Card */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-white font-blackops flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-purple-400" />
              {monthName}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={previousMonth}
                variant="outline"
                size="sm"
                className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                onClick={goToToday}
                variant="outline"
                size="sm"
                className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 font-mono"
              >
                Today
              </Button>
              <Button
                onClick={nextMonth}
                variant="outline"
                size="sm"
                className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-mono font-bold text-gray-400 p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square p-2 bg-gray-900/30 rounded-lg" />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1
              const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
              const isToday = new Date().toDateString() === date.toDateString()
              const dayHackathons = getHackathonsForDate(date)

              return (
                <div
                  key={day}
                  className={`aspect-square p-2 rounded-lg border-2 transition-all ${
                    isToday
                      ? 'bg-purple-500/20 border-purple-400'
                      : dayHackathons.length > 0
                      ? 'bg-gray-800/50 border-gray-700 hover:border-purple-400 cursor-pointer'
                      : 'bg-gray-900/30 border-gray-800'
                  }`}
                >
                  <div className="flex flex-col h-full">
                    <div className={`text-sm font-mono font-bold mb-1 ${
                      isToday ? 'text-purple-400' : 'text-white'
                    }`}>
                      {day}
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1">
                      {dayHackathons.slice(0, 2).map((hackathon) => (
                        <Link
                          key={hackathon.id}
                          href={`/dashboard/organizer/hackathons/${hackathon.id}`}
                          className="block"
                        >
                          <div
                            className={`text-xs p-1 rounded truncate ${getStatusColor(
                              hackathon.status
                            )} text-white hover:opacity-80 transition-opacity`}
                            title={hackathon.title}
                          >
                            {hackathon.title}
                          </div>
                        </Link>
                      ))}
                      {dayHackathons.length > 2 && (
                        <div className="text-xs text-gray-400 font-mono p-1">
                          +{dayHackathons.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white font-blackops text-lg">Status Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-600"></div>
              <span className="text-sm text-gray-400 font-mono">Draft</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-600"></div>
              <span className="text-sm text-gray-400 font-mono">Published</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-600"></div>
              <span className="text-sm text-gray-400 font-mono">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-600"></div>
              <span className="text-sm text-gray-400 font-mono">Cancelled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-purple-400 bg-purple-500/20"></div>
              <span className="text-sm text-gray-400 font-mono">Today</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Hackathons List */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white font-blackops">Upcoming Hackathons This Month</CardTitle>
        </CardHeader>
        <CardContent>
          {hackathons.filter(h => {
            const startDate = new Date(h.registration_start_date || h.start_date)
            return startDate.getMonth() === currentMonth.getMonth() &&
                   startDate.getFullYear() === currentMonth.getFullYear()
          }).length > 0 ? (
            <div className="space-y-3">
              {hackathons
                .filter(h => {
                  const startDate = new Date(h.registration_start_date || h.start_date)
                  return startDate.getMonth() === currentMonth.getMonth() &&
                         startDate.getFullYear() === currentMonth.getFullYear()
                })
                .sort((a, b) => new Date(a.registration_start_date || a.start_date).getTime() - new Date(b.registration_start_date || b.start_date).getTime())
                .map((hackathon) => (
                  <Link
                    key={hackathon.id}
                    href={`/dashboard/organizer/hackathons/${hackathon.id}`}
                    className="block p-4 rounded-lg border-2 border-gray-800 hover:border-purple-400 transition-all bg-gray-900/50 hover:bg-gray-800/50"
                  >
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-base mb-1">{hackathon.title}</h4>
                        <p className="text-sm text-gray-400 font-mono">
                          {new Date(hackathon.registration_start_date || hackathon.start_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          -{' '}
                          {new Date(hackathon.registration_end_date || hackathon.end_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <Badge className={getStatusColor(hackathon.status)}>
                        {hackathon.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-mono text-sm">No hackathons scheduled for this month</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
