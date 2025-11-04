'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HackathonManagementRoot() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to approvals tab by default
    router.replace('/admin/dashboard/hackathon-management/approvals')
  }, [router])

  return (
    <div className="flex h-screen items-center justify-center bg-black">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400 font-mono">Loading...</p>
      </div>
    </div>
  )
}
