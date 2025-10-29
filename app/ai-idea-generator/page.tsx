'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, Search, Sparkles, ArrowRight, FileText, CheckCircle, Loader, MessageCircle, Share2, BookmarkPlus, Send } from 'lucide-react'
import { fetchPublishedHackathons } from "@/lib/actions/createHackathon-actions";
import { saveGeneratedIdea } from "@/lib/actions/generatedIdeas-actions";
import { createConversation, updateConversation, type Message } from "@/lib/actions/conversations-actions";
import { showCustomToast } from '@/components/toast-notification';


interface Hackathon {
  id: string;
  title: string;
  logo_url?: string;
  categories?: string[];
  organization?: string;
}

interface GeneratedIdea {
  id?: string;
  hackathonId: string;
  hackathonName: string;
  title: string;
  description: string;
  problemStatement: string;
  vision: string;
  implementation?: {
    phases?: Array<{
      name: string;
      duration: string;
      tasks: string[];
    }>;
    databaseRecommendation?: {
      database: string;
      reasoning: string;
      schema: string;
      alternatives: string;
    };
    securityBestPractices?: string[];
    deploymentGuide?: {
      frontend: string;
      backend: string;
      database: string;
      monitoring: string;
    };
  };
  techStack?: string[];
  estimatedTime?: string;
  skillsRequired?: string[];
  successMetrics?: string[];
  winningStrategy?: string;
  error?: string; // For validation errors
}

