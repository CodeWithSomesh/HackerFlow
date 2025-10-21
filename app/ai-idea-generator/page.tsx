'use client'

import { useState, useEffect } from 'react'
import { Upload, Search, Sparkles, ArrowRight, FileText, CheckCircle, Loader, MessageCircle, Share2, BookmarkPlus } from 'lucide-react'
import { fetchPublishedHackathons } from "@/lib/actions/createHackathon-actions";
import { saveGeneratedIdea } from "@/lib/actions/generatedIdeas-actions";
// import { useChat } from '@ai-sdk/react'
import { useChat } from 'ai/react'
import { toast } from 'sonner'
import { showCustomToast } from '@/components/toast-notification';

export default function AIIdeaGenerator() {
    const [currentPage, setCurrentPage] = useState<'input' | 'results'>('input')
  const [selectedHackathon, setSelectedHackathon] = useState<any>(null)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeText, setResumeText] = useState('')
  const [inspiration, setInspiration] = useState('')
  const [hackathonSearch, setHackathonSearch] = useState('')
  const [hackathons, setHackathons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generatedIdea, setGeneratedIdea] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  const { messages, append, isLoading } = useChat({
    api: '/api/chat',
    onFinish: (message) => {
      try {
        const content = message.content
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          setGeneratedIdea({
            ...parsed,
            hackathonId: selectedHackathon.id,
            hackathonName: selectedHackathon.title,
          })
          setCurrentPage('results')
          showCustomToast('success', 'Idea generated successfully!')
        }
      } catch (error) {
        console.error('Failed to parse response:', error)
        showCustomToast('error', 'Failed to generate idea. Please try again.')
      }
    },
    onError: (error) => {
      console.error('Chat error:', error)
      showCustomToast('error', 'Failed to connect to AI service.')
    }
  })

  useEffect(() => {
    loadHackathons()
  }, [])

  const loadHackathons = async () => {
    const result = await fetchPublishedHackathons()
    if (result.success) {
      setHackathons(result.data)
      if (result.data.length === 0) {
        showCustomToast('info', 'No published hackathons found.')
      }
    } else {
      showCustomToast('error', 'Failed to load hackathons.')
    }
    setLoading(false)
  }

  const filteredHackathons = hackathons.filter(h => 
    h.title?.toLowerCase().includes(hackathonSearch.toLowerCase())
  )

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      showCustomToast('error', 'File size must be less than 10MB')
      return
    }

    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    if (!validTypes.includes(file.type)) {
      showCustomToast('error', 'Please upload a PDF, DOC, DOCX, or TXT file')
      return
    }

    setResumeFile(file)

    try {
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        setResumeText(text.substring(0, 5000))
        showCustomToast('success', 'Resume uploaded successfully!')
      }
      reader.onerror = () => {
        showCustomToast('error', 'Failed to read file')
      }
      reader.readAsText(file)
    } catch (error) {
      showCustomToast('error', 'Failed to process resume')
    }
  }

  const handleGenerateIdeas = async () => {
    if (!selectedHackathon) {
      showCustomToast('warning', 'Please select a hackathon first')
      return
    }
    if (!resumeFile && !inspiration) {
      showCustomToast('warning', 'Please upload a resume or provide inspiration')
      return
    }

    showCustomToast('info', 'Generating your idea... This may take a moment.')

    await append({
      role: 'user',
      content: `Generate a hackathon project idea for ${selectedHackathon.title}`,
    }, {
      options: {
        body: {
          hackathonTitle: selectedHackathon.title,
          hackathonCategories: selectedHackathon.categories,
          resumeText,
          inspiration,
        }
      }
    })
  }

  const handleSaveIdea = async () => {
    if (!generatedIdea) return

    setIsSaving(true)
    const result = await saveGeneratedIdea({
      hackathonId: generatedIdea.hackathonId,
      title: generatedIdea.title,
      description: generatedIdea.description,
      problemStatement: generatedIdea.problemStatement,
      vision: generatedIdea.vision,
      techStack: generatedIdea.techStack,
      estimatedTime: generatedIdea.estimatedTime,
      skillsRequired: generatedIdea.skillsRequired,
      successMetrics: generatedIdea.successMetrics,
      implementation: generatedIdea.implementation,
      inspiration,
      resumeAnalyzed: Boolean(resumeFile),
    })

    setIsSaving(false)

    if (result.success) {
      showCustomToast('success', 'Idea saved successfully!')
    } else {
      showCustomToast('error', result.error || 'Failed to save idea')
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-gray-400 font-mono">Loading hackathons...</p>
        </div>
      </div>
    )
  }

  // Mock hackathons data
