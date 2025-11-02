'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Home,
  DollarSign,
  FileCheck,
  Users,
  BarChart3,
  Shield,
  Menu,
  ChevronDown,
  LogOut,
  ShieldCheck,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarNav, SidebarNavItem, useSidebar } from '@/components/ui/sidebar'
import { signOut } from '@/app/utils/actions'
import Image from 'next/image'
import HackerFlowLogo from '@/assets/hackerflow-logo.png'
import { checkAdminAccess } from '@/lib/actions/admin-actions'

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { open } = useSidebar()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [role, setRole] = useState<string>('admin')
  const [isSuperadmin, setIsSuperadmin] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAccess()
  }, [])

  async function checkAccess() {
    setIsLoading(true)
    const supabase = createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/admin/login')
      return
    }

    // Check admin access
    const accessCheck = await checkAdminAccess()
    if (!accessCheck.isAdmin) {
      router.push('/')
      return
    }

    setUser(user)
    setRole(accessCheck.role || 'admin')
    setIsSuperadmin(accessCheck.isSuperadmin || false)

    // Load profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    setProfile(profile)
    setIsLoading(false)
  }

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    if (email) {
      return email.slice(0, 2).toUpperCase()
    }
    return 'AD'
  }

  const baseNavItems = [
    { href: '/admin/dashboard', label: 'Overview', icon: Home },
    { href: '/admin/dashboard/revenue', label: 'Revenue', icon: DollarSign },
    { href: '/admin/dashboard/approvals', label: 'Approvals', icon: FileCheck },
    { href: '/admin/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  ]

  // Add Admin Management tab only for superadmin
  const navItems = isSuperadmin
    ? [...baseNavItems, { href: '/admin/dashboard/users', label: 'Admin Management', icon: Shield }]
    : baseNavItems

  const SidebarContent_Component = () => (
    <>
      <SidebarHeader className="border-b border-gray-800">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg flex-shrink-0">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          {open && (
            <span className="font-blackops text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">ADMIN</span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarNav>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.href === '/admin/dashboard'
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + '/')

            return (
              <Link key={item.href} href={item.href}>
                <SidebarNavItem active={isActive}>
                  <Icon className={`h-5 w-5 ${isActive ? 'text-purple-400' : ''}`} />
                  {open && <span>{item.label}</span>}
                </SidebarNavItem>
              </Link>
            )
          })}
        </SidebarNav>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-800">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 bg-gradient-to-br from-purple-400 to-pink-500">
            <AvatarImage src={profile?.profile_image} />
            <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-500 text-black font-bold">
              {getInitials(profile?.full_name, user?.email)}
            </AvatarFallback>
          </Avatar>
          {open && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {profile?.full_name || user?.email?.split('@')[0] || 'Admin'}
              </p>
              <p className="text-xs text-purple-400 truncate font-mono font-bold">
                {isSuperadmin ? 'SUPERADMIN' : 'ADMIN'}
              </p>
            </div>
          )}
        </div>
      </SidebarFooter>
    </>
  )

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-mono">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-black">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar>
          <SidebarContent_Component />
        </Sidebar>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-gradient-to-r from-gray-900 to-black border-b-2 border-purple-400 shadow-lg">
          <div className="flex items-center justify-between px-4 md:px-6 py-4">
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-white">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-gray-900 border-gray-800 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b border-gray-800">
                    <Link href="/" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                        <ShieldCheck className="h-6 w-6 text-white" />
                      </div>
                      <span className="font-blackops text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">ADMIN</span>
                    </Link>
                  </div>

                  <div className="flex-1 overflow-y-auto px-3 py-4">
                    <nav className="space-y-1">
                      {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                              isActive
                                ? 'bg-purple-500/20 text-purple-400 border-2 border-purple-400'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`}>
                              <Icon className={`h-5 w-5 ${isActive ? 'text-purple-400' : ''}`} />
                              <span>{item.label}</span>
                            </div>
                          </Link>
                        )
                      })}
                    </nav>
                  </div>

                  <div className="p-4 border-t border-gray-800">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 bg-gradient-to-br from-purple-400 to-pink-500">
                        <AvatarImage src={profile?.profile_image} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-500 text-black font-bold">
                          {getInitials(profile?.full_name, user?.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {profile?.full_name || user?.email?.split('@')[0] || 'Admin'}
                        </p>
                        <p className="text-xs text-purple-400 truncate font-mono font-bold">
                          {isSuperadmin ? 'SUPERADMIN' : 'ADMIN'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <div className="md:hidden flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <span className="font-blackops text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">ADMIN</span>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none">
                  <Avatar className="h-10 w-10 bg-gradient-to-br from-purple-400 to-pink-500">
                    <AvatarImage src={profile?.profile_image} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-500 text-black font-bold">
                      {getInitials(profile?.full_name, user?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-gray-400 hidden md:block" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-gray-900 border-gray-800" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold text-white">
                        {profile?.full_name || 'Admin'}
                      </p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-mono font-bold bg-purple-500/20 text-purple-400 border border-purple-400 w-fit mt-1">
                        {isSuperadmin ? 'SUPERADMIN' : 'ADMIN'} PORTAL
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem asChild>
                    <Link href="/" className="cursor-pointer">
                      Back to Home
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem asChild>
                    <form action={signOut} className="w-full">
                      <button type="submit" className="flex items-center w-full text-red-400 hover:text-red-300">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-black">
          {children}
        </main>
      </div>
    </div>
  )
}