export default function AIIdeaGenerator() {
  const [currentPage, setCurrentPage] = useState<'input' | 'results'>('input')
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeText, setResumeText] = useState('')
  const [inspiration, setInspiration] = useState('')
  const [hackathonSearch, setHackathonSearch] = useState('')
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(true)
  const [generatedIdea, setGeneratedIdea] = useState<GeneratedIdea | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Chat state
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<Message[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isStreamingChat, setIsStreamingChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // const { messages, sendMessage, status } = useChat({
  //   onFinish: (options) => {
  //     try {
  //       const message = options.message;
        
  //       // Collect all text content from message parts
  //       let content = '';
  //       if (message.parts) {
  //         for (const part of message.parts) {
  //           if (part.type === 'text' && 'text' in part) {
  //             content += part.text;
  //           }
  //         }
  //       }
        
  //       const jsonMatch = content.match(/\{[\s\S]*\}/)
  //       if (jsonMatch) {
  //         const parsed = JSON.parse(jsonMatch[0])
  //         setGeneratedIdea({
  //           ...parsed,
  //           hackathonId: selectedHackathon.id,
  //           hackathonName: selectedHackathon.title,
  //         })
  //         setCurrentPage('results')
  //         showCustomToast('success', 'Idea generated successfully!')
  //       }
  //     } catch (error) {
  //       console.error('Failed to parse response:', error)
  //       showCustomToast('error', 'Failed to generate idea. Please try again.')
  //     }
  //   },
  //   onError: (error: Error) => {
  //     console.error('Chat error:', error)
  //     showCustomToast('error', 'Failed to connect to AI service.')
  //   }
  // })

  useEffect(() => {
    loadHackathons()
  }, [])

  // Load conversation when idea is generated
  useEffect(() => {
    if (generatedIdea && currentPage === 'results') {
      // Initialize chat for this idea
      // Don't create conversation until idea is saved (has an ID)
      // This prevents creating conversations with temporary IDs
      if (generatedIdea.id && !conversationId) {
        const initConversation = async () => {
          const result = await createConversation(
            generatedIdea.hackathonId,
            generatedIdea.id!,
            chatMessages
          )
          if (result.success) {
            setConversationId(result.data.id)
          }
        }
        initConversation()
      }
    }
  }, [generatedIdea, currentPage, conversationId, chatMessages])

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
    } catch {
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

    setIsGenerating(true)
    showCustomToast('info', 'Generating your idea... This may take a moment.')

    try {
      const response = await fetch('/api/generate-idea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Generate a hackathon project idea for ${selectedHackathon.title}`,
            }
          ],
          hackathonId: selectedHackathon.id, // Pass hackathon ID for full details
          hackathonTitle: selectedHackathon.title,
          hackathonCategories: selectedHackathon.categories,
          resumeText,
          inspiration,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', errorData);
        const errorMessage = errorData.details || errorData.error || `API Error: ${response.status}`;
        throw new Error(errorMessage);
      }

      // Read the complete response text (API now returns complete JSON, not streaming)
      const responseText = await response.text();
      console.log('Full response text:', responseText);

      // Trim whitespace and check if we have content
      const trimmedText = responseText.trim();

      if (!trimmedText) {
        console.error('API returned empty response. This usually means the model is invalid or API failed silently.');
        throw new Error('Empty response from API - Check server logs for details');
      }

      // Try to extract JSON from the response
      // This regex looks for the first { and matches it with the last }
      const jsonMatch = trimmedText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        console.error('Failed to find JSON in response:', trimmedText);
        // If no JSON found, the response might be plain text or an error
        throw new Error('No valid JSON found in response. Response: ' + trimmedText.substring(0, 200));
      }

      try {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('Successfully parsed idea:', parsed);

        // Check if AI returned a validation error
        if (parsed.error) {
          showCustomToast('error', parsed.error);
          return;
        }

        setGeneratedIdea({
          ...parsed,
          hackathonId: selectedHackathon.id,
          hackathonName: selectedHackathon.title,
        });
        setCurrentPage('results');
        showCustomToast('success', 'Idea generated successfully!');
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        console.error('JSON string that failed:', jsonMatch[0]);
        throw new Error('Failed to parse AI response as JSON');
      }
    } catch (error) {
      console.error('Failed to generate idea:', error);
      showCustomToast('error', error instanceof Error ? error.message : 'Failed to generate idea. Please try again.');
    } finally {
      setIsGenerating(false)
    }
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
      techStack: generatedIdea.techStack || [],
      estimatedTime: generatedIdea.estimatedTime || 'Not specified',
      skillsRequired: generatedIdea.skillsRequired || [],
      successMetrics: generatedIdea.successMetrics || [],
      implementation: {
        phases: generatedIdea.implementation?.phases || []
      },
      inspiration,
      resumeAnalyzed: Boolean(resumeFile),
    })

    setIsSaving(false)

    if (result.success) {
      showCustomToast('success', 'Idea saved successfully!')
      // Update generatedIdea with the saved ID
      setGeneratedIdea({
        ...generatedIdea,
        id: result.data.id
      })
      // Now create a conversation for this idea if one doesn't exist
      if (!conversationId) {
        const convResult = await createConversation(
          generatedIdea.hackathonId,
          result.data.id,
          chatMessages // Pass existing chat messages if any
        )
        if (convResult.success) {
          setConversationId(convResult.data.id)
        }
      }
    } else {
      showCustomToast('error', result.error || 'Failed to save idea')
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return
    if (!selectedHackathon) {
      showCustomToast('error', 'No hackathon selected')
      return
    }

    // Check if idea is saved before allowing chat
    if (!generatedIdea?.id) {
      showCustomToast('warning', 'Please save your idea first before chatting')
      return
    }

    const userMessage: Message = {
      role: 'user',
      content: chatInput,
      timestamp: new Date().toISOString(),
    }

    const updatedMessages = [...chatMessages, userMessage]
    setChatInput('')
    setChatMessages(updatedMessages)
    setIsStreamingChat(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          hackathonTitle: selectedHackathon.title,
          hackathonCategories: selectedHackathon.categories,
          hackathonId: selectedHackathon.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          fullResponse += chunk
        }

        const assistantMessage: Message = {
          role: 'assistant',
          content: fullResponse,
          timestamp: new Date().toISOString(),
        }

        const finalMessages = [...updatedMessages, assistantMessage]
        setChatMessages(finalMessages)

        // Update conversation in database
        if (conversationId) {
          await updateConversation(conversationId, finalMessages)
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      showCustomToast('error', 'Failed to send message')
      // Remove the user message if there was an error
      setChatMessages((prev) => prev.slice(0, -1))
    } finally {
      setIsStreamingChat(false)
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

  // PAGE 1: All inputs combined
  if (currentPage === 'input') {
    return (
      <div className="min-h-screen bg-black mt-4 pb-6">
        <div className="bg-gradient-to-r from-teal-600 via-cyan-500 to-yellow-400 border-y-4 border-pink-400 shadow-2xl mb-6">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <h1 className="text-5xl font-blackops text-white drop-shadow-lg mb-2">
              Generate Your Hackathon Idea
            </h1>
            <p className="text-xl text-white/90 font-mono">
              Let AI help you brainstorm an innovative project idea tailored to your skills 🚀
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 space-y-6">
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
              Upload your resume for more personalized idea generation. We&apos;ll analyze your skills and experience.
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
              What problems do you want to solve? What technologies excite you? Any specific domains you&apos;re passionate about?
            </p>

            <textarea
              value={inspiration}
              onChange={(e) => setInspiration(e.target.value)}
              placeholder="E.g., I&apos;m passionate about sustainability and want to build something using AI to track carbon footprint. I have experience with React, Node.js, and machine learning..."
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
            disabled={isGenerating || !selectedHackathon || (!resumeFile && !inspiration)}
            className={`inline-flex items-center gap-2 px-8 py-4 rounded-lg font-mono font-bold text-white transition-all ${
              !isGenerating && selectedHackathon && (resumeFile || inspiration)
                ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 hover:opacity-90 shadow-lg'
                : 'bg-gray-700 cursor-not-allowed opacity-50'
            }`}
          >
            {isGenerating ? (
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

  // PAGE 2: Results page - Add the missing left column
  if (currentPage === 'results' && generatedIdea) {
    return (
      <div className="min-h-screen bg-black mt-4">
        <div className="bg-gradient-to-r from-teal-600 via-cyan-500 to-yellow-400 border-y-4 border-pink-400 shadow-2xl mb-6">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <h1 className="text-5xl font-blackops text-white drop-shadow-lg mb-2">
              Your Generated Idea
            </h1>
            <p className="text-xl text-white/90 font-mono">
              {generatedIdea.hackathonName}
            </p>
          </div>
        </div>

        <div className="max-w-[1700px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 h-[calc(100vh-220px)]">
            {/* LEFT COLUMN - Timeline & Sidebar */}
            <div className="space-y-6 overflow-y-auto pr-2">
              {/* Project Timeline */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-blue-500/30 rounded-2xl p-6">
                <h3 className="text-lg font-blackops text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-blue-600"></div>
                  Time Estimates
                </h3>
                <div className="space-y-6">
                  {generatedIdea.implementation?.phases && generatedIdea.implementation.phases.length > 0 ? (
                    generatedIdea.implementation.phases.map((phase, idx: number) => {
                      const totalPhases = generatedIdea.implementation?.phases?.length || 0;
                      return (
                        <div key={idx} className="relative">
                          <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center border-2 border-gray-800 z-10">
                                <span className="text-white font-blackops text-xs">{idx + 1}</span>
                              </div>
                              {idx < totalPhases - 1 && (
                                <div className="w-1 h-16 bg-gradient-to-b from-blue-500 to-transparent mt-2"></div>
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <h4 className="text-white font-blackops text-sm mb-1">{phase.name}</h4>
                              <p className="text-sm text-gray-400 font-mono font-bold mb-2">{phase.duration}</p>
                              <ul className="space-y-1">
                                {phase.tasks?.map((task: string, i: number) => (
                                  <li key={i} className="text-xs text-gray-400 font-mono">
                                    • {task}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-400 font-mono text-sm">No implementation timeline available</p>
                  )}
                </div>
              </div>

              {/* Skills Required */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-purple-500/30 rounded-2xl p-6">
                <h3 className="text-lg font-blackops text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-purple-600"></div>
                  Skills Required
                </h3>
                <div className="space-y-2">
                  {generatedIdea.skillsRequired?.map((skill: string) => (
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
                  {generatedIdea.successMetrics?.map((metric: string) => (
                    <div key={metric} className="flex gap-2 items-start">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                      <p className="text-sm text-gray-300 font-mono">{metric}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CENTER COLUMN - Main Idea Content */}
            <div className="lg:col-span-2 overflow-y-auto pr-2">
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
                      {generatedIdea.techStack?.map((tech: string) => (
                        <span key={tech} className="px-3 py-1.5 bg-teal-500/10 border-2 border-teal-500/30 text-teal-300 rounded-lg text-xs font-mono font-bold">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Database Recommendation */}
                  {generatedIdea.implementation?.databaseRecommendation && (
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-6">
                      <h3 className="text-lg font-blackops text-white mb-3 flex items-center gap-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-blue-600"></div>
                        Database Recommendation
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-blue-300 font-mono font-bold text-sm mb-1">
                            {generatedIdea.implementation.databaseRecommendation.database}
                          </p>
                          <p className="text-gray-300 font-mono text-xs leading-relaxed">
                            {generatedIdea.implementation.databaseRecommendation.reasoning}
                          </p>
                        </div>
                        <div>
                          <p className="text-blue-300 font-mono font-bold text-xs mb-1">Schema:</p>
                          <p className="text-gray-300 font-mono text-xs">
                            {generatedIdea.implementation.databaseRecommendation.schema}
                          </p>
                        </div>
                        <div>
                          <p className="text-blue-300 font-mono font-bold text-xs mb-1">Alternatives:</p>
                          <p className="text-gray-300 font-mono text-xs">
                            {generatedIdea.implementation.databaseRecommendation.alternatives}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Security Best Practices */}
                  {generatedIdea.implementation?.securityBestPractices && generatedIdea.implementation.securityBestPractices.length > 0 && (
                    <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-6">
                      <h3 className="text-lg font-blackops text-white mb-3 flex items-center gap-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-red-400 to-red-600"></div>
                        Security Best Practices
                      </h3>
                      <ul className="space-y-2">
                        {generatedIdea.implementation.securityBestPractices.map((practice: string, idx: number) => (
                          <li key={idx} className="flex gap-2 items-start">
                            <span className="text-red-400 mt-1">•</span>
                            <p className="text-gray-300 font-mono text-xs leading-relaxed flex-1">
                              {practice}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Deployment Guide */}
                  {generatedIdea.implementation?.deploymentGuide && (
                    <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-6">
                      <h3 className="text-lg font-blackops text-white mb-3 flex items-center gap-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-purple-600"></div>
                        Deployment Guide
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-purple-300 font-mono font-bold text-xs mb-1">Frontend:</p>
                          <p className="text-gray-300 font-mono text-xs leading-relaxed">
                            {generatedIdea.implementation.deploymentGuide.frontend}
                          </p>
                        </div>
                        <div>
                          <p className="text-purple-300 font-mono font-bold text-xs mb-1">Backend:</p>
                          <p className="text-gray-300 font-mono text-xs leading-relaxed">
                            {generatedIdea.implementation.deploymentGuide.backend}
                          </p>
                        </div>
                        <div>
                          <p className="text-purple-300 font-mono font-bold text-xs mb-1">Database:</p>
                          <p className="text-gray-300 font-mono text-xs leading-relaxed">
                            {generatedIdea.implementation.deploymentGuide.database}
                          </p>
                        </div>
                        <div>
                          <p className="text-purple-300 font-mono font-bold text-xs mb-1">Monitoring:</p>
                          <p className="text-gray-300 font-mono text-xs leading-relaxed">
                            {generatedIdea.implementation.deploymentGuide.monitoring}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Winning Strategy */}
                  {generatedIdea.winningStrategy && (
                    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-6">
                      <h3 className="text-lg font-blackops text-white mb-3 flex items-center gap-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-yellow-400 to-yellow-600"></div>
                        Winning Strategy
                      </h3>
                      <p className="text-gray-300 font-mono text-sm leading-relaxed">
                        {generatedIdea.winningStrategy}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
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

            {/* RIGHT COLUMN - Chat with AI */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-cyan-500/30 rounded-2xl p-6 flex flex-col overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-blackops text-white">Chat with AI</h3>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                {chatMessages.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center px-4">
                      <MessageCircle className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-400 font-mono mb-2">
                        Ask questions about your idea!
                      </p>
                      {!generatedIdea?.id && (
                        <p className="text-xs text-yellow-400 font-mono">
                          Save your idea first to start chatting
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg text-sm font-mono ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                          : 'bg-gray-800 text-gray-300 border border-gray-700'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}

                {isStreamingChat && (
                  <div className="flex justify-start">
                    <div className="max-w-xs px-4 py-2 rounded-lg text-sm font-mono bg-gray-800 text-gray-300 border border-gray-700">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Ask a question..."
                  disabled={isStreamingChat}
                  className="flex-1 bg-gray-900/80 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all font-mono disabled:opacity-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isStreamingChat || !chatInput.trim()}
                  className="px-3 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:opacity-90 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isStreamingChat ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}