'use server'

import { createClient } from '@/lib/supabase/server'

export interface GitHubProject {
  id: number
  name: string
  full_name: string
  description?: string
  language?: string
  stars_count: number
  forks_count: number
  watchers_count: number
  open_issues_count: number
  size: number
  default_branch: string
  topics: string[]
  homepage?: string
  html_url: string
  clone_url: string
  ssh_url: string
  created_at: string
  updated_at: string
  pushed_at: string
  is_private: boolean
  is_fork: boolean
  is_archived: boolean
  is_disabled: boolean
}

export interface GitHubStats {
  contributions: number
  repositories: number
  followers: number
  following: number
  stars: number
  contributionGraph: number[][]
}

export interface LanguageStats {
  name: string
  percentage: number
  color: string
}

export interface ContributionStreak {
  current: number
  longest: number
  total: number
}

// Initiate GitHub OAuth flow
export async function connectGitHub() {
  try {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_SITE_URL}/auth/github/callback&scope=repo,user:email,read:user`
    
    return { success: true, authUrl: githubAuthUrl }
  } catch (error) {
    console.error('Error in connectGitHub:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Fetch user's GitHub repositories
export async function fetchGitHubRepositories() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Not authenticated')
    }

    // Get access token from profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('github_access_token, github_username')
      .eq('user_id', user.id)
      .single()

    if (!profile?.github_access_token) {
      throw new Error('GitHub not connected')
    }

    const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        'Authorization': `Bearer ${profile.github_access_token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'HackerFlow-App'
      },
      cache: 'no-store'
    })    

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const repos = await response.json()
    
    return {
      success: true,
      repositories: repos.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        language: repo.language,
        stars_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        watchers_count: repo.watchers_count,
        open_issues_count: repo.open_issues_count,
        size: repo.size,
        default_branch: repo.default_branch,
        topics: repo.topics || [],
        homepage: repo.homepage,
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
    }
  } catch (error) {
    console.error('Error fetching repositories:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function fetchPinnedRepositories() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Not authenticated')
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('github_access_token, github_username')
      .eq('user_id', user.id)
      .single()

    if (!profile?.github_access_token || !profile?.github_username) {
      throw new Error('GitHub not connected')
    }

    // GraphQL query for pinned repositories
    const query = `
      query {
        user(login: "${profile.github_username}") {
          pinnedItems(first: 6, types: REPOSITORY) {
            nodes {
              ... on Repository {
                name
                description
                url
                stargazerCount
                forkCount
                primaryLanguage {
                  name
                  color
                }
              }
            }
          }
        }
      }
    `

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${profile.github_access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
      cache: 'no-store'
    })

    const result = await response.json()

    if (result.errors) {
      console.error('GraphQL errors:', result.errors)
      throw new Error(result.errors[0].message)
    }

    const pinnedRepos = result.data?.user?.pinnedItems?.nodes || []

    return {
      success: true,
      repositories: pinnedRepos.map((repo: any) => ({
        name: repo.name,
        description: repo.description || 'No description',
        language: repo.primaryLanguage?.name || 'Unknown',
        languageColor: repo.primaryLanguage?.color || '#gray',
        stars: repo.stargazerCount,
        forks: repo.forkCount,
        url: repo.url
      }))
    }
  } catch (error) {
    console.error('Error fetching pinned repositories:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Fetch top languages
export async function fetchTopLanguages() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Not authenticated')
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('github_access_token, github_username')
      .eq('user_id', user.id)
      .single()

    if (!profile?.github_access_token || !profile?.github_username) {
      throw new Error('GitHub not connected')
    }

    // Fetch all user repositories
    const reposResponse = await fetch(
      `https://api.github.com/users/${profile.github_username}/repos?per_page=100&type=owner`,
      {
        headers: {
          'Authorization': `Bearer ${profile.github_access_token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
        cache: 'no-store'
      }
    )

    const repos = await reposResponse.json()

    // Calculate language statistics
    const languageBytes: { [key: string]: { bytes: number; color: string } } = {}
    let totalBytes = 0

    // Fetch languages for each repo
    for (const repo of repos) {
      if (repo.fork) continue // Skip forked repos

      const langResponse = await fetch(repo.languages_url, {
        headers: {
          'Authorization': `Bearer ${profile.github_access_token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
        cache: 'no-store'
      })

      const languages = await langResponse.json()

      for (const [lang, bytes] of Object.entries(languages)) {
        const byteCount = bytes as number
        if (!languageBytes[lang]) {
          // Get language color from GitHub's linguist colors
          const colorMap: { [key: string]: string } = {
            'TypeScript': '#3178c6',
            'JavaScript': '#f1e05a',
            'Python': '#3572A5',
            'Java': '#b07219',
            'C++': '#f34b7d',
            'C#': '#178600',
            'Go': '#00ADD8',
            'Rust': '#dea584',
            'PHP': '#4F5D95',
            'Ruby': '#701516',
            'Swift': '#F05138',
            'Kotlin': '#A97BFF',
            'Dart': '#00B4AB',
            'HTML': '#e34c26',
            'CSS': '#563d7c',
          }
          languageBytes[lang] = { 
            bytes: 0, 
            color: colorMap[lang] || '#gray' 
          }
        }
        languageBytes[lang].bytes += byteCount
        totalBytes += byteCount
      }
    }

    // Convert to percentages and sort
    const languageStats: LanguageStats[] = Object.entries(languageBytes)
      .map(([name, data]) => ({
        name,
        percentage: (data.bytes / totalBytes) * 100,
        color: data.color
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 10) // Top 10 languages

    return {
      success: true,
      languages: languageStats
    }
  } catch (error) {
    console.error('Error fetching top languages:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Fetch Github Stats using GraphQL for contribution data
export async function fetchGitHubStats(): Promise<{ success: boolean; stats?: GitHubStats & { streak?: ContributionStreak }; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Not authenticated')
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('github_access_token, github_username')
      .eq('user_id', user.id)
      .single()

    if (!profile?.github_access_token || !profile?.github_username) {
      throw new Error('GitHub not connected')
    }

    // Fetch user data
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${profile.github_access_token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
      cache: 'no-store'
    })

    if (!userResponse.ok) {
      throw new Error(`GitHub API error: ${userResponse.status}`)
    }

    const userData = await userResponse.json()

    // Fetch repositories for star count
    const reposResponse = await fetch(
      `https://api.github.com/users/${profile.github_username}/repos?per_page=100&type=owner`,
      {
        headers: {
          'Authorization': `Bearer ${profile.github_access_token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
        cache: 'no-store'
      }
    )

    if (!reposResponse.ok) {
      throw new Error(`GitHub API error: ${reposResponse.status}`)
    }

    const repos = await reposResponse.json()
    const totalStars = repos
      .filter((repo: any) => !repo.fork)
      .reduce((sum: number, repo: any) => sum + repo.stargazers_count, 0)

    // Get current year and last year for comprehensive data
    const currentYear = new Date().getFullYear()
    const lastYear = currentYear - 1
    
    // GraphQL query for contribution calendar (last 52 weeks)
    const query = `
      query {
        user(login: "${profile.github_username}") {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                }
              }
            }
          }
        }
      }
    `

    const graphqlResponse = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${profile.github_access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
      cache: 'no-store'
    })

    if (!graphqlResponse.ok) {
      throw new Error(`GitHub GraphQL API error: ${graphqlResponse.status}`)
    }

    const graphqlResult = await graphqlResponse.json()
    
    let contributionGraph: number[][] = []
    let totalContributions = 0
    let streakData: ContributionStreak = { current: 0, longest: 0, total: 0 }

    if (graphqlResult.data?.user?.contributionsCollection) {
      const calendar = graphqlResult.data.user.contributionsCollection.contributionCalendar
      totalContributions = calendar.totalContributions

      // Convert weeks to contribution graph
      const allWeeks = calendar.weeks
      contributionGraph = allWeeks.map((week: any) => 
        week.contributionDays.map((day: any) => day.contributionCount)
      )

      // Calculate streaks
      const allDays = allWeeks.flatMap((week: any) => week.contributionDays)
      
      let currentStreak = 0
      let longestStreak = 0
      let tempStreak = 0
      
      // Start from the most recent day (reverse order)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      // Go through days from most recent to oldest
      for (let i = allDays.length - 1; i >= 0; i--) {
        const day = allDays[i]
        const dayDate = new Date(day.date)
        dayDate.setHours(0, 0, 0, 0)
        
        if (day.contributionCount > 0) {
          tempStreak++
          longestStreak = Math.max(longestStreak, tempStreak)
          
          // If this is today or yesterday (allowing for timezone differences), it counts for current streak
          const daysDiff = Math.floor((today.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24))
          if (daysDiff <= 1 && currentStreak === 0) {
            currentStreak = tempStreak
          }
        } else {
          // Only break current streak if we've already started counting it
          if (currentStreak > 0) {
            break
          }
          tempStreak = 0
        }
      }

      streakData = {
        current: currentStreak,
        longest: longestStreak,
        total: totalContributions
      }
    }

    return {
      success: true,
      stats: {
        contributions: totalContributions,
        repositories: userData.public_repos,
        followers: userData.followers,
        following: userData.following,
        stars: totalStars,
        contributionGraph,
        streak: streakData
      }
    }
  } catch (error) {
    console.error('Error fetching GitHub stats:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Save GitHub stats to database
export async function saveGitHubStats(stats: GitHubStats & { streak?: ContributionStreak }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Not authenticated')
    }

    // Upsert GitHub stats
    const { error: statsError } = await supabase
      .from('github_stats')
      .upsert({
        user_id: user.id,
        total_contributions: stats.contributions,
        public_repos: stats.repositories,
        followers: stats.followers,
        following: stats.following,
        total_stars: stats.stars,
        current_streak: stats.streak?.current || 0,
        longest_streak: stats.streak?.longest || 0,
        contribution_graph: stats.contributionGraph,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (statsError) {
      console.error('Error saving GitHub stats:', statsError)
      throw statsError
    }

    return { success: true }
  } catch (error) {
    console.error('Error in saveGitHubStats:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Save GitHub repositories to database
export async function saveGitHubRepositories(repositories: any[]) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Not authenticated')
    }

    // Delete existing repositories for this user
    await supabase
      .from('github_repositories')
      .delete()
      .eq('user_id', user.id)

    // Insert new repositories
    if (repositories.length > 0) {
      const reposToInsert = repositories.map(repo => ({
        user_id: user.id,
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stars_count: repo.stars_count,
        forks_count: repo.forks_count,
        html_url: repo.html_url,
        is_fork: repo.is_fork,
        is_pinned: false, // Will be updated separately
        created_at: repo.created_at,
        updated_at: repo.updated_at
      }))

      const { error: reposError } = await supabase
        .from('github_repositories')
        .insert(reposToInsert)

      if (reposError) {
        console.error('Error saving repositories:', reposError)
        throw reposError
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in saveGitHubRepositories:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Save pinned repositories to database
export async function savePinnedRepositories(pinnedRepos: any[]) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Not authenticated')
    }

    // Mark all repos as not pinned first
    await supabase
      .from('github_repositories')
      .update({ is_pinned: false })
      .eq('user_id', user.id)

    // Update pinned status for pinned repos
    for (const repo of pinnedRepos) {
      await supabase
        .from('github_repositories')
        .update({ is_pinned: true })
        .eq('user_id', user.id)
        .eq('name', repo.name)
    }

    return { success: true }
  } catch (error) {
    console.error('Error in savePinnedRepositories:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Save top languages to database
export async function saveTopLanguages(languages: LanguageStats[]) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Not authenticated')
    }

    // Delete existing languages for this user
    await supabase
      .from('github_languages')
      .delete()
      .eq('user_id', user.id)

    // Insert new languages
    if (languages.length > 0) {
      const langsToInsert = languages.map(lang => ({
        user_id: user.id,
        name: lang.name,
        percentage: lang.percentage,
        color: lang.color
      }))

      const { error: langsError } = await supabase
        .from('github_languages')
        .insert(langsToInsert)

      if (langsError) {
        console.error('Error saving languages:', langsError)
        throw langsError
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in saveTopLanguages:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Disconnect GitHub
export async function disconnectGitHub() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Not authenticated')
    }

    const { error } = await supabase
      .from('user_profiles')
      .update({
        github_username: null,
        github_access_token: null,
        github_connected_at: null,
      })
      .eq('user_id', user.id)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error disconnecting GitHub:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}