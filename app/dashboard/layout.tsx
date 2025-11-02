'use client'

import { SidebarProvider } from '@/components/ui/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-black">
        {children}
      </div>
    </SidebarProvider>
  )
}
