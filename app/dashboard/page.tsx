'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    async function checkUserRole() {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      // Check if user has organized any hackathons
      const { count: organizerCount } = await supabase
        .from('hackathons')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user.id)

      // Check if user has participated in any hackathons
      const { count: hackerCount } = await supabase
        .from('hackathon_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Check localStorage for last visited dashboard
      const lastDashboard = localStorage.getItem('lastDashboard')

      // Decide which dashboard to show
      if (lastDashboard === 'organizer' && organizerCount && organizerCount > 0) {
        router.push('/dashboard/organizer')
      } else if (lastDashboard === 'hacker' && hackerCount && hackerCount > 0) {
        router.push('/dashboard/hacker')
      } else if (hackerCount && hackerCount > 0) {
        router.push('/dashboard/hacker')
      } else if (organizerCount && organizerCount > 0) {
        router.push('/dashboard/organizer')
      } else {
        // Default to hacker if no activity yet
        router.push('/dashboard/hacker')
      }
    }

    checkUserRole()
  }, [router])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400 font-mono">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}
