'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { getHackathonParticipants, getHackathonTeams, getHackathonWinners } from '@/lib/actions/dashboard-actions'
import {
  Users,
  Trophy,
  Calendar,
  MapPin,
  Edit,
  Share2,
  Eye,
  DollarSign,
  Target,
  BarChart3,
} from 'lucide-react'
import Image from 'next/image'

export default function HackathonDetailPage() {
  const params = useParams()
  const hackathonId = params.id as string

  const [hackathon, setHackathon] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHackathonData()
  }, [hackathonId])

  async function loadHackathonData() {
    setLoading(true)
    const supabase = createClient()

    // Get hackathon details
    const { data: hackathonData } = await supabase
      .from('hackathons')
      .select('*')
      .eq('id', hackathonId)
      .single()

    setHackathon(hackathonData)

    // Get participants count
    const participantsResult = await getHackathonParticipants(hackathonId, { limit: 1 })
    const teamsResult = await getHackathonTeams(hackathonId)
    const winnersResult = await getHackathonWinners(hackathonId)

    const { count: teamParticipants } = await supabase
      .from('hackathon_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('hackathon_id', hackathonId)
      .eq('participant_type', 'team')
      .eq('registration_status', 'confirmed')

    const { count: individualParticipants } = await supabase
      .from('hackathon_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('hackathon_id', hackathonId)
      .eq('participant_type', 'individual')
      .eq('registration_status', 'confirmed')

    setStats({
      totalParticipants: (participantsResult.pagination?.total || 0),
      teamParticipants: teamParticipants || 0,
      individualParticipants: individualParticipants || 0,
      totalTeams: teamsResult.success ? teamsResult.data.length : 0,
      winnersCount: winnersResult.success ? winnersResult.data.length : 0,
    })

    setLoading(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary" className="bg-gray-700">Draft</Badge>
      case 'published':
        return <Badge className="bg-green-600">Published</Badge>
      case 'completed':
        return <Badge className="bg-blue-600">Completed</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading || !hackathon) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header Banner */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-black border-2 border-purple-500/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-6 flex-wrap md:flex-nowrap">
            {hackathon.logo_url ? (
              <Image
                src={hackathon.logo_url}
                alt={hackathon.title}
                width={120}
                height={120}
                className="rounded-lg border-2 border-purple-400"
              />
            ) : (
              <div className="w-30 h-30 rounded-lg bg-purple-800 flex items-center justify-center text-6xl border-2 border-purple-400">
                🚀
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-blackops text-white mb-2">{hackathon.title}</h1>
                  <p className="text-gray-400 font-mono">{hackathon.organization}</p>
                </div>
                {getStatusBadge(hackathon.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="h-4 w-4 text-purple-400" />
                  <span className="font-mono text-sm">
                    {new Date(hackathon.registration_start_date).toLocaleDateString()} - {new Date(hackathon.registration_end_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Target className="h-4 w-4 text-purple-400" />
                  <span className="font-mono text-sm capitalize">{hackathon.mode}</span>
                </div>
                {hackathon.location && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPin className="h-4 w-4 text-purple-400" />
                    <span className="font-mono text-sm">{hackathon.location}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <Link href={`/organize/step3?id=${hackathon.id}`}>
                  <Button variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <Link href={`/dashboard/organizer/hackathons/${hackathonId}/analytics`}>
                  <Button variant="outline" className="border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-black">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
                <Link href={`/hackathons/${hackathonId}`} target="_blank">
                  <Button variant="outline" className="border-gray-700 text-gray-300">
                    <Eye className="h-4 w-4 mr-2" />
                    View Public Page
                  </Button>
                </Link>
                {/* <Button variant="outline" className="border-gray-700 text-gray-300">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button> */}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-700/10 border-2 border-blue-500/50 hover:border-blue-400 transition-all">
          <CardHeader className="pb-4">
            <CardTitle className="text-blue-400 font-mono text-base flex items-center gap-2">
              <Users className="h-5 w-5" />
              Total Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-blackops text-white mb-2">
              {stats?.totalParticipants || 0}
            </div>
            <p className="text-sm text-gray-400 font-mono">Registered for this event</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-700/10 border-2 border-green-500/50 hover:border-green-400 transition-all">
          <CardHeader className="pb-4">
            <CardTitle className="text-green-400 font-mono text-base flex items-center gap-2">
              <Users className="h-5 w-5" />
              Total Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-blackops text-white mb-2">
              {stats?.totalTeams || 0}
            </div>
            <p className="text-sm text-gray-400 font-mono">Teams formed and active</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-700/10 border-2 border-yellow-500/50 hover:border-yellow-400 transition-all">
          <CardHeader className="pb-4">
            <CardTitle className="text-yellow-400 font-mono text-base flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Winners Declared
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-blackops text-white mb-2">
              {stats?.winnersCount || 0}
            </div>
            <p className="text-sm text-gray-400 font-mono">Prize winners announced</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white font-blackops">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href={`/dashboard/organizer/hackathons/${hackathonId}/participants`}>
              <Button variant="outline" className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                <Users className="h-5 w-5 mr-2" />
                Manage Participants
              </Button>
            </Link>
            {/* View Teams button removed - redundant with Manage Participants */}
            <Link href={`/dashboard/organizer/hackathons/${hackathonId}/winners`}>
              <Button variant="outline" className="w-full border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10">
                <Trophy className="h-5 w-5 mr-2" />
                Manage Winners
              </Button>
            </Link>
            <Link href={`/dashboard/organizer/hackathons/${hackathonId}/analytics`}>
              <Button variant="outline" className="w-full border-green-500/50 text-green-400 hover:bg-green-500/10">
                <BarChart3 className="h-5 w-5 mr-2" />
                View Analytics
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* ===========================================================================
          About Section - REMOVED for production
          Users can view full description on the public hackathon page.
          To restore: uncomment the section below
          =========================================================================== */}
      {/* <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white font-blackops">About This Hackathon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 font-mono whitespace-pre-wrap">{hackathon.about}</p>

          {hackathon.categories && hackathon.categories.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-bold text-gray-400 mb-2">Categories:</h4>
              <div className="flex flex-wrap gap-2">
                {hackathon.categories.map((category: string) => (
                  <Badge key={category} variant="outline" className="text-purple-400 border-purple-400">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card> */}
    </div>
  )
}
