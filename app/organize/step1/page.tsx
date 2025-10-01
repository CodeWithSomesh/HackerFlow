'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Globe, Lock, CalendarClock, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function OrganizeStep1Page() {
  const router = useRouter()
  const [visibility, setVisibility] = useState<'public' | 'invite'>('public')
  const [mode, setMode] = useState<'online' | 'offline'>('online')

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-5xl mx-auto px-6 py-10">
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
          <div className="grid sm:grid-cols-[240px_1fr] gap-6">
            <div className="border-2 border-dashed border-gray-600 rounded-md bg-gray-900/40 flex items-center justify-center h-48">
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
              <div className="grid gap-2">
                <Label className="text-gray-200 font-mono">Opportunity Type</Label>
                <Select defaultValue="hackathons">
                  <SelectTrigger className="bg-black border-gray-700 text-gray-200">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-gray-700">
                    <SelectItem value="hackathons">Hackathons & Coding Challenges</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subtype */}
              <div className="grid gap-2">
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
              </div>

              {/* Visibility */}
              <div className="grid gap-2">
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
            </div>
          </div>

          {/* Title */}
          <div className="mt-6 grid gap-2">
            <Label className="text-gray-200 font-mono">Opportunity Title</Label>
            <Input placeholder="Enter Opportunity Title" className="bg-black border-gray-700 text-gray-100" />
          </div>

          {/* Org & URL */}
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-gray-200 font-mono">Enter Your Organisation</Label>
              <Input defaultValue="" placeholder="Organization Name" className="bg-black border-gray-700 text-gray-100" />
            </div>
            <div className="grid gap-2">
              <Label className="text-gray-200 font-mono">Website URL</Label>
              <Input placeholder="https://" className="bg-black border-gray-700 text-gray-100" />
            </div>
          </div>

          {/* Festival */}
          <div className="mt-4 grid gap-2">
            <Label className="text-gray-200 font-mono">Festival (optional)</Label>
            <Input placeholder="Enter Festival Name" className="bg-black border-gray-700 text-gray-100" />
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
                  <ImageIcon className="w-5 h-5" />
                </div>
                <span className="font-mono text-white">Offline Mode</span>
              </button>
            </div>
          </div>

          {/* Categories & Skills */}
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-gray-200 font-mono">Categories</Label>
              <Input placeholder="e.g. AI, Web, FinTech" className="bg-black border-gray-700 text-gray-100" />
            </div>
            <div className="grid gap-2">
              <Label className="text-gray-200 font-mono">Skills to be Assessed</Label>
              <Input placeholder="Search skills" className="bg-black border-gray-700 text-gray-100" />
            </div>
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

// 'use client'

// import { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { Upload, Globe, Lock, CalendarClock, Image as ImageIcon } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Textarea } from '@/components/ui/textarea'
// import { Label } from '@/components/ui/label'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// export default function OrganizeBasicDetailsPage() {
//   const router = useRouter()
//   const [visibility, setVisibility] = useState<'public' | 'invite'>('public')
//   const [mode, setMode] = useState<'online' | 'offline'>('online')

//   return (
//     <div className="min-h-screen bg-black">
//       <div className="max-w-5xl mx-auto px-6 py-10">
//         {/* Stepper */}
//         <div className="flex items-center gap-4 mb-8">
//           <div className="flex items-center gap-3">
//             <div className="w-9 h-9 rounded-full bg-teal-500 text-black font-bold flex items-center justify-center border border-teal-300">1</div>
//             <span className="font-blackops text-xl text-white">Basic Details</span>
//           </div>
//           <div className="h-px flex-1 bg-gray-700"></div>
//           <div className="flex items-center gap-3 opacity-70">
//             <div className="w-9 h-9 rounded-full bg-gray-800 text-gray-400 font-bold flex items-center justify-center border border-gray-600">2</div>
//             <span className="font-blackops text-xl text-gray-300">Registration Details</span>
//           </div>
//         </div>

//         {/* Card */}
//         <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-md p-6">
//           <h2 className="font-blackops text-3xl text-white mb-6 flex items-center gap-2">
//             <CalendarClock className="w-7 h-7 text-teal-400" />
//             Create a New Hackathon
//           </h2>

//           {/* Logo upload */}
//           <div className="grid sm:grid-cols-[240px_1fr] gap-6">
//             <div className="border-2 border-dashed border-gray-600 rounded-md bg-gray-900/40 flex items-center justify-center h-48">
//               <div className="text-center">
//                 <div className="mx-auto w-12 h-12 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center">
//                   <Upload className="w-6 h-6" />
//                 </div>
//                 <p className="mt-3 text-gray-200 font-mono">Opportunity Logo</p>
//                 <p className="text-xs text-gray-400">Max size 1MB. PNG/JPG</p>
//               </div>
//             </div>

