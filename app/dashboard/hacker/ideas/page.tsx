'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getSavedIdeas, deleteSavedIdea } from '@/lib/actions/saved-ideas-actions'
import { Lightbulb, Calendar, Trash2, Eye, Sparkles } from 'lucide-react'
import { showCustomToast } from '@/components/toast-notification'
import Link from 'next/link'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function GeneratedIdeasPage() {
  const [ideas, setIdeas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteIdeaId, setDeleteIdeaId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadIdeas()
  }, [])

  async function loadIdeas() {
    setLoading(true)
    const result = await getSavedIdeas()

    if (result.success) {
      setIdeas(result.data)
    } else {
      showCustomToast('error', 'Failed to load saved ideas')
    }

    setLoading(false)
  }

  async function handleDelete() {
    if (!deleteIdeaId) return

    setIsDeleting(true)
    const result = await deleteSavedIdea(deleteIdeaId)

    if (result.success) {
      showCustomToast('success', 'Idea deleted successfully')
      setIdeas(ideas.filter(idea => idea.id !== deleteIdeaId))
      setDeleteIdeaId(null)
    } else {
      showCustomToast('error', result.message || 'Failed to delete idea')
    }

    setIsDeleting(false)
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 mb-2">
            GENERATED IDEAS
          </h1>
          <p className="text-gray-400 font-mono">
            View and manage your AI-generated hackathon ideas
          </p>
        </div>
        <Link href="/ai-idea-generator">
          <Button className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:opacity-90 text-white font-mono font-bold">
            <Sparkles className="h-4 w-4 mr-2" />
            Generate New Idea
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-teal-500/30">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Lightbulb className="h-8 w-8 text-teal-400" />
            <div>
              <p className="text-3xl font-blackops text-teal-400">{ideas.length}</p>
              <p className="text-gray-400 font-mono text-sm">Saved Ideas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ideas Grid */}
      {ideas.length === 0 ? (
        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
          <CardContent className="py-16">
            <div className="text-center">
              <Lightbulb className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-blackops text-white mb-2">No Ideas Yet</h3>
              <p className="text-gray-400 font-mono mb-6">
                Generate AI-powered hackathon ideas to get started
              </p>
              <Link href="/ai-idea-generator">
                <Button className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:opacity-90 text-white font-mono font-bold">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Your First Idea
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map((idea) => (
            <Card
              key={idea.id}
              className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800 hover:border-teal-400 transition-all group"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <CardTitle className="text-white font-blackops text-lg mb-2 line-clamp-2">
                      {idea.title}
                    </CardTitle>
                    {idea.hackathons && (
                      <div className="flex items-center gap-2 text-sm text-gray-400 font-mono">
                        <Calendar className="h-3 w-3" />
                        {idea.hackathons.title}
                      </div>
                    )}
                  </div>
                  <div className="p-2 rounded-lg bg-teal-500/10">
                    <Lightbulb className="h-5 w-5 text-teal-400" />
                  </div>
                </div>
                {idea.hackathons?.categories && idea.hackathons.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {idea.hackathons.categories.slice(0, 3).map((category: string, idx: number) => (
                      <Badge
                        key={idx}
                        className="bg-gray-800/50 text-gray-300 border border-gray-700 font-mono text-xs"
                      >
                        {category}
                      </Badge>
                    ))}
                    {idea.hackathons.categories.length > 3 && (
                      <Badge className="bg-gray-800/50 text-gray-300 border border-gray-700 font-mono text-xs">
                        +{idea.hackathons.categories.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-400 text-sm line-clamp-3">{idea.description}</p>

                {/* Tech Stack */}
                {idea.tech_stack && idea.tech_stack.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 font-mono mb-2">Tech Stack:</p>
                    <div className="flex flex-wrap gap-1">
                      {idea.tech_stack.slice(0, 4).map((tech: string, idx: number) => (
                        <Badge
                          key={idx}
                          className="bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono text-xs"
                        >
                          {tech}
                        </Badge>
                      ))}
                      {idea.tech_stack.length > 4 && (
                        <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono text-xs">
                          +{idea.tech_stack.length - 4}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="pt-3 border-t border-gray-800 space-y-1">
                  {idea.estimated_time && (
                    <p className="text-xs text-gray-500 font-mono">
                      Estimated Time: <span className="text-gray-400">{idea.estimated_time}</span>
                    </p>
                  )}
                  <p className="text-xs text-gray-500 font-mono">
                    Created: {new Date(idea.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Link href={`/dashboard/hacker/ideas/${idea.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full border-teal-500/50 text-teal-400 hover:bg-teal-500/10 font-mono"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    onClick={() => setDeleteIdeaId(idea.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteIdeaId} onOpenChange={() => setDeleteIdeaId(null)}>
        <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400 font-blackops">Delete Idea</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400 font-mono">
              Are you sure you want to delete this idea? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
