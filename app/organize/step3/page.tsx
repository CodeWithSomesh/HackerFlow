'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { 
  Calendar, 
  Clock, 
  Globe, 
  MapPin, 
  Settings, 
  Image, 
  ChevronRight, 
  Sparkles,
  Users,
  Trophy,
  Info,
  CheckCircle,
  Plus,
  X,
  Building,
  Mail,
  Phone,
  DollarSign,
  Award,
  AlertCircle,
  MessageCircle,
  Heart,
  Upload,
  Edit
} from 'lucide-react'
import { uploadHackathonBanner, uploadHackathonLogo, getHackathonById, updateHackathonStep3 } from '@/lib/actions/createHackathon-actions'
import { createHackathonStep3Schema, type CreateHackathonStep3FormData } from '@/lib/validations/createHackathons'
import { showCustomToast } from '@/components/toast-notification'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { createClient } from '@/lib/supabase/client'


type SectionKey = 'banner' | 'basic' | 'timeline' | 'about' | 'prizes' | 'dates' | 'faq' | 'organizers' | 'sponsors' | 'requirements' | 'eligibility'

export default function OrganizeStep3Page() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<SectionKey>('basic')
  const [hackathonId, setHackathonId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: 'Your Awesome Hackathon',
    organizer: 'Your Organization',
    mode: 'Online',
    location: 'Global',
    participants: 120,
    maxParticipants: 500,
    totalPrizePool: '$5,000',
    banner: '/api/placeholder/1200/400',
    logo: '',
    about: 'Add an engaging description about your hackathon. Include the theme, goals, what participants will build, and what makes your event unique...',
    duration: '48H',
    registrationDeadline: 'Oct 07',
    eligibility: ['Students', 'Professionals'],
    requirements: ['Valid ID proof', 'Laptop with required software'],
    categories: [] as string[],
    prizes: [] as Array<{ position: string; amount: string; description: string; type: string }>,
    timeline: [] as Array<{ title: string; startDate: string; endDate: string; description: string }>,
    importantDates: [] as Array<{ title: string; date: string; time: string; description: string }>,
    faq: [] as Array<{ question: string; answer: string }>,
    organizers: [] as Array<{ name: string; role: string; email: string; phone: string; profileUrl: string; photo: string }>,
    sponsors: [] as Array<{ name: string; tier: string; website: string; logo: string; description: string }>
  })

  const [newRequirement, setNewRequirement] = useState('')
  const [newTimelineItem, setNewTimelineItem] = useState({ title: '', startDate: '', endDate: '', description: '' })
  const [newDateItem, setNewDateItem] = useState({ title: '', date: '', time: '', description: '' })
  const [newPrize, setNewPrize] = useState({ position: '', amount: '', description: '', type: 'Cash' })
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' })
  const [newOrganizer, setNewOrganizer] = useState({ name: '', role: '', email: '', phone: '', profileUrl: '', photo: '' })
  const [newSponsor, setNewSponsor] = useState({ name: '', tier: 'Sponsor Tier', website: '', logo: '', description: '' })

  // Edit states
  const [editingTimelineIndex, setEditingTimelineIndex] = useState<number | null>(null)
  const [editingDateIndex, setEditingDateIndex] = useState<number | null>(null)
  const [editingPrizeIndex, setEditingPrizeIndex] = useState<number | null>(null)
  const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null)
  const [editingOrganizerIndex, setEditingOrganizerIndex] = useState<number | null>(null)
  const [editingSponsorIndex, setEditingSponsorIndex] = useState<number | null>(null)

  const bannerInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const organizerPhotoInputRef = useRef<HTMLInputElement>(null)
  const sponsorLogoInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingBanner, setIsUploadingBanner] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingOrganizerPhoto, setIsUploadingOrganizerPhoto] = useState(false)
  const [isUploadingSponsorLogo, setIsUploadingSponsorLogo] = useState(false)
  const [originalFormData, setOriginalFormData] = useState(formData)

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<CreateHackathonStep3FormData>({
    resolver: zodResolver(createHackathonStep3Schema),
    defaultValues: {
      title: 'Your Awesome Hackathon',
      organizer: 'Your Organization',
      mode: 'Online',
      location: 'Global',
      participants: 120,
      maxParticipants: 500,
      totalPrizePool: '$5,000',
      bannerUrl: '/api/placeholder/1200/400',
      logoUrl: '',
      about: 'Add an engaging description about your hackathon. Include the theme, goals, what participants will build, and what makes your event unique...',
      duration: '48H',
      registrationDeadline: 'Oct 07',
      eligibility: ['Students', 'Professionals'],
      requirements: ['Valid ID proof', 'Laptop with required software'],
      categories: [],
      prizes: [],
      timeline: [],
      importantDates: [],
      faq: [],
      organizers: [],
      sponsors: []
    }
  })

  // Preload data from database
  useEffect(() => {
    const loadHackathonData = async () => {
      const storedId = localStorage.getItem('current_hackathon_id')
      if (!storedId) {
        showCustomToast('error', 'No hackathon found. Please start from Step 1.')
        router.push('/organize/step1')
        return
      }
      
      setHackathonId(storedId)
      const result = await getHackathonById(storedId)
      
      if (result.success && result.data) {
        const data = result.data as any
        const formValues = {
          title: data.title || 'Your Awesome Hackathon',
          organizer: data.organization || 'Your Organization',
          mode: data.mode || 'Online',
          location: data.location || 'Global',
          participants: data.participants || 120,
          maxParticipants: data.max_participants || 500,
          totalPrizePool: data.total_prize_pool || '$5,000',
          banner: data.banner_url || '/api/placeholder/1200/400',
          logo: data.logo_url || '',
          about: data.about || 'Add an engaging description about your hackathon...',
          duration: data.duration || '48H',
          registrationDeadline: data.registration_deadline || 'Oct 07',
          eligibility: data.eligibility || ['Students', 'Professionals'],
          requirements: data.requirements || ['Valid ID proof', 'Laptop with required software'],
          categories: data.categories || [],
          prizes: data.prizes || [],
          timeline: data.timeline || [],
          importantDates: data.important_dates || [],
          faq: data.faq || [],
          organizers: data.organizers || [],
          sponsors: data.sponsors || []
        }
        
        // Update form data state
        setFormData(formValues)
        setOriginalFormData(formValues) // Store original data
        // Reset form with loaded values
        reset(formValues)
        
        showCustomToast('info', 'Previous hackathon data loaded successfully.')
      }
      setIsLoading(false)
    }
    
    loadHackathonData()
  }, [router, reset])

  const openEditor = (key: SectionKey) => {
    setActiveSection(key)
    setOpen(true)
  }

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData({...formData, requirements: [...formData.requirements, newRequirement]})
      setNewRequirement('')
    }
  }

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData, 
      requirements: formData.requirements.filter((_, i) => i !== index)
    })
  }

  const addTimelineItem = () => {
    if (newTimelineItem.title.trim()) {
      if (editingTimelineIndex !== null) {
        // Update existing item
        const updatedTimeline = [...formData.timeline]
        updatedTimeline[editingTimelineIndex] = newTimelineItem
        setFormData({...formData, timeline: updatedTimeline})
        setEditingTimelineIndex(null)
      } else {
        // Add new item
        setFormData({...formData, timeline: [...formData.timeline, newTimelineItem]})
      }
      setNewTimelineItem({ title: '', startDate: '', endDate: '', description: '' })
    }
  }

  const editTimelineItem = (index: number) => {
    const item = formData.timeline[index]
    setNewTimelineItem(item)
    setEditingTimelineIndex(index)
  }

  const cancelEditTimeline = () => {
    setNewTimelineItem({ title: '', startDate: '', endDate: '', description: '' })
    setEditingTimelineIndex(null)
  }

  const addDateItem = () => {
    if (newDateItem.title.trim()) {
      setFormData({...formData, importantDates: [...formData.importantDates, newDateItem]})
      setNewDateItem({ title: '', date: '', time: '', description: '' })
    }
  }

  const addPrize = () => {
    if (newPrize.position.trim() && newPrize.amount.trim()) {
      setFormData({...formData, prizes: [...formData.prizes, newPrize]})
      setNewPrize({ position: '', amount: '', description: '', type: 'Cash' })
    }
  }

  const editPrize = (index: number) => {
    const prize = formData.prizes[index]
    setNewPrize(prize)
    setEditingPrizeIndex(index)
  }

  const cancelEditPrize = () => {
    setNewPrize({ position: '', amount: '', description: '', type: 'Cash' })
    setEditingPrizeIndex(null)
  }

  const updateAddPrize = () => {
    if (newPrize.position.trim() && newPrize.amount.trim()) {
      if (editingPrizeIndex !== null) {
        const updatedPrizes = [...formData.prizes]
        updatedPrizes[editingPrizeIndex] = newPrize
        setFormData({...formData, prizes: updatedPrizes})
        setEditingPrizeIndex(null)
      } else {
        setFormData({...formData, prizes: [...formData.prizes, newPrize]})
      }
      setNewPrize({ position: '', amount: '', description: '', type: 'Cash' })
    }
  }

  const addFaq = () => {
    if (newFaq.question.trim() && newFaq.answer.trim()) {
      setFormData({...formData, faq: [...formData.faq, newFaq]})
      setNewFaq({ question: '', answer: '' })
    }
  }

  const editFaq = (index: number) => {
    const faq = formData.faq[index]
    setNewFaq(faq)
    setEditingFaqIndex(index)
  }
  
  const cancelEditFaq = () => {
    setNewFaq({ question: '', answer: '' })
    setEditingFaqIndex(null)
  }
  
  const updateAddFaq = () => {
    if (newFaq.question.trim() && newFaq.answer.trim()) {
      if (editingFaqIndex !== null) {
        const updatedFaq = [...formData.faq]
        updatedFaq[editingFaqIndex] = newFaq
        setFormData({...formData, faq: updatedFaq})
        setEditingFaqIndex(null)
      } else {
        setFormData({...formData, faq: [...formData.faq, newFaq]})
      }
      setNewFaq({ question: '', answer: '' })
    }
  }

  const addOrganizer = () => {
    if (newOrganizer.name.trim() && newOrganizer.role.trim()) {
      setFormData({...formData, organizers: [...formData.organizers, newOrganizer]})
      setNewOrganizer({ name: '', role: '', email: '', phone: '', profileUrl: '', photo: '' })
    }
  }

  const editOrganizer = (index: number) => {
    const organizer = formData.organizers[index]
    setNewOrganizer(organizer)
    setEditingOrganizerIndex(index)
  }
  
  const cancelEditOrganizer = () => {
    setNewOrganizer({ name: '', role: '', email: '', phone: '', profileUrl: '', photo: '' })
    setEditingOrganizerIndex(null)
  }
  
  const updateAddOrganizer = () => {
    if (newOrganizer.name.trim() && newOrganizer.role.trim()) {
      if (editingOrganizerIndex !== null) {
        const updatedOrganizers = [...formData.organizers]
        updatedOrganizers[editingOrganizerIndex] = newOrganizer
        setFormData({...formData, organizers: updatedOrganizers})
        setEditingOrganizerIndex(null)
      } else {
        setFormData({...formData, organizers: [...formData.organizers, newOrganizer]})
      }
      setNewOrganizer({ name: '', role: '', email: '', phone: '', profileUrl: '', photo: '' })
    }
  }

  const addSponsor = () => {
    if (newSponsor.name.trim()) {
      setFormData({...formData, sponsors: [...formData.sponsors, newSponsor]})
      setNewSponsor({ name: '', tier: 'Sponsor Tier', website: '', logo: '', description: '' })
    }
  }

  const editSponsor = (index: number) => {
    const sponsor = formData.sponsors[index]
    setNewSponsor(sponsor)
    setEditingSponsorIndex(index)
  }
  
  const cancelEditSponsor = () => {
    setNewSponsor({ name: '', tier: 'Sponsor Tier', website: '', logo: '', description: '' })
    setEditingSponsorIndex(null)
  }
  
  const updateAddSponsor = () => {
    if (newSponsor.name.trim()) {
      if (editingSponsorIndex !== null) {
        const updatedSponsors = [...formData.sponsors]
        updatedSponsors[editingSponsorIndex] = newSponsor
        setFormData({...formData, sponsors: updatedSponsors})
        setEditingSponsorIndex(null)
      } else {
        setFormData({...formData, sponsors: [...formData.sponsors, newSponsor]})
      }
      setNewSponsor({ name: '', tier: 'Sponsor Tier', website: '', logo: '', description: '' })
    }
  }

  // Save functionality
  const onSave = async (data: CreateHackathonStep3FormData) => {
    if (!hackathonId) {
      showCustomToast('error', 'Hackathon ID not found. Please start from Step 1.')
      return
    }

    setIsSaving(true)
    
    try {
      // Merge formData with form values to ensure all data is included
      const saveData = {
        ...data,
        bannerUrl: formData.banner,
        logoUrl: formData.logo,
        eligibility: formData.eligibility,
        requirements: formData.requirements,
        prizes: formData.prizes,
        timeline: formData.timeline,
        importantDates: formData.importantDates,
        faq: formData.faq,
        organizers: formData.organizers,
        sponsors: formData.sponsors
      }
      const result = await updateHackathonStep3(hackathonId, saveData as CreateHackathonStep3FormData)
      
      if (result.success) {
        showCustomToast('success', 'Hackathon details saved successfully!')
        setOriginalFormData(formData) // Update original data after successful save
        setOpen(false)
      } else {
        showCustomToast('error', result.error || 'Failed to save hackathon details. Please try again.')
      }
    } catch (error) {
      console.error('Save error:', error)
      showCustomToast('error', 'An unexpected error occurred. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!hackathonId) {
      showCustomToast('error', 'Hackathon ID not found. Please start from Step 1.')
      return
    }

    setIsSavingDraft(true)
    
    try {
      const saveData = {
        title: formData.title,
        organizer: formData.organizer,
        mode: formData.mode,
        location: formData.location,
        participants: formData.participants,
        maxParticipants: formData.maxParticipants,
        totalPrizePool: formData.totalPrizePool,
        bannerUrl: formData.banner,
        logoUrl: formData.logo,
        about: formData.about,
        duration: formData.duration,
        registrationDeadline: formData.registrationDeadline,
        eligibility: formData.eligibility,
        requirements: formData.requirements,
        categories: formData.categories,
        prizes: formData.prizes,
        timeline: formData.timeline,
        importantDates: formData.importantDates,
        faq: formData.faq,
        organizers: formData.organizers,
        sponsors: formData.sponsors
      }
      
      const result = await updateHackathonStep3(hackathonId, saveData as CreateHackathonStep3FormData)
      
      if (result.success) {
        showCustomToast('success', 'Draft saved successfully!')
        setOriginalFormData(formData)
      } else {
        showCustomToast('error', result.error || 'Failed to save draft. Please try again.')
      }
    } catch (error) {
      console.error('Save draft error:', error)
      showCustomToast('error', 'An unexpected error occurred. Please try again.')
    } finally {
      setIsSavingDraft(false)
    }
  }

  const handlePublish = async () => {
    if (!hackathonId) {
      showCustomToast('error', 'Hackathon ID not found. Please start from Step 1.')
      return
    }

    setIsPublishing(true)
    
    try {
      const supabase = await createClient()
      
      // First save all current data
      const saveData = {
        title: formData.title,
        organizer: formData.organizer,
        mode: formData.mode,
        location: formData.location,
        participants: formData.participants,
        maxParticipants: formData.maxParticipants,
        totalPrizePool: formData.totalPrizePool,
        bannerUrl: formData.banner,
        logoUrl: formData.logo,
        about: formData.about,
        duration: formData.duration,
        registrationDeadline: formData.registrationDeadline,
        eligibility: formData.eligibility,
        requirements: formData.requirements,
        categories: formData.categories,
        prizes: formData.prizes,
        timeline: formData.timeline,
        importantDates: formData.importantDates,
        faq: formData.faq,
        organizers: formData.organizers,
        sponsors: formData.sponsors
      }
      
      const saveResult = await updateHackathonStep3(hackathonId, saveData as CreateHackathonStep3FormData)
      
      if (!saveResult.success) {
        showCustomToast('error', 'Failed to save changes before publishing. Please try again.')
        setIsPublishing(false)
        return
      }

      // Then update status to published
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        showCustomToast('error', 'User not authenticated')
        setIsPublishing(false)
        return
      }

      const { error: publishError } = await supabase
        .from('hackathons')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', hackathonId)
        .eq('created_by', user.id)

      if (publishError) {
        console.error('Publish error:', publishError)
        showCustomToast('error', 'Failed to publish hackathon. Please try again.')
      } else {
        showCustomToast('success', 'Hackathon published successfully! 🎉')
        
        // Clear localStorage
        localStorage.removeItem('current_hackathon_id')
        
        // Redirect to hackathons page after a short delay
        setTimeout(() => {
          router.push('/hackathons')
        }, 1500)
      }
    } catch (error) {
      console.error('Publish error:', error)
      showCustomToast('error', 'An unexpected error occurred. Please try again.')
    } finally {
      setIsPublishing(false)
      setShowPublishDialog(false)
    }
  }

  const navigationSections = [
    { key: 'banner', label: 'Banners & Logo', icon: Image, color: 'purple' },
    { key: 'basic', label: 'Basic Details', icon: Settings, color: 'blue' },
    { key: 'eligibility', label: 'Eligibility', icon: Sparkles, color: 'orange' },
    { key: 'requirements', label: 'Requirements', icon: CheckCircle, color: 'green' },
    { key: 'timeline', label: 'Stages & Timeline', icon: Calendar, color: 'teal' },
    { key: 'dates', label: 'Important Dates', icon: AlertCircle, color: 'red' },
    { key: 'about', label: 'About Section', icon: Info, color: 'indigo' },
    { key: 'prizes', label: 'Prizes', icon: Trophy, color: 'yellow' },
    { key: 'faq', label: 'FAQ', icon: MessageCircle, color: 'pink' },
    { key: 'organizers', label: 'Organizers', icon: Users, color: 'cyan' },
    { key: 'sponsors', label: 'Sponsors', icon: Heart, color: 'lime' },
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      purple: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      blue: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      orange: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
      green: 'text-green-400 bg-green-500/10 border-green-500/30',
      teal: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
      red: 'text-red-400 bg-red-500/10 border-red-500/30',
      indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
      yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
      pink: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
      cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      lime: 'text-lime-400 bg-lime-500/10 border-lime-500/30',
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-[1500px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-blackops text-4xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-teal-400 mb-2">
              Review & Customize
            </h1>
            <p className="text-gray-400 font-mono text-sm">Fine-tune every detail before publishing your hackathon</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              className="bg-gray-800/50 hover:bg-gray-700/50 text-white border border-gray-600 hover:border-gray-500 px-6 py-6 font-mono transition-all hover:scale-105"
              onClick={handleSaveDraft}
              disabled={isSavingDraft || isPublishing || isLoading}
            >
              {isSavingDraft ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button 
              className="bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 hover:from-purple-600 hover:via-blue-600 hover:to-teal-600 text-white px-8 py-6 font-mono font-bold transition-all hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50"
              onClick={() => setShowPublishDialog(true)}
              disabled={isSavingDraft || isPublishing || isLoading}
            >
              {isPublishing ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[26%_72%] gap-6">
          {/* Left Navigation */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-4 shadow-xl">
              <div className="mb-4 pb-4 border-b border-gray-700">
                <h2 className="font-blackops text-lg text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-teal-400" />
                  Edit Sections
                </h2>
              </div>
              <nav className="space-y-2">
                {navigationSections.map(({ key, label, icon: Icon, color }) => (
                  <button
                    key={key}
                    onClick={() => openEditor(key as SectionKey)}
                    className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-left border-2 transition-all group ${
                      activeSection === key 
                        ? `${getColorClasses(color)} shadow-lg scale-[1.02]` 
                        : 'bg-gray-900/40 border-gray-700/50 hover:bg-gray-800/60 hover:border-gray-600'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${activeSection === key ? '' : 'text-gray-400 group-hover:text-gray-300'}`} />
                      <span className={`font-mono text-sm font-medium ${activeSection === key ? '' : 'text-gray-300 group-hover:text-white'}`}>
                        {label}
                      </span>
                    </span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${activeSection === key ? 'translate-x-1' : 'text-gray-500'}`} />
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Center Preview */}
          <main>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 rounded-xl overflow-hidden shadow-2xl">
              {/* Banner */}
              {formData.banner && formData.banner !== '/api/placeholder/1200/400' && formData.banner !== '' && (
                <div className="relative h-[280px] border-b-2 border-gray-700 overflow-hidden group">
                  <img 
                    src={formData.banner} 
                    alt="Banner" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                  <button 
                    onClick={() => openEditor('banner')}
                    className="absolute top-4 right-4 bg-gray-900/80 hover:bg-gray-800 border border-gray-600 text-white px-4 py-2 rounded-lg text-sm font-mono transition-all hover:scale-105 opacity-0 group-hover:opacity-100"
                  >
                    Edit Banner
                  </button>
                </div>
              )}
              
              <div className="p-5">
                {/* Header with Logo */}
                <div className="grid grid-cols-[100px_1fr] gap-6 items-start mb-8">
                  <div 
                    onClick={() => openEditor('banner')}
                    className="rounded-xl overflow-hidden h-[100px] w-[100px] bg-gray-800 border-2 border-gray-700 flex items-center justify-center cursor-pointer hover:border-teal-400 transition-all group"
                  >
                    {formData.logo && formData.logo !== '' ? (
                      <img 
                        src={formData.logo} 
                        alt="Logo" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <Image className="w-8 h-8 text-gray-500 group-hover:text-teal-400 transition-colors" />
                    )}
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-5xl font-black font-blackops text-white leading-tight">{formData.title}</h2>
                    <div className="flex flex-wrap gap-4 text-sm font-mono text-gray-300">
                      <span className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 rounded-lg">
                        <Globe className="w-4 h-4 text-blue-400" /> {formData.mode}
                      </span>
                      <span className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 rounded-lg">
                        <MapPin className="w-4 h-4 text-purple-400" /> {formData.location}
                      </span>
                      <span className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 px-3 py-1.5 rounded-lg">
                        <Users className="w-4 h-4 text-teal-400" /> {formData.participants} participants
                      </span>
                    </div>
                  </div>
                </div>

                {/* Organizer Info */}
                <div className="mb-8 p-4 bg-gray-800/30 border border-gray-700 rounded-xl">
                  <div className="flex gap-4 font-mono text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Building className="w-5 h-5 text-blue-400" />
                      <span>Organized by <span className="text-white font-semibold">{formData.organizer}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="w-5 h-5 text-blue-400" />
                      <span>Updated: {new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Key Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur border-2 border-blue-500/30 rounded-2xl p-5 text-center hover:scale-105 transition-all shadow-lg hover:shadow-blue-500/20">
                    <Users className="w-7 h-7 text-blue-400 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-white font-mono">{Math.ceil(formData.participants / 4)}</div>
                    <div className="text-sm text-gray-300 font-mono mt-1 font-medium">Teams</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur border-2 border-green-500/30 rounded-2xl p-5 text-center hover:scale-105 transition-all shadow-lg hover:shadow-green-500/20">
                    <Clock className="w-7 h-7 text-green-400 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-white font-mono">{formData.duration}</div>
                    <div className="text-sm text-gray-300 font-mono mt-1 font-medium">Duration</div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 backdrop-blur border-2 border-yellow-500/30 rounded-2xl p-5 text-center hover:scale-105 transition-all shadow-lg hover:shadow-yellow-500/20">
                    <Calendar className="w-7 h-7 text-yellow-400 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-white font-mono">{formData.registrationDeadline}</div>
                    <div className="text-sm text-gray-300 font-mono mt-1 font-medium">Deadline</div>
                  </div>
                  <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 backdrop-blur border-2 border-pink-500/30 rounded-2xl p-5 text-center hover:scale-105 transition-all shadow-lg hover:shadow-pink-500/20">
                    <Trophy className="w-7 h-7 text-pink-400 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-white font-mono">{formData.totalPrizePool}</div>
                    <div className="text-sm text-gray-300 font-mono mt-1 font-medium">Prize Pool</div>
                  </div>
                </div>

                {/* Eligibility Preview */}
                <div className="mb-8 p-6 rounded-xl border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-orange-600/10 hover:scale-[1.01] transition-all cursor-pointer" onClick={() => openEditor('eligibility')}>
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-7 h-7 text-orange-400" />
                    <h3 className="font-blackops text-2xl text-white">Eligibility</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.eligibility.length > 0 ? (
                      formData.eligibility.map((item, index) => (
                        <span key={index} className="px-4 py-2 bg-orange-500/20 border border-orange-500/40 rounded-lg text-orange-300 font-mono text-sm">
                          {item}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-400 font-mono text-sm">Add eligibility criteria using the editor</p>
                    )}
                  </div>
                </div>

                {/* Requirements Preview */}
                {formData.requirements.length > 0 && (
                  <div className="mb-8 p-6 rounded-xl border-2 border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-600/10 hover:scale-[1.01] transition-all cursor-pointer" onClick={() => openEditor('requirements')}>
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle className="w-7 h-7 text-green-400" />
                      <h3 className="font-blackops text-2xl text-white">Requirements</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {formData.requirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-3 px-4 py-2.5 bg-gray-800/30 rounded-xl border border-gray-700/50">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <span className="text-gray-300 font-mono text-sm">{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline Preview */}
                {formData.timeline.length > 0 && (
                  <div className="mb-8 p-6 rounded-xl border-2 border-teal-500/30 bg-gradient-to-br from-teal-500/10 to-teal-600/10 hover:scale-[1.01] transition-all cursor-pointer" onClick={() => openEditor('timeline')}>
                    <div className="flex items-center gap-3 mb-4">
                      <Calendar className="w-7 h-7 text-teal-400" />
                      <h3 className="font-blackops text-2xl text-white">Timeline & Stages</h3>
                    </div>
                    <div className="space-y-3">
                      {formData.timeline.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                          <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="text-white font-mono text-sm font-semibold">{item.title}</h4>
                            <p className="text-gray-400 font-mono text-xs">{item.startDate} - {item.endDate}</p>
                          </div>
                        </div>
                      ))}
                      {formData.timeline.length > 3 && (
                        <p className="text-gray-400 font-mono text-sm">+ {formData.timeline.length - 3} more stages</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Important Dates Preview */}
                {formData.importantDates.length > 0 && (
                  <div className="mb-8 p-6 rounded-xl border-2 border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-600/10 hover:scale-[1.01] transition-all cursor-pointer" onClick={() => openEditor('dates')}>
                    <div className="flex items-center gap-3 mb-4">
                      <AlertCircle className="w-7 h-7 text-red-400" />
                      <h3 className="font-blackops text-2xl text-white">Important Dates</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {formData.importantDates.slice(0, 4).map((date, index) => (
                        <div key={index} className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                          <h4 className="text-white font-mono text-sm font-semibold">{date.title}</h4>
                          <p className="text-gray-400 font-mono text-xs">{date.date} at {date.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prizes Preview */}
                {formData.prizes.length > 0 && (
                  <div className="mb-8 p-6 rounded-xl border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 hover:scale-[1.01] transition-all cursor-pointer" onClick={() => openEditor('prizes')}>
                    <div className="flex items-center gap-3 mb-4">
                      <Trophy className="w-7 h-7 text-yellow-400" />
                      <h3 className="font-blackops text-2xl text-white">Prizes & Rewards</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {formData.prizes.slice(0, 4).map((prize, index) => (
                        <div key={index} className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                          <h4 className="text-white font-mono text-sm font-semibold">{prize.position}</h4>
                          <p className="text-yellow-400 font-mono text-sm font-bold">{prize.amount}</p>
                          <p className="text-gray-400 font-mono text-xs">{prize.type}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* FAQ Preview */}
                {formData.faq.length > 0 && (
                  <div className="mb-8 p-6 rounded-xl border-2 border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-pink-600/10 hover:scale-[1.01] transition-all cursor-pointer" onClick={() => openEditor('faq')}>
                    <div className="flex items-center gap-3 mb-4">
                      <MessageCircle className="w-7 h-7 text-pink-400" />
                      <h3 className="font-blackops text-2xl text-white">Frequently Asked Questions</h3>
                    </div>
                    <div className="space-y-3">
                      {formData.faq.slice(0, 3).map((faq, index) => (
                        <div key={index} className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                          <h4 className="text-white font-mono text-sm font-semibold mb-1">{faq.question}</h4>
                          <p className="text-gray-300 font-mono text-xs">{faq.answer}</p>
                        </div>
                      ))}
                      {formData.faq.length > 3 && (
                        <p className="text-gray-400 font-mono text-sm">+ {formData.faq.length - 3} more questions</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Organizers Preview */}
                {formData.organizers.length > 0 && (
                <div className="mb-8 p-6 rounded-xl border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 hover:scale-[1.01] transition-all cursor-pointer" onClick={() => openEditor('organizers')}>
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-7 h-7 text-cyan-400" />
                    <h3 className="font-blackops text-2xl text-white">Organizers</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {formData.organizers.slice(0, 4).map((organizer, index) => (
                      <div key={index} className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50 flex items-center gap-3">
                        {organizer.photo && organizer.photo !== '' ? (
                          <img 
                            src={organizer.photo} 
                            alt={organizer.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-cyan-500/30 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-cyan-500/20 border-2 border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                            <Users className="w-6 h-6 text-cyan-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-mono text-sm font-semibold truncate">{organizer.name}</h4>
                          <p className="text-gray-300 font-mono text-xs truncate">{organizer.role}</p>
                          <p className="text-gray-400 font-mono text-xs truncate">{organizer.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

                {/* Sponsors Preview */}
                {formData.sponsors.length > 0 && (
                  <div className="mb-8 p-6 rounded-xl border-2 border-lime-500/30 bg-gradient-to-br from-lime-500/10 to-lime-600/10 hover:scale-[1.01] transition-all cursor-pointer" onClick={() => openEditor('sponsors')}>
                    <div className="flex items-center gap-3 mb-4">
                      <Heart className="w-7 h-7 text-lime-400" />
                      <h3 className="font-blackops text-2xl text-white">Sponsors & Partners</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {formData.sponsors.slice(0, 6).map((sponsor, index) => (
                        <div key={index} className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50 text-center">
                          {sponsor.logo && sponsor.logo !== '' ? (
                            <div className="mb-2 flex items-center justify-center h-16">
                              <img 
                                src={sponsor.logo} 
                                alt={sponsor.name}
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                          ) : (
                            <div className="mb-2 flex items-center justify-center h-16">
                              <div className="w-12 h-12 rounded bg-lime-500/20 flex items-center justify-center">
                                <Heart className="w-6 h-6 text-lime-400" />
                              </div>
                            </div>
                          )}
                          <h4 className="text-white font-mono text-sm font-semibold truncate">{sponsor.name}</h4>
                          <p className="text-gray-400 font-mono text-xs truncate">{sponsor.tier}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* About Section Preview */}
                <div className="p-6 rounded-xl border-2 border-gray-700 bg-gray-900/60 hover:border-gray-600 transition-all cursor-pointer" onClick={() => openEditor('about')}>
                  <div className="flex items-center gap-3 mb-4">
                    <Info className="w-7 h-7 text-indigo-400" />
                    <h3 className="font-blackops text-2xl text-white">About This Hackathon</h3>
                  </div>
                  <p className="text-gray-300 font-geist leading-relaxed whitespace-pre-line">{formData.about}</p>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      openEditor('about')
                    }}
                    className="mt-4 text-sm font-mono text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
                  >
                    Edit content <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Categories Tags */}
                {formData.categories && formData.categories.length > 0 && (
                  <div className="mt-6 p-6 rounded-xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-600/10">
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="w-7 h-7 text-purple-400" />
                      <h3 className="font-blackops text-2xl text-white">Categories</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.categories.map((category, index) => (
                        <span key={index} className="px-4 py-2 bg-purple-500/20 border border-purple-500/40 rounded-lg text-purple-300 font-mono text-sm">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>

        {/* Editor Sheet */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="right" className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 w-[96vw] sm:w-[720px] lg:w-[960px] xl:w-[1100px] 2xl:w-[1280px] overflow-y-auto p-0">
            <SheetHeader className="border-b border-gray-700 px-6 py-5 bg-gray-900/50 sticky top-0 z-10">
              <SheetTitle className="font-blackops text-2xl text-white flex items-center gap-3">
                {navigationSections.find(s => s.key === activeSection)?.icon && (
                  <div className={`p-2.5 rounded-lg ${getColorClasses(navigationSections.find(s => s.key === activeSection)?.color || 'blue')}`}>
                    {(() => {
                      const Icon = navigationSections.find(s => s.key === activeSection)?.icon
                      return Icon ? <Icon className="w-5 h-5" /> : null
                    })()}
                  </div>
                )}
                {navigationSections.find(s => s.key === activeSection)?.label}
              </SheetTitle>
            </SheetHeader>

            <div className="px-6 py-6 space-y-6">
              {/* Basic Details */}
              {activeSection === 'basic' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-gray-200 font-mono text-sm flex items-center gap-2">
                      Hackathon Title <span className="text-red-400 text-xs">*</span>
                    </Label>
                    <Input 
                      className="bg-black/60 border-gray-700 text-gray-100 focus:border-blue-500 transition-colors h-11 font-mono" 
                      placeholder="e.g., AI Innovation Hackathon 2025" 
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-gray-200 font-mono text-sm flex items-center gap-2">
                      Organizer Name <span className="text-red-400 text-xs">*</span>
                    </Label>
                    <Input 
                      className="bg-black/60 border-gray-700 text-gray-100 focus:border-blue-500 transition-colors h-11 font-mono" 
                      placeholder="Your organization name" 
                      value={formData.organizer}
                      onChange={(e) => setFormData({...formData, organizer: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-200 font-mono text-sm">Mode</Label>
                      <select 
                        className="w-full bg-black/60 border border-gray-700 text-gray-100 rounded-md px-3 h-11 focus:border-blue-500 transition-colors font-mono"
                        value={formData.mode}
                        onChange={(e) => setFormData({...formData, mode: e.target.value})}
                      >
                        <option>Online</option>
                        <option>Offline</option>
                        <option>Hybrid</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-200 font-mono text-sm">Location</Label>
                      <Input 
                        className="bg-black/60 border-gray-700 text-gray-100 h-11 font-mono" 
                        placeholder="City, Country"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-200 font-mono text-sm">Current Participants</Label>
                      <Input 
                        type="number" 
                        className="bg-black/60 border-gray-700 text-gray-100 h-11 font-mono" 
                        placeholder="0"
                        value={formData.participants}
                        onChange={(e) => setFormData({...formData, participants: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-200 font-mono text-sm">Max Participants</Label>
                      <Input 
                        type="number" 
                        className="bg-black/60 border-gray-700 text-gray-100 h-11 font-mono" 
                        placeholder="500"
                        value={formData.maxParticipants}
                        onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-200 font-mono text-sm">Duration</Label>
                      <Input 
                        className="bg-black/60 border-gray-700 text-gray-100 h-11 font-mono" 
                        placeholder="48H"
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-200 font-mono text-sm">Registration Deadline</Label>
                      <Input 
                        className="bg-black/60 border-gray-700 text-gray-100 h-11 font-mono" 
                        placeholder="Oct 07"
                        value={formData.registrationDeadline}
                        onChange={(e) => setFormData({...formData, registrationDeadline: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Banner Section */}
              {activeSection === 'banner' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-gray-200 font-mono text-sm">Desktop Banner</Label>
                    {formData.banner && formData.banner !== '/api/placeholder/1200/400' ? (
                      <div className="relative border-2 border-gray-700 rounded-lg overflow-hidden">
                        <img 
                          src={formData.banner} 
                          alt="Banner preview" 
                          className="w-full h-48 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({...formData, banner: '/api/placeholder/1200/400'})
                            setValue('bannerUrl', '/api/placeholder/1200/400')
                            if (bannerInputRef.current) {
                              bannerInputRef.current.value = ''
                            }
                          }}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full px-3 py-1 transition-colors text-sm font-mono"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    ) : (
                      <div 
                        className="border-2 border-dashed border-gray-700 rounded-lg bg-black/40 p-6 text-center hover:border-gray-600 transition-colors cursor-pointer" 
                        onClick={() => bannerInputRef.current?.click()}
                      >
                        <div className="mx-auto w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                          <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-gray-200 font-mono text-sm mb-1">
                          {isUploadingBanner ? 'Uploading...' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">Recommended: 1200x400px, Max 2MB</p>
                      </div>
                    )}
                    <input 
                      ref={bannerInputRef} 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        
                        setIsUploadingBanner(true)
                        showCustomToast('info', 'Uploading banner...')
                        
                        try {
                          const res = await uploadHackathonBanner(file)
                          if (res.success && res.url) {
                            setFormData({...formData, banner: res.url})
                            setValue('bannerUrl', res.url)
                            showCustomToast('success', 'Banner uploaded successfully!')
                          } else {
                            showCustomToast('error', res.error || 'Failed to upload banner')
                            if (bannerInputRef.current) {
                              bannerInputRef.current.value = ''
                            }
                          }
                        } catch (error) {
                          showCustomToast('error', 'An unexpected error occurred during upload')
                        } finally {
                          setIsUploadingBanner(false)
                        }
                      }} 
                    />
                    <Input 
                      placeholder="Or paste image URL here" 
                      className="bg-black/60 border-gray-700 text-gray-100 h-11 font-mono"
                      value={formData.banner === '/api/placeholder/1200/400' ? '' : formData.banner}
                      onChange={(e) => {
                        setFormData({...formData, banner: e.target.value})
                        setValue('bannerUrl', e.target.value)
                      }}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-gray-200 font-mono text-sm">Hackathon Logo</Label>
                    {formData.logo && formData.logo !== '' ? (
                      <div className="relative border-2 border-gray-700 rounded-lg overflow-hidden w-48 h-48 mx-auto">
                        <img 
                          src={formData.logo} 
                          alt="Logo preview" 
                          className="w-full h-full object-contain p-4 bg-gray-900"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({...formData, logo: ''})
                            setValue('logoUrl', '')
                            if (logoInputRef.current) {
                              logoInputRef.current.value = ''
                            }
                          }}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full px-3 py-1 transition-colors text-sm font-mono"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    ) : (
                      <div 
                        className="border-2 border-dashed border-gray-700 rounded-lg bg-black/40 p-6 text-center hover:border-gray-600 transition-colors cursor-pointer" 
                        onClick={() => logoInputRef.current?.click()}
                      >
                        <div className="mx-auto w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                          <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-gray-200 font-mono text-sm mb-1">
                          {isUploadingLogo ? 'Uploading...' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">Recommended: Square format, 200x200px minimum, Max 1MB</p>
                      </div>
                    )}
                    <input 
                      ref={logoInputRef} 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        
                        setIsUploadingLogo(true)
                        showCustomToast('info', 'Uploading logo...')
                        
                        try {
                          const res = await uploadHackathonLogo(file)
                          if (res.success && res.url) {
                            setFormData({...formData, logo: res.url})
                            setValue('logoUrl', res.url)
                            showCustomToast('success', 'Logo uploaded successfully!')
                          } else {
                            showCustomToast('error', res.error || 'Failed to upload logo')
                            if (logoInputRef.current) {
                              logoInputRef.current.value = ''
                            }
                          }
                        } catch (error) {
                          showCustomToast('error', 'An unexpected error occurred during upload')
                        } finally {
                          setIsUploadingLogo(false)
                        }
                      }} 
                    />
                    <Input 
                      placeholder="Or paste logo URL here" 
                      className="bg-black/60 border-gray-700 text-gray-100 h-11 font-mono"
                      value={formData.logo}
                      onChange={(e) => {
                        setFormData({...formData, logo: e.target.value})
                        setValue('logoUrl', e.target.value)
                      }}
                    />
                  </div>
                </div>
              )}

              {/* About Section */}
              {activeSection === 'about' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-gray-200 font-mono text-sm">About Your Hackathon</Label>
                    <p className="text-xs text-gray-400 font-mono">Describe your hackathon in detail. Include the theme, goals, what participants will build, and what makes your event unique.</p>
                    <Textarea 
                      rows={14} 
                      className="bg-black/60 border-gray-700 text-gray-100 focus:border-blue-500 transition-colors font-mono text-sm" 
                      placeholder="Describe your hackathon in detail. Include the theme, goals, what participants will build, and what makes your event unique..."
                      value={formData.about}
                      onChange={(e) => setFormData({...formData, about: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-gray-200 font-mono text-sm">Tags</Label>
                    <Input 
                      className="bg-black/60 border-gray-700 text-gray-100 h-11 font-mono" 
                      placeholder="AI, Web3, Healthcare, Social Impact (comma separated)" 
                    />
                  </div>
                </div>
              )}

              {/* Eligibility */}
              {activeSection === 'eligibility' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-gray-200 font-mono text-sm">Who Can Participate?</Label>
                    <p className="text-xs text-gray-400 font-mono">Select all that apply</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Everyone', icon: '👥', selected: formData.eligibility.includes('Everyone') },
                        { label: 'College Students', icon: '🎓', selected: formData.eligibility.includes('College Students') },
                        { label: 'Professionals', icon: '💼', selected: formData.eligibility.includes('Professionals') },
                        { label: 'School Students', icon: '📚', selected: formData.eligibility.includes('School Students') },
                        { label: 'Freshers', icon: '🔍', selected: formData.eligibility.includes('Freshers') },
                        { label: 'Others', icon: '⋯', selected: formData.eligibility.includes('Others') }
                      ].map(({ label, icon, selected }) => (
                        <div
                          key={label}
                          onClick={() => {
                            if (selected) {
                              setFormData({...formData, eligibility: formData.eligibility.filter(el => el !== label)})
                            } else {
                              setFormData({...formData, eligibility: [...formData.eligibility, label]})
                            }
                          }}
                          className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 ${
                            selected 
                              ? 'border-blue-500 bg-blue-500/10' 
                              : 'border-gray-700 bg-gray-900/40 hover:border-gray-600'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-2">{icon}</div>
                            <div className={`font-mono text-sm ${selected ? 'text-white' : 'text-gray-300'}`}>
                              {label}
                            </div>
                          </div>
                          {selected && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Requirements */}
              {activeSection === 'requirements' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-gray-200 font-mono text-sm">Participation Requirements</Label>
                    <p className="text-xs text-gray-400 font-mono">List what participants need to have or bring</p>
                    <div className="space-y-2">
                      {formData.requirements.map((req, index) => (
                        <div key={index} className="flex gap-3 items-center p-3 bg-black/40 border border-gray-700 rounded-lg group hover:border-gray-600 transition-colors">
                          <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <span className="flex-1 text-gray-200 font-mono text-sm">{req}</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeRequirement(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        className="bg-black/60 border-gray-700 text-gray-100 h-11 flex-1 font-mono" 
                        placeholder="Add a new requirement..."
                        value={newRequirement}
                        onChange={(e) => setNewRequirement(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                      />
                      <Button 
                        className="bg-green-600 hover:bg-green-700 text-white h-11 px-5"
                        onClick={addRequirement}
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Prizes */}
              {activeSection === 'prizes' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-gray-200 font-mono text-sm">Total Prize Pool</Label>
                    <Input 
                      placeholder="$5,000" 
                      className="bg-black/60 border-gray-700 text-gray-100 h-11 font-mono"
                      value={formData.totalPrizePool}
                      onChange={(e) => setFormData({...formData, totalPrizePool: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-gray-200 font-mono text-sm">Prize Distribution</Label>
                    <p className="text-xs text-gray-400 font-mono">Add prizes and rewards for winners</p>
                    
                    {/* Existing Prizes */}
                    {formData.prizes.length > 0 && (
                      <div className="space-y-3">
                        {formData.prizes.map((prize, index) => (
                          <div key={index} className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-white font-mono text-sm font-semibold">{prize.position}</h4>
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-6 w-6 p-0"
                                  onClick={() => editPrize(index)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-6 w-6 p-0"
                                  onClick={() => setFormData({...formData, prizes: formData.prizes.filter((_, i) => i !== index)})}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-yellow-400 font-mono text-sm font-semibold mb-1">{prize.amount}</p>
                            <p className="text-gray-300 font-mono text-xs mb-2">{prize.description}</p>
                            <div className="text-gray-400 font-mono text-xs">Type: {prize.type}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add New Prize */}
                    <div className="p-5 bg-black/40 border border-gray-700 rounded-lg space-y-4">
                      <Input 
                        placeholder="Prize Position (e.g., 1st Place)" 
                        className="bg-gray-900/60 border-gray-600 text-gray-100 h-11 font-mono"
                        value={newPrize.position}
                        onChange={(e) => setNewPrize({...newPrize, position: e.target.value})}
                      />
                      <Input 
                        placeholder="Amount (e.g., $2,000)" 
                        className="bg-gray-900/60 border-gray-600 text-gray-100 h-11 font-mono"
                        value={newPrize.amount}
                        onChange={(e) => setNewPrize({...newPrize, amount: e.target.value})}
                      />
                      <Textarea 
                        rows={3} 
                        placeholder="Prize description and details" 
                        className="bg-gray-900/60 border-gray-600 text-gray-100 font-mono"
                        value={newPrize.description}
                        onChange={(e) => setNewPrize({...newPrize, description: e.target.value})}
                      />
                      <select 
                        className="w-full bg-gray-900/60 border border-gray-600 text-gray-100 rounded-md px-3 h-11 font-mono"
                        value={newPrize.type}
                        onChange={(e) => setNewPrize({...newPrize, type: e.target.value})}
                      >
                        <option>Cash</option>
                        <option>Certificate</option>
                        <option>Swag</option>
                        <option>Mentorship</option>
                        <option>Other</option>
                      </select>
                    </div>
                    {/* Update the Add Prize button */}
                    <div className="flex gap-3">
                      <Button 
                        className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white h-11 font-mono"
                        onClick={updateAddPrize}
                      >
                        <Plus className="w-4 h-4 mr-2" /> {editingPrizeIndex !== null ? 'Update Prize' : 'Add Prize'}
                      </Button>
                      {editingPrizeIndex !== null && (
                        <Button 
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 h-11 font-mono"
                          onClick={cancelEditPrize}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              {activeSection === 'timeline' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-gray-200 font-mono text-sm">Event Stages & Timeline</Label>
                    <p className="text-xs text-gray-400 font-mono">Define the key stages and milestones of your hackathon</p>
                    
                    {/* Existing Timeline Items */}
                    {formData.timeline.length > 0 && (
                      <div className="space-y-3">
                        {formData.timeline.map((item, index) => (
                          <div key={index} className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-white font-mono text-sm font-semibold">{item.title}</h4>
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-6 w-6 p-0"
                                  onClick={() => editTimelineItem(index)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-6 w-6 p-0"
                                  onClick={() => setFormData({...formData, timeline: formData.timeline.filter((_, i) => i !== index)})}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-gray-300 font-mono text-xs mb-2">{item.description}</p>
                            <div className="text-gray-400 font-mono text-xs">
                              {item.startDate} - {item.endDate}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add New Timeline Item */}
                    <div className="p-5 bg-black/40 border border-gray-700 rounded-lg space-y-4">
                      <Input 
                        placeholder="Stage Title (e.g., Registration Opens)" 
                        className="bg-gray-900/60 border-gray-600 text-gray-100 h-11 font-mono"
                        value={newTimelineItem.title}
                        onChange={(e) => setNewTimelineItem({...newTimelineItem, title: e.target.value})}
                      />
                      <Textarea 
                        rows={3} 
                        placeholder="Stage description and details" 
                        className="bg-gray-900/60 border-gray-600 text-gray-100 font-mono"
                        value={newTimelineItem.description}
                        onChange={(e) => setNewTimelineItem({...newTimelineItem, description: e.target.value})}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-gray-300 font-mono text-xs">Start Date & Time</Label>
                          <Input 
                            type="datetime-local" 
                            className="bg-gray-900/60 border-gray-600 text-gray-100 h-11 font-mono"
                            value={newTimelineItem.startDate}
                            onChange={(e) => setNewTimelineItem({...newTimelineItem, startDate: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-300 font-mono text-xs">End Date & Time</Label>
                          <Input 
                            type="datetime-local" 
                            className="bg-gray-900/60 border-gray-600 text-gray-100 h-11 font-mono"
                            value={newTimelineItem.endDate}
                            onChange={(e) => setNewTimelineItem({...newTimelineItem, endDate: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white h-11 font-mono"
                        onClick={addTimelineItem}
                      >
                        <Plus className="w-4 h-4 mr-2" /> {editingTimelineIndex !== null ? 'Update Stage' : 'Add Stage'}
                      </Button>
                      {editingTimelineIndex !== null && (
                        <Button 
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 h-11 font-mono"
                          onClick={cancelEditTimeline}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Important Dates */}
              {activeSection === 'dates' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-gray-200 font-mono text-sm">Key Dates & Deadlines</Label>
                    <p className="text-xs text-gray-400 font-mono">Add important dates participants should remember</p>
                    
                    {/* Existing Date Items */}
                    {formData.importantDates.length > 0 && (
                      <div className="space-y-3">
                        {formData.importantDates.map((item, index) => (
                          <div key={index} className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-white font-mono text-sm font-semibold">{item.title}</h4>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-6 w-6 p-0"
                                onClick={() => setFormData({...formData, importantDates: formData.importantDates.filter((_, i) => i !== index)})}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            <p className="text-gray-300 font-mono text-xs mb-2">{item.description}</p>
                            <div className="text-gray-400 font-mono text-xs">
                              {item.date} at {item.time}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add New Date Item */}
                    <div className="p-5 bg-black/40 border border-gray-700 rounded-lg space-y-4">
                      <Input 
                        placeholder="Date Title (e.g., Submission Deadline)" 
                        className="bg-gray-900/60 border-gray-600 text-gray-100 h-11 font-mono"
                        value={newDateItem.title}
                        onChange={(e) => setNewDateItem({...newDateItem, title: e.target.value})}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input 
                          type="date" 
                          className="bg-gray-900/60 border-gray-600 text-gray-100 h-11 font-mono"
                          value={newDateItem.date}
                          onChange={(e) => setNewDateItem({...newDateItem, date: e.target.value})}
                        />
                        <Input 
                          type="time" 
                          placeholder="Time" 
                          className="bg-gray-900/60 border-gray-600 text-gray-100 h-11 font-mono"
                          value={newDateItem.time}
                          onChange={(e) => setNewDateItem({...newDateItem, time: e.target.value})}
                        />
                      </div>
                      <Textarea 
                        rows={2} 
                        placeholder="Additional details or timezone information" 
                        className="bg-gray-900/60 border-gray-600 text-gray-100 font-mono"
                        value={newDateItem.description}
                        onChange={(e) => setNewDateItem({...newDateItem, description: e.target.value})}
                      />
                    </div>
                    <Button 
                      className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white h-11 font-mono"
                      onClick={addDateItem}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Date
                    </Button>
                  </div>
                </div>
              )}

              {/* FAQ */}
              {activeSection === 'faq' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-gray-200 font-mono text-sm">Frequently Asked Questions</Label>
                    <p className="text-xs text-gray-400 font-mono">Help participants by answering common questions</p>
                    
                    {/* Existing FAQs */}
                    {formData.faq.length > 0 && (
                      <div className="space-y-3">
                        {formData.faq.map((faq, index) => (
                          <div key={index} className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-white font-mono text-sm font-semibold">{faq.question}</h4>
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-6 w-6 p-0"
                                  onClick={() => editFaq(index)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-6 w-6 p-0"
                                  onClick={() => setFormData({...formData, faq: formData.faq.filter((_, i) => i !== index)})}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-gray-300 font-mono text-xs">{faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add New FAQ */}
                    <div className="p-5 bg-black/40 border border-gray-700 rounded-lg space-y-4">
                      <Input 
                        placeholder="Question" 
                        className="bg-gray-900/60 border-gray-600 text-gray-100 h-11 font-mono"
                        value={newFaq.question}
                        onChange={(e) => setNewFaq({...newFaq, question: e.target.value})}
                      />
                      <Textarea 
                        rows={5} 
                        placeholder="Answer to the question" 
                        className="bg-gray-900/60 border-gray-600 text-gray-100 font-mono"
                        value={newFaq.answer}
                        onChange={(e) => setNewFaq({...newFaq, answer: e.target.value})}
                      />
                    </div>
                    {/* Update the Add FAQ button */}
                    <div className="flex gap-3">
                      <Button 
                        className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white h-11 font-mono"
                        onClick={updateAddFaq}
                      >
                        <Plus className="w-4 h-4 mr-2" /> {editingFaqIndex !== null ? 'Update FAQ' : 'Add FAQ'}
                      </Button>
                      {editingFaqIndex !== null && (
                        <Button 
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 h-11 font-mono"
                          onClick={cancelEditFaq}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Organizers */}
              {activeSection === 'organizers' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-gray-200 font-mono text-sm">Organizer Details</Label>
                    <p className="text-xs text-gray-400 font-mono">Add team members and their contact information</p>
                    
                    {/* Existing Organizers */}
                    {formData.organizers.length > 0 && (
                      <div className="space-y-3">
                        {formData.organizers.map((organizer, index) => (
                          <div key={index} className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex gap-3 items-center">
                                {organizer.photo && (
                                  <img 
                                    src={organizer.photo} 
                                    alt={organizer.name}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
                                  />
                                )}
                                <div>
                                  <h4 className="text-white font-mono text-sm font-semibold">{organizer.name}</h4>
                                  <p className="text-gray-300 font-mono text-xs">{organizer.role}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-6 w-6 p-0"
                                  onClick={() => editOrganizer(index)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-6 w-6 p-0"
                                  onClick={() => setFormData({...formData, organizers: formData.organizers.filter((_, i) => i !== index)})}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-gray-400 font-mono text-xs">{organizer.email}</p>
                            {organizer.phone && <p className="text-gray-400 font-mono text-xs">{organizer.phone}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add photo preview in the form */}
                    {newOrganizer.photo && (
                      <div className="flex items-center gap-3 p-3 bg-gray-800/30 border border-gray-700 rounded-lg">
                        <img 
                          src={newOrganizer.photo} 
                          alt="Preview"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <span className="text-gray-300 font-mono text-sm flex-1">Photo uploaded</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                          onClick={() => setNewOrganizer({...newOrganizer, photo: ''})}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {/* Add New Organizer */}
                    <div className="p-5 bg-black/40 border border-gray-700 rounded-lg space-y-4">
                      <Input 
                        placeholder="Full Name" 
                        className="bg-gray-900/60 border-gray-600 text-gray-100 h-11 font-mono"
                        value={newOrganizer.name}
                        onChange={(e) => setNewOrganizer({...newOrganizer, name: e.target.value})}
                      />
                      <Input 
                        placeholder="Role/Title" 
                        className="bg-gray-900/60 border-gray-600 text-gray-100 h-11 font-mono"
                        value={newOrganizer.role}
                        onChange={(e) => setNewOrganizer({...newOrganizer, role: e.target.value})}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input 
                          type="email" 
                          placeholder="Email" 
                          className="bg-gray-900/60 border-gray-600 text-gray-100 h-11 font-mono"
                          value={newOrganizer.email}
                          onChange={(e) => setNewOrganizer({...newOrganizer, email: e.target.value})}
                        />
                        <Input 
                          type="tel" 
                          placeholder="Phone (optional)" 
                          className="bg-gray-900/60 border-gray-600 text-gray-100 h-11 font-mono"
                          value={newOrganizer.phone}
                          onChange={(e) => setNewOrganizer({...newOrganizer, phone: e.target.value})}
                        />
                      </div>
                      <Input 
                        placeholder="LinkedIn or Profile URL (optional)" 
                        className="bg-gray-900/60 border-gray-600 text-gray-100 h-11 font-mono"
                        value={newOrganizer.profileUrl}
                        onChange={(e) => setNewOrganizer({...newOrganizer, profileUrl: e.target.value})}
                      />
                      <div 
                        className="border-2 border-dashed border-gray-600 rounded-lg bg-gray-900/40 p-4 text-center hover:border-gray-500 transition-colors cursor-pointer"
                        onClick={() => organizerPhotoInputRef.current?.click()}
                      >
                        <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-400 font-mono text-xs">
                          {isUploadingOrganizerPhoto ? 'Uploading...' : 'Upload profile photo'}
                        </p>
                      </div>
                      <input 
                        ref={organizerPhotoInputRef} 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          setIsUploadingOrganizerPhoto(true)
                          const res = await uploadHackathonLogo(file)
                          setIsUploadingOrganizerPhoto(false)
                          if (res.success && res.url) {
                            setNewOrganizer(prev => ({ ...prev, photo: res.url }))
                            showCustomToast('success', 'Organizer photo uploaded successfully!')
                          } else {
                            showCustomToast('error', res.error || 'Failed to upload organizer photo')
                          }
                        }} 
                      />
                    </div>

                    {/* Update the Add Organizer button */}
                    <div className="flex gap-3">
                      <Button 
                        className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white h-11 font-mono"
                        onClick={updateAddOrganizer}
                      >
                        <Plus className="w-4 h-4 mr-2" /> {editingOrganizerIndex !== null ? 'Update Organizer' : 'Add Organizer'}
                      </Button>
                      {editingOrganizerIndex !== null && (
                        <Button 
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 h-11 font-mono"
                          onClick={cancelEditOrganizer}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Sponsors */}
              {activeSection === 'sponsors' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-gray-200 font-mono text-sm">Sponsor Information</Label>
                    <p className="text-xs text-gray-400 font-mono">Showcase sponsors and partners supporting your event</p>
                    
                    {/* Existing Sponsors */}
                    {formData.sponsors.length > 0 && (
                      <div className="space-y-3">
                        {formData.sponsors.map((sponsor, index) => (
                          <div key={index} className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex gap-3 items-center">
                                {sponsor.logo && (
                                  <img 
                                    src={sponsor.logo} 
                                    alt={sponsor.name}
                                    className="w-10 h-10 rounded object-contain bg-white/5 p-1"
                                  />
                                )}
                                <div>
                                  <h4 className="text-white font-mono text-sm font-semibold">{sponsor.name}</h4>
                                  <p className="text-gray-300 font-mono text-xs">{sponsor.tier}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-6 w-6 p-0"
                                  onClick={() => editSponsor(index)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-6 w-6 p-0"
                                  onClick={() => setFormData({...formData, sponsors: formData.sponsors.filter((_, i) => i !== index)})}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            {sponsor.website && <p className="text-gray-400 font-mono text-xs">{sponsor.website}</p>}
                            {sponsor.description && <p className="text-gray-300 font-mono text-xs mt-2">{sponsor.description}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add logo preview in the form */}
                    {newSponsor.logo && (
                      <div className="flex items-center gap-3 p-3 bg-gray-800/30 border border-gray-700 rounded-lg">
                        <img 
                          src={newSponsor.logo} 
                          alt="Preview"
                          className="w-12 h-12 rounded object-contain bg-white/5 p-1"
                        />
                        <span className="text-gray-300 font-mono text-sm flex-1">Logo uploaded</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                          onClick={() => setNewSponsor({...newSponsor, logo: ''})}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {/* Add New Sponsor */}
                    <div className="p-5 bg-black/40 border border-gray-700 rounded-lg space-y-4">
                      <Input 
                        placeholder="Sponsor Name" 
                        className="bg-gray-900/60 border-gray-600 text-gray-100 h-11 font-mono"
                        value={newSponsor.name}
                        onChange={(e) => setNewSponsor({...newSponsor, name: e.target.value})}
                      />
                      <select 
                        className="w-full bg-gray-900/60 border border-gray-600 text-gray-100 rounded-md px-3 h-11 font-mono"
                        value={newSponsor.tier}
                        onChange={(e) => setNewSponsor({...newSponsor, tier: e.target.value})}
                      >
                        <option>Sponsor Tier</option>
                        <option>Title Sponsor</option>
                        <option>Gold Sponsor</option>
                        <option>Silver Sponsor</option>
                        <option>Bronze Sponsor</option>
                        <option>Community Partner</option>
                      </select>
                      <Input 
                        placeholder="Website Link" 
                        className="bg-gray-900/60 border-gray-600 text-gray-100 h-11 font-mono"
                        value={newSponsor.website}
                        onChange={(e) => setNewSponsor({...newSponsor, website: e.target.value})}
                      />
                      <div 
                        className="border-2 border-dashed border-gray-600 rounded-lg bg-gray-900/40 p-4 text-center hover:border-gray-500 transition-colors cursor-pointer"
                        onClick={() => sponsorLogoInputRef.current?.click()}
                      >
                        <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-400 font-mono text-xs">
                          {isUploadingSponsorLogo ? 'Uploading...' : 'Upload sponsor logo'}
                        </p>
                      </div>
                      <input 
                        ref={sponsorLogoInputRef} 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          setIsUploadingSponsorLogo(true)
                          const res = await uploadHackathonLogo(file)
                          setIsUploadingSponsorLogo(false)
                          if (res.success && res.url) {
                            setNewSponsor(prev => ({ ...prev, logo: res.url }))
                            showCustomToast('success', 'Sponsor logo uploaded successfully!')
                          } else {
                            showCustomToast('error', res.error || 'Failed to upload sponsor logo')
                          }
                        }} 
                      />
                      <Textarea 
                        rows={3} 
                        placeholder="Sponsor description (optional)" 
                        className="bg-gray-900/60 border-gray-600 text-gray-100 font-mono"
                        value={newSponsor.description}
                        onChange={(e) => setNewSponsor({...newSponsor, description: e.target.value})}
                      />
                    </div>

                    {/* Update the Add Sponsor button */}
                    <div className="flex gap-3">
                      <Button 
                        className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white h-11 font-mono"
                        onClick={updateAddSponsor}
                      >
                        <Plus className="w-4 h-4 mr-2" /> {editingSponsorIndex !== null ? 'Update Sponsor' : 'Add Sponsor'}
                      </Button>
                      {editingSponsorIndex !== null && (
                        <Button 
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 h-11 font-mono"
                          onClick={cancelEditSponsor}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Save Button - Sticky Footer */}
            <div className="sticky bottom-0 px-6 py-4 bg-gray-900/95 backdrop-blur border-t border-gray-700 flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 bg-gray-800/50 hover:bg-gray-700 border-gray-600 text-white h-11 font-mono"
                onClick={() => {
                  setFormData(originalFormData)
                  reset(originalFormData)
                  setOpen(false)
                }}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 text-white h-11 font-bold font-mono hover:from-purple-600 hover:via-blue-600 hover:to-teal-600 shadow-lg disabled:opacity-50" 
                disabled={isSaving}
                onClick={handleSubmit(onSave)}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Publish Confirmation Dialog */}
        <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
          <AlertDialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-blackops text-2xl text-white flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                Ready to Publish?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300 font-mono text-sm space-y-3 pt-4">
                <p className="leading-relaxed">
                  Please confirm that all hackathon details are correct and complete before publishing.
                </p>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 space-y-2">
                  <div className="text-yellow-300 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Important Notice:
                  </div>
                  <p className="text-yellow-200/90 text-xs">
                    Once published, your hackathon will be live and visible to all users. Make sure all information is accurate.
                  </p>
                </div>
                <div className="space-y-2 pt-2">
                  <p className="text-gray-400 text-xs font-semibold">Please verify:</p>
                  <ul className="space-y-1.5 text-xs text-gray-400">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>All dates and deadlines are correct</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Prize information is accurate</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Contact details are up to date</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>All required sections are complete</span>
                    </li>
                  </ul>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3 pt-4">
              <AlertDialogCancel 
                className="bg-gray-800 hover:bg-gray-700 border-gray-600 text-white font-mono"
                disabled={isPublishing}
              >
                Review Again
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handlePublish}
                disabled={isPublishing}
                className="bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 hover:from-purple-600 hover:via-blue-600 hover:to-teal-600 text-white font-mono font-bold disabled:opacity-50"
              >
                {isPublishing ? 'Publishing...' : 'Publish Hackathon'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )}