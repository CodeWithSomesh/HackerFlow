import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  // Support both token_hash and token (some templates/providers use token)
  const token_hash = searchParams.get("token_hash") ?? searchParams.get("token");
  // Supabase default template may send type=email; treat it as signup. If type is missing, assume signup.
  const rawType = searchParams.get("type") ?? undefined;
  const normalizedType = rawType === 'email' ? 'signup' : rawType;
  const type = (normalizedType ?? 'signup') as EmailOtpType | null;
  // Support both next and redirect_to
  // const next = searchParams.get("next") ?? searchParams.get("redirect_to") ?? "/";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      // After email verification, there is no OAuth code to exchange.
      // Determine user type and redirect directly to profile setup.
      const { data: { user } } = await supabase.auth.getUser();
      const userTypeFromQuery = searchParams.get("user_primary_type");
      const userType = (user?.user_metadata?.user_primary_type || userTypeFromQuery || 'hacker') as 'hacker' | 'organizer';

      const redirectPath = userType === 'organizer'
        ? '/onboarding/organizer/profile-setup'
        : '/onboarding/hacker/profile-setup';

      redirect(redirectPath);
    } else {
      // redirect the user to an error page with some instructions
      redirect(`/auth/error?error=${error?.message}`);
    }
  }

  // redirect the user to an error page with some instructions
  redirect(`/auth/error?error=No token hash or type`);
}
