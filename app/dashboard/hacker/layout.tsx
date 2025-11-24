'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Home,
  Calendar,
  Users,
  Trophy,
  Award,
  Activity,
  Settings,
  Menu,
  Bell,
  ChevronDown,
  LogOut,
  X,
  Folder,
  Lightbulb,
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarNav, SidebarNavItem, useSidebar } from '@/components/ui/sidebar'
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, checkAndAwardBadges } from '@/lib/actions/dashboard-actions'
import { signOut } from '@/app/utils/actions'
import { DummyDataToggle } from '@/components/ui/dummy-data-toggle'
import Image from 'next/image'
import HackerFlowLogo from '@/assets/hackerflow-logo.png'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  read: boolean
  created_at: string
}

export default function HackerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { open } = useSidebar()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [hasOrganizerRole, setHasOrganizerRole] = useState(false)
  const [hasHackerRole, setHasHackerRole] = useState(false)

  useEffect(() => {
    loadUserData()
    loadNotifications()
    checkAndAwardUserBadges()

    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  async function checkAndAwardUserBadges() {
    try {
      // Check and award any eligible badges
      await checkAndAwardBadges()
    } catch (error) {
      console.error('Error checking badges:', error)
    }
  }

  async function loadUserData() {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setProfile(profile)

      // Check if user has organized hackathons
      const { count: organizerCount } = await supabase
        .from('hackathons')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user.id)

      // Check if user has participated in hackathons
      const { count: hackerCount } = await supabase
        .from('hackathon_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      setHasOrganizerRole((organizerCount || 0) > 0)
      setHasHackerRole((hackerCount || 0) > 0)
    }
  }

  function switchToOrganizer() {
    localStorage.setItem('lastDashboard', 'organizer')
    router.push('/dashboard/organizer')
  }

  function switchToHacker() {
    localStorage.setItem('lastDashboard', 'hacker')
    router.push('/dashboard/hacker')
  }

  async function loadNotifications() {
    const result = await getUserNotifications(undefined, false)
    if (result.success) {
      setNotifications(result.data)
      setUnreadCount(result.unreadCount || 0)
    }
  }

  async function handleNotificationClick(notification: Notification) {
    if (!notification.read) {
      await markNotificationAsRead(notification.id)
      await loadNotifications()
    }

    if (notification.link) {
      router.push(notification.link)
    }

    setNotificationsOpen(false)
  }

  async function handleMarkAllAsRead() {
    await markAllNotificationsAsRead()
    await loadNotifications()
  }

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    if (email) {
      return email.slice(0, 2).toUpperCase()
    }
    return 'HC'
  }

  const getTimeAgo = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)

    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return then.toLocaleDateString()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'registration': return '📝'
      case 'team_invite': return '👥'
      case 'winner_announcement': return '🏆'
      case 'payment_update': return '💰'
      case 'hackathon_update': return '📢'
      default: return '🔔'
    }
  }

  const navItems = [
    { href: '/dashboard/hacker', label: 'Overview', icon: Home },
    { href: '/dashboard/hacker/hackathons', label: 'My Hackathons', icon: Calendar },
    { href: '/dashboard/hacker/teams', label: 'Teams', icon: Users },
    { href: '/dashboard/hacker/prizes', label: 'Prizes', icon: Trophy },
    { href: '/dashboard/hacker/badges', label: 'Badges', icon: Award },
    { href: '/dashboard/hacker/ideas', label: 'Generated Ideas', icon: Lightbulb },
    { href: '/dashboard/hacker/activity', label: 'Activity', icon: Activity },
  ]

  const SidebarContent_Component = () => (
    <>
      <SidebarHeader className="border-b border-gray-800">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-teal-400 flex items-center justify-center shadow-lg flex-shrink-0">
            <Image
              src={HackerFlowLogo}
              alt="HackerFlow Logo"
              className="rounded-md"
            />
          </div>
          {open && (
            <span className="font-blackops text-2xl text-white">HackerFlow</span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarNav>
          {navItems.map((item) => {
            const Icon = item.icon
            // Fix: For the overview page, only match exact path, not children
            const isActive = item.href === '/dashboard/hacker'
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + '/')

            return (
              <Link key={item.href} href={item.href}>
                <SidebarNavItem active={isActive}>
                  <Icon className={`h-5 w-5 ${isActive ? 'text-teal-400' : ''}`} />
                  {open && <span>{item.label}</span>}
                </SidebarNavItem>
              </Link>
            )
          })}
        </SidebarNav>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-800">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 bg-gradient-to-br from-teal-400 to-cyan-500">
            <AvatarImage src={profile?.profile_image} />
            <AvatarFallback className="bg-gradient-to-br from-teal-400 to-cyan-500 text-black font-bold">
              {getInitials(profile?.full_name, user?.email)}
            </AvatarFallback>
          </Avatar>
          {open && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {profile?.full_name || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          )}
        </div>
      </SidebarFooter>
    </>
  )

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
        <header className="sticky top-0 z-40 bg-gradient-to-r from-gray-900 to-black border-b-2 border-teal-400 shadow-lg">
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
                      <div className="h-10 w-10 rounded-lg bg-teal-400 flex items-center justify-center shadow-lg">
                        <Image
                          src={HackerFlowLogo}
                          alt="HackerFlow Logo"
                          className="rounded-md"
                        />
                      </div>
                      <span className="font-blackops text-2xl text-white">HackerFlow</span>
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
                                ? 'bg-teal-500/20 text-teal-400 border-2 border-teal-400'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`}>
                              <Icon className={`h-5 w-5 ${isActive ? 'text-teal-400' : ''}`} />
                              <span>{item.label}</span>
                            </div>
                          </Link>
                        )
                      })}
                    </nav>
                  </div>

                  <div className="p-4 border-t border-gray-800">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 bg-gradient-to-br from-teal-400 to-cyan-500">
                        <AvatarImage src={profile?.profile_image} />
                        <AvatarFallback className="bg-gradient-to-br from-teal-400 to-cyan-500 text-black font-bold">
                          {getInitials(profile?.full_name, user?.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <div className="md:hidden flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-teal-400 flex items-center justify-center">
                <Image
                  src={HackerFlowLogo}
                  alt="HackerFlow Logo"
                  className="rounded-md"
                />
              </div>
              <span className="font-blackops text-xl text-white">HackerFlow</span>
            </div>

            <div className="flex w-full items-center justify-between gap-3">
              <div className='flex items-center gap-2'>
                {/* Role Switcher - Visible on all tabs */}
                {hasOrganizerRole && (
                  <Button
                    onClick={switchToOrganizer}
                    size="sm"
                    className="hidden md:flex bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-mono font-bold border-2 border-purple-400/50 hover:border-purple-300 transition-all shadow-lg p-5 hover:shadow-purple-500/50"
                  >
                    <Folder className="h-4 w-4 mr-2" />
                    Switch to Organizer Dashboard
                  </Button>
                )}

                {/* Dummy Data Toggle */}
                <div className="hidden lg:block">
                  <DummyDataToggle onToggle={() => {}} defaultValue={true} />
                </div>
              </div>

              <div className='flex items-center gap-2'>
                {/* Notifications */}
                <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative text-white hover:bg-gray-800"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 bg-gray-900 border-gray-800 p-0" align="end">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                      <h3 className="font-blackops text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-xs text-teal-400 hover:text-teal-300 font-mono font-bold"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="text-center py-8">
                          <Bell className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                          <p className="text-gray-400 font-mono text-sm">No notifications yet</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-800">
                          {notifications.map((notification) => (
                            <button
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification)}
                              className={`w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors ${
                                !notification.read ? 'bg-teal-500/5' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <span className="text-2xl flex-shrink-0">
                                  {getNotificationIcon(notification.type)}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-white text-sm">
                                      {notification.title}
                                    </p>
                                    {!notification.read && (
                                      <span className="h-2 w-2 rounded-full bg-teal-400"></span>
                                    )}
                                  </div>
                                  <p className="text-gray-400 text-xs mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-gray-500 text-xs mt-1">
                                    {getTimeAgo(notification.created_at)}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="hidden md:flex items-center gap-2 focus:outline-none">
                    <Avatar className="h-10 w-10 bg-gradient-to-br from-teal-400 to-cyan-500">
                      <AvatarImage src={profile?.profile_image} />
                      <AvatarFallback className="bg-gradient-to-br from-teal-400 to-cyan-500 text-black font-bold">
                        {getInitials(profile?.full_name, user?.email)}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 bg-gray-900 border-2 border-gray-400" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold text-white">
                          {profile?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-gray-400">{user?.email}</p>
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-mono font-bold bg-teal-500/20 text-teal-400 border border-teal-400 w-fit mt-1">
                          Hacker Dashboard
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-500" />
                    {hasOrganizerRole && (
                      <>
                        <DropdownMenuItem onClick={switchToOrganizer} className="cursor-pointer">
                          {/* <Users className="h-4 w-4 mr-2" /> */}
                          Switch to Organizer Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-500" />
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        View Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-500" />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings" className="cursor-pointer">
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-500" />
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
