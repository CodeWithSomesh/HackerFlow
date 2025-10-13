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
      
      console.log('User after exchange:', user)
      
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
        if (finalUserType === 'hacker') {
          const { data: profile } = await supabase
            .from('hacker_profiles')
            .select('id')
            .eq('user_id', user.id)
            .single()
          
          hasProfile = !!profile
          console.log('Hacker profile exists:', hasProfile)
          
          // Redirect based on profile existence
          if (!hasProfile && isNewUser) {
            redirectPath = '/onboarding/hacker/profile-setup?toast=welcome'
          } else if (hasProfile) {
            redirectPath = '/hackathons?toast=login_success'
          } else {
            // Existing user but no profile (edge case)
            redirectPath = '/onboarding/hacker/profile-setup?toast=complete_profile'
          }
        } else if (finalUserType === 'organizer') {
          const { data: profile } = await supabase
            .from('organizer_profiles')
            .select('id')
            .eq('user_id', user.id)
            .single()
          
          hasProfile = !!profile
          console.log('Organizer profile exists:', hasProfile)
          
          // Redirect based on profile existence
          if (!hasProfile && isNewUser) {
            redirectPath = '/onboarding/organizer/profile-setup?toast=welcome'
          } else if (hasProfile) {
            redirectPath = '/hackathons?toast=login_success'
          } else {
            // Existing user but no profile (edge case)
            redirectPath = '/onboarding/organizer/profile-setup?toast=complete_profile'
          }
        }
      }
      
      console.log('Profile exists:', hasProfile)
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