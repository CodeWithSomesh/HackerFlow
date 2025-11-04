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

function isHackathonDetailsPath(pathname: string | null): boolean {
  if (!pathname) return false
  return pathname.startsWith("/hackathons/")
}

function isDashboardPath(pathname: string | null): boolean {
  if (!pathname) return false
  return pathname.startsWith("/dashboard/")
}

function isAdminPath(pathname: string | null): boolean {
  if (!pathname) return false
  return pathname.startsWith("/admin/")
}

function isFindTeammatesPath(pathname: string | null): boolean {
  if (!pathname) return false
  return pathname.startsWith("/find-teammates")
}

export function NavbarGate() {
  const pathname = usePathname()
  if (isOnboardingPath(pathname)) return null
  if (isAuthPath(pathname)) return null
  if (isHackathonDetailsPath(pathname)) return null
  if (isDashboardPath(pathname)) return null
  if (isAdminPath(pathname)) return null
  return <Navbar />
}

export function FooterGate() {
  const pathname = usePathname()
  if (isOnboardingPath(pathname)) return null
  if (isAuthPath(pathname)) return null
  if (isHackathonDetailsPath(pathname)) return null
  if (isDashboardPath(pathname)) return null
  if (isAdminPath(pathname)) return null
  if (isFindTeammatesPath(pathname)) return null
  return <Footer />
}


