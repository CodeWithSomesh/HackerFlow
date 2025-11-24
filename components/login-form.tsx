// "use client";

// import { cn } from "@/lib/utils";
// import { createClient } from "@/lib/supabase/client";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useState } from "react";

// export function LoginForm({
//   className,
//   ...props
// }: React.ComponentPropsWithoutRef<"div">) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const supabase = createClient();
//     setIsLoading(true);
//     setError(null);

//     try {
//       const { error } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//       });
//       if (error) throw error;
      
//       // Get user data to determine user type
//       const { data: { user } } = await supabase.auth.getUser();
//       const userType = user?.user_metadata?.user_primary_type || 'hacker';
      
//       // Redirect based on user type
//       if (userType === 'organizer') {
//         router.push("/onboarding/organizer/profile-setup");
//       } else {
//         router.push("/onboarding/hacker/profile-setup");
//       }
//     } catch (error: unknown) {
//       setError(error instanceof Error ? error.message : "An error occurred");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className={cn("flex flex-col gap-6", className)} {...props}>
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-2xl">Login</CardTitle>
//           <CardDescription>
//             Enter your email below to login to your account
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleLogin}>
//             <div className="flex flex-col gap-6">
//               <div className="grid gap-2">
//                 <Label htmlFor="email">Email</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="m@example.com"
//                   required
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                 />
//               </div>
//               <div className="grid gap-2">
//                 <div className="flex items-center">
//                   <Label htmlFor="password">Password</Label>
//                   <Link
//                     href="/auth/forgot-password"
//                     className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
//                   >
//                     Forgot your password?
//                   </Link>
//                 </div>
//                 <Input
//                   id="password"
//                   type="password"
//                   required
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                 />
//               </div>
//               {error && <p className="text-sm text-red-500">{error}</p>}
//               <Button type="submit" className="w-full" disabled={isLoading}>
//                 {isLoading ? "Logging in..." : "Login"}
//               </Button>
//             </div>
//             <div className="mt-4 text-center text-sm">
//               Don&apos;t have an account?{" "}
//               <Link
//                 href="/auth/sign-up"
//                 className="underline underline-offset-4"
//               >
//                 Sign up
//               </Link>
//             </div>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Home, 
  Eye, 
  EyeOff, 
  LogIn,
  AlertCircle,
  Mail,
  Lock
} from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { Github } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { showCustomToast } from "@/components/toast-notification"

export function LoginForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authMethod, setAuthMethod] = useState<"google" | "github" | null>(null)
  const [error, setError] = useState("")

  const handleHomeClick = () => {
    router.push("/")
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })
      if (error) throw error

      // Get user data to determine user type and check profile completion
      const { data: { user } } = await supabase.auth.getUser()
      console.log(user)

      if (user) {
        // Check if user has a profile record (is registered)
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('id, user_primary_type')
          .eq('user_id', user.id)
          .single()

        const userType = profile?.user_primary_type || user.user_metadata?.user_primary_type || 'hacker'

        if (!profile || profileError) {
          // No profile record - new user, redirect to profile setup
          showCustomToast('info', "Please complete your profile setup")
          if (userType === 'organizer') {
            router.push("/onboarding/organizer/profile-setup")
          } else {
            router.push("/onboarding/hacker/profile-setup")
          }
        } else {
          // Profile exists - already registered, redirect to hackathons
          showCustomToast('success', "Welcome Back!")
          router.push("/hackathons")
        }
      }

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred during sign in")
      showCustomToast('error', "Sign in failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setAuthMethod("google")
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to sign in with Google")
      showCustomToast('error', "Failed to sign in with Google")
      setIsLoading(false)
    }
  }

  const handleGithubSignIn = async () => {
    setAuthMethod("github")
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to sign in with GitHub")
      showCustomToast('error', "Failed to sign in with GitHub")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Background Effects - Neutral colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-96 left-2 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-96 right-2 w-96 h-96 bg-teal-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/15 via-slate-500/15 to-gray-500/15 rounded-full blur-3xl"></div>
      </div>

      {/* Home Button */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={handleHomeClick}
          className="backdrop-blur-xl bg-gray-800/50 border border-gray-700 hover:border-blue-500/50 text-white rounded-md p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <Home className="w-5 h-5" />
        </button>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-5xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-teal-400">
              WELCOME BACK
            </h1>
            <p className="text-gray-300 font-mono text-lg mt-2">
              Login to continue to HackerFlow
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className=" mx-auto max-w-4xl px-6 py-12">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-md p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="text-red-400" />
            </div>
            <span className="text-red-300 text-sm font-mono">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-md overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-slate-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="relative p-8">
            <div className="text-center mb-6">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-slate-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-full h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <LogIn className="w-10 h-10 text-white" />
                </div>
              </div>
              
              <h2 className="text-2xl font-blackops text-blue-300 mb-2">LOGIN</h2>
              <p className="text-gray-300 font-mono text-sm">Access your HackerFlow account</p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-6">
              <div className="space-y-2">
                <label className="text-gray-200 text-sm font-mono flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@example.com"
                  className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 focus:outline-none focus:border-blue-500 font-mono"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-gray-200 text-sm font-mono flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 pr-12 focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center">
                {/* <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-500 bg-gray-900 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-400 text-sm font-mono">Remember me</span>
                </label> */}
                <button
                  type="button"
                  onClick={() => router.push("/auth/forgot-password")}
                  className="text-blue-400 hover:text-blue-300 text-sm font-mono transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading && !authMethod}
                className="w-full bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-mono font-bold py-4 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading && !authMethod ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <LogIn className="w-5 h-5" />
                    Login
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="relative py-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gray-900 px-6 py-2 text-sm text-gray-400 font-mono border border-gray-700 rounded-md">
              or continue with
            </span>
          </div>
        </div>

        {/* Social Auth Options */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 hover:border-blue-500/50 text-white font-mono py-4 rounded-md transition-all hover:shadow-lg hover:shadow-blue-500/10 disabled:opacity-50"
          >
            {isLoading && authMethod === "google" ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                Connecting...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <FcGoogle className="w-5 h-5" />
                Continue with Google
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={handleGithubSignIn}
            disabled={isLoading}
            className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 hover:border-gray-500/50 text-white font-mono py-4 rounded-md transition-all hover:shadow-lg hover:shadow-gray-500/10 disabled:opacity-50"
          >
            {isLoading && authMethod === "github" ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                Connecting...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Github className="w-5 h-5" />
                Continue with GitHub
              </div>
            )}
          </button>
        </div>

        {/* Footer Links */}
        <div className="text-center space-y-4 pt-8">
          <p className="text-gray-400 font-mono text-sm">
            Don&apos;t have an account?{" "}
            <button 
              onClick={() => router.push("/onboarding/user-type")}
              className="text-blue-400 hover:text-blue-300 font-bold transition-colors"
            >
              Sign Up
            </button>
          </p>
          <button
            onClick={() => router.push("/")}
            className="text-sm text-gray-500 hover:text-gray-300 font-mono transition-colors"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