//             <div className="space-y-5">
//               {/* Opportunity Type */}
//               <div className="grid gap-2">
//                 <Label className="text-gray-200 font-mono">Opportunity Type</Label>
//                 <Select defaultValue="hackathons">
//                   <SelectTrigger className="bg-black border-gray-700 text-gray-200">
//                     <SelectValue placeholder="Select type" />
//                   </SelectTrigger>
//                   <SelectContent className="bg-black border-gray-700">
//                     <SelectItem value="hackathons">Hackathons & Coding Challenges</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Subtype */}
//               <div className="grid gap-2">
//                 <Label className="text-gray-200 font-mono">Opportunity Sub Type</Label>
//                 <Select>
//                   <SelectTrigger className="bg-black border-gray-700 text-gray-200">
//                     <SelectValue placeholder="Please select sub type" />
//                   </SelectTrigger>
//                   <SelectContent className="bg-black border-gray-700">
//                     <SelectItem value="open">Open Innovation</SelectItem>
//                     <SelectItem value="themed">Themed Challenge</SelectItem>
//                     <SelectItem value="internal">Internal/University</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Visibility */}
//               <div className="grid gap-2">
//                 <Label className="text-gray-200 font-mono">Visibility</Label>
//                 <div className="grid sm:grid-cols-2 gap-3">
//                   <button
//                     onClick={() => setVisibility('public')}
//                     className={`flex items-start gap-3 p-4 rounded-md border transition-colors ${
//                       visibility === 'public'
//                         ? 'border-teal-400 bg-teal-500/10'
//                         : 'border-gray-700 bg-gray-900/40 hover:bg-gray-800/40'
//                     }`}
//                   >
//                     <div className="w-9 h-9 rounded-md bg-teal-500/20 text-teal-400 flex items-center justify-center">
//                       <Globe className="w-5 h-5" />
//                     </div>
//                     <div className="text-left">
//                       <div className="font-mono text-white">Open publicly on HackerFlow</div>
//                       <div className="text-xs text-gray-400">Visible to all users</div>
//                     </div>
//                   </button>
//                   <button
//                     onClick={() => setVisibility('invite')}
//                     className={`flex items-start gap-3 p-4 rounded-md border transition-colors ${
//                       visibility === 'invite'
//                         ? 'border-teal-400 bg-teal-500/10'
//                         : 'border-gray-700 bg-gray-900/40 hover:bg-gray-800/40'
//                     }`}
//                   >
//                     <div className="w-9 h-9 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center">
//                       <Lock className="w-5 h-5" />
//                     </div>
//                     <div className="text-left">
//                       <div className="font-mono text-white">Invite Only</div>
//                       <div className="text-xs text-gray-400">Accessible via link</div>
//                     </div>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Title */}
//           <div className="mt-6 grid gap-2">
//             <Label className="text-gray-200 font-mono">Opportunity Title</Label>
//             <Input placeholder="Enter Opportunity Title" className="bg-black border-gray-700 text-gray-100" />
//           </div>

//           {/* Org & URL */}
//           <div className="mt-4 grid sm:grid-cols-2 gap-4">
//             <div className="grid gap-2">
//               <Label className="text-gray-200 font-mono">Enter Your Organisation</Label>
//               <Input defaultValue="" placeholder="Organization Name" className="bg-black border-gray-700 text-gray-100" />
//             </div>
//             <div className="grid gap-2">
//               <Label className="text-gray-200 font-mono">Website URL</Label>
//               <Input placeholder="https://" className="bg-black border-gray-700 text-gray-100" />
//             </div>
//           </div>

//           {/* Festival */}
//           <div className="mt-4 grid gap-2">
//             <Label className="text-gray-200 font-mono">Festival (optional)</Label>
//             <Input placeholder="Enter Festival Name" className="bg-black border-gray-700 text-gray-100" />
//           </div>

//           {/* Mode of event */}
//           <div className="mt-6 grid gap-2">
//             <Label className="text-gray-200 font-mono">Mode of Event</Label>
//             <div className="grid sm:grid-cols-2 gap-3">
//               <button
//                 onClick={() => setMode('online')}
//                 className={`flex items-center gap-3 p-4 rounded-md border ${
//                   mode === 'online' ? 'border-teal-400 bg-teal-500/10' : 'border-gray-700 bg-gray-900/40 hover:bg-gray-800/40'
//                 }`}
//               >
//                 <div className="w-9 h-9 rounded-md bg-teal-500/20 text-teal-400 flex items-center justify-center">
//                   <Globe className="w-5 h-5" />
//                 </div>
//                 <span className="font-mono text-white">Online Mode</span>
//               </button>
//               <button
//                 onClick={() => setMode('offline')}
//                 className={`flex items-center gap-3 p-4 rounded-md border ${
//                   mode === 'offline' ? 'border-teal-400 bg-teal-500/10' : 'border-gray-700 bg-gray-900/40 hover:bg-gray-800/40'
//                 }`}
//               >
//                 <div className="w-9 h-9 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center">
//                   <ImageIcon className="w-5 h-5" />
//                 </div>
//                 <span className="font-mono text-white">Offline Mode</span>
//               </button>
//             </div>
//           </div>

//           {/* Categories & Skills */}
//           <div className="mt-6 grid sm:grid-cols-2 gap-4">
//             <div className="grid gap-2">
//               <Label className="text-gray-200 font-mono">Categories</Label>
//               <Input placeholder="e.g. AI, Web, FinTech" className="bg-black border-gray-700 text-gray-100" />
//             </div>
//             <div className="grid gap-2">
//               <Label className="text-gray-200 font-mono">Skills to be Assessed</Label>
//               <Input placeholder="Search skills" className="bg-black border-gray-700 text-gray-100" />
//             </div>
//           </div>

//           {/* About */}
//           <div className="mt-6 grid gap-2">
//             <Label className="text-gray-200 font-mono">About Opportunity</Label>
//             <Textarea rows={10} placeholder="Share rules, eligibility, process, format, etc. Minimum 500 words recommended."
//               className="bg-black border-gray-700 text-gray-100" />
//           </div>

//           <div className="mt-8 flex justify-end">
//             <Button
//               className="bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 text-white font-geist"
//               onClick={() => router.push('/organize/registration')}
//             >
//               Next
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }


