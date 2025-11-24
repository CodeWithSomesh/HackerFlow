'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useEffect } from 'react'
import { User, Users } from 'lucide-react'
import { createHackathonStep2Schema, type CreateHackathonStep2FormData } from '@/lib/validations/createHackathons'
import { updateHackathonStep2, getHackathonById } from '@/lib/actions/createHackathon-actions'
import { showCustomToast } from '@/components/toast-notification'

export default function OrganizeRegistrationDetailsPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hackathonId, setHackathonId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
    watch,
  } = useForm<CreateHackathonStep2FormData>({
    resolver: zodResolver(createHackathonStep2Schema),
    mode: 'onChange',
    defaultValues: {
      participationType: 'individual',
      teamSizeMin: 1,
      teamSizeMax: 400,
    },
  })

  const participationType = watch('participationType')
  const watchStart = watch('registrationStartDate')
  const watchEnd = watch('registrationEndDate')

  useEffect(() => {
    const storedId = localStorage.getItem('current_hackathon_id')
    if (!storedId) {
      showCustomToast('error', 'No hackathon found. Please start from Step 1.')
      router.push('/organize/step1')
    } else {
      setHackathonId(storedId)
    }
  }, [router])

  // Preload saved values for Step 2
  useEffect(() => {
    const preload = async () => {
      if (!hackathonId) return
      const result = await getHackathonById(hackathonId)
      if (result.success && result.data) {
        const d = result.data as any
        if (d.participation_type) setValue('participationType', d.participation_type, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
        if (typeof d.team_size_min === 'number') setValue('teamSizeMin', d.team_size_min, { shouldValidate: true })
        if (typeof d.team_size_max === 'number') setValue('teamSizeMax', d.team_size_max, { shouldValidate: true })
        if (d.registration_start_date) setValue('registrationStartDate', d.registration_start_date?.slice(0, 16), { shouldValidate: true, shouldDirty: true, shouldTouch: true })
        if (d.registration_end_date) setValue('registrationEndDate', d.registration_end_date?.slice(0, 16), { shouldValidate: true, shouldDirty: true, shouldTouch: true })
        if (d.max_registrations !== undefined) setValue('maxRegistrations', d.max_registrations, { shouldValidate: true })
        // Ensure validation messages render immediately after preload
        await trigger(['registrationStartDate', 'registrationEndDate', 'teamSizeMin', 'teamSizeMax', 'participationType', 'maxRegistrations'])
      }
    }
    preload()
  }, [hackathonId, setValue, trigger])

  // Re-validate whenever date values change (including after preload)
  useEffect(() => {
    if (watchStart || watchEnd) {
      trigger(['registrationStartDate', 'registrationEndDate'])
    }
  }, [watchStart, watchEnd, trigger])

  const onSubmit = async (data: CreateHackathonStep2FormData) => {
    if (!hackathonId) {
      showCustomToast('error', 'Hackathon ID not found. Please start from Step 1.')
      return
    }

    setIsSubmitting(true)
    
    try {
      const result = await updateHackathonStep2(hackathonId, data)
      
      if (result.success) {
        showCustomToast('success', 'Registration details saved successfully! Proceeding to next step.')
        setTimeout(() => {
          router.push('/organize/step3')
        }, 1500)
      } else {
        showCustomToast('error', result.error || 'Failed to save registration details. Please try again.')
      }
    } catch (error) {
      console.error('Submission error:', error)
      showCustomToast('error', 'An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const onError = () => {
    showCustomToast('error', 'Please fill up all the necessary fields')
  }

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

        <form onSubmit={handleSubmit(onSubmit, onError)}>
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-md p-6">
            <h2 className="font-blackops text-3xl text-white mb-6">Registrations Details</h2>

            {/* Participation Type */}
            <div className="grid gap-2 mb-5">
              <Label className="text-gray-200 font-mono">Participation Type *</Label>
              <div className="grid sm:grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => setValue('participationType', 'individual', { shouldValidate: true, shouldDirty: true, shouldTouch: true })}
                  className={`flex items-start gap-3 p-4 rounded-md border transition-colors ${
                    participationType === 'individual'
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
                  type="button"
                  onClick={() => setValue('participationType', 'team', { shouldValidate: true, shouldDirty: true, shouldTouch: true })}
                  className={`flex items-start gap-3 p-4 rounded-md border transition-colors ${
                    participationType === 'team'
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
            </div>

            {/* Team size */}
            {participationType === 'team' && (
              <div className="mt-5 grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-gray-200 font-mono">Team Size (Min) *</Label>
                  <Input 
                    type="number" 
                    min={1} 
                    {...register('teamSizeMin', { valueAsNumber: true })}
                    className="bg-black border-gray-700 text-gray-100" 
                  />
                  {errors.teamSizeMin && (
                    <p className="text-red-400 text-sm">{errors.teamSizeMin.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label className="text-gray-200 font-mono">Team Size (Max) *</Label>
                  <Input 
                    type="number" 
                    min={1}
                    {...register('teamSizeMax', { valueAsNumber: true })}
                    className="bg-black border-gray-700 text-gray-100" 
                  />
                  {errors.teamSizeMax && (
                    <p className="text-red-400 text-sm">{errors.teamSizeMax.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-gray-200 font-mono">Registration Start Date & Time *</Label>
                <Input 
                  type="datetime-local"
                  {...register('registrationStartDate')}
                  className="bg-black border-gray-700 text-gray-100" 
                />
                {errors.registrationStartDate && (
                  <p className="text-red-400 text-sm">{errors.registrationStartDate.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label className="text-gray-200 font-mono">Registration End Date & Time *</Label>
                <Input 
                  type="datetime-local"
                  {...register('registrationEndDate')}
                  className="bg-black border-gray-700 text-gray-100" 
                />
                {errors.registrationEndDate && (
                  <p className="text-red-400 text-sm">{errors.registrationEndDate.message}</p>
                )}
              </div>
            </div>

            {/* Optional settings */}
            <div className="mt-5 grid gap-2">
              <Label className="text-gray-200 font-mono">Number of Registrations Allowed</Label>
              <Input 
                type="number"
                {...register('maxRegistrations', { 
                  valueAsNumber: true,
                  setValueAs: (v) => v === '' ? null : parseInt(v)
                })}
                // placeholder="Leave empty for unlimited registrations" 
                placeholder='200'
                className="bg-black border-gray-700 text-gray-100" 
              />
            </div>

            <div className="mt-8 flex justify-between">
              <Button 
                type="button"
                variant="secondary" 
                className="bg-gray-800 text-white border border-gray-600" 
                onClick={() => router.push('/organize/step1')}
              >
                Back
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 text-white disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Next'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}