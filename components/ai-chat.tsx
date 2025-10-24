'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { 
  Send, 
  Sparkles, 
  RefreshCcw, 
  Copy, 
  Paperclip, 
  Globe, 
  Zap,
  MessageCircle,
  Loader2,
  X,
  FileText,
  ImageIcon,
  Search,
  ChevronDown,
  Save
} from 'lucide-react';
import { fetchPublishedHackathons } from '@/lib/actions/createHackathon-actions';
import { showCustomToast } from './toast-notification';

// Define types
interface MessagePart {
  type: string;
  text: string;
  url?: string;
}

interface Message {
  id: string;
  role: string;
  parts: MessagePart[];
}

interface Hackathon {
  id: string;
  title: string;
  categories?: string[];
  organization?: string;
  logo_url?: string;
}

const HackathonAIChat = () => {
  const [input, setInput] = useState<string>('');
  const [model, setModel] = useState<string>('openai/gpt-4o');
  const [webSearch, setWebSearch] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  
  // Hackathon selection states
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);
  const [hackathonSearch, setHackathonSearch] = useState<string>('');
  const [showHackathonSelector, setShowHackathonSelector] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Conversation saving
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const { messages, sendMessage, status } = useChat({
    onFinish: (options) => {
      // Handle completion if needed
    },
    onError: (error: Error) => {
      console.error('Chat error:', error);
      showCustomToast('error', 'Failed to connect to AI service.');
    }
  });


  const models = [
    { name: 'GPT 4o', value: 'openai/gpt-4o' },
    { name: 'Deepseek R1', value: 'deepseek/deepseek-r1' },
  ];

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
    h.title?.toLowerCase().includes(hackathonSearch.toLowerCase()) ||
    h.organization?.toLowerCase().includes(hackathonSearch.toLowerCase())
  );

  // Save conversation to database
  const saveConversation = async () => {
    if (!selectedHackathon || messages.length === 0) return;

    try {
      setIsSaving(true);
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hackathonId: selectedHackathon.id,
          messages: messages,
          conversationId: conversationId,
        }),
      });

      const data = await response.json();
      if (data.id) {
        setConversationId(data.id);
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save conversation every 30 seconds
  useEffect(() => {
    if (messages.length > 0 && selectedHackathon) {
      const interval = setInterval(() => {
        saveConversation();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [messages, selectedHackathon]);

  const handleRegenerate = () => {
    if (messages.length === 0) return;
    
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      // Extract content from parts if it exists
      let content = '';
      if ('parts' in lastUserMessage && Array.isArray(lastUserMessage.parts)) {
        content = lastUserMessage.parts
          .filter((part: any) => part.type === 'text')
          .map((part: any) => part.text)
          .join('');
      }
      
      sendMessage({
        role: 'user',
        parts: [{ type: 'text', text: content }],
      }, {
        body: {
          model,
          webSearch,
          hackathonTitle: selectedHackathon?.title,
          hackathonCategories: selectedHackathon?.categories,
          hackathonId: selectedHackathon?.id,
        }
      });
    }
  };

  const handleSubmit = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (!input.trim() && attachments.length === 0) return;
    if (!selectedHackathon) {
      showCustomToast('warning', 'Please select a hackathon first');
      return;
    }
  
    const content = input || 'Sent with attachments';
    
    sendMessage({
      role: 'user',
      parts: [{ type: 'text', text: content }],
    }, {
      body: {
        model,
        webSearch,
        hackathonTitle: selectedHackathon.title,
        hackathonCategories: selectedHackathon.categories,
        hackathonId: selectedHackathon.id,
      }
    });
  
    setInput('');
    setAttachments([]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };


  // Hackathon Selection Screen
  if (showHackathonSelector && !selectedHackathon) {
    return (
      <div className="min-h-screen bg-black pt-6 pb-12">
        <div className="bg-gradient-to-r from-teal-600 via-cyan-500 to-yellow-400 border-b-4 border-pink-400 shadow-2xl">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white drop-shadow-lg mb-1">
                  AI Idea Assistant
                </h1>
                <p className="text-lg text-white/90 font-mono">
                  Select a hackathon to start brainstorming 🚀
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 mt-12">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-teal-500/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-black text-white">Select a Hackathon</h2>
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

            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-teal-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-400 font-mono">Loading hackathons...</p>
              </div>
            ) : filteredHackathons.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 font-mono">No hackathons found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredHackathons.map((hackathon) => (
                  <button
                    key={hackathon.id}
                    onClick={() => {
                      setSelectedHackathon(hackathon);
                      setShowHackathonSelector(false);
                    }}
                    className="p-6 rounded-xl border-2 border-gray-700 bg-gray-900/50 hover:border-teal-400/50 hover:bg-gray-900 transition-all text-left group"
                  >
                    {hackathon.logo_url ? (
                      <img src={hackathon.logo_url} alt={hackathon.title} className="w-12 h-12 rounded-lg object-cover mb-3" />
                    ) : (
                      <div className="text-4xl mb-3">🚀</div>
                    )}
                    <h3 className="text-lg font-black text-white mb-2 group-hover:text-teal-300 transition-colors">
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
        </div>
      </div>
    );
  }

  // Chat Interface
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-500 to-yellow-400 border-b-4 border-pink-400 shadow-2xl">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white drop-shadow-lg mb-1">
                  AI Idea Assistant
                </h1>
                <p className="text-lg text-white/90 font-mono">
                  {selectedHackathon?.title || 'Brainstorming mode'} 🚀
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowHackathonSelector(true)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg text-white font-mono text-sm font-bold transition-all"
            >
              Change Hackathon
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col h-[calc(100vh-180px)]">
        {/* Controls Bar */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-teal-500/30 rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            {/* Model Selector */}
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-teal-400" />
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="bg-gray-900/80 border-2 border-gray-700 rounded-lg px-4 py-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all cursor-pointer"
              >
                {models.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Web Search Toggle */}
            <button
              onClick={() => setWebSearch(!webSearch)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm font-bold transition-all ${
                webSearch
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-lg'
                  : 'bg-gray-900 text-gray-400 border-2 border-gray-700 hover:border-cyan-500/50'
              }`}
            >
              <Globe className="w-4 h-4" />
              Web Search
            </button>

            {/* Save Button */}
            <button
              onClick={saveConversation}
              disabled={isSaving || messages.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white rounded-lg font-mono text-sm font-bold transition-all border-2 border-gray-700 hover:border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? 'Saving...' : 'Save'}
            </button>

            <div className="flex-1"></div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm font-mono">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-purple-400" />
                <span className="text-gray-400">{messages.length} messages</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto mb-6 space-y-6 pr-2">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-6 max-w-2xl">
                <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-black text-white">
                  Let's Build Something Amazing
                </h2>
                <p className="text-gray-400 font-mono text-lg">
                  Ask me anything about hackathon ideas, project planning, tech stacks, or get help brainstorming for {selectedHackathon?.title}!
                </p>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  {[
                    `💡 Generate an idea for ${selectedHackathon?.title}`,
                    '🚀 Help me pick the right tech stack',
                    '🎯 What makes a winning pitch?',
                    '⏱️ Create a 24-hour project timeline'
                  ].map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(prompt)}
                      className="p-4 bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 hover:border-teal-500/50 rounded-xl text-left transition-all group"
                    >
                      <p className="text-white font-mono text-sm group-hover:text-teal-300 transition-colors">
                        {prompt}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message: any, idx: number) => {
                // Extract content from message
                let content = '';
                if (message.parts) {
                  content = message.parts
                    .filter((part: any) => part.type === 'text')
                    .map((part: any) => part.text)
                    .join('');
                } else if ('content' in message) {
                  content = typeof message.content === 'string' ? message.content : '';
                }
              
                return (
                  <div key={message.id || idx}>
                    {message.role === 'user' ? (
                      <div className="flex justify-end">
                        <div className="max-w-3xl">
                          <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl rounded-tr-sm p-5 shadow-lg">
                            <p className="text-white font-mono leading-relaxed">
                              {content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-start">
                        <div className="max-w-3xl">
                          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-purple-500/30 rounded-2xl rounded-tl-sm p-5 shadow-lg">
                            <p className="text-gray-100 font-mono leading-relaxed whitespace-pre-wrap">
                              {content}
                            </p>
                            
                            {idx === messages.length - 1 && (
                              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-700">
                                <button
                                  onClick={handleRegenerate}
                                  className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-mono text-gray-300 transition-all"
                                >
                                  <RefreshCcw className="w-3 h-3" />
                                  Retry
                                </button>
                                <button
                                  onClick={() => navigator.clipboard.writeText(content)}
                                  className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-mono text-gray-300 transition-all"
                                >
                                  <Copy className="w-3 h-3" />
                                  Copy
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })} 

              {status === 'streaming' && (
                <div className="flex justify-start">
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-purple-500/30 rounded-2xl rounded-tl-sm p-5">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                      <span className="text-gray-400 font-mono text-sm">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-pink-500/30 rounded-2xl p-4 shadow-2xl">
          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {attachments.map((file, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg">
                  {file.type?.startsWith('image/') ? (
                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <FileText className="w-4 h-4 text-cyan-400" />
                  )}
                  <span className="text-sm text-gray-300 font-mono">{file.name}</span>
                  <button
                    onClick={() => removeAttachment(i)}
                    className="ml-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-3">
            {/* File Upload */}
            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,image/*"
              />
              <div className="w-12 h-12 rounded-xl bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 hover:border-cyan-500/50 flex items-center justify-center transition-all">
                <Paperclip className="w-5 h-5 text-gray-400" />
              </div>
            </label>

            {/* Text Input */}
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Ask me anything about hackathon ideas..."
                rows={1}
                className="w-full bg-gray-900/80 border-2 border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all font-mono resize-none"
                style={{ minHeight: '48px', maxHeight: '200px' }}
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
              disabled={status === 'streaming' || (!input.trim() && attachments.length === 0)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                status === 'streaming' || (!input.trim() && attachments.length === 0)
                  ? 'bg-gray-800 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 hover:opacity-90 shadow-lg'
              }`}
            >
              {status === 'streaming' ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Send className="w-5 h-5 text-white" />
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 font-mono mt-3 text-center">
            Press Enter to send • Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default HackathonAIChat;