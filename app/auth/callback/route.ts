import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const userType = searchParams.get('user_primary_type') as 'hacker' | 'organizer' | null
  
  console.log('Callback URL:', request.url)
  console.log('User type from URL:', userType)
  
  let next = searchParams.get('next') ?? '/'
  if (!next.startsWith('/')) {
    next = '/'
  }

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      const session = data.session
      
      console.log('User after exchange:', user)
      
      // ============ CRITICAL FIX: Capture GitHub Token ============
      if (user && session && user.app_metadata.provider === 'github') {
        const githubToken = session.provider_token
        
        console.log('GitHub OAuth detected, token:', githubToken ? 'EXISTS' : 'NULL')
        
        if (githubToken) {
          try {
            // Fetch GitHub user data
            const githubResponse = await fetch('https://api.github.com/user', {
              headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
              },
              cache: 'no-store'
            })
            
            if (githubResponse.ok) {
              const githubUser = await githubResponse.json()
              console.log('GitHub user data fetched:', githubUser.login)
              
              // Fetch repositories for skill analysis
              const reposResponse = await fetch('https://api.github.com/user/repos?per_page=50&sort=updated', {
                headers: {
                  'Authorization': `Bearer ${githubToken}`,
                  'Accept': 'application/vnd.github.v3+json',
                },
                cache: 'no-store'
              })
              
              let programmingLanguages: string[] = []
              let frameworks: string[] = []
              
              if (reposResponse.ok) {
                const repos = await reposResponse.json()
                
                // Analyze languages
                const languageCount: { [key: string]: number } = {}
                repos.forEach((repo: any) => {
                  if (repo.language) {
                    languageCount[repo.language] = (languageCount[repo.language] || 0) + 1
                  }
                })
                
                programmingLanguages = Object.entries(languageCount)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .slice(0, 8)
                  .map(([lang]) => lang)
                
                // Detect frameworks from repo names and topics
                const frameworkPatterns: { [key: string]: RegExp[] } = {
                  'React': [/react/i, /jsx/i],
                  'Vue': [/vue/i],
                  'Angular': [/angular/i],
                  'Node.js': [/node/i, /express/i],
                  'Django': [/django/i],
                  'Flask': [/flask/i],
                  'Spring': [/spring/i],
                  'Docker': [/docker/i],
                  'Next.js': [/next/i, /nextjs/i],
                }
                
                const frameworkSet = new Set<string>()
                repos.forEach((repo: any) => {
                  const searchText = `${repo.name} ${repo.description || ''} ${repo.topics?.join(' ') || ''}`.toLowerCase()
                  Object.entries(frameworkPatterns).forEach(([framework, patterns]) => {
                    if (patterns.some(pattern => pattern.test(searchText))) {
                      frameworkSet.add(framework)
                    }
                  })
                })
                
                frameworks = Array.from(frameworkSet).slice(0, 6)
              }
              
              // Save to database immediately
              const { error: updateError } = await supabase
                .from('user_profiles')
                .upsert({
                  user_id: user.id,
                  email: user.email,
                  user_primary_type: userType || 'hacker',
                  full_name: '',
                  github_username: githubUser.login,
                  github_access_token: githubToken,
                  github_connected_at: new Date().toISOString(),
                  github_repos_count: githubUser.public_repos || 0,
                  programming_languages: programmingLanguages,
                  frameworks: frameworks,
                }, { 
                  onConflict: 'user_id',
                  ignoreDuplicates: false 
                })
              
              if (updateError) {
                console.error('Failed to save GitHub token to database:', updateError)
              } else {
                console.log('✅ GitHub token and data saved to database successfully')

                // ✅ ADD THIS: Pass token via URL so profile setup can access it
                // if (!hasProfile) {
                //   redirectPath = redirectPath + `&github_token=${encodeURIComponent(githubToken)}`
                // }
              }
            }
          } catch (fetchError) {
            console.error('Failed to fetch GitHub user data:', fetchError)
          }
        }
      }
      // ============ END CRITICAL FIX ============
      
      // Determine if this is a new OAuth user (first time signing in)
      const isNewUser = data.user?.identities && data.user.identities.length > 0 && 
                        data.user.identities[0].created_at === data.user.created_at
      
      console.log('Is new user:', isNewUser)
      
      // Update user metadata with user type if not already set
      if (user && userType && !user.user_metadata?.user_primary_type) {
        await supabase.auth.updateUser({
          data: { user_primary_type: userType }
        })
        console.log('Updated user metadata with user_primary_type:', userType)
      }
      
      const finalUserType = userType || user?.user_metadata?.user_primary_type || 'hacker'
      console.log('Final user type for redirect:', finalUserType)
      
      // Check if profile exists
      let hasProfile = false
      let redirectPath = '/hackathons'

      if (user) {
        // Check user_profiles table
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id, full_name')
          .eq('user_id', user.id)
          .single()
        
        // Profile is complete if full_name exists AND is not empty
        hasProfile = !!(profile && profile.full_name && profile.full_name.trim() !== '')
        console.log('Profile exists and complete:', hasProfile)
        
        if (finalUserType === 'hacker') {
          console.log('Hacker profile check - hasProfile:', hasProfile, 'isNewUser:', isNewUser)
          
          // CRITICAL FIX: Always redirect to profile setup if profile is incomplete
          if (!hasProfile) {
            // Profile doesn't exist or is incomplete - go to setup
            redirectPath = '/onboarding/hacker/profile-setup?toast=complete_profile'
          } else {
            // Profile is complete - go to hackathons
            redirectPath = '/hackathons?toast=login_success'
          }
        } else if (finalUserType === 'organizer') {
          console.log('Organizer profile check - hasProfile:', hasProfile, 'isNewUser:', isNewUser)
          
          // Same logic for organizers
          if (!hasProfile) {
            redirectPath = '/onboarding/organizer/profile-setup?toast=complete_profile'
          } else {
            redirectPath = '/hackathons?toast=login_success'
          }
        }
      }
      
      console.log('Redirecting to:', redirectPath)
      
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectPath}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`)
      } else {
        return NextResponse.redirect(`${origin}${redirectPath}`)
      }
    } else {
      console.error('Auth callback error:', error)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}