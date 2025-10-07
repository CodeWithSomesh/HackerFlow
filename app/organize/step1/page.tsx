'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Globe, Lock, CalendarClock, Image as ImageIcon, Building, Code2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MultiSelect } from "@/components/multi-select";

const options = [
	{ value: "web3", label: "Web3 & Blockchain", style: { badgeColor: "#8b5cf6", iconColor: "#a78bfa" } },
	{ value: "ai-ml", label: "AI & Machine Learning", style: { badgeColor: "#3b82f6", iconColor: "#60a5fa" } },
	{ value: "iot", label: "IoT & Hardware", style: { badgeColor: "#10b981", iconColor: "#34d399" } },
	{ value: "mobile", label: "Mobile Development", style: { badgeColor: "#f59e0b", iconColor: "#fbbf24" } },
	{ value: "web", label: "Web Development", style: { badgeColor: "#06b6d4", iconColor: "#22d3ee" } },
	{ value: "game", label: "Game Development", style: { badgeColor: "#ec4899", iconColor: "#f472b6" } },
	{ value: "ar-vr", label: "AR/VR", style: { badgeColor: "#a855f7", iconColor: "#c084fc" } },
	{ value: "cybersecurity", label: "Cybersecurity", style: { badgeColor: "#ef4444", iconColor: "#f87171" } },
	{ value: "fintech", label: "FinTech", style: { badgeColor: "#14b8a6", iconColor: "#2dd4bf" } },
	{ value: "healthcare", label: "Healthcare & BioTech", style: { badgeColor: "#22c55e", iconColor: "#4ade80" } },
	{ value: "edtech", label: "EdTech", style: { badgeColor: "#f97316", iconColor: "#fb923c" } },
	{ value: "social-good", label: "Social Good", style: { badgeColor: "#84cc16", iconColor: "#a3e635" } },
	{ value: "climate", label: "Climate & Sustainability", style: { badgeColor: "#059669", iconColor: "#10b981" } },
	{ value: "devtools", label: "DevTools & Productivity", style: { badgeColor: "#6366f1", iconColor: "#818cf8" } },
	{ value: "data", label: "Data Science & Analytics", style: { badgeColor: "#8b5cf6", iconColor: "#a78bfa" } },
	{ value: "cloud", label: "Cloud Computing", style: { badgeColor: "#0ea5e9", iconColor: "#38bdf8" } },
	{ value: "automation", label: "Automation & Robotics", style: { badgeColor: "#64748b", iconColor: "#94a3b8" } },
	{ value: "design", label: "UI/UX Design", style: { badgeColor: "#d946ef", iconColor: "#e879f9" } },
	{ value: "open-source", label: "Open Source", style: { badgeColor: "#000000", iconColor: "#374151" } },
	{ value: "enterprise", label: "Enterprise Solutions", style: { badgeColor: "#475569", iconColor: "#64748b" } },
];

