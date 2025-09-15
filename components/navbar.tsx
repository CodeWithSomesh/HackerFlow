"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { Menu, Home, Zap, Calendar } from "lucide-react"
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
import DashboardImage from '@/assets/dashboardImage.png';

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
            <div className="relative w-full h-40 mb-2 rounded-md overflow-hidden flex items-center justify-center bg-teal-300">
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
    <header className="sticky top-0 z-50 p-4 mt-3">
      <div className="container mx-auto max-w-6xl">
        <div className="flex h-16 items-center justify-between px-6 bg-background/80 backdrop-blur-xl border border-border rounded-full shadow-lg relative">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-[#08f8a5] flex items-center justify-center shadow-lg">
              <Image 
                src={HackerFlowLogo}
                alt="HackerFlow Logo"
                className="rounded-md"/>
            </div>
            <span className="font-bol font-blackops text-2xl tracking-tight text-foreground">HackerFlow</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 text-md md:flex">
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

          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="outline"
              asChild
              className="border-teal-400 font-bold text-[#08f8a5] hover:bg-teal-50 dark:border-teal-400 dark:text-[#08f8a5] dark:hover:bg-teal-600 dark:hover:text-white bg-transparent"
            >
              <Link href="#organize">Organize Event</Link>
            </Button>
            {userEmail ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full w-9 h-9 p-0">
                    <Avatar className="w-8 h-8">
                      <AvatarImage alt="Profile" />
                      <AvatarFallback>{initials(userEmail)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="truncate">{userEmail}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/protected">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <form action={signOut} className="w-full">
                      <button type="submit" className="w-full text-left">Sign Out</button>
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

          {/* Mobile Nav */}
          <div className="md:hidden flex items-center gap-2">
            <ModeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="border-border bg-background/80 hover:bg-accent">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="border-border p-0 w-64 flex flex-col bg-background/95 backdrop-blur-xl"
              >
                <div className="flex items-center gap-2 px-4 py-4 border-b border-border">
                  <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">HF</span>
                  </div>
                  <span className="font-bold text-lg tracking-tight text-foreground">HackerFlow</span>
                </div>

                {/* Nav Links */}
                <nav className="flex flex-col gap-1 mt-2">
                  {links.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-accent hover:text-teal-600 transition-colors"
                    >
                      <span className="inline-flex items-center justify-center w-5 h-5 text-muted-foreground">
                        <l.icon className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-medium">{l.label}</span>
                    </Link>
                  ))}
                </nav>

                <div className="mt-auto border-t border-border p-4 space-y-3">
                  <Button
                    variant="outline"
                    asChild
                    className="w-full border-teal-200 text-teal-600 hover:bg-teal-50 dark:border-teal-800 dark:text-teal-400 dark:hover:bg-teal-950 bg-transparent"
                  >
                    <Link href="#organize">Organize Event</Link>
                  </Button>
                  {userEmail ? (
                    <div className="space-y-2">
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/protected">Dashboard</Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/settings">Settings</Link>
                      </Button>
                      <form action={signOut}>
                        <Button type="submit" className="w-full bg-teal-600 text-white hover:bg-teal-700">Sign Out</Button>
                      </form>
                    </div>
                  ) : (
                    <Button asChild className="w-full bg-teal-600 text-white hover:bg-teal-700">
                      <Link href="/onboarding/user-type">Join HackerFlow</Link>
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}