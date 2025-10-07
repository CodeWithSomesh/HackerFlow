'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Toggle } from '@/components/ui/toggle'
import { useState } from 'react'
import { Globe, User, Users } from 'lucide-react'

export default function OrganizeRegistrationDetailsPage() {
  const router = useRouter()
  const [teamEnabled, setTeamEnabled] = useState(false)

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Stepper */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-3 opacity-80">
            <div className="w-9 h-9 rounded-full bg-gray-800 text-gray-400 font-bold flex items-center justify-center border border-gray-600">1</div>
            <span className="font-blackops text-xl text-gray-300">Basic Details</span>
          </div>
          <div className="h-px flex-1 bg-gray-700"></div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-teal-500 text-black font-bold flex items-center justify-center border border-teal-300">2</div>
            <span className="font-blackops text-xl text-white">Registration Details</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-md p-6">
          <h2 className="font-blackops text-3xl text-white mb-6">Registrations Details</h2>

          {/* Take registrations elsewhere - simplified banner */}
          {/* <div className="mb-6 rounded-md border border-yellow-600/50 bg-yellow-500/10 p-4 text-yellow-200">
            For exclusive analytics and unlimited credits, take registrations on HackerFlow.
          </div> */}

          {/* Participation Type */}
          <div className="grid sm:grid-cols-2 gap-3">
            <button 
            onClick={() => setTeamEnabled(false)}
            className={`flex items-start gap-3 p-4 rounded-md border transition-colors ${
              !teamEnabled
                ? 'border-teal-400 bg-teal-500/10'
                : 'border-gray-700 bg-gray-900/40 hover:bg-gray-800/40'
            }`}>
              <div className="w-9 h-9 rounded-md bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <User className="w-5 h-5"/>
              </div>
              <div className='text-left'>
                <div className="text-white font-mono">Individual</div>
                <div className="text-xs text-gray-400">Solo participation</div>
              </div>
            </button>

            <button 
            onClick={() => setTeamEnabled(true)}
            className={`flex items-start gap-3 p-4 rounded-md border transition-colors ${
              teamEnabled
                ? 'border-cyan-400 bg-cyan-500/10'
                : 'border-gray-700 bg-gray-900/40 hover:bg-gray-800/40'
            }`}>
              <div className="w-9 h-9 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Users className="w-5 h-5"/>
              </div>
              <div className='text-left'>
                <div className="text-white font-mono">Participation as a team</div>
                <div className="text-xs text-gray-400">Enable teams</div>
              </div>
            </button>
          </div>

          {/* Team size */}
          <div className="mt-5 grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-gray-200 font-mono">Team Size (Min)</Label>
              <Input type="number" min={1} defaultValue={1} className="bg-black border-gray-700 text-gray-100" />
            </div>
            <div className="grid gap-2">
              <Label className="text-gray-200 font-mono">Team Size (Max)</Label>
              <Input type="number" min={1} defaultValue={4} className="bg-black border-gray-700 text-gray-100" />
            </div>
          </div>

          {/* Dates */}
          <div className="mt-5 grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-gray-200 font-mono">Registration Start Date & Time</Label>
              <Input type="datetime-local" className="bg-black border-gray-700 text-gray-100" />
            </div>
            <div className="grid gap-2">
              <Label className="text-gray-200 font-mono">Registration End Date & Time</Label>
              <Input type="datetime-local" className="bg-black border-gray-700 text-gray-100" />
            </div>
          </div>

          {/* Optional settings */}
          <div className="mt-5 grid gap-2">
            <Label className="text-gray-200 font-mono">Number of Registrations Allowed (Leave It Empty if Unlimited)</Label>
            <Input type="number" placeholder="Enter if only certain number of participants can apply" className="bg-black border-gray-700 text-gray-100" />
          </div>

          <div className="mt-8 flex justify-between">
            <Button variant="secondary" className="bg-gray-800 text-white border border-gray-600" onClick={() => router.push('/organize/step1')}>Back</Button>
            <Button className="bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 text-white" onClick={() => router.push('/organize/step3')}>Next</Button>
          </div>
        </div>
      </div>
    </div>
  )
}


