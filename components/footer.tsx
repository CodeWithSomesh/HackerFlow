"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Github, Linkedin, Twitter, Mail, Users, Calendar, ArrowRight } from "lucide-react"
import Image from "next/image"
import HackerFlowLogo from '@/assets/hackerflow-logo.png';


export function Footer() {
    return (
        <footer className="border-t border-border ">
        <div className="container mx-auto py-6">
          <div className="grid gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-lg bg-[#08f8a5] flex items-center justify-center shadow-lg">
                    <Image 
                      src={HackerFlowLogo}
                      alt="HackerFlow Logo"
                      className="rounded-md"/>
                  </div>
                  <span className="font-bol font-blackops text-2xl tracking-tight text-foreground hidden md:flex">HackerFlow</span>
                </Link>
              </div>
              <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
                Revolutionizing hackathon participation in Malaysia's tech ecosystem with AI-powered team formation and
                centralized event discovery.
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  🇲🇾 Made in Malaysia
                </Badge>
              </div>
            </div>

            {/* Navigation */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <h5 className="mb-3 text-sm font-semibold text-foreground underline">Platform</h5>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {["Hackathons", "Generate Hackathon Ideas", "AI Team Formation", "Leaderboard",].map((item) => (
                    <li key={item}>
                      <Link
                        href={`#${item.toLowerCase().replace(" ", "-")}`}
                        className="hover:text-teal-500 transition-colors"
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <h5 className="mb-3 text-sm font-semibold text-foreground underline">Connect</h5>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    <a
                      href="https://github.com/codewithsomesh"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-teal-500 transition-colors"
                      aria-label="Follow HackerFlow on GitHub"
                    >
                      GitHub
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <Twitter className="h-4 w-4" />
                    <a
                      href="https://twitter.com/codewithmesh"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-teal-500 transition-colors"
                      aria-label="Follow HackerFlow on Twitter"
                    >
                      Twitter
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    <a
                      href="https://www.linkedin.com/in/someshwar-rao-929050249/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-teal-500 transition-colors"
                      aria-label="Follow HackerFlow on LinkedIn"
                    >
                      LinkedIn
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <a
                      href="mailto:hello@hackerflow.my"
                      className="hover:text-teal-500 transition-colors"
                      aria-label="Email HackerFlow"
                    >
                      Contact Us
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
            <p>© 2025 HackerFlow. Empowering Malaysia's tech ecosystem.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-teal-500 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-teal-500 transition-colors">
                Terms of Service
              </Link>
              <Link href="/about" className="hover:text-teal-500 transition-colors">
                About Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    )
  }
  