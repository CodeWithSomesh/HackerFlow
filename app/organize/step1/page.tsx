'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Upload, Globe, Lock, CalendarClock, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MultiSelect } from "@/components/multi-select"
import { MinimalTiptap } from '@/components/ui/shadcn-io/minimal-tiptap'
import { createHackathonStep1Schema, type CreateHackathonStep1FormData } from '@/lib/validations/createHackathons'
import { createHackathon, uploadHackathonLogo, getHackathonById } from '@/lib/actions/createHackathon-actions'
import { showCustomToast } from '@/components/toast-notification'

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [content, setContent] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateHackathonStep1FormData>({
    resolver: zodResolver(createHackathonStep1Schema),
    defaultValues: {
      visibility: 'public',
      mode: 'online',
      categories: [],
      about: '',
    },
  })

  const visibility = watch('visibility')
  const mode = watch('mode')

  useEffect(() => {
    const loadHackathonData = async () => {
      const storedId = localStorage.getItem('current_hackathon_id')
      if (storedId) {
        const result = await getHackathonById(storedId)
        if (result.success && result.data) {
          // Preload form data
          setValue('title', result.data.title)
          setValue('organization', result.data.organization)
          setValue('websiteUrl', result.data.website_url || '')
          setValue('visibility', result.data.visibility)
          setValue('mode', result.data.mode)
          setValue('logo', result.data.logo_url)
          setLogoPreview(result.data.logo_url)
          
          // Fix: Set categories and trigger MultiSelect update
          const cats = result.data.categories || []
          setValue('categories', cats)
          setSelectedCategories(cats)
          
          // Fix: Set content and trigger MinimalTiptap update
          const aboutContent = result.data.about || ''
          setValue('about', aboutContent)
          setContent(aboutContent)
          
          showCustomToast('info', 'Previous hackathon data loaded successfully.')
        }
      }
      setIsLoading(false)
    }
  
    loadHackathonData()
  }, [])
  // eslint-disable-next-line react-hooks/exhaustive-deps


  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
  
    setIsUploading(true)
    showCustomToast('info', 'Uploading logo...')
  
    try {
      const result = await uploadHackathonLogo(file)
      
      if (result.success && result.url) {
        setLogoPreview(result.url)
        setValue('logo', result.url)
        showCustomToast('success', 'Logo uploaded successfully!')
      } else {
        showCustomToast('error', result.error || 'Failed to upload logo')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
      showCustomToast('error', 'An unexpected error occurred during upload')
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (data: CreateHackathonStep1FormData) => {
    setIsSubmitting(true)
    
    try {
      const existingHackathonId = localStorage.getItem('current_hackathon_id')
      const result = await createHackathon(data, existingHackathonId || undefined)
      
      if (result.success) {
        const message = result.isUpdate 
          ? 'Hackathon details updated successfully! Proceeding to registration details.'
          : 'Hackathon details saved successfully! Proceeding to registration details.'
        
        showCustomToast('success', message)
        
        // Store hackathon ID for step 2
        if (result.data?.id) {
          localStorage.setItem('current_hackathon_id', result.data.id)
        }
        
        setTimeout(() => {
          router.push('/organize/step2')
        }, 1500)
      } else {
        showCustomToast('error', result.error || 'Failed to save hackathon details. Please try again.')
      }
    } catch (error) {
      console.error('Submission error:', error)
      showCustomToast('error', 'An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

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

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-md p-6">
            <h2 className="font-blackops text-3xl text-white mb-6 flex items-center gap-2">
              <CalendarClock className="w-7 h-7 text-teal-400" />
              Create a New Hackathon
            </h2>

            {/* Logo upload */}
            <div className="grid sm:grid-cols-[250px_1fr] gap-6">
              <div className="relative border-2 border-dashed border-gray-600 rounded-md bg-gray-900/40 flex items-center justify-center h-full min-h-[200px] overflow-hidden">
                {logoPreview ? (
                  <div className="relative w-full h-full">
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      className="w-full h-full object-contain p-4"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setLogoPreview(null)
                        setValue('logo', '')
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ''
                        }
                      }}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full px-2 py-1 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="text-center cursor-pointer w-full h-full flex items-center justify-center flex-col">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleLogoUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <div className="mx-auto w-12 h-12 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="mt-3 text-gray-200 font-mono">
                      {isUploading ? 'Uploading...' : 'Opportunity Logo'}
                    </p>
                    <p className="text-xs text-gray-400">Max size 1MB. PNG/JPG</p>
                    <p className="text-xs text-teal-400 mt-2">Click to upload</p>
                  </label>
                )}
              </div>
              {errors.logo && (
                <p className="text-red-400 text-sm col-span-full">{errors.logo.message}</p>
              )}

              <div className="space-y-5">
                {/* Title */}
                <div className="grid gap-2">
                  <Label className="text-gray-200 font-mono">Opportunity Title *</Label>
                  <Input 
                    {...register('title')}
                    placeholder="Enter Opportunity Title" 
                    className="bg-black border-gray-700 text-gray-100" 
                  />
                  {errors.title && (
                    <p className="text-red-400 text-sm">{errors.title.message}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label className="text-gray-200 font-mono">Enter Your Organisation *</Label>
                  <Input 
                    {...register('organization')}
                    placeholder="Organization Name" 
                    className="bg-black border-gray-700 text-gray-100" 
                  />
                  {errors.organization && (
                    <p className="text-red-400 text-sm">{errors.organization.message}</p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label className="text-gray-200 font-mono">Website URL</Label>
                  <Input 
                    {...register('websiteUrl')}
                    placeholder="https://" 
                    className="bg-black border-gray-700 text-gray-100" 
                  />
                  {errors.websiteUrl && (
                    <p className="text-red-400 text-sm">{errors.websiteUrl.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Visibility */}
            <div className="grid mt-6 gap-2">
              <Label className="text-gray-200 font-mono">Visibility *</Label>
              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setValue('visibility', 'public')}
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
                  type="button"
                  onClick={() => setValue('visibility', 'invite')}
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
              <Label className="text-gray-200 font-mono">Mode of Event *</Label>
              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setValue('mode', 'online')}
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
                  type="button"
                  onClick={() => setValue('mode', 'offline')}
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

            {/* Categories */}
            <div className="mt-6">
              <div className="grid gap-2">
                <Label className="text-gray-200 font-mono">Categories *</Label>
                <MultiSelect
                  options={options}
                  defaultValue={selectedCategories}
                  onValueChange={(values) => {
                    setSelectedCategories(values)
                    setValue('categories', values)
                  }}
                  placeholder="Select at least one..."            
                  className="bg-black border-gray-700"
                  popoverClassName="bg-[#020817] border-gray-700 [&_[cmdk-item][data-selected=true]]:!bg-gray-800 [&_[cmdk-item][data-selected=true]]:!text-gray-100 [&_[cmdk-separator]]:!border-t [&_[cmdk-separator]]:!border-gray-700"
                />
                {errors.categories && (
                  <p className="text-red-400 text-sm">{errors.categories.message}</p>
                )}
              </div>
            </div>

            {/* About */}
            <div className="mt-6 grid gap-2">
              <Label className="text-gray-200 font-mono">About Opportunity *</Label>
              <p className="text-sm text-gray-400 mb-2">Share rules, eligibility, process, format, etc. Minimum 500 characters required.</p>
              
              <MinimalTiptap
                key={content} 
                content={content}
                onChange={(value) => {
                  setContent(value)
                  setValue('about', value)
                }}
                placeholder="Start typing your opportunity details here... Use headings, lists, and formatting to make it clear and engaging."
                className="w-full"
              />
              {errors.about && (
                <p className="text-red-400 text-sm">{errors.about.message}</p>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting || isUploading || isLoading}
                className="bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 text-white font-geist disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : isLoading ? 'Loading...' : 'Next'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}