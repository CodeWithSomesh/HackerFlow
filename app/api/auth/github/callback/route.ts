import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/profile?error=no_code', request.url))
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()
    
    if (tokenData.error) {
      throw new Error(tokenData.error_description || 'Failed to get access token')
    }

    const accessToken = tokenData.access_token

    // Get GitHub user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })

    const githubUser = await userResponse.json()

    // Store in Supabase
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Not authenticated')
    }

    // Update user_profiles table (not hacker_profiles)
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        github_username: githubUser.login,
        github_access_token: accessToken,
        github_connected_at: new Date().toISOString(),
        github_integration_data: githubUser,
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      throw updateError
    }

    // Redirect back to profile
    return NextResponse.redirect(new URL('/profile?github=connected', request.url))
  } catch (error) {
    console.error('GitHub OAuth error:', error)
    return NextResponse.redirect(
      new URL(`/profile?error=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`, request.url)
    )
  }
}