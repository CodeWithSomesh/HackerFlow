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
  Image as ImageIcon, 
  ChevronRight, 
  Sparkles,
  Users,
  Trophy,
  Info,
  CheckCircle,
  Plus,
  X,
  Building,
//   Mail,
//   Phone,
//   DollarSign,
//   Award,
  AlertCircle,
  MessageCircle,
  Heart,
  Upload,
  Edit,
  User,
  Lock,
  PersonStanding
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MinimalTiptap } from '@/components/ui/shadcn-io/minimal-tiptap'
import { MultiSelect } from '@/components/multi-select'
import { triggerFireworks, triggerSideCannons, triggerStars } from '@/lib/confetti'
import { OrganizerVerificationModal } from '@/components/organizer-verification-modal'
import { PaymentModal } from '@/components/payment-modal'


type SectionKey = 'banner' | 'basic' | 'timeline' | 'about' | 'prizes' | 'dates' | 'faq' | 'organizers' | 'sponsors' | 'requirements' | 'eligibility'

export default function OrganizeStep3Page() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<SectionKey>('basic')
  const [hackathonId, setHackathonId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [identityDocumentUrl, setIdentityDocumentUrl] = useState<string>('')
  const [authorizationLetterUrl, setAuthorizationLetterUrl] = useState<string>('')
  const [existingIdentityUrl, setExistingIdentityUrl] = useState<string>('')
  const [existingAuthLetterUrl, setExistingAuthLetterUrl] = useState<string>('')

  // Form state
  const [formData, setFormData] = useState<{
    title: string
    organizer: string
    websiteUrl: string
    visibility: 'public' | 'invite'
    mode: 'online' | 'offline' | 'hybrid'
    location: string
    participationType: 'individual' | 'team'
    teamSizeMin: number
    teamSizeMax: number
    registrationStartDate: string
    registrationEndDate: string
    participants: number
    maxParticipants: number
    totalPrizePool: string
    banner: string
    logo: string
    about: string
    duration: string
    registrationDeadline: string
    eligibility: string[]
    requirements: string[]
    categories: string[]
    prizes: Array<{ position: string; amount: string; description: string; type: string }>
    timeline: Array<{ title: string; startDate: string; endDate: string; description: string }>
    importantDates: Array<{ title: string; date: string; time: string; description: string }>
    faq: Array<{ question: string; answer: string }>
    organizers: Array<{ name: string; role: string; email: string; phone: string; profileUrl: string; photo: string }>
    sponsors: Array<{ name: string; tier: string; website: string; logo: string; description: string }>
  }>({
    title: 'Your Awesome Hackathon',
    organizer: 'Your Organization',
    websiteUrl: '',
    visibility: 'public',
    mode: 'online',
    location: '',
    participationType: 'individual',
    teamSizeMin: 1,
    teamSizeMax: 5,
    registrationStartDate: '',
    registrationEndDate: '',
    participants: 0,
    maxParticipants: 500,
    totalPrizePool: '$5,000',
    banner: '/api/placeholder/1200/400',
    logo: '',
    about: 'Add an engaging description about your hackathon...',
    duration: '48H',
    registrationDeadline: '',
    eligibility: ['Professionals'],
    requirements: ['Valid ID proof', 'Laptop with required software'],
    categories: [],
    prizes: [],
    timeline: [],
    importantDates: [],
    faq: [],
    organizers: [],
    sponsors: []
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [tempFormData, setTempFormData] = useState(formData)

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
      websiteUrl: '',
      visibility: 'public',
      mode: 'online',
      location: '',
      participationType: 'individual',
      teamSizeMin: 1,
      teamSizeMax: 5,
      registrationStartDate: '',
      registrationEndDate: '',
      participants: 0,
      maxParticipants: 500,
      totalPrizePool: '$5,000',
      bannerUrl: '/api/placeholder/1200/400',
      logoUrl: '',
      about: 'Add an engaging description...',
      duration: '48H',
      registrationDeadline: '',
      eligibility: ['Professionals'],
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

        // Load existing documents if they exist - CHECK IF THESE FIELDS EXIST IN YOUR DATABASE
        if (data.identity_document_url) {
          console.log('Loading existing identity doc:', data.identity_document_url)
          setExistingIdentityUrl(data.identity_document_url)
          setIdentityDocumentUrl(data.identity_document_url)
        }
        if (data.authorization_letter_url) {
          console.log('Loading existing auth letter:', data.authorization_letter_url)
          setExistingAuthLetterUrl(data.authorization_letter_url)
          setAuthorizationLetterUrl(data.authorization_letter_url)
        }
      

        const formValues = {
          title: data.title || 'Your Awesome Hackathon',
          organizer: data.organization || 'Your Organization',
          websiteUrl: data.website_url || '',
          visibility: data.visibility || 'public',
          mode: data.mode || 'online',
          location: data.location || '',
          participationType: data.participation_type || 'individual',
          teamSizeMin: data.team_size_min || 1,
          teamSizeMax: data.team_size_max || 5,
          registrationStartDate: data.registration_start_date?.slice(0, 16) || '',
          registrationEndDate: data.registration_end_date?.slice(0, 16) || '',
          participants: data.participants || 0,
          maxParticipants: data.max_registrations || 500,
          totalPrizePool: data.total_prize_pool || '$5,000',
          banner: data.banner_url || '/api/placeholder/1200/400',
          logo: data.logo_url || '',
          about: data.about || 'Add an engaging description...',
          duration: data.duration || '48H',
          registrationDeadline: data.registration_deadline || '',
          eligibility: data.eligibility || ['Professionals'],
          requirements: data.requirements || ['Valid ID proof', 'Laptop with required software'],
          categories: data.categories || [],
          prizes: data.prizes || [],
          timeline: data.timeline || [],
          importantDates: data.important_dates || [],
          faq: data.faq || [],
          organizers: data.organizers || [],
          sponsors: data.sponsors || []
        }
        
        setFormData(formValues)
        setOriginalFormData(formValues)
        reset(formValues)
        
        showCustomToast('info', 'Hackathon data loaded successfully.')
      }
      setIsLoading(false)
    }
    
    loadHackathonData()
  }, [router, reset])

  const openEditor = (key: SectionKey) => {
    setActiveSection(key)
    setTempFormData(formData)
    // Sync all form values when opening editor
    reset(formData)
    setHasUnsavedChanges(false)
    setOpen(true)
  }

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setTempFormData({...tempFormData, requirements: [...tempFormData.requirements, newRequirement]})
      setNewRequirement('')
      setHasUnsavedChanges(true)
    }
  }

  const removeRequirement = (index: number) => {
    const newRequirements = tempFormData.requirements.filter((_, i) => i !== index)
    setTempFormData({
      ...tempFormData, 
      requirements: newRequirements
    })
    setHasUnsavedChanges(true)
  }

  const addTimelineItem = () => {
    if (newTimelineItem.title.trim()) {
      if (editingTimelineIndex !== null) {
        const updatedTimeline = [...tempFormData.timeline]
        updatedTimeline[editingTimelineIndex] = newTimelineItem
        setTempFormData({...tempFormData, timeline: updatedTimeline})
        setEditingTimelineIndex(null)
      } else {
        setTempFormData({...tempFormData, timeline: [...tempFormData.timeline, newTimelineItem]})
      }
      setNewTimelineItem({ title: '', startDate: '', endDate: '', description: '' })
      setHasUnsavedChanges(true)
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
      setTempFormData({...tempFormData, importantDates: [...tempFormData.importantDates, newDateItem]})
      setNewDateItem({ title: '', date: '', time: '', description: '' })
      setHasUnsavedChanges(true)
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
    // Validate: position is required, amount is required only if not Certificate
    const isValid = newPrize.position.trim() &&
      (newPrize.type === 'Certificate' || (newPrize.amount && newPrize.amount.trim()));

    if (isValid) {
      if (editingPrizeIndex !== null) {
        const updatedPrizes = [...tempFormData.prizes]
        updatedPrizes[editingPrizeIndex] = newPrize
        setTempFormData({...tempFormData, prizes: updatedPrizes})
        setEditingPrizeIndex(null)
      } else {
        setTempFormData({...tempFormData, prizes: [...tempFormData.prizes, newPrize]})
      }
      setNewPrize({ position: '', amount: '', description: '', type: 'Cash' })
      setHasUnsavedChanges(true)
    } else {
      showCustomToast('error', 'Please fill in all required fields. Amount is optional for Certificate prizes.')
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
        const updatedFaq = [...tempFormData.faq]
        updatedFaq[editingFaqIndex] = newFaq
        setTempFormData({...tempFormData, faq: updatedFaq})
        setEditingFaqIndex(null)
      } else {
        setTempFormData({...tempFormData, faq: [...tempFormData.faq, newFaq]})
      }
      setNewFaq({ question: '', answer: '' })
      setHasUnsavedChanges(true)
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
        const updatedOrganizers = [...tempFormData.organizers]
        updatedOrganizers[editingOrganizerIndex] = newOrganizer
        setTempFormData({...tempFormData, organizers: updatedOrganizers})
        setEditingOrganizerIndex(null)
      } else {
        setTempFormData({...tempFormData, organizers: [...tempFormData.organizers, newOrganizer]})
      }
      setNewOrganizer({ name: '', role: '', email: '', phone: '', profileUrl: '', photo: '' })
      setHasUnsavedChanges(true)
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
        const updatedSponsors = [...tempFormData.sponsors]
        updatedSponsors[editingSponsorIndex] = newSponsor
        setTempFormData({...tempFormData, sponsors: updatedSponsors})
        setEditingSponsorIndex(null)
      } else {
        setTempFormData({...tempFormData, sponsors: [...tempFormData.sponsors, newSponsor]})
      }
      setNewSponsor({ name: '', tier: 'Sponsor Tier', website: '', logo: '', description: '' })
      setHasUnsavedChanges(true)
    }
  }

  //Check Validations Function
  const validateCurrentSection = (): string | null => {
    switch(activeSection) {
      case 'basic':
        if (!tempFormData.title || tempFormData.title.length < 5) return 'Title must be at least 5 characters'
        if (!tempFormData.organizer || tempFormData.organizer.length < 2) return 'Organization name is required'
        if ((tempFormData.mode === 'offline' || tempFormData.mode === 'hybrid') && !tempFormData.location) return 'Location is required for offline/hybrid events'
        if (tempFormData.participationType === 'team' && (!tempFormData.teamSizeMin || !tempFormData.teamSizeMax)) return 'Team size limits are required'
        if (tempFormData.participationType === 'team' && tempFormData.teamSizeMin > tempFormData.teamSizeMax) return 'Team size minimum cannot exceed maximum'
        if (!tempFormData.registrationStartDate) return 'Registration start date is required'
        if (!tempFormData.registrationEndDate) return 'Registration end date is required'
        break
  
      case 'banner':
        if (!tempFormData.banner || tempFormData.banner === '/api/placeholder/1200/400') return 'Banner image is required'
        if (!tempFormData.logo || tempFormData.logo === '') return 'Logo is required'
        break
  
      case 'about':
        if (!tempFormData.about || tempFormData.about.length < 100) return 'About section must be at least 100 characters'
        if (!tempFormData.categories || tempFormData.categories.length === 0) return 'Please select at least one category'
        break
  
      case 'eligibility':
        if (!tempFormData.eligibility || tempFormData.eligibility.length === 0) return 'Please select at least one eligibility criteria'
        break
  
      case 'timeline':
        if (tempFormData.timeline?.find(item => !item.title || !item.startDate || !item.endDate)) {
          return 'All timeline items must have title, start date, and end date'
        }
        break
  
      case 'prizes':
        if (tempFormData.prizes?.find(prize => !prize.position || !prize.type)) {
          return 'All prizes must have position and type'
        }
        // Check that non-certificate prizes have amounts
        if (tempFormData.prizes?.find(prize => prize.type !== 'Certificate' && !prize.amount)) {
          return 'Cash and Other prizes must have an amount'
        }
        break
  
      case 'dates':
        if (tempFormData.importantDates?.find(date => !date.title || !date.date || !date.time)) {
          return 'All important dates must have title, date, and time'
        }
        break
  
      case 'faq':
        if (tempFormData.faq?.find(faq => !faq.question || !faq.answer)) {
          return 'All FAQ items must have both question and answer'
        }
        break
  
      case 'organizers':
        if (tempFormData.organizers?.find(org => !org.name || !org.role || !org.email)) {
          return 'All organizers must have name, role, and email'
        }
        break
  
      case 'sponsors':
        if (tempFormData.sponsors?.find(sponsor => !sponsor.name || !sponsor.tier)) {
          return 'All sponsors must have name and tier'
        }
        break
    }
    return null
  }

  // Save functionality
  const onSave = async (data: CreateHackathonStep3FormData) => {
    if (!hackathonId) {
      showCustomToast('error', 'Hackathon ID not found. Please start from Step 1.')
      return
    }
  
    setIsSaving(true)
    
    try {
      // Use tempFormData directly since it has all the latest changes
      const saveData: CreateHackathonStep3FormData = {
        title: tempFormData.title,
        organizer: tempFormData.organizer,
        websiteUrl: tempFormData.websiteUrl,
        visibility: tempFormData.visibility,
        mode: tempFormData.mode,
        location: tempFormData.location,
        participationType: tempFormData.participationType,
        teamSizeMin: tempFormData.teamSizeMin,
        teamSizeMax: tempFormData.teamSizeMax,
        registrationStartDate: tempFormData.registrationStartDate,
        registrationEndDate: tempFormData.registrationEndDate,
        participants: tempFormData.participants,
        maxParticipants: tempFormData.maxParticipants,
        totalPrizePool: tempFormData.totalPrizePool,
        bannerUrl: tempFormData.banner,
        logoUrl: tempFormData.logo,
        about: tempFormData.about,
        duration: tempFormData.duration,
        registrationDeadline: tempFormData.registrationDeadline,
        eligibility: tempFormData.eligibility,
        requirements: tempFormData.requirements,
        categories: tempFormData.categories,
        prizes: tempFormData.prizes,
        timeline: tempFormData.timeline,
        importantDates: tempFormData.importantDates,
        faq: tempFormData.faq,
        organizers: tempFormData.organizers,
        sponsors: tempFormData.sponsors
      }
      
      const result = await updateHackathonStep3(hackathonId, saveData)
      
      if (result.success) {
        // Apply temp changes to actual form data
        setFormData(tempFormData)
        setOriginalFormData(tempFormData)
        setHasUnsavedChanges(false)
        
        // Close sheet immediately
        setOpen(false)
        
        // Show success notification after 1 second delay
        setTimeout(() => {
          showCustomToast('success', 'Hackathon details saved successfully!')
        }, 1000)
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
        websiteUrl: formData.websiteUrl,
        visibility: formData.visibility,
        mode: formData.mode,
        location: formData.location,
        participationType: formData.participationType,
        teamSizeMin: formData.teamSizeMin,
        teamSizeMax: formData.teamSizeMax,
        registrationStartDate: formData.registrationStartDate,
        registrationEndDate: formData.registrationEndDate,
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

      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        showCustomToast('error', 'User not authenticated')
        setIsPublishing(false)
        return
      }

      console.log('Publishing with documents:', {
        identity: identityDocumentUrl,
        auth: authorizationLetterUrl
      })
  
      // Prepare data for final save before publishing
      const saveData: CreateHackathonStep3FormData = {
        title: formData.title,
        organizer: formData.organizer,
        websiteUrl: formData.websiteUrl,
        visibility: formData.visibility,
        mode: formData.mode,
        location: formData.location,
        participationType: formData.participationType,
        teamSizeMin: formData.teamSizeMin,
        teamSizeMax: formData.teamSizeMax,
        registrationStartDate: formData.registrationStartDate,
        registrationEndDate: formData.registrationEndDate,
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
      
      // Save all data before publishing
      const saveResult = await updateHackathonStep3(hackathonId, saveData)
      
      if (!saveResult.success) {
        showCustomToast('error', 'Failed to save changes before publishing. Please try again.')
        setIsPublishing(false)
        return
      }
      
      if (!user) {
        showCustomToast('error', 'User not authenticated')
        setIsPublishing(false)
        return
      }
  
      // Update status to waiting for admin approval
      // Set status to 'waiting_for_approval' as per admin approval flow
    const { error: publishError } = await supabase
      .from('hackathons')
      .update({
        status: 'waiting_for_approval',
        published_at: new Date().toISOString(),
        verification_status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', hackathonId)
      .eq('created_by', user.id)

    if (publishError) {
      console.error('Publish error:', publishError)
      showCustomToast('error', 'Failed to submit hackathon for approval.')
    } else {
      showCustomToast('success', 'Hackathon submitted for admin approval! ⏳')
      localStorage.removeItem('current_hackathon_id')
      triggerSideCannons()
      triggerStars()
      triggerFireworks()
      setTimeout(() => router.push('/dashboard/organizer'), 1500)
    }
  } catch (error) {
    console.error('Publish error:', error)
    showCustomToast('error', 'An unexpected error occurred.')
  } finally {
    setIsPublishing(false)
    setShowPublishDialog(false)
  }
  }

  // Helper function to strip HTML tags and decode entities for preview
  const stripHtmlAndDecode = (html: string) => {
    // Create a temporary div to decode HTML entities
    const txt = document.createElement('textarea')
    txt.innerHTML = html
    const decoded = txt.value
    
    // Strip HTML tags
    return decoded.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  }


  const navigationSections = [
    { key: 'banner', label: 'Banners & Logo', icon: ImageIcon, color: 'purple' },
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
              onClick={() => {
                console.log('Publish clicked')
                console.log('existingIdentityUrl:', existingIdentityUrl)
                console.log('existingAuthLetterUrl:', existingAuthLetterUrl)
                console.log('identityDocumentUrl:', identityDocumentUrl)
                console.log('authorizationLetterUrl:', authorizationLetterUrl)

                // Just run validation and show dialog if passes
                if (!hackathonId) {
                  showCustomToast('error', 'Hackathon ID not found. Please start from Step 1.')
                  return
                }

                const validationErrors: string[] = []

                // All validation checks
                if (!formData.title || formData.title.length < 5) {
                  validationErrors.push('Valid hackathon title is required (min 5 characters)')
                }
                if (!formData.organizer || formData.organizer.length < 2) {
                  validationErrors.push('Organization name is required (min 2 characters)')
                }
                if (!formData.about || formData.about.length < 100) {
                  validationErrors.push('About section must be at least 100 characters')
                }
                if (!formData.categories || formData.categories.length === 0) {
                  validationErrors.push('At least one category is required')
                }
                if (!formData.eligibility || formData.eligibility.length === 0) {
                  validationErrors.push('At least one eligibility criteria is required')
                }
                if (!formData.banner || formData.banner === '/api/placeholder/1200/400' || formData.banner === '') {
                  validationErrors.push('Banner image is required')
                }
                if (!formData.logo || formData.logo === '') {
                  validationErrors.push('Logo is required')
                }
                if (!formData.registrationStartDate) {
                  validationErrors.push('Registration start date is required')
                }
                if (!formData.registrationEndDate) {
                  validationErrors.push('Registration end date is required')
                }
                if (!formData.duration || formData.duration === '') {
                  validationErrors.push('Hackathon duration is required')
                }
                if (!formData.totalPrizePool || formData.totalPrizePool === '') {
                  validationErrors.push('Total prize pool is required')
                }
                if (!formData.maxParticipants || formData.maxParticipants < 1) {
                  validationErrors.push('Max participants must be at least 1')
                }
                if ((formData.mode === 'offline' || formData.mode === 'hybrid') && !formData.location) {
                  validationErrors.push('Location is required for offline/hybrid events')
                }
                if (formData.participationType === 'team') {
                  if (!formData.teamSizeMin || !formData.teamSizeMax) {
                    validationErrors.push('Team size limits are required for team participation')
                  }
                  if (formData.teamSizeMin > formData.teamSizeMax) {
                    validationErrors.push('Team size minimum cannot exceed maximum')
                  }
                }
                if (formData.websiteUrl && formData.websiteUrl !== '') {
                  try {
                    new URL(formData.websiteUrl)
                  } catch {
                    validationErrors.push('Website URL must be a valid URL')
                  }
                }
                if (formData.registrationStartDate && formData.registrationEndDate) {
                  const startDate = new Date(formData.registrationStartDate)
                  const endDate = new Date(formData.registrationEndDate)
                  if (startDate >= endDate) {
                    validationErrors.push('Registration end date must be after start date')
                  }
                }

                // Show errors if any
                if (validationErrors.length > 0) {
                  showCustomToast('error', `Please complete: ${validationErrors.slice(0, 3).join(', ')}${validationErrors.length > 3 ? ` and ${validationErrors.length - 3} more` : ''}`)
                  return
                }

                // Check if documents already exist
                if (existingIdentityUrl && existingAuthLetterUrl) {
                  // Documents already uploaded, skip to payment
                  setIdentityDocumentUrl(existingIdentityUrl)
                  setAuthorizationLetterUrl(existingAuthLetterUrl)
                  setShowPaymentModal(true)
                } else {
                  // Need to upload documents
                  setShowVerificationModal(true)
                }
              }}
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
                {navigationSections.map(({ key, label, 
                // icon: Icon, 
                color }) => (
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
                      <ImageIcon className={`w-5 h-5 ${activeSection === key ? '' : 'text-gray-400 group-hover:text-gray-300'}`} />
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
                <div className="relative h-[300px] border-b-2 border-gray-700 overflow-hidden group">
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
              
              <div className="px-5 pt-5">
                {/* Header with Logo */}
                <div className="grid grid-cols-[100px_1fr] gap-6 items-start mb-4">
                  <div 
                    onClick={() => openEditor('banner')}
                    className="rounded-xl overflow-hidden h-[105px] w-[105px] bg-gray-800 border-2 border-gray-700 flex items-center justify-center cursor-pointer hover:border-teal-400 transition-all group"
                  >
                    {formData.logo && formData.logo !== '' ? (
                      <img 
                        src={formData.logo} 
                        alt="Logo" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <img className="w-8 h-8 text-gray-500 group-hover:text-teal-400 transition-colors" />
                    )}
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-5xl font-black font-blackops text-white leading-tight">{formData.title}</h2>
                    <div className="flex flex-wrap gap-4 text-sm font-mono text-gray-300">
                      <span className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 rounded-lg">
                        <Globe className="w-4 h-4 text-blue-400" /> {formData.mode.charAt(0).toUpperCase() + formData.mode.slice(1)}
                      </span>
                      {formData.location && formData.mode !== "online" && (
                        <span className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 rounded-lg">
                        <MapPin className="w-4 h-4 text-purple-400" /> {formData.location}
                        </span>
                      )}
                      
                      <span className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 px-3 py-1.5 rounded-lg">
                        <Users className="w-4 h-4 text-teal-400" /> {formData.participants} participants
                      </span>
                    </div>
                  </div>
                </div>

                {/* Organizer Info */}
                <div className="mb-4 p-4 bg-gray-800/30 border border-gray-700 rounded-xl">
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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur border-2 border-blue-500/30 rounded-2xl p-5 text-center hover:scale-105 transition-all shadow-lg hover:shadow-blue-500/20">
                    <PersonStanding className="w-7 h-7 text-blue-400 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-white font-mono">{Math.ceil(formData.participants)}</div>
                    <div className="text-sm text-gray-300 font-mono mt-1 font-medium">Participants</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur border-2 border-green-500/30 rounded-2xl p-5 text-center hover:scale-105 transition-all shadow-lg hover:shadow-green-500/20">
                    <Users className="w-7 h-7 text-green-400 mx-auto mb-3" />
                    {/* Need to change to registered teams  */}
                    <div className="text-3xl font-bold text-white font-mono">{formData.participants}</div>
                    <div className="text-sm text-gray-300 font-mono mt-1 font-medium">Teams</div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 backdrop-blur border-2 border-yellow-500/30 rounded-2xl p-5 text-center hover:scale-105 transition-all shadow-lg hover:shadow-yellow-500/20">
                    <Calendar className="w-7 h-7 text-yellow-400 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-white font-mono">
                      {formData.registrationEndDate
                      ? new Date(formData.registrationEndDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                        })
                      : "N/A"}
                    </div>
                    <div className="text-sm text-gray-300 font-mono mt-1 font-medium">Deadline</div>
                  </div>
                  <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 backdrop-blur border-2 border-pink-500/30 rounded-2xl p-5 text-center hover:scale-105 transition-all shadow-lg hover:shadow-pink-500/20">
                    <Trophy className="w-7 h-7 text-pink-400 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-white font-mono">{formData.totalPrizePool}</div>
                    <div className="text-sm text-gray-300 font-mono mt-1 font-medium">Prize Pool</div>
                  </div>
                </div>

                {/* Eligibility Preview */}
                <div className="mb-4 p-6 rounded-xl border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-orange-600/10 hover:scale-[1.01] transition-all cursor-pointer" onClick={() => openEditor('eligibility')}>
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
                  <div className="mb-4 p-6 rounded-xl border-2 border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-600/10 hover:scale-[1.01] transition-all cursor-pointer" onClick={() => openEditor('requirements')}>
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

                {/* About Section Preview */}
                <div className="mb-4 p-6 rounded-xl border-2 border-gray-700 bg-gray-900/60 hover:border-gray-600 transition-all cursor-pointer" onClick={() => openEditor('about')}>
                  <div className="flex items-center gap-3 mb-4">
                    <Info className="w-7 h-7 text-indigo-400" />
                    <h3 className="font-blackops text-2xl text-white">About This Hackathon</h3>
                  </div>
                  <div 
                    className="text-gray-300 font-geist leading-relaxed prose prose-invert max-w-none
                    [&_p]:mb-3 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-3 
                    [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-3
                    [&_li]:mb-1 [&_strong]:text-white [&_strong]:font-semibold
                    [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:text-white
                    [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:text-white
                    [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:text-white"
                    dangerouslySetInnerHTML={{ __html: formData.about }}
                  />
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
                  <div className="mb-4 p-6 rounded-xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-600/10">
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="w-7 h-7 text-purple-400" />
                      <h3 className="font-blackops text-2xl text-white">Categories</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.categories.map((category, index) => (
                        <span key={index} className="px-4 py-2 bg-purple-500/20 border border-purple-500/40 rounded-lg text-purple-300 font-mono text-sm">
                          {category.toLocaleUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline Preview */}
                {formData.timeline.length > 0 && (
                  <div className="mb-4 p-6 rounded-xl border-2 border-teal-500/30 bg-gradient-to-br from-teal-500/10 to-teal-600/10 hover:scale-[1.01] transition-all cursor-pointer" onClick={() => openEditor('timeline')}>
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
                  <div className="mb-4 p-6 rounded-xl border-2 border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-600/10 hover:scale-[1.01] transition-all cursor-pointer" onClick={() => openEditor('dates')}>
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
                  <div className="mb-4 p-6 rounded-xl border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 hover:scale-[1.01] transition-all cursor-pointer" onClick={() => openEditor('prizes')}>
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
                  <div className="mb-4 p-6 rounded-xl border-2 border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-pink-600/10 hover:scale-[1.01] transition-all cursor-pointer" onClick={() => openEditor('faq')}>
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
                <div className="mb-4 p-6 rounded-xl border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 hover:scale-[1.01] transition-all cursor-pointer" onClick={() => openEditor('organizers')}>
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
                  <div className="mb-4 p-6 rounded-xl border-2 border-lime-500/30 bg-gradient-to-br from-lime-500/10 to-lime-600/10 hover:scale-[1.01] transition-all cursor-pointer" onClick={() => openEditor('sponsors')}>
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
              </div>
            </div>
          </main>
        </div>

        {/* Editor Sheet */}
        <Sheet open={open} 
          onOpenChange={(isOpen) => {
            if (!isOpen && hasUnsavedChanges) {
              // Reset to original data if closing without saving
              setFormData(originalFormData)
              setTempFormData(originalFormData)
              reset(originalFormData)
              setHasUnsavedChanges(false)
            }
            setOpen(isOpen)
          }}>
          <SheetContent side="right" className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 overflow-y-auto p-0">
            <SheetHeader className="border-b border-gray-700 px-6 py-5 bg-gray-900/50 sticky top-0 z-10">
              <SheetTitle className="font-blackops text-2xl text-white flex items-center gap-3">
                {navigationSections.find(s => s.key === activeSection)?.icon && (
                  <div className={`p-2.5 rounded-lg ${getColorClasses(navigationSections.find(s => s.key === activeSection)?.color || 'blue')}`}>
                    {(() => {
                      const Icon = navigationSections.find(s => s.key === activeSection)?.icon
                      return Icon ? <ImageIcon className="w-5 h-5" /> : null
                    })()}
                  </div>
                )}
                {navigationSections.find(s => s.key === activeSection)?.label}
              </SheetTitle>
            </SheetHeader>

            <div className="px-5 py-5 space-y-6"> 
              {/* Basic Details */}
              {activeSection === 'basic' && (
                <div className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label className="text-gray-200 font-mono text-sm flex items-center gap-2">
                      Hackathon Title <span className="text-red-400 text-xs">*</span>
                    </Label>
                    <Input 
                      className="bg-black border-gray-700 text-gray-100 focus:border-teal-400 transition-colors h-11 font-mono" 
                      placeholder="e.g., AI Innovation Hackathon 2025" 
                      value={tempFormData.title}
                      onChange={(e) => {
                        setTempFormData({...tempFormData, title: e.target.value})
                        
                        setHasUnsavedChanges(true)
                      }}
                    />
                  </div>
                  
                  {/* Organizer */}
                  <div className="space-y-2">
                    <Label className="text-gray-200 font-mono text-sm flex items-center gap-2">
                      Organization Name <span className="text-red-400 text-xs">*</span>
                    </Label>
                    <Input 
                      className="bg-black border-gray-700 text-gray-100 focus:border-teal-400 transition-colors h-11 font-mono" 
                      placeholder="Your organization name" 
                      value={tempFormData.organizer}
                      onChange={(e) => {
                        setTempFormData({...tempFormData, organizer: e.target.value})
                        setHasUnsavedChanges(true)
                      }}
                    />
                  </div>

                  {/* Website URL */}
                  <div className="space-y-2">
                    <Label className="text-gray-200 font-mono text-sm">Website URL</Label>
                    <Input 
                      className="bg-black border-gray-700 text-gray-100 focus:border-teal-400 transition-colors h-11 font-mono" 
                      placeholder="https://your-website.com" 
                      value={tempFormData.websiteUrl}
                      onChange={(e) => {
                        setTempFormData({...tempFormData, websiteUrl: e.target.value})
                        setHasUnsavedChanges(true)
                      }}
                    />
                  </div>

                  {/* Visibility */}
                  <div className="space-y-2">
                    <Label className="text-gray-200 font-mono text-sm">Visibility</Label>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setTempFormData({...tempFormData, visibility: 'public'})
                          setHasUnsavedChanges(true)
                        }}
                        className={`flex items-start gap-3 p-4 rounded-md border transition-colors ${
                          tempFormData.visibility === 'public'
                            ? 'border-teal-400 bg-teal-500/10'
                            : 'border-gray-700 bg-gray-900/40 hover:bg-gray-800/40'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-md bg-teal-500/20 text-teal-400 flex items-center justify-center">
                          <Globe className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <div className="font-mono text-white text-sm">Open publicly</div>
                          <div className="text-xs text-gray-400">Visible to all users</div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTempFormData({...tempFormData, visibility: 'invite'})
                          setHasUnsavedChanges(true)
                        }}
                        className={`flex items-start gap-3 p-4 rounded-md border transition-colors ${
                          tempFormData.visibility === 'invite'
                            ? 'border-teal-400 bg-teal-500/10'
                            : 'border-gray-700 bg-gray-900/40 hover:bg-gray-800/40'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center">
                          <Lock className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <div className="font-mono text-white text-sm">Invite Only</div>
                          <div className="text-xs text-gray-400">Accessible via link</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Mode of Event */}
                  <div className="space-y-2">
                    <Label className="text-gray-200 font-mono text-sm">Mode of Event</Label>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setTempFormData({...tempFormData, mode: 'online'})
                          setHasUnsavedChanges(true)
                        }}
                        className={`flex items-center gap-3 p-4 rounded-md border transition-colors ${
                          tempFormData.mode === 'online' 
                            ? 'border-teal-400 bg-teal-500/10' 
                            : 'border-gray-700 bg-gray-900/40 hover:bg-gray-800/40'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-md bg-teal-500/20 text-teal-400 flex items-center justify-center">
                          <Globe className="w-5 h-5" />
                        </div>
                        <span className="font-mono text-white text-sm">Online</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTempFormData({...tempFormData, mode: 'offline'})
                          setHasUnsavedChanges(true)
                        }}
                        className={`flex items-center gap-3 p-4 rounded-md border transition-colors ${
                          tempFormData.mode === 'offline' 
                            ? 'border-teal-400 bg-teal-500/10' 
                            : 'border-gray-700 bg-gray-900/40 hover:bg-gray-800/40'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center">
                          <Building className="w-5 h-5" />
                        </div>
                        <span className="font-mono text-white text-sm">Offline</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTempFormData({...tempFormData, mode: 'hybrid'})
                          setHasUnsavedChanges(true)
                        }}
                        className={`flex items-center gap-3 p-4 rounded-md border transition-colors ${
                          tempFormData.mode === 'hybrid' 
                            ? 'border-teal-400 bg-teal-500/10' 
                            : 'border-gray-700 bg-gray-900/40 hover:bg-gray-800/40'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-md bg-purple-500/20 text-purple-400 flex items-center justify-center">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <span className="font-mono text-white text-sm">Hybrid</span>
                      </button>
                    </div>
                  </div>

                  {/* Location - shown for offline and hybrid */}
                  {(tempFormData.mode === 'offline' || tempFormData.mode === 'hybrid') && (
                    <div className="space-y-2">
                      <Label className="text-gray-200 font-mono text-sm flex items-center gap-2">
                        Event Location <span className="text-red-400 text-xs">*</span>
                      </Label>
                      <Input 
                        className="bg-black border-gray-700 text-gray-100 focus:border-teal-400 transition-colors h-11 font-mono" 
                        placeholder="City, Country or Venue Address"
                        value={tempFormData.location}
                        onChange={(e) => {
                          setTempFormData({...tempFormData, location: e.target.value})
                          setHasUnsavedChanges(true)
                        }}
                      />
                    </div>
                  )}

                  {/* Participation Type */}
                  <div className="space-y-2">
                    <Label className="text-gray-200 font-mono text-sm">Participation Type</Label>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <button 
                        type="button"
                        onClick={() => {
                          setTempFormData({...tempFormData, participationType: 'individual'})
                          setHasUnsavedChanges(true)
                        }}
                        className={`flex items-start gap-3 p-4 rounded-md border transition-colors ${
                          tempFormData.participationType === 'individual'
                            ? 'border-teal-400 bg-teal-500/10'
                            : 'border-gray-700 bg-gray-900/40 hover:bg-gray-800/40'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-md bg-teal-500/20 text-teal-400 flex items-center justify-center">
                          <User className="w-5 h-5"/>
                        </div>
                        <div className='text-left'>
                          <div className="text-white font-mono text-sm">Individual</div>
                          <div className="text-xs text-gray-400">Solo participation</div>
                        </div>
                      </button>

                      <button 
                        type="button"
                        onClick={() => {
                          setTempFormData({...tempFormData, participationType: 'team'})
                          setHasUnsavedChanges(true)
                        }}
                        className={`flex items-start gap-3 p-4 rounded-md border transition-colors ${
                          tempFormData.participationType === 'team'
                            ? 'border-cyan-400 bg-cyan-500/10'
                            : 'border-gray-700 bg-gray-900/40 hover:bg-gray-800/40'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                          <Users className="w-5 h-5"/>
                        </div>
                        <div className='text-left'>
                          <div className="text-white font-mono text-sm">Team Participation</div>
                          <div className="text-xs text-gray-400">Enable teams</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Team Size - shown only for team participation */}
                  {tempFormData.participationType === 'team' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-200 font-mono text-sm">Team Size (Min)</Label>
                        <Input 
                          type="number" 
                          min={1}
                          className="bg-black border-gray-700 text-gray-100 focus:border-teal-400 transition-colors h-11 font-mono" 
                          placeholder="2"
                          value={tempFormData.teamSizeMin}
                          onChange={(e) => {
                            setTempFormData({...tempFormData, teamSizeMin: parseInt(e.target.value) || 1})
                            setHasUnsavedChanges(true)
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-200 font-mono text-sm">Team Size (Max)</Label>
                        <Input 
                          type="number" 
                          min={1}
                          className="bg-black border-gray-700 text-gray-100 focus:border-teal-400 transition-colors h-11 font-mono" 
                          placeholder="5"
                          value={tempFormData.teamSizeMax}
                          onChange={(e) => {
                            setTempFormData({...tempFormData, teamSizeMax: parseInt(e.target.value) || 5})
                            setHasUnsavedChanges(true)
                          }}
                        />
                      </div>
                    </div>
                  )}

                  

                  {/* Participant Limits */}
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-200 font-mono text-sm">Max Participants</Label>
                      <Input 
                        type="number" 
                        min={1}
                        className="bg-black border-gray-700 text-gray-100 focus:border-teal-400 transition-colors h-11 font-mono" 
                        placeholder="500"
                        value={tempFormData.maxParticipants}
                        onChange={(e) => {
                          setTempFormData({...tempFormData, maxParticipants: parseInt(e.target.value) || 0})
                          setHasUnsavedChanges(true)
                        }}
                      />
                    </div>
                  </div>

                  {/* Registration Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-200 font-mono text-sm">Registration Start</Label>
                      <Input 
                        type="datetime-local"
                        className="bg-black border-gray-700 text-gray-100 focus:border-teal-400 transition-colors h-11 font-mono" 
                        value={tempFormData.registrationStartDate}
                        onChange={(e) => {
                          setTempFormData({...tempFormData, registrationStartDate: e.target.value})
                          setHasUnsavedChanges(true)
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-200 font-mono text-sm">Registration End</Label>
                      <Input 
                        type="datetime-local"
                        className="bg-black border-gray-700 text-gray-100 focus:border-teal-400 transition-colors h-11 font-mono" 
                        value={tempFormData.registrationEndDate}
                        onChange={(e) => {
                          setTempFormData({...tempFormData, registrationEndDate: e.target.value})
                          setHasUnsavedChanges(true)
                        }}
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
                    {tempFormData.banner && tempFormData.banner !== '/api/placeholder/1200/400' ? (
                      <div className="relative border-2 border-gray-700 rounded-lg overflow-hidden">
                        <img 
                          src={tempFormData.banner} 
                          alt="Banner preview" 
                          className="w-full h-48 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setTempFormData({...tempFormData, banner: '/api/placeholder/1200/400'})
                            setHasUnsavedChanges(true)
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
                            setTempFormData({...tempFormData, banner: res.url})
                            setHasUnsavedChanges(true)
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
                      value={tempFormData.banner === '/api/placeholder/1200/400' ? '' : tempFormData.banner}
                      onChange={(e) => {
                        setTempFormData({...tempFormData, banner: e.target.value})
                        setHasUnsavedChanges(true)
                        setValue('bannerUrl', e.target.value)
                      }}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-gray-200 font-mono text-sm">Hackathon Logo</Label>
                    {tempFormData.logo && tempFormData.logo !== '' ? (
                      <div className="relative border-2 border-gray-700 rounded-lg overflow-hidden w-48 h-48 mx-auto">
                        <img 
                          src={tempFormData.logo} 
                          alt="Logo preview" 
                          className="w-full h-full object-contain p-4 bg-gray-900"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setTempFormData({...tempFormData, logo: ''})
                            setHasUnsavedChanges(true)
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
                            setTempFormData({...tempFormData, logo: res.url})
                            setHasUnsavedChanges(true)
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
                      value={tempFormData.logo}
                      onChange={(e) => {
                        setTempFormData({...tempFormData, logo: e.target.value})
                        setHasUnsavedChanges(true)
                        setValue('logoUrl', e.target.value)
                      }}
                    />
                  </div>
                </div>
              )}

              {/* About Section */}
              {/* {activeSection === 'about' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-gray-200 font-mono text-sm">About Your Hackathon</Label>
                    <p className="text-xs text-gray-400 font-mono">Describe your hackathon in detail. Include the theme, goals, what participants will build, and what makes your event unique.</p>
                    <Textarea 
                      rows={14} 
                      className="bg-black/60 border-gray-700 text-gray-100 focus:border-blue-500 transition-colors font-mono text-sm" 
                      placeholder="Describe your hackathon in detail. Include the theme, goals, what participants will build, and what makes your event unique..."
                      value={tempFormData.about}
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
              )} */}

              {/* About Section */}
              {activeSection === 'about' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-gray-200 font-mono text-sm flex items-center gap-2">
                      Categories <span className="text-red-400 text-xs">*</span>
                    </Label>
                    <p className="text-xs text-gray-400 font-mono mb-2">
                      Select relevant categories that best describe your hackathon's focus areas.
                    </p>
                    
                    <MultiSelect
                      options={[
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
                      ]}
                      defaultValue={tempFormData.categories}
                      onValueChange={(values) => {
                        setTempFormData({...tempFormData, categories: values})
                        setHasUnsavedChanges(true)
                        setValue('categories', values)
                      }}
                      placeholder="Select categories..."            
                      className="bg-black border-gray-700"
                      popoverClassName="bg-[#020817] border-gray-700 z-[100] [&_[cmdk-item][data-selected=true]]:!bg-gray-800 [&_[cmdk-item][data-selected=true]]:!text-gray-100 [&_[cmdk-separator]]:!border-t [&_[cmdk-separator]]:!border-gray-700"
                    />


                    <Label className="text-gray-200 font-mono text-sm flex items-center gap-2">
                      About Your Hackathon <span className="text-red-400 text-xs">*</span>
                    </Label>
                    <p className="text-xs text-gray-400 font-mono mb-2">
                      Share rules, eligibility, process, format, etc. Use rich text formatting to make it clear and engaging. Minimum 100 characters required.
                    </p>
                    
                    <MinimalTiptap
                      content={tempFormData.about}
                      onChange={(value) => {
                        setTempFormData({...tempFormData, about: value})
                        setHasUnsavedChanges(true)
                        setValue('about', value)
                      }}
                      placeholder="Start typing your opportunity details here... Use headings, lists, and formatting to make it clear and engaging."
                      className="w-full"
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
                        { label: 'Everyone', icon: '👥', selected: tempFormData.eligibility.includes('Everyone') },
                        { label: 'Uni/College Students', icon: '🎓', selected: tempFormData.eligibility.includes('Uni/College Students') },
                        { label: 'Professionals', icon: '💼', selected: tempFormData.eligibility.includes('Professionals') },
                        { label: 'High School Students', icon: '📚', selected: tempFormData.eligibility.includes('High School Students') },
                        { label: 'Freshers', icon: '🔍', selected: tempFormData.eligibility.includes('Freshers') },
                        { label: 'Others', icon: '⋯', selected: tempFormData.eligibility.includes('Others') }
                      ].map(({ label, icon, selected }) => (
                        <div
                          key={label}
                          onClick={() => {
                            if (label === 'Everyone') {
                              // If clicking Everyone, either select only Everyone or deselect all
                              if (selected) {
                                setTempFormData({...tempFormData, eligibility: []})
                              } else {
                                setTempFormData({...tempFormData, eligibility: ['Everyone']})
                              }
                            } else {
                              // If clicking any other option, remove Everyone and toggle this option
                              let newEligibility = tempFormData.eligibility.filter(el => el !== 'Everyone')
                              if (selected) {
                                newEligibility = newEligibility.filter(el => el !== label)
                              } else {
                                newEligibility = [...newEligibility, label]
                              }
                              setTempFormData({...tempFormData, eligibility: newEligibility})
                            }
                            setHasUnsavedChanges(true)
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
                      {tempFormData.requirements.map((req, index) => (
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
                      value={tempFormData.totalPrizePool}
                      onChange={(e) => {
                        setTempFormData({...tempFormData, totalPrizePool: e.target.value})
                        setHasUnsavedChanges(true)
                      }}
                      
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-gray-200 font-mono text-sm">Prize Distribution</Label>
                    <p className="text-xs text-gray-400 font-mono">Add prizes and rewards for winners</p>
                    
                    {/* Existing Prizes */}
                    {tempFormData.prizes.length > 0 && (
                      <div className="space-y-3">
                        {tempFormData.prizes.map((prize, index) => (
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
                                  onClick={() => {
                                    setTempFormData({...tempFormData, prizes: tempFormData.prizes.filter((_, i) => i !== index)})
                                    setHasUnsavedChanges(true)
                                  }}
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
                      <Select
                        value={newPrize.type}
                        onValueChange={(value) => {
                          setNewPrize({...newPrize, type: value, amount: value === 'Certificate' ? '' : newPrize.amount})
                        }}
                      >
                        <SelectTrigger className="bg-gray-900/60 font-mono border-gray-600 text-gray-200 h-11 text-md">
                          <SelectValue placeholder="Select prize type" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-700 font-mono z-[100]">
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Certificate">Certificate</SelectItem>
                          <SelectItem value="Others">Others</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Prize Position (e.g., 1st Place)"
                        className="bg-gray-900/60 border-gray-600 text-gray-100 h-11 font-mono"
                        value={newPrize.position}
                        onChange={(e) => setNewPrize({...newPrize, position: e.target.value})}
                      />
                      {newPrize.type !== 'Certificate' && (
                        <Input
                          placeholder="Amount (e.g., $2,000)"
                          className="bg-gray-900/60 border-gray-600 text-gray-100 h-11 font-mono"
                          value={newPrize.amount}
                          onChange={(e) => setNewPrize({...newPrize, amount: e.target.value})}
                        />
                      )}
                      <Textarea
                        rows={3}
                        placeholder="Prize description and details"
                        className="bg-gray-900/60 border-gray-600 text-gray-100 font-mono"
                        value={newPrize.description}
                        onChange={(e) => setNewPrize({...newPrize, description: e.target.value})}
                      />
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
                    {tempFormData.timeline.length > 0 && (
                      <div className="space-y-3">
                        {tempFormData.timeline.map((item, index) => (
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
                                  onClick={() => {
                                    setTempFormData({...tempFormData, timeline: tempFormData.timeline.filter((_, i) => i !== index)})
                                    setHasUnsavedChanges(true)
                                  }}
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
                      <div className="grid sm:grid-cols-2 gap-3">
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
                    {tempFormData.importantDates.length > 0 && (
                      <div className="space-y-3">
                        {tempFormData.importantDates.map((item, index) => (
                          <div key={index} className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-white font-mono text-sm font-semibold">{item.title}</h4>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-6 w-6 p-0"
                                onClick={() => {
                                  setTempFormData({...tempFormData, importantDates: tempFormData.importantDates.filter((_, i) => i !== index)})
                                  setHasUnsavedChanges(true)
                              }}
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
                    {tempFormData.faq.length > 0 && (
                      <div className="space-y-3">
                        {tempFormData.faq.map((faq, index) => (
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
                                  onClick={() => {
                                    setTempFormData({...tempFormData, faq: tempFormData.faq.filter((_, i) => i !== index)})
                                    setHasUnsavedChanges(true)
                                  
                                  }}
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
                    {tempFormData.organizers.length > 0 && (
                      <div className="space-y-3">
                        {tempFormData.organizers.map((organizer, index) => (
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
                                  onClick={() => {
                                    setTempFormData({...tempFormData, organizers: tempFormData.organizers.filter((_, i) => i !== index)})
                                    setHasUnsavedChanges(true)
                                  }}
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
                    {tempFormData.sponsors.length > 0 && (
                      <div className="space-y-3">
                        {tempFormData.sponsors.map((sponsor, index) => (
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
                                  onClick={() => {
                                    setTempFormData({...tempFormData, sponsors: tempFormData.sponsors.filter((_, i) => i !== index)})
                                    setHasUnsavedChanges(true)
                                  }}
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
                        onChange={(e) => setNewSponsor({...newSponsor, tier: e.target.value})}
                      />
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
                  setTempFormData(originalFormData)
                  setHasUnsavedChanges(false)
                  setOpen(false)
                }}
              >
                Cancel
              </Button>
              {/* Use this Button to bypass the validations */}
              {/* <Button 
                className="flex-1 bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 text-white h-11 font-bold font-mono hover:from-purple-600 hover:via-blue-600 hover:to-teal-600 shadow-lg disabled:opacity-50" 
                disabled={isSaving}
                onClick={() => onSave({} as CreateHackathonStep3FormData)}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button> */}
              <Button 
                className="flex-1 bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 text-white h-11 font-bold font-mono hover:from-purple-600 hover:via-blue-600 hover:to-teal-600 shadow-lg disabled:opacity-50" 
                disabled={isSaving}
                onClick={async () => {
                  const validationError = validateCurrentSection()
                  if (validationError) {
                    showCustomToast('error', validationError)
                    return
                  }
                  
                  const saveData: CreateHackathonStep3FormData = {
                    title: tempFormData.title,
                    organizer: tempFormData.organizer,
                    websiteUrl: tempFormData.websiteUrl,
                    visibility: tempFormData.visibility,
                    mode: tempFormData.mode,
                    location: tempFormData.location,
                    participationType: tempFormData.participationType,
                    teamSizeMin: tempFormData.teamSizeMin,
                    teamSizeMax: tempFormData.teamSizeMax,
                    registrationStartDate: tempFormData.registrationStartDate,
                    registrationEndDate: tempFormData.registrationEndDate,
                    participants: tempFormData.participants,
                    maxParticipants: tempFormData.maxParticipants,
                    totalPrizePool: tempFormData.totalPrizePool,
                    bannerUrl: tempFormData.banner,
                    logoUrl: tempFormData.logo,
                    about: tempFormData.about,
                    duration: tempFormData.duration,
                    registrationDeadline: tempFormData.registrationDeadline,
                    eligibility: tempFormData.eligibility,
                    requirements: tempFormData.requirements,
                    categories: tempFormData.categories,
                    prizes: tempFormData.prizes,
                    timeline: tempFormData.timeline,
                    importantDates: tempFormData.importantDates,
                    faq: tempFormData.faq,
                    organizers: tempFormData.organizers,
                    sponsors: tempFormData.sponsors
                  }

                  await onSave(saveData)
                }}
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
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                Submit for Admin Approval?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300 font-mono text-sm space-y-3 pt-4">
                <div className="leading-relaxed">
                  Please confirm that all hackathon details are correct and complete before submitting for admin review.
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-2">
                  <div className="text-blue-300 font-semibold flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Admin Approval Required
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Your hackathon will be reviewed by our admin team. Once approved, it will be published on the platform. This process typically takes 24-48 hours.
                  </p>
                </div>
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
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel 
                className="bg-gray-800 py-6 hover:bg-black border-gray-600 text-white font-mono"
                disabled={isPublishing}
              >
                Review Again
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handlePublish}  // ✅ Simply call handlePublish
                disabled={isPublishing}
                className="bg-gradient-to-r py-6 from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white font-mono font-bold disabled:opacity-50"
              >
                {isPublishing ? 'Submitting for Approval...' : 'Submit for Admin Approval'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Organizer Verification Modal */}
        <OrganizerVerificationModal
          open={showVerificationModal}
          onOpenChange={(isOpen) => {
            setShowVerificationModal(isOpen)
            if (!isOpen && !identityDocumentUrl && !authorizationLetterUrl) {
              setIdentityDocumentUrl(existingIdentityUrl)
              setAuthorizationLetterUrl(existingAuthLetterUrl)
            }
          }}
          onVerificationComplete={(identityUrl, authUrl) => {
            setIdentityDocumentUrl(identityUrl)
            setAuthorizationLetterUrl(authUrl)
            setExistingIdentityUrl(identityUrl)
            setExistingAuthLetterUrl(authUrl)
            setShowPaymentModal(true)
          }}
          existingIdentityUrl={existingIdentityUrl}
          existingAuthLetterUrl={existingAuthLetterUrl}
          hackathonId={hackathonId || undefined}  // Add this
        />

        {/* Payment Modal */}
        <PaymentModal
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          onPaymentComplete={() => {
            setShowPublishDialog(true)
          }}
          amount={50}
          hackathonTitle={formData.title}
        />
      </div>
    </div>
  )}