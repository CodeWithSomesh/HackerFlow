import { NextRequest, NextResponse } from 'next/server';
// import { GitHubOAuthService } from '@/lib/services/github-oauth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  
  if (error) {
    return NextResponse.redirect(
      new URL(`/onboarding/hacker/profile-setup?github_error=${encodeURIComponent(error)}`, request.url)
    );
  }
  
  if (!code) {
    return NextResponse.redirect(
      new URL('/onboarding/hacker/profile-setup?github_error=missing_code', request.url)
    );
  }
  
  try {
    // The actual OAuth handling will be done on the client side
    // This endpoint just redirects back with the code
    return NextResponse.redirect(
      new URL(`/onboarding/hacker/profile-setup?github_code=${code}`, request.url)
    );
  } catch (err) {
    console.error('GitHub OAuth callback error:', err);
    return NextResponse.redirect(
      new URL('/onboarding/hacker/profile-setup?github_error=oauth_failed', request.url)
    );
  }
}