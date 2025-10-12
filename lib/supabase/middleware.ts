import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // If the env vars are not set, skip middleware check
  if (!hasEnvVars) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // If user is authenticated and trying to access onboarding, check if they already have a profile
  if (user && request.nextUrl.pathname.startsWith("/onboarding/")) {
    const { data: { user: fullUser } } = await supabase.auth.getUser();
    const userType = fullUser?.user_metadata?.user_primary_type;
    
    // Allow user-type selection page
    if (request.nextUrl.pathname === "/onboarding/user-type") {
      return supabaseResponse;
    }
    
    // Check if user has profile
    if (userType === 'hacker') {
      const { data: profile } = await supabase
        .from('hacker_profiles')
        .select('id')
        .eq('user_id', fullUser?.id)
        .single();
      
      if (profile) {
        // User already has profile, redirect to hackathons
        const url = request.nextUrl.clone();
        url.pathname = "/hackathons";
        url.searchParams.set('toast', 'already_registered');
        return NextResponse.redirect(url);
      }
    } else if (userType === 'organizer') {
      const { data: profile } = await supabase
        .from('organizer_profiles')
        .select('id')
        .eq('user_id', fullUser?.id)
        .single();
      
      if (profile) {
        // User already has profile, redirect to hackathons
        const url = request.nextUrl.clone();
        url.pathname = "/hackathons";
        url.searchParams.set('toast', 'already_registered');
        return NextResponse.redirect(url);
      }
    }
  }

  // Redirect unauthenticated users to onboarding
  if (
    request.nextUrl.pathname !== "/" &&
    !user &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    !request.nextUrl.pathname.startsWith("/onboarding/user-type") &&
    request.nextUrl.pathname !== "/onboarding/hacker/auth" &&
    request.nextUrl.pathname !== "/onboarding/organizer/auth" &&
    !request.nextUrl.pathname.startsWith("/_next") &&
    request.nextUrl.pathname !== "/favicon.ico"
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/onboarding/user-type";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}