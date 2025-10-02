"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

function isOnboardingPath(pathname: string | null): boolean {
  if (!pathname) return false
  return pathname.startsWith("/onboarding")
}

function isAuthPath(pathname: string | null): boolean {
  if (!pathname) return false
  return pathname.startsWith("/auth")
}

export function NavbarGate() {
  const pathname = usePathname()
  if (isOnboardingPath(pathname)) return null
  if (isAuthPath(pathname)) return null
  return <Navbar />
}

export function FooterGate() {
  const pathname = usePathname()
  if (isOnboardingPath(pathname)) return null
  if (isAuthPath(pathname)) return null
  return <Footer />
}


