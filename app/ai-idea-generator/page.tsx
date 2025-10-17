'use client'

import { useState } from 'react'
import { Upload, Search, Sparkles, ArrowRight, FileText, CheckCircle, AlertCircle, Loader, MessageCircle, Share2, BookmarkPlus } from 'lucide-react'

export default function AIIdeaGenerator() {
  const [currentPage, setCurrentPage] = useState<'input' | 'results'>('input')
  const [selectedHackathon, setSelectedHackathon] = useState<any>(null)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [inspiration, setInspiration] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedIdea, setGeneratedIdea] = useState<any>(null)
  const [hackathonSearch, setHackathonSearch] = useState('')

  // Mock hackathons data
  const mockHackathons = [
    { id: 1, name: 'TechCrunch Disrupt', category: 'Innovation & Startups', date: 'Dec 2024', logo: '🚀' },
    { id: 2, name: 'NASA Space Apps', category: 'Space Technology', date: 'Oct 2024', logo: '🛸' },
    { id: 3, name: 'AngelHack Global', category: 'Social Impact', date: 'Nov 2024', logo: '💡' },
    { id: 4, name: 'HackMIT', category: 'Open Innovation', date: 'Sep 2024', logo: '🎓' },
    { id: 5, name: 'Junction', category: 'Sustainability', date: 'Nov 2024', logo: '🌱' },
    { id: 6, name: 'Devpost Global', category: 'AI/Machine Learning', date: 'Dec 2024', logo: '🤖' },
  ]

  const filteredHackathons = mockHackathons.filter(h => 
    h.name.toLowerCase().includes(hackathonSearch.toLowerCase())
  )

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }
      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        alert('Please upload a PDF, DOC, or DOCX file')
        return
      }
      setResumeFile(file)
    }
  }

  const handleGenerateIdeas = async () => {
    if (!selectedHackathon) {
      alert('Please select a hackathon')
      return
    }
    if (!resumeFile && !inspiration) {
      alert('Please upload a resume or provide inspiration')
      return
    }

    setIsGenerating(true)

    // Simulate API call - replace with actual API route later
    setTimeout(() => {
      const mockIdea = {
        id: Date.now(),
        hackathonId: selectedHackathon.id,
        hackathonName: selectedHackathon.name,
        title: 'AI-Powered Team Recommendation Engine',
        description: 'Create a smart algorithm that analyzes participant resumes, GitHub profiles, and skill sets to automatically recommend optimal team formations, maximizing complementary skills and experience levels.',
        problemStatement: 'During hackathons, teams are often formed randomly or based on existing connections, missing opportunities for optimal skill complementarity. This leads to suboptimal team dynamics and project outcomes.',
        vision: 'Build a platform that uses machine learning to analyze participant profiles and create perfectly balanced teams where each member brings unique value.',
        implementation: {
          phases: [
            {
              name: 'Research & Data Collection',
              duration: '10 hours',
              tasks: [
                'Analyze successful hackathon team compositions',
                'Integrate with GitHub API for project history',
                'Parse resume data using NLP',
              ]
            },
            {
              name: 'Algorithm Development',
              duration: '20 hours',
              tasks: [
                'Build recommendation engine using collaborative filtering',
                'Implement skill gap analysis',
                'Create matching algorithm optimizing for diversity',
              ]
            },
            {
              name: 'Frontend & Deployment',
              duration: '15 hours',
              tasks: [
                'Create real-time team matching interface',
                'Build admin dashboard for hackathon organizers',
                'Deploy to production',
              ]
            },
          ]
        },
        techStack: ['Python', 'NLP/spaCy', 'React', 'Node.js', 'PostgreSQL', 'TensorFlow'],
        estimatedTime: '45 hours',
        skillsRequired: ['Backend Development', 'ML/AI', 'Frontend Development', 'API Integration'],
        successMetrics: [
          'Team satisfaction score > 8/10',
          'Project completion rate > 90%',
          'Skill match accuracy > 85%'
        ]
      }

      setGeneratedIdea(mockIdea)
      setIsGenerating(false)
      setCurrentPage('results')
    }, 2000)
  }

  // PAGE 1: All inputs combined
  if (currentPage === 'input') {
    return (
      <div className="min-h-screen bg-black pt-6 pb-12">
        {/* Header */}
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
                  <div className="text-4xl mb-3">{hackathon.logo}</div>
                  <h3 className="text-lg font-blackops text-white mb-2 group-hover:text-teal-300 transition-colors">{hackathon.name}</h3>
                  <p className="text-sm text-gray-400 font-mono mb-3">{hackathon.category}</p>
                  <p className="text-xs text-gray-500 font-mono">{hackathon.date}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Resume Upload */}
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
                accept=".pdf,.doc,.docx"
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
                  PDF, DOC, or DOCX files up to 10MB
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

          {/* Inspiration Input */}
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

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              onClick={handleGenerateIdeas}
              disabled={!selectedHackathon || (!resumeFile && !inspiration)}
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-lg font-mono font-bold text-white transition-all ${
                selectedHackathon && (resumeFile || inspiration)
                  ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 hover:opacity-90 shadow-lg'
                  : 'bg-gray-700 cursor-not-allowed opacity-50'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              Generate Idea
              <ArrowRight className="w-5 h-5" />
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
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 via-cyan-500 to-yellow-400 border-y-4 border-pink-400 shadow-2xl mb-12">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <h1 className="text-5xl font-blackops text-white drop-shadow-lg mb-2">
              Your Generated Idea
            </h1>
            <p className="text-xl text-white/90 font-mono">
              {generatedIdea.hackathonName}
            </p>
          </div>
        </div>

        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-16 h-16 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 font-mono text-lg">Generating your brilliant idea...</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* LEFT COLUMN - Timeline & Sidebar */}
              <div className="space-y-6">
                {/* Project Timeline */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-blue-500/30 rounded-2xl p-6">
                  <h3 className="text-lg font-blackops text-white mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-blue-600"></div>
                    Time Estimates
                  </h3>
                  <div className="space-y-6">
                    {generatedIdea.implementation.phases.map((phase: any, idx: number) => (
                      <div key={idx} className="relative">
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center border-2 border-gray-800 z-10">
                              <span className="text-white font-blackops text-xs">{idx + 1}</span>
                            </div>
                            {idx < generatedIdea.implementation.phases.length - 1 && (
                              <div className="w-1 h-16 bg-gradient-to-b from-blue-500 to-transparent mt-2"></div>
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <h4 className="text-white font-blackops text-sm mb-1">{phase.name}</h4>
                            <p className="text-sm text-gray-400 font-mono font-bold mb-2">{phase.duration}</p>
                            <ul className="space-y-1">
                              {phase.tasks.map((task: string, i: number) => (
                                <li key={i} className="text-xs text-gray-400 font-mono">
                                  • {task}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills Required */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-purple-500/30 rounded-2xl p-6">
                  <h3 className="text-lg font-blackops text-white mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-purple-600"></div>
                    Skills Required
                  </h3>
                  <div className="space-y-2">
                    {generatedIdea.skillsRequired.map((skill: string) => (
                      <div key={skill} className="px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                        <p className="text-sm text-purple-300 font-mono">{skill}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Success Metrics */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-green-500/30 rounded-2xl p-6">
                  <h3 className="text-lg font-blackops text-white mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-green-400 to-green-600"></div>
                    Success Metrics
                  </h3>
                  <div className="space-y-2">
                    {generatedIdea.successMetrics.map((metric: string) => (
                      <div key={metric} className="flex gap-2 items-start">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                        <p className="text-sm text-gray-300 font-mono">{metric}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN - Main Idea Content */}
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-purple-500/30 rounded-2xl overflow-hidden shadow-xl">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-gray-700 p-8">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h2 className="text-3xl font-blackops text-white mb-3">
                          {generatedIdea.title}
                        </h2>
                        <p className="text-gray-300 font-mono text-base leading-relaxed">
                          {generatedIdea.description}
                        </p>
                      </div>
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 space-y-8">
                    {/* Problem Statement */}
                    <div>
                      <h3 className="text-lg font-blackops text-white mb-3">Problem Statement</h3>
                      <p className="text-gray-300 font-mono leading-relaxed text-sm">
                        {generatedIdea.problemStatement}
                      </p>
                    </div>

                    {/* Vision */}
                    <div>
                      <h3 className="text-lg font-blackops text-white mb-3">Vision</h3>
                      <p className="text-gray-300 font-mono leading-relaxed text-sm">
                        {generatedIdea.vision}
                      </p>
                    </div>

                    {/* Tech Stack */}
                    <div>
                      <h3 className="text-lg font-blackops text-white mb-3">Tech Stack</h3>
                      <div className="flex flex-wrap gap-2">
                        {generatedIdea.techStack.map((tech: string) => (
                          <span key={tech} className="px-3 py-1.5 bg-teal-500/10 border-2 border-teal-500/30 text-teal-300 rounded-lg text-xs font-mono font-bold">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-700">
                      <button className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-mono font-bold text-sm transition-all border border-gray-700 flex items-center justify-center gap-2">
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                      <button className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-mono font-bold text-sm transition-all border border-gray-700 flex items-center justify-center gap-2">
                        <BookmarkPlus className="w-4 h-4" />
                        Make it a post!
                      </button>
                      <button className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 text-white rounded-lg font-mono font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2">
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
        )}
      </div>
    )
  }
}