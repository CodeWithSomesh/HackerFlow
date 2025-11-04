'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileCheck, List } from 'lucide-react'

export default function HackathonManagementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const tabs = [
    { href: '/admin/dashboard/hackathon-management/all', label: 'All Hackathons', icon: List },
    { href: '/admin/dashboard/hackathon-management/approvals', label: 'Approvals', icon: FileCheck },
  ]

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 mb-2">
          HACKATHON MANAGEMENT
        </h1>
        <p className="text-gray-400 font-mono">
          Manage and approve hackathon submissions
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b-2 border-gray-800">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/')

          return (
            <Link key={tab.href} href={tab.href}>
              <div
                className={`flex items-center gap-2 px-4 py-3 font-mono font-bold transition-all border-b-2 ${
                  isActive
                    ? 'border-purple-400 text-purple-400 bg-purple-500/10'
                    : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Tab Content */}
      <div>{children}</div>
    </div>
  )
}
