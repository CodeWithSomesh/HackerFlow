'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getHackerTeamMemberships } from '@/lib/actions/dashboard-actions'
import { Users, Crown, ExternalLink, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadTeams()
  }, [])

  async function loadTeams() {
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

      setTeams([
        {
          team_id: 't1',
          team_name: 'Code Warriors',
          hackathon_title: 'AI Innovation Hackathon',
          hackathon_id: 'h1',
          is_leader: true,
          team_size: 4,
          members: [
            { full_name: 'John Doe', profile_image: null },
            { full_name: 'Jane Smith', profile_image: null },
            { full_name: 'Bob Johnson', profile_image: null },
            { full_name: 'Alice Brown', profile_image: null },
          ],
        },
        {
          team_id: 't2',
          team_name: 'Web3 Pioneers',
          hackathon_title: 'Blockchain Summit',
          hackathon_id: 'h2',
          is_leader: false,
          team_size: 3,
          members: [
            { full_name: 'Sarah Lee', profile_image: null },
            { full_name: 'Mike Chen', profile_image: null },
            { full_name: 'Emma Wilson', profile_image: null },
          ],
        },
        {
          team_id: 't3',
          team_name: 'Mobile Innovators',
          hackathon_title: 'App Development Challenge',
          hackathon_id: 'h3',
          is_leader: true,
          team_size: 5,
          members: [
            { full_name: 'David Kim', profile_image: null },
            { full_name: 'Lisa Wang', profile_image: null },
            { full_name: 'Tom Harris', profile_image: null },
            { full_name: 'Nina Patel', profile_image: null },
            { full_name: 'Chris Martin', profile_image: null },
          ],
        },
      ])
    } else {
      // ============================================================================
      // PRODUCTION CODE
      // This code fetches real data from the database
      // ============================================================================
      const result = await getHackerTeamMemberships()
      if (result.success) {
        setTeams(result.data)
      }
    }

    setLoading(false)
  }

  const filteredTeams = teams.filter(team =>
    team.team_name.toLowerCase().includes(search.toLowerCase()) ||
    team.hackathon_title.toLowerCase().includes(search.toLowerCase())
  )

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-purple-400 mb-2">
          MY TEAMS
        </h1>
        <p className="text-gray-400 font-mono">
          Teams you're part of across all hackathons
        </p>
      </div>

      {/* Search */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search teams or hackathons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Teams Grid */}
      {filteredTeams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <Card key={team.id} className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800 hover:border-teal-400 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white font-blackops flex items-center gap-2 text-lg mb-2">
                      <Users className="h-5 w-5 text-teal-400" />
                      {team.team_name}
                    </CardTitle>
                    <Link href={`/hackathons/${team.hackathon_id}`} className="text-sm text-gray-400 hover:text-teal-400 font-mono flex items-center gap-1">
                      {team.hackathon_title}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                  {team.is_leader && (
                    <Badge className="bg-yellow-600 text-white border-yellow-400">
                      <Crown className="h-3 w-3 mr-1" />
                      Leader
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Team Size */}
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-sm text-gray-400 font-mono">Team Size</span>
                    <span className="text-white font-bold">
                      {team.team_size_current} / {team.team_size_max}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-sm text-gray-400 font-mono">Status</span>
                    <Badge variant={team.status === 'active' ? 'default' : 'secondary'} className={team.status === 'active' ? 'bg-green-600' : ''}>
                      {team.status}
                    </Badge>
                  </div>

                  {/* Members Avatars */}
                  <div>
                    <p className="text-sm text-gray-400 font-mono mb-2">Members</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {team.members.slice(0, 5).map((member: any) => (
                        <div key={member.id} className="relative group">
                          <Avatar className="h-10 w-10 bg-gradient-to-br from-purple-400 to-pink-500 border-2 border-gray-800">
                            <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-500 text-white font-bold text-xs">
                              {getInitials(member.first_name + ' ' + member.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            {member.first_name} {member.last_name}
                            {member.is_leader && ' (Leader)'}
                          </div>
                        </div>
                      ))}
                      {team.members.length > 5 && (
                        <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center border-2 border-gray-700">
                          <span className="text-xs font-bold text-gray-400">
                            +{team.members.length - 5}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-16 w-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-blackops text-white mb-2">No Teams Found</h3>
            <p className="text-gray-400 font-mono text-sm mb-6 text-center">
              {search ? 'Try adjusting your search' : 'You haven\'t joined any teams yet'}
            </p>
            {!search && (
              <Link href="/hackathons">
                <Button className="bg-teal-600 hover:bg-teal-500 text-white font-mono font-bold">
                  Browse Hackathons
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
