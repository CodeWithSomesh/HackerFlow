'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getSavedIdeaById } from '@/lib/actions/saved-ideas-actions'
import {
  Lightbulb,
  ArrowLeft,
  Target,
  Eye,
  Wrench,
  Clock,
  Users,
  TrendingUp,
  Code,
  Database,
  Shield,
  Rocket,
  CheckCircle
} from 'lucide-react'
import { showCustomToast } from '@/components/toast-notification'

export default function IdeaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [idea, setIdea] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      loadIdea(params.id as string)
    }
  }, [params.id])

  async function loadIdea(ideaId: string) {
    setLoading(true)
    const result = await getSavedIdeaById(ideaId)

    if (result.success) {
      setIdea(result.data)
    } else {
      showCustomToast('error', 'Failed to load idea')
      router.push('/dashboard/hacker/ideas')
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-64" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    )
  }

  if (!idea) {
    return null
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Back Button */}
      <Button
        onClick={() => router.push('/dashboard/hacker/ideas')}
        variant="ghost"
        className="text-gray-400 hover:text-white font-mono"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Ideas
      </Button>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500">
            <Lightbulb className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-blackops text-white mb-2">{idea.title}</h1>
            {idea.hackathons && (
              <div className="flex items-center gap-2 text-gray-400 font-mono">
                <span>For: {idea.hackathons.title}</span>
                {idea.hackathons.organization && (
                  <span className="text-gray-500">by {idea.hackathons.organization}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Categories */}
        {idea.hackathons?.categories && idea.hackathons.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {idea.hackathons.categories.map((category: string, idx: number) => (
              <Badge
                key={idx}
                className="bg-gray-800 text-gray-300 border border-gray-700 font-mono"
              >
                {category}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white font-blackops flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-teal-400" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>{idea.description}</p>
            </CardContent>
          </Card>

          {/* Problem Statement */}
          {idea.problem_statement && (
            <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white font-blackops flex items-center gap-2">
                  <Target className="h-5 w-5 text-red-400" />
                  Problem Statement
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p>{idea.problem_statement}</p>
              </CardContent>
            </Card>
          )}

          {/* Vision */}
          {idea.vision && (
            <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white font-blackops flex items-center gap-2">
                  <Eye className="h-5 w-5 text-purple-400" />
                  Vision
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p>{idea.vision}</p>
              </CardContent>
            </Card>
          )}

          {/* Implementation Phases */}
          {idea.implementation && typeof idea.implementation === 'object' && 'phases' in idea.implementation && (
            <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white font-blackops flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-blue-400" />
                  Implementation Phases
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {idea.implementation.phases?.map((phase: any, idx: number) => (
                  <div key={idx} className="p-4 bg-gray-800/50 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </div>
                      <h3 className="text-white font-bold">{phase.name}</h3>
                      <Badge className="ml-auto bg-blue-500/20 text-blue-400 border border-blue-400 font-mono text-xs">
                        {phase.duration}
                      </Badge>
                    </div>
                    <ul className="space-y-1 ml-10">
                      {phase.tasks?.map((task: string, taskIdx: number) => (
                        <li key={taskIdx} className="text-gray-400 text-sm flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Database Recommendation */}
          {idea.implementation?.databaseRecommendation && (
            <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white font-blackops flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-400" />
                  Database Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-gray-800/50 rounded-md">
                  <p className="text-green-400 font-bold mb-1">
                    {idea.implementation.databaseRecommendation.database}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {idea.implementation.databaseRecommendation.reasoning}
                  </p>
                </div>
                {idea.implementation.databaseRecommendation.schema && (
                  <div className="p-3 bg-black/50 rounded-md">
                    <p className="text-gray-400 font-mono text-xs mb-2">Schema:</p>
                    <pre className="text-gray-300 text-xs overflow-x-auto">
                      {idea.implementation.databaseRecommendation.schema}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Security Best Practices */}
          {idea.implementation?.securityBestPractices && (
            <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white font-blackops flex items-center gap-2">
                  <Shield className="h-5 w-5 text-yellow-400" />
                  Security Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {idea.implementation.securityBestPractices.map((practice: string, idx: number) => (
                    <li key={idx} className="text-gray-400 text-sm flex items-start gap-2">
                      <Shield className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <span>{practice}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Deployment Guide */}
          {idea.implementation?.deploymentGuide && (
            <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white font-blackops flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-orange-400" />
                  Deployment Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(idea.implementation.deploymentGuide).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-800/50 rounded-md">
                    <p className="text-orange-400 font-bold mb-1 capitalize">{key}</p>
                    <p className="text-gray-400 text-sm">{value as string}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Tech Stack */}
          {idea.tech_stack && idea.tech_stack.length > 0 && (
            <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white font-blackops flex items-center gap-2">
                  <Code className="h-5 w-5 text-blue-400" />
                  Tech Stack
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {idea.tech_stack.map((tech: string, idx: number) => (
                    <Badge
                      key={idx}
                      className="bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Estimated Time */}
          {idea.estimated_time && (
            <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white font-blackops flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-400" />
                  Estimated Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-blackops text-purple-400">{idea.estimated_time}</p>
              </CardContent>
            </Card>
          )}

          {/* Skills Required */}
          {idea.skills_required && idea.skills_required.length > 0 && (
            <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white font-blackops flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-400" />
                  Skills Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {idea.skills_required.map((skill: string, idx: number) => (
                    <li key={idx} className="text-gray-400 text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                      {skill}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Success Metrics */}
          {idea.success_metrics && idea.success_metrics.length > 0 && (
            <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white font-blackops flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-yellow-400" />
                  Success Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {idea.success_metrics.map((metric: string, idx: number) => (
                    <li key={idx} className="text-gray-400 text-sm flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <span>{metric}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
