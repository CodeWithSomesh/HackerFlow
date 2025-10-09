import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const userType = searchParams.get('user_primary_type') as 'hacker' | 'organizer' | null
  
  // Debug logging
  console.log('Callback URL:', request.url)
  console.log('User type from URL:', userType)
  console.log('All search params:', Object.fromEntries(searchParams.entries()))
  
  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? '/'
  if (!next.startsWith('/')) {
    // if "next" is not a relative URL, use the default
    next = '/'
  }

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    console.log('Exchange code result:', { data, error })
    
    if (!error) {
      // Get user info
      const { data: { user } } = await supabase.auth.getUser()
      
      console.log('User after exchange:', user)
      console.log('User metadata before update:', user?.user_metadata)
      
      // Update user metadata with user type if not already set
      if (user && userType && !user.user_metadata?.user_primary_type) {
        await supabase.auth.updateUser({
          data: { user_primary_type: userType }
        })
        console.log('Updated user metadata with user_primary_type:', userType)
      }
      
      // Determine the final user type
      const finalUserType = userType || user?.user_metadata?.user_primary_type || 'hacker'
      console.log('Final user type for redirect:', finalUserType)
      
      // Check if profile exists
      let hasProfile = false
      let redirectPath = '/hackathons' // Default for users with profiles
      
      if (user) {
        if (finalUserType === 'hacker') {
          const { data: profile } = await supabase
            .from('hacker_profiles')
            .select('id')
            .eq('user_id', user.id)
            .single()
          
          hasProfile = !!profile
          console.log('Hacker profile exists:', hasProfile)
          
          if (!hasProfile) {
            redirectPath = '/onboarding/hacker/profile-setup'
          }
        } else if (finalUserType === 'organizer') {
          const { data: profile } = await supabase
            .from('organizer_profiles')
            .select('id')
            .eq('user_id', user.id)
            .single()
          
          hasProfile = !!profile
          console.log('Organizer profile exists:', hasProfile)
          
          if (!hasProfile) {
            redirectPath = '/onboarding/organizer/profile-setup'
          }
        }
      }
      
      console.log('Profile exists:', hasProfile)
      console.log('Redirecting to:', redirectPath)
      
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      console.log('Redirect details:', { origin, forwardedHost, isLocalEnv, redirectPath })
      
      if (isLocalEnv) {
        const redirectUrl = `${origin}${redirectPath}`
        console.log('Redirecting to (local):', redirectUrl)
        return NextResponse.redirect(redirectUrl)
      } else if (forwardedHost) {
        const redirectUrl = `https://${forwardedHost}${redirectPath}`
        console.log('Redirecting to (forwarded):', redirectUrl)
        return NextResponse.redirect(redirectUrl)
      } else {
        const redirectUrl = `${origin}${redirectPath}`
        console.log('Redirecting to (fallback):', redirectUrl)
        return NextResponse.redirect(redirectUrl)
      }
    } else {
      console.error('Auth callback error:', error)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/error`)
}