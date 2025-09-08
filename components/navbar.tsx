"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { Menu, Home, Zap, Calendar, Users, Mail } from "lucide-react"

export function Navbar() {
  const links = [
    { href: "/", label: "Hackathons", icon: Home },
    { href: "#features", label: "Tools", icon: Zap },
    { href: "#events", label: "Leaderboard", icon: Calendar },
  ]

  return (
    <header className="sticky top-0 z-50 p-4 mt-3">
      <div className="container mx-auto max-w-6xl">
        <div className="flex h-14 items-center justify-between px-6 bg-background/80 backdrop-blur-xl border border-border rounded-full shadow-lg">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#08f8a5] flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">HF</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">HackerFlow</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 text-sm md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-muted-foreground hover:text-teal-500 transition-colors font-medium"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {/* <ModeToggle /> */}
            <Button
              variant="outline"
              asChild
              className="border-teal-400 font-bold text-[#08f8a5] hover:bg-teal-50 dark:border-teal-400 dark:text-[#08f8a5] dark:hover:bg-teal-600 dark:hover:text-white bg-transparent"
            >
              <Link href="#organize">Organize Event</Link>
            </Button>
            <Button
              asChild
              className="bg-[#08f8a5] text-white font-bold hover:bg-teal-600 shadow-lg hover:shadow-xl transition-all"
            >
              <Link href="/onboarding/user-type">Join HackerFlow</Link>
            </Button>
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
                  <Button asChild className="w-full bg-teal-600 text-white hover:bg-teal-700">
                    <Link href="/onboarding/user-type">Join HackerFlow</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}