//   const mockHackathons = [
//     { id: 1, name: 'TechCrunch Disrupt', category: 'Innovation & Startups', date: 'Dec 2024', logo: '🚀' },
//     { id: 2, name: 'NASA Space Apps', category: 'Space Technology', date: 'Oct 2024', logo: '🛸' },
//     { id: 3, name: 'AngelHack Global', category: 'Social Impact', date: 'Nov 2024', logo: '💡' },
//     { id: 4, name: 'HackMIT', category: 'Open Innovation', date: 'Sep 2024', logo: '🎓' },
//     { id: 5, name: 'Junction', category: 'Sustainability', date: 'Nov 2024', logo: '🌱' },
//     { id: 6, name: 'Devpost Global', category: 'AI/Machine Learning', date: 'Dec 2024', logo: '🤖' },
//   ]

  // PAGE 1: All inputs combined
  if (currentPage === 'input') {
    return (
      <div className="min-h-screen bg-black pt-6 pb-12">
        <div className="bg-gradient-to-r from-teal-600 via-cyan-500 to-yellow-400 border-y-4 border-pink-400 shadow-2xl mb-12">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <h1 className="text-5xl font-blackops text-white drop-shadow-lg mb-2">
              Generate Your Hackathon Idea
            </h1>
            <p className="text-xl text-white/90 font-mono">
              Let AI help you brainstorm an innovative project idea tailored to your skills 🚀
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 space-y-8">
          {/* Hackathon Selection */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-teal-500/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-blackops text-white">Select a Hackathon</h2>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search hackathons..."
                value={hackathonSearch}
                onChange={(e) => setHackathonSearch(e.target.value)}
                className="w-full bg-gray-900/80 backdrop-blur border-2 border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all font-mono"
              />
            </div>

            {filteredHackathons.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 font-mono">No hackathons found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredHackathons.map((hackathon) => (
                  <button
                    key={hackathon.id}
                    onClick={() => setSelectedHackathon(hackathon)}
                    className={`p-6 rounded-xl border-2 transition-all text-left group ${
                      selectedHackathon?.id === hackathon.id
                        ? 'border-pink-400 bg-gradient-to-br from-pink-500/10 to-purple-500/10'
                        : 'border-gray-700 bg-gray-900/50 hover:border-teal-400/50 hover:bg-gray-900'
                    }`}
                  >
                    {hackathon.logo_url ? (
                      <img src={hackathon.logo_url} alt={hackathon.title} className="w-12 h-12 rounded-lg object-cover mb-3" />
                    ) : (
                      <div className="text-4xl mb-3">🚀</div>
                    )}
                    <h3 className="text-lg font-blackops text-white mb-2 group-hover:text-teal-300 transition-colors">
                      {hackathon.title}
                    </h3>
                    {hackathon.categories && hackathon.categories.length > 0 && (
                      <p className="text-sm text-gray-400 font-mono mb-3">
                        {hackathon.categories.slice(0, 2).join(', ')}
                      </p>
                    )}
                    {hackathon.organization && (
                      <p className="text-xs text-gray-500 font-mono">{hackathon.organization}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Resume Upload - Keep your existing code */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-pink-500/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-blackops text-white">Upload Your Resume</h2>
              <span className="text-gray-400 font-mono text-sm">(Optional)</span>
            </div>

            <p className="text-gray-300 font-mono mb-6">
              Upload your resume for more personalized idea generation. We'll analyze your skills and experience.
            </p>

            <div className="relative">
              <input
                type="file"
                onChange={handleResumeUpload}
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                id="resume-upload"
              />
              <label
                htmlFor="resume-upload"
                className="flex flex-col items-center justify-center w-full p-12 border-2 border-dashed border-gray-700 rounded-xl hover:border-teal-400/50 hover:bg-teal-400/5 transition-all cursor-pointer"
              >
                <Upload className="w-12 h-12 text-teal-400 mb-3" />
                <p className="text-lg text-white font-mono font-bold mb-2">
                  {resumeFile ? resumeFile.name : 'Choose Your Resume'}
                </p>
                <p className="text-sm text-gray-400 font-mono">
                  PDF, DOC, DOCX, or TXT files up to 10MB
                </p>
              </label>
            </div>

            {resumeFile && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-green-300 font-mono text-sm">Resume uploaded successfully</span>
              </div>
            )}
          </div>

          {/* Inspiration Input - Keep your existing code */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-cyan-500/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-blackops text-white">Your Inspiration</h2>
              <span className="text-gray-400 font-mono text-sm">(Optional)</span>
            </div>

            <p className="text-gray-300 font-mono mb-4">
              What problems do you want to solve? What technologies excite you? Any specific domains you're passionate about?
            </p>

            <textarea
              value={inspiration}
              onChange={(e) => setInspiration(e.target.value)}
              placeholder="E.g., I'm passionate about sustainability and want to build something using AI to track carbon footprint. I have experience with React, Node.js, and machine learning..."
              maxLength={5000}
              className="w-full bg-gray-900/80 border-2 border-gray-700 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all font-mono resize-none h-40"
            />

            <div className="text-right text-sm text-gray-400 font-mono mt-2">
              {inspiration.length}/5000
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex gap-4 justify-end">
            <button
              onClick={handleGenerateIdeas}
              disabled={isLoading || !selectedHackathon || (!resumeFile && !inspiration)}
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-lg font-mono font-bold text-white transition-all ${
                !isLoading && selectedHackathon && (resumeFile || inspiration)
                  ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 hover:opacity-90 shadow-lg'
                  : 'bg-gray-700 cursor-not-allowed opacity-50'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Idea
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // PAGE 2: Single Idea Display (matching reference image layout)
  if (currentPage === 'results' && generatedIdea) {
    return (
      <div className="min-h-screen bg-black pt-20 pb-12">
        {/* Keep all your existing results page JSX */}
        {/* Just update the action buttons section: */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ... your existing left column code ... */}
            
            {/* RIGHT COLUMN */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-purple-500/30 rounded-2xl overflow-hidden shadow-xl">
                {/* ... your existing content ... */}
                
                {/* Updated Action Buttons */}
                <div className="p-8">
                  <div className="flex gap-3 pt-4 border-t border-gray-700">
                    <button 
                      onClick={() => showCustomToast('info', 'Share feature coming soon!')}
                      className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-mono font-bold text-sm transition-all border border-gray-700 flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                    <button 
                      onClick={handleSaveIdea}
                      disabled={isSaving}
                      className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-mono font-bold text-sm transition-all border border-gray-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="w-4 h-4" />
                          Save Idea
                        </>
                      )}
                    </button>
                    <button 
                      onClick={() => showCustomToast('info', 'Edit feature coming soon!')}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 text-white rounded-lg font-mono font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Edit idea
                    </button>
                  </div>
                </div>
              </div>

              {/* Back Button */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => {
                    setCurrentPage('input')
                    setGeneratedIdea(null)
                    setSelectedHackathon(null)
                    setResumeFile(null)
                    setResumeText('')
                    setInspiration('')
                  }}
                  className="px-6 py-3 rounded-lg font-mono font-bold text-white bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 transition-all"
                >
                  Generate Another Idea
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}