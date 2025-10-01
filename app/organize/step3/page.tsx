'use client'

import { useState } from 'react'
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
  Heart
} from 'lucide-react'
import Image from "next/image";

type SectionKey = 'banner' | 'basic' | 'timeline' | 'about' | 'prizes' | 'dates' | 'faq' | 'organizers' | 'sponsors' | 'requirements' | 'eligibility'

export default function OrganizeStep3Page() {
  const [open, setOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<SectionKey>('basic')

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
    prizes: [],
    timeline: [],
    importantDates: [],
    faq: [],
    organizers: [],
    sponsors: []
  })

  const [newRequirement, setNewRequirement] = useState('')

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
            >
              Save Draft
            </Button>
            <Button className="bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 hover:from-purple-600 hover:via-blue-600 hover:to-teal-600 text-white px-8 py-6 font-mono font-bold transition-all hover:scale-105 shadow-lg hover:shadow-xl">
              Publish
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[26%_74%] gap-6">
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
              {formData.banner && (
                <div className="relative h-[280px] border-b-2 border-gray-700 overflow-hidden group">
                  <Image 
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
              
              <div className="p-8">
                {/* Header with Logo */}
                <div className="grid grid-cols-[100px_1fr] gap-6 items-start mb-8">
                  <div 
                    onClick={() => openEditor('banner')}
                    className="rounded-xl overflow-hidden h-[100px] w-[100px] bg-gray-800 border-2 border-gray-700 flex items-center justify-center cursor-pointer hover:border-teal-400 transition-all group"
                  >
                    <ImageIcon className="w-8 h-8 text-gray-500 group-hover:text-teal-400 transition-colors" />
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
              </div>
            </div>
          </main>
        </div>

        {/* Editor Sheet */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="right" className="bg-gray-900 border-gray-800 w-[90vw] sm:w-[540px] overflow-y-auto">
            <SheetHeader className="border-b border-gray-800 pb-4">
              <SheetTitle className="font-blackops text-2xl text-white flex items-center gap-3">
                {navigationSections.find(s => s.key === activeSection)?.icon && (
                  <div className={`p-2 rounded-lg ${getColorClasses(navigationSections.find(s => s.key === activeSection)?.color || 'blue')}`}>
                    {(() => {
                      const Icon = navigationSections.find(s => s.key === activeSection)?.icon
                      return Icon ? <ImageIcon className="w-5 h-5" /> : null
                    })()}
                  </div>
                )}
                {navigationSections.find(s => s.key === activeSection)?.label}
              </SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Basic Details */}
              {activeSection === 'basic' && (
                <div className="space-y-5">
                  <div>
                    <Label className="text-gray-200 font-mono mb-2 flex items-center gap-2">
                      Hackathon Title <span className="text-red-400">*</span>
                    </Label>
                    <Input 
                      className="bg-black border-gray-700 text-gray-100 focus:border-blue-500 transition-colors h-12" 
                      placeholder="e.g., AI Innovation Hackathon 2025" 
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-gray-200 font-mono mb-2 flex items-center gap-2">
                      Organizer Name <span className="text-red-400">*</span>
                    </Label>
                    <Input 
                      className="bg-black border-gray-700 text-gray-100 focus:border-blue-500 transition-colors h-12" 
                      placeholder="Your organization name" 
                      value={formData.organizer}
                      onChange={(e) => setFormData({...formData, organizer: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-200 font-mono mb-2">Mode</Label>
                      <select 
                        className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-3 h-12 focus:border-blue-500 transition-colors"
                        value={formData.mode}
                        onChange={(e) => setFormData({...formData, mode: e.target.value})}
                      >
                        <option>Online</option>
                        <option>Offline</option>
                        <option>Hybrid</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-gray-200 font-mono mb-2">Location</Label>
                      <Input 
                        className="bg-black border-gray-700 text-gray-100 h-12" 
                        placeholder="City, Country"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-200 font-mono mb-2">Current Participants</Label>
                      <Input 
                        type="number" 
                        className="bg-black border-gray-700 text-gray-100 h-12" 
                        placeholder="0"
                        value={formData.participants}
                        onChange={(e) => setFormData({...formData, participants: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label className="text-gray-200 font-mono mb-2">Max Participants</Label>
                      <Input 
                        type="number" 
                        className="bg-black border-gray-700 text-gray-100 h-12" 
                        placeholder="500"
                        value={formData.maxParticipants}
                        onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-200 font-mono mb-2">Duration</Label>
                      <Input 
                        className="bg-black border-gray-700 text-gray-100 h-12" 
                        placeholder="48H"
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label className="text-gray-200 font-mono mb-2">Registration Deadline</Label>
                      <Input 
                        className="bg-black border-gray-700 text-gray-100 h-12" 
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
                <div className="space-y-5">
                  <div>
                    <Label className="text-gray-200 font-mono mb-2">Desktop Banner URL</Label>
                    <Input 
                      placeholder="https://..." 
                      className="bg-black border-gray-700 text-gray-100 h-12"
                      value={formData.banner}
                      onChange={(e) => setFormData({...formData, banner: e.target.value})}
                    />
                    <p className="text-xs text-gray-400 mt-2 font-mono">Recommended: 1200x400px</p>
                  </div>
                  <div>
                    <Label className="text-gray-200 font-mono mb-2">Logo URL</Label>
                    <Input 
                      placeholder="https://..." 
                      className="bg-black border-gray-700 text-gray-100 h-12"
                      value={formData.logo}
                      onChange={(e) => setFormData({...formData, logo: e.target.value})}
                    />
                    <p className="text-xs text-gray-400 mt-2 font-mono">Recommended: Square format, 200x200px minimum</p>
                  </div>
                </div>
              )}

              {/* About Section */}
              {activeSection === 'about' && (
                <div className="space-y-5">
                  <div>
                    <Label className="text-gray-200 font-mono mb-2">About Your Hackathon</Label>
                    <Textarea 
                      rows={12} 
                      className="bg-black border-gray-700 text-gray-100 focus:border-blue-500 transition-colors" 
                      placeholder="Describe your hackathon in detail. Include the theme, goals, what participants will build, and what makes your event unique..."
                      value={formData.about}
                      onChange={(e) => setFormData({...formData, about: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label className="text-gray-200 font-mono mb-2">Tags (comma separated)</Label>
                    <Input 
                      className="bg-black border-gray-700 text-gray-100 h-12" 
                      placeholder="AI, Web3, Healthcare, Social Impact" 
                    />
                  </div>
                </div>
              )}

              {/* Eligibility */}
              {activeSection === 'eligibility' && (
                <div className="space-y-5">
                  <div>
                    <Label className="text-gray-200 font-mono mb-2">Who Can Participate?</Label>
                    <div className="space-y-3">
                      {['Students', 'Professionals', 'Freelancers', 'Beginners', 'All Levels'].map((item) => (
                        <label key={item} className="flex items-center gap-3 p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 text-blue-500"
                            checked={formData.eligibility.includes(item)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({...formData, eligibility: [...formData.eligibility, item]})
                              } else {
                                setFormData({...formData, eligibility: formData.eligibility.filter(el => el !== item)})
                              }
                            }}
                          />
                          <span className="text-gray-200 font-mono">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Requirements */}
              {activeSection === 'requirements' && (
                <div className="space-y-5">
                  <div>
                    <Label className="text-gray-200 font-mono mb-3">Participation Requirements</Label>
                    <div className="space-y-3 mb-4">
                      {formData.requirements.map((req, index) => (
                        <div key={index} className="flex gap-2 items-center p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <span className="flex-1 text-gray-200 font-mono text-sm">{req}</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0"
                            onClick={() => removeRequirement(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        className="bg-black border-gray-700 text-gray-100 h-12 flex-1" 
                        placeholder="Add a new requirement..."
                        value={newRequirement}
                        onChange={(e) => setNewRequirement(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                      />
                      <Button 
                        className="bg-green-600 hover:bg-green-700 text-white h-12 px-6"
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
                <div className="space-y-5">
                  <div>
                    <Label className="text-gray-200 font-mono mb-2">Total Prize Pool</Label>
                    <Input 
                      placeholder="$5,000" 
                      className="bg-black border-gray-700 text-gray-100 h-12"
                      value={formData.totalPrizePool}
                      onChange={(e) => setFormData({...formData, totalPrizePool: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label className="text-gray-200 font-mono mb-3">Prize Distribution</Label>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg space-y-3">
                        <Input placeholder="Prize Position (e.g., 1st Place)" className="bg-black border-gray-700 text-gray-100 h-12" />
                        <Input placeholder="Amount (e.g., $2,000)" className="bg-black border-gray-700 text-gray-100 h-12" />
                        <Textarea rows={2} placeholder="Description" className="bg-black border-gray-700 text-gray-100" />
                        <select className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-3 h-12">
                          <option>Cash</option>
                          <option>Certificate</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                    <Button className="w-full mt-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white h-12">
                      <Plus className="w-4 h-4 mr-2" /> Add Prize
                    </Button>
                  </div>
                </div>
              )}

              {/* Timeline */}
              {activeSection === 'timeline' && (
                <div className="space-y-5">
                  <div>
                    <Label className="text-gray-200 font-mono mb-3">Event Stages</Label>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg space-y-3">
                        <Input placeholder="Stage Title (e.g., Registration Opens)" className="bg-black border-gray-700 text-gray-100 h-12" />
                        <Input type="date" placeholder="Date" className="bg-black border-gray-700 text-gray-100 h-12" />
                        <Textarea rows={3} placeholder="Stage Description" className="bg-black border-gray-700 text-gray-100" />
                        <div className="grid grid-cols-2 gap-3">
                          <Input type="datetime-local" placeholder="Start Date & Time" className="bg-black border-gray-700 text-gray-100 h-12" />
                          <Input type="datetime-local" placeholder="End Date & Time" className="bg-black border-gray-700 text-gray-100 h-12" />
                        </div>
                      </div>
                    </div>
                    <Button className="w-full mt-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white h-12">
                      <Plus className="w-4 h-4 mr-2" /> Add Stage
                    </Button>
                  </div>
                </div>
              )}

              {/* Important Dates */}
              {activeSection === 'dates' && (
                <div className="space-y-5">
                  <div>
                    <Label className="text-gray-200 font-mono mb-3">Key Dates & Deadlines</Label>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg space-y-3">
                        <Input placeholder="Date Title (e.g., Submission Deadline)" className="bg-black border-gray-700 text-gray-100 h-12" />
                        <div className="grid grid-cols-2 gap-3">
                          <Input type="date" className="bg-black border-gray-700 text-gray-100 h-12" />
                          <Input type="time" placeholder="Time" className="bg-black border-gray-700 text-gray-100 h-12" />
                        </div>
                        <Textarea rows={2} placeholder="Description" className="bg-black border-gray-700 text-gray-100" />
                      </div>
                    </div>
                    <Button className="w-full mt-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white h-12">
                      <Plus className="w-4 h-4 mr-2" /> Add Date
                    </Button>
                  </div>
                </div>
              )}

              {/* FAQ */}
              {activeSection === 'faq' && (
                <div className="space-y-5">
                  <div>
                    <Label className="text-gray-200 font-mono mb-3">Frequently Asked Questions</Label>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg space-y-3">
                        <Input placeholder="Question" className="bg-black border-gray-700 text-gray-100 h-12" />
                        <Textarea rows={4} placeholder="Answer" className="bg-black border-gray-700 text-gray-100" />
                      </div>
                    </div>
                    <Button className="w-full mt-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white h-12">
                      <Plus className="w-4 h-4 mr-2" /> Add FAQ
                    </Button>
                  </div>
                </div>
              )}

              {/* Organizers */}
              {activeSection === 'organizers' && (
                <div className="space-y-5">
                  <div>
                    <Label className="text-gray-200 font-mono mb-3">Organizer Details</Label>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg space-y-3">
                        <Input placeholder="Name" className="bg-black border-gray-700 text-gray-100 h-12" />
                        <Input placeholder="Role/Title" className="bg-black border-gray-700 text-gray-100 h-12" />
                        <Input type="email" placeholder="Email" className="bg-black border-gray-700 text-gray-100 h-12" />
                        <Input type="tel" placeholder="Phone (optional)" className="bg-black border-gray-700 text-gray-100 h-12" />
                        <Input placeholder="Profile Image URL (optional)" className="bg-black border-gray-700 text-gray-100 h-12" />
                      </div>
                    </div>
                    <Button className="w-full mt-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white h-12">
                      <Plus className="w-4 h-4 mr-2" /> Add Organizer
                    </Button>
                  </div>
                </div>
              )}

              {/* Sponsors */}
              {activeSection === 'sponsors' && (
                <div className="space-y-5">
                  <div>
                    <Label className="text-gray-200 font-mono mb-3">Sponsor Information</Label>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg space-y-3">
                        <Input placeholder="Sponsor Name" className="bg-black border-gray-700 text-gray-100 h-12" />
                        <Input placeholder="Logo URL" className="bg-black border-gray-700 text-gray-100 h-12" />
                        <Input placeholder="Website Link (optional)" className="bg-black border-gray-700 text-gray-100 h-12" />
                        <Textarea rows={3} placeholder="Description (optional)" className="bg-black border-gray-700 text-gray-100" />
                      </div>
                    </div>
                    <Button className="w-full mt-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white h-12">
                      <Plus className="w-4 h-4 mr-2" /> Add Sponsor
                    </Button>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="pt-4 flex gap-3 border-t border-gray-800">
                <Button 
                  variant="outline" 
                  className="flex-1 bg-gray-800 hover:bg-gray-700 border-gray-600 text-white h-12"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 text-white h-12 font-bold hover:from-purple-600 hover:via-blue-600 hover:to-teal-600" 
                  onClick={() => setOpen(false)}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}