export default function OrganizeStep1Page() {
  const router = useRouter()
  const [visibility, setVisibility] = useState<'public' | 'invite'>('public')
  const [mode, setMode] = useState<'online' | 'offline'>('online')
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Stepper */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-teal-500 text-black font-bold flex items-center justify-center border border-teal-300">1</div>
            <span className="font-blackops text-xl text-white">Basic Details</span>
          </div>
          <div className="h-px flex-1 bg-gray-700"></div>
          <div className="flex items-center gap-3 opacity-70">
            <div className="w-9 h-9 rounded-full bg-gray-800 text-gray-400 font-bold flex items-center justify-center border border-gray-600">2</div>
            <span className="font-blackops text-xl text-gray-300">Registration Details</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-md p-6">
          <h2 className="font-blackops text-3xl text-white mb-6 flex items-center gap-2">
            <CalendarClock className="w-7 h-7 text-teal-400" />
            Create a New Hackathon
          </h2>

          {/* Logo upload */}
          <div className="grid sm:grid-cols-[250px_1fr] gap-6">
            <div className="border-2 border-dashed border-gray-600 rounded-md bg-gray-900/40 flex items-center justify-center h-full">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="mt-3 text-gray-200 font-mono">Opportunity Logo</p>
                <p className="text-xs text-gray-400">Max size 1MB. PNG/JPG</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Opportunity Type */}
              {/* <div className="grid gap-2">
                <Label className="text-gray-200 font-mono">Opportunity Type</Label>
                <Select defaultValue="hackathons">
                  <SelectTrigger className="bg-black border-gray-700 text-gray-200">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-gray-700">
                    <SelectItem value="hackathons">Hackathons & Coding Challenges</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}

              {/* Subtype */}
              {/* <div className="grid gap-2">
                <Label className="text-gray-200 font-mono">Opportunity Sub Type</Label>
                <Select>
                  <SelectTrigger className="bg-black border-gray-700 text-gray-200">
                    <SelectValue placeholder="Please select sub type" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-gray-700">
                    <SelectItem value="open">Open Innovation</SelectItem>
                    <SelectItem value="themed">Themed Challenge</SelectItem>
                    <SelectItem value="internal">Internal/University</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}

              {/* Title */}
              <div className="grid gap-2">
                <Label className="text-gray-200 font-mono">Opportunity Title</Label>
                <Input placeholder="Enter Opportunity Title" className="bg-black border-gray-700 text-gray-100" />
              </div>

              <div className="grid gap-2">
                <Label className="text-gray-200 font-mono">Enter Your Organisation</Label>
                <Input defaultValue="" placeholder="Organization Name" className="bg-black border-gray-700 text-gray-100" />
              </div>
              
              <div className="grid gap-2">
                <Label className="text-gray-200 font-mono">Website URL</Label>
                <Input placeholder="https://" className="bg-black border-gray-700 text-gray-100" />
              </div>

              
            </div>
          </div>


          {/* Visibility */}
          <div className="grid mt-6 gap-2">
            <Label className="text-gray-200 font-mono">Visibility</Label>
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                onClick={() => setVisibility('public')}
                className={`flex items-start gap-3 p-4 rounded-md border transition-colors ${
                  visibility === 'public'
                    ? 'border-teal-400 bg-teal-500/10'
                    : 'border-gray-700 bg-gray-900/40 hover:bg-gray-800/40'
                }`}
              >
                <div className="w-9 h-9 rounded-md bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-mono text-white">Open publicly on HackerFlow</div>
                  <div className="text-xs text-gray-400">Visible to all users</div>
                </div>
              </button>
              <button
                onClick={() => setVisibility('invite')}
                className={`flex items-start gap-3 p-4 rounded-md border transition-colors ${
                  visibility === 'invite'
                    ? 'border-teal-400 bg-teal-500/10'
                    : 'border-gray-700 bg-gray-900/40 hover:bg-gray-800/40'
                }`}
              >
                <div className="w-9 h-9 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-mono text-white">Invite Only</div>
                  <div className="text-xs text-gray-400">Accessible via link</div>
                </div>
              </button>
            </div>
          </div>

          {/* Mode of event */}
          <div className="mt-6 grid gap-2">
            <Label className="text-gray-200 font-mono">Mode of Event</Label>
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                onClick={() => setMode('online')}
                className={`flex items-center gap-3 p-4 rounded-md border ${
                  mode === 'online' ? 'border-teal-400 bg-teal-500/10' : 'border-gray-700 bg-gray-900/40 hover:bg-gray-800/40'
                }`}
              >
                <div className="w-9 h-9 rounded-md bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <span className="font-mono text-white">Online Mode</span>
              </button>
              <button
                onClick={() => setMode('offline')}
                className={`flex items-center gap-3 p-4 rounded-md border ${
                  mode === 'offline' ? 'border-teal-400 bg-teal-500/10' : 'border-gray-700 bg-gray-900/40 hover:bg-gray-800/40'
                }`}
              >
                <div className="w-9 h-9 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
                <span className="font-mono text-white">Offline Mode</span>
              </button>
            </div>
          </div>

          {/* Categories & Skills */}
          <div className="mt-6">
            <div className="grid gap-2">
              <Label className="text-gray-200 font-mono">Categories</Label>
              <MultiSelect
                options={options}
                onValueChange={setSelected}
                // variant="inverted"
                placeholder="Select at least one..."            
                className="bg-black border-gray-700 "
                popoverClassName="bg-[#020817] border-gray-700 [&_[cmdk-item][data-selected=true]]:!bg-gray-800 [&_[cmdk-item][data-selected=true]]:!text-gray-100 [&_[cmdk-separator]]:!border-t [&_[cmdk-separator]]:!border-gray-700"
              />
            </div>
            {/* <div className="grid gap-2">
              <Label className="text-gray-200 font-mono">Skills to be Assessed</Label>
              <Input placeholder="Search skills" className="bg-black border-gray-700 text-gray-100" />
            </div> */}
          </div>

          {/* About */}
          <div className="mt-6 grid gap-2">
            <Label className="text-gray-200 font-mono">About Opportunity</Label>
            <Textarea rows={10} placeholder="Share rules, eligibility, process, format, etc. Minimum 500 words recommended."
              className="bg-black border-gray-700 text-gray-100" />
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              className="bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 text-white font-geist"
              onClick={() => router.push('/organize/step2')}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}