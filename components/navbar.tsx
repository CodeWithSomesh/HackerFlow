"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
// import { ModeToggle } from "@/components/ui/mode-toggle"
import { Menu, LogOut, Settings, User, ChevronDown} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { signOut } from "@/app/utils/actions"
import HackerFlowLogo from '@/assets/hackerflow-logo.png';
import Image, { StaticImageData } from "next/image"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import BrowseHackathonImage from '@/assets/browseHackathonImage2.png';
import DashboardImage from '@/assets/dashboardImage2.png';

// Updated ListItem component with image support
const ListItem = forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & {
    title: string
    image?: StaticImageData
    imageAlt?: string
  }
>(({ className, title, children, href, image, imageAlt, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          href={href || "#"}
          className={cn(
            "block select-none space-y-2 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          {image && (
            <div className="relative w-full h-36 mb-2 rounded-md overflow-hidden flex items-center justify-center bg-teal-300">
              <Image
                src={image}
                alt={imageAlt || title}
                width={300}
                height={80}
                className="object-contain max-w-full max-h-full"
              />
            </div>
          )}
          <div className="text-md font-medium leading-none underline">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

// Mobile ListItem component (without image for mobile)
const MobileListItem = forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & {
    title: string
    onClose?: () => void
  }
>(({ className, title, children, href, onClose, ...props }, ref) => {
  return (
    <Link
      ref={ref}
      href={href || "#"}
      onClick={onClose}
      className={cn(
        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        className
      )}
      {...props}
    >
      <div className="text-sm font-medium leading-none underline">{title}</div>
      <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
        {children}
      </p>
    </Link>
  )
})
MobileListItem.displayName = "MobileListItem"

export function Navbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [hackathonsOpen, setHackathonsOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let mounted = true
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return
      setUserEmail(data.user?.email ?? null)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null)
    })
    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const initials = (email: string | null) => {
    if (!email) return "U"
    const namePart = email.split("@")[0]
    return namePart.slice(0, 2).toUpperCase()
  }

  const closeMobileMenu = () => {
    setIsOpen(false)
    setHackathonsOpen(false)
    setToolsOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 mt-3 mb-8 md:mb-0 px-4">
      <div className="mx-auto max-w-7xl w-full">
        <div className="flex items-center justify-between px-6 py-3 bg-background/80 backdrop-blur-xl border border-border rounded-full shadow-lg">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-[#08f8a5] flex items-center justify-center shadow-lg">
              <Image 
                src={HackerFlowLogo}
                alt="HackerFlow Logo"
                className="rounded-md"/>
            </div>
            <span className="font-bol font-blackops text-2xl tracking-tight text-foreground flex">HackerFlow</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 text-md md:flex lg:-ml-36">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent data-[state=open]:bg-transparent hover:bg-accent/50">
                    Hackathons
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="min-w-[400px] p-4 bg-black">
                    <ul className="grid w-[400px] gap-2 md:w-[500px] grid-cols-2  lg:w-[550px]">
                      <ListItem
                        title="Browse Hackathons"
                        href="/hackathons"
                        className="hover:bg-gray-600"
                        image={BrowseHackathonImage} 
                        imageAlt="Browse Hackathons"
                      >
                        Discover upcoming hackathons and join the community.
                      </ListItem>
                      <ListItem
                        title="Organize Hackathons"
                        href="/organize/step1"
                        className="hover:bg-gray-600"
                        image={DashboardImage} 
                        imageAlt="Organize Hackathons"
                      >
                        Create and manage your own hackathon events.
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent data-[state=open]:bg-transparent hover:bg-accent/50">
                    Tools
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="min-w-[400px] p-4 bg-black">
                    <ul className="grid w-[400px] gap-3 md:w-[500px] grid-cols-2 lg:w-[550px]">
                      <ListItem
                        title="Generate Hackathon Ideas with AI"
                        href="/hackathons"
                        className="hover:bg-gray-600"
                        image={BrowseHackathonImage} 
                        imageAlt="AI Idea Generation"
                      >
                        Use AI to brainstorm innovative project ideas for hackathons.
                      </ListItem>
                      <ListItem
                        title="AI Team Matchmaking"
                        href="/organize/step1"
                        className="hover:bg-gray-600"
                        image={BrowseHackathonImage} 
                        imageAlt="Team Matchmaking"
                      >
                        Find the perfect teammates with AI-powered matching.
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link href="/leaderboard" className="bg-transparent hover:bg-accent/50">
                      Leaderboard
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          <div className="flex items-center gap-3">
            {/* Desktop User Menu */}
            <div className="hidden md:flex">
              {userEmail ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded-full bg-black border border-gray-400">
                    <Avatar className="h-10 w-10 bg-teal-400">
                      <AvatarFallback className="font-bol font-blackops">{initials(userEmail)}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-black">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white" />
                    <DropdownMenuItem className="hover:bg-gray-600">
                      <User className="h-4 w-4" /> Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-gray-600">
                      <User className="h-4 w-4" /> Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-gray-600">
                      <Settings className="h-4 w-4" /> Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white" />
                    <DropdownMenuItem asChild>
                      <form action={signOut} className="w-full hover:bg-gray-700 hover:font-bold">
                        <LogOut className="h-4 w-4 text-red-500" />
                        <button type="submit" className="w-full text-left text-red-500">Sign Out</button>
                      </form>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  asChild
                  className="bg-[#08f8a5] text-black font-black hover:text-white hover:bg-teal-600 shadow-lg hover:shadow-xl transition-all"
                >
                  <Link href="/onboarding/user-type">Join HackerFlow</Link>
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-white border border-white hover:bg-teal-300 ">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-black border-gray-800">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-6">
                    <Link href="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
                      <div className="h-8 w-8 rounded-lg bg-[#08f8a5] flex items-center justify-center shadow-lg">
                        <Image 
                          src={HackerFlowLogo}
                          alt="HackerFlow Logo"
                          className="rounded-md"/>
                      </div>
                      <span className="font-bol font-blackops text-xl tracking-tight text-foreground">HackerFlow</span>
                    </Link>
                  </div>

                  {/* Navigation */}
                  <nav className="flex-1 space-y-2">
                    {/* Hackathons Section */}
                    <Collapsible open={hackathonsOpen} onOpenChange={setHackathonsOpen}>
                      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-800 transition-colors">
                        Hackathons
                        <ChevronDown className={cn("h-4 w-4 transition-transform", hackathonsOpen && "rotate-180")} />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 px-3">
                        <MobileListItem
                          title="Browse Hackathons"
                          href="/hackathons"
                          onClose={closeMobileMenu}
                          className="hover:bg-gray-700"
                        >
                          Discover upcoming hackathons and join the community.
                        </MobileListItem>
                        <MobileListItem
                          title="Organize Hackathons"
                          href="/organize/step1"
                          onClose={closeMobileMenu}
                          className="hover:bg-gray-700"
                        >
                          Create and manage your own hackathon events.
                        </MobileListItem>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Tools Section */}
                    <Collapsible open={toolsOpen} onOpenChange={setToolsOpen}>
                      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-800 transition-colors">
                        Tools
                        <ChevronDown className={cn("h-4 w-4 transition-transform", toolsOpen && "rotate-180")} />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 px-3">
                        <MobileListItem
                          title="Generate Hackathon Ideas with AI"
                          href="/hackathons"
                          onClose={closeMobileMenu}
                          className="hover:bg-gray-700"
                        >
                          Use AI to brainstorm innovative project ideas for hackathons.
                        </MobileListItem>
                        <MobileListItem
                          title="AI Team Matchmaking"
                          href="/organize/step1"
                          onClose={closeMobileMenu}
                          className="hover:bg-gray-700"
                        >
                          Find the perfect teammates with AI-powered matching.
                        </MobileListItem>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Leaderboard */}
                    <Link
                      href="/leaderboard"
                      onClick={closeMobileMenu}
                      className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      Leaderboard
                    </Link>
                  </nav>

                  {/* Mobile User Section */}
                  <div className="border-t border-gray-800 pt-6 mt-auto">
                    {userEmail ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 px-3 py-2">
                          <Avatar className="h-8 w-8 bg-teal-400">
                            <AvatarFallback className="font-bol font-blackops text-sm">{initials(userEmail)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{userEmail}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <Link
                            href="/profile"
                            onClick={closeMobileMenu}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-800 transition-colors"
                          >
                            <User className="h-4 w-4" />
                            Profile
                          </Link>
                          <Link
                            href="/dashboard"
                            onClick={closeMobileMenu}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-800 transition-colors"
                          >
                            <User className="h-4 w-4" />
                            Dashboard
                          </Link>
                          <Link
                            href="/settings"
                            onClick={closeMobileMenu}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-800 transition-colors"
                          >
                            <Settings className="h-4 w-4" />
                            Settings
                          </Link>
                          
                          <form action={signOut} className="w-full">
                            <button 
                              type="submit" 
                              className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-gray-800 transition-colors"
                              onClick={closeMobileMenu}
                            >
                              <LogOut className="h-4 w-4" />
                              Sign Out
                            </button>
                          </form>
                        </div>
                      </div>
                    ) : (
                      <Button
                        asChild
                        className="w-full bg-[#08f8a5] text-black font-black hover:text-white hover:bg-teal-600 shadow-lg hover:shadow-xl transition-all"
                        onClick={closeMobileMenu}
                      >
                        <Link href="/onboarding/user-type">Join HackerFlow</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}