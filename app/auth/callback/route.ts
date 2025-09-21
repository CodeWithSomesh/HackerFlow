import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const userType = searchParams.get('user_type') as 'hacker' | 'organizer' | null
  
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
      if (user && userType && !user.user_metadata?.user_type) {
        await supabase.auth.updateUser({
          data: { user_type: userType }
        })
        console.log('Updated user metadata with user_type:', userType)
      }
      
      // Determine redirect path based on user type from URL params or user metadata
      const finalUserType = userType || user?.user_metadata?.user_type || 'hacker'
      console.log('Final user type for redirect:', finalUserType)
      
      const redirectPath = finalUserType === 'organizer' 
        ? '/onboarding/organizer/profile-setup' 
        : '/onboarding/hacker/profile-setup'
        
      console.log('Redirecting to:', redirectPath)
      
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      console.log('Redirect details:', { origin, forwardedHost, isLocalEnv, redirectPath })
      
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
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