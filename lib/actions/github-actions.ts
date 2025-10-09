'use server'

import { createClient } from '@/lib/supabase/server'
import { GitHubProject } from './profile-actions'

interface GitHubRepoResponse {
  id: number;
  name: string;
  full_name: string;
  description?: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  size: number;
  default_branch: string;
  topics?: string[];
  homepage?: string | null;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  private: boolean;
  fork: boolean;
  archived: boolean;
  disabled: boolean;
}


// GitHub API Integration
export async function connectGitHub() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // For now, we'll use a simple OAuth flow
    // In production, you'd want to implement proper GitHub OAuth
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/github/callback&scope=repo,user:email`
    
    return { success: true, authUrl: githubAuthUrl }
  } catch (error) {
    console.error('Error in connectGitHub:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Fetch GitHub repositories for a user
export async function fetchGitHubRepositories(accessToken: string): Promise<GitHubProject[]> {
  try {
    const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'HackerFlow-App'
      }
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const repos: GitHubRepoResponse[] = await response.json();
    
    // Transform GitHub API response to our format
    return repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description ?? undefined, 
      language: repo.language ?? undefined,
      stars_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      watchers_count: repo.watchers_count,
      open_issues_count: repo.open_issues_count,
      size: repo.size,
      default_branch: repo.default_branch,
      topics: repo.topics || [],
      homepage: repo.homepage ?? undefined, 
      html_url: repo.html_url,
      clone_url: repo.clone_url,
      ssh_url: repo.ssh_url,
      created_at: repo.created_at,
      updated_at: repo.updated_at,
      pushed_at: repo.pushed_at,
      is_private: repo.private,
      is_fork: repo.fork,
      is_archived: repo.archived,
      is_disabled: repo.disabled,
    }))
  } catch (error) {
    console.error('Error fetching GitHub repositories:', error)
    throw error
  }
}


