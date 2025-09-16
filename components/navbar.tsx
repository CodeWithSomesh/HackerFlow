"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { Menu, Home, Zap, Calendar, LogOut, Settings, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

export function Navbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null)

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

  const links = [
    { href: "/hackathons", label: "Hackathons", icon: Home },
    { href: "#features", label: "Tools", icon: Zap },
    { href: "#events", label: "Leaderboard", icon: Calendar },
  ]

  return (
    <header className="sticky top-0 z-50 mt-3 px-4">
      <div className="mx-auto max-w-7xl w-full">
        <div className="flex items-center justify-between px-6 py-3 bg-background/80 backdrop-blur-xl border border-border rounded-full shadow-lg">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-[#08f8a5] flex items-center justify-center shadow-lg">
              <Image 
                src={HackerFlowLogo}
                alt="HackerFlow Logo"
                className="rounded-md"/>
            </div>
            <span className="font-bol font-blackops text-2xl tracking-tight text-foreground hidden md:flex">HackerFlow</span>
          </Link>

          {/* Desktop Nav */}
          <nav className=" items-center gap-8 text-md md:flex md:-ml-36">
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
                        href="/organize"
                        className="hover:bg-gray-600"
                        image={DashboardImage} 
                        imageAlt="Organize Hackathons"
                      >
                        Create and manage your own hackathon events.
                      </ListItem>
                      {/* <ListItem
                        title="Past Events"
                        href="/hackathons/past"
                        className="hover:bg-gray-600"
                        image={BrowseHackathonImage} 
                        imageAlt="Past Events"
                      >
                        Explore completed hackathons and their results.
                      </ListItem>
                      <ListItem
                        title="Resources"
                        href="/resources"
                        className="hover:bg-gray-600"
                        image={BrowseHackathonImage} 
                        imageAlt="Resources"
                      >
                        Tools and guides for hackathon success.
                      </ListItem> */}
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
                        href="/organize"
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

          <div className="md:flex items-center gap-3">
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

          
        </div>
      </div>
    </header>
  )
}