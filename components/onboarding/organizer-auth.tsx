"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ProgressIndicator } from "./progress-indicator"
import { AlertCircle, Github, Home, Eye, EyeOff, Users, CheckCircle } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { signInWithGoogleOrganizer, signInWithGithubOrganizer } from "@/app/utils/actions"
import { createClient } from "@/lib/supabase/client"
import { showCustomToast } from "../toast-notification"
import { AuthToastHandler } from "../toasts/auth-toastHandler"

export function OrganizerAuth() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [authMethod, setAuthMethod] = useState<"google" | "github" | "signin" | null>(null)
  const [error, setError] = useState("")
  const [validations, setValidations] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  })
  // const searchParams = useSearchParams()
  // const authType = searchParams.get('authtype')?.toLocaleLowerCase()

  // Check if user is already logged in (regardless of profile completion)
  useEffect(() => {
    const checkExistingUser = async () => {
      try {
        console.log('[Organizer Auth] Starting auth check...')
        const supabase = createClient()
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError) {
          console.log('[Organizer Auth] Error getting user:', userError)
          setIsCheckingAuth(false)
          return
        }

        if (user) {
          console.log('[Organizer Auth] User is logged in, redirecting to hackathons')
          showCustomToast('info', "You're already logged in!")
          router.push('/hackathons')
          return
        } else {
          console.log('[Organizer Auth] No user found, allowing access to auth page')
        }
      } catch (err) {
        console.error('[Organizer Auth] Error in checkExistingUser:', err)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkExistingUser()
  }, [router])

  const validatePassword = (pwd: string) => {
    const newValidations = {
      minLength: pwd.length >= 8,
      hasUpperCase: /[A-Z]/.test(pwd),
      hasLowerCase: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
    }
    setValidations(newValidations)
    return Object.values(newValidations).every(Boolean)
  }

  const handleHomeClick = () => {
    router.push("/")
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
  
    if (!formData.fullName.trim()) {
      setError("Full name is required")
      showCustomToast('error', "Full name is required") 
      return
    }
  
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      showCustomToast('error', "Passwords do not match") 
      return
    }
  
    if (!Object.values(validations).every(Boolean)) {
      setError("Please meet all password requirements")
      showCustomToast('error', "Please meet all password requirements") 
      return
    }
  
    setIsLoading(true)
  
    try {
      const supabase = createClient()
  
      // Attempt to sign up
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?user_primary_type=organizer`,
          data: { user_primary_type: 'organizer', full_name: formData.fullName },
        },
      })
      
      if (error) {
        // Check if error is due to existing user
        if (error.message.includes('already registered') || 
            error.message.includes('already been registered') ||
            error.status === 422) {
          setError("This email is already registered. Please log in instead.")
          showCustomToast('error', "Account already exists. Redirecting to Login Page")
          setTimeout(() => router.push("/auth/login"), 2000)
          return
        }
        throw error
      }
  
      // Check if user already exists (Supabase returns user even if already registered)
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError("This email is already registered. Please log in instead.")
        showCustomToast('error', "Account already exists. Redirecting to Login Page")
        setTimeout(() => router.push("/auth/login"), 2000)
        return
      }
  
      showCustomToast('success', "Account created! Please check your email to verify.")
      router.push("/auth/sign-up-success")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during sign up"
      setError(errorMessage)
      showCustomToast('error', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }


  // const handleEmailSignup = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   setError("")

  //   // Basic validation
  //   if (!formData.fullName.trim()) {
  //     setError("Full name is required")
  //     showCustomToast('error', "Full name is required") 
  //     return
  //   }

  //   if (formData.password !== formData.confirmPassword) {
  //     setError("Passwords do not match")
  //     showCustomToast('error', "Passwords do not match") 
  //     return
  //   }

  //   if (formData.password.length < 8) {
  //     setError("Password must be at least 8 characters long")
  //     showCustomToast('error', "Password must be at least 8 characters long") 
  //     return
  //   }

  //   setIsLoading(true)

  //   try {
  //     const supabase = createClient()
  //     const { error } = await supabase.auth.signUp({
  //       email: formData.email,
  //       password: formData.password,
  //       options: {
  //         emailRedirectTo: `${window.location.origin}/auth/callback?user_primary_type=organizer`,
  //         data: { user_primary_type: "organizer", full_name: formData.fullName },
  //       },
  //     })
  //     if (error) throw error

  //     router.push("/auth/sign-up-success")
  //   } catch (err: unknown) {
  //     setError(err instanceof Error ? err.message : "An error occurred during sign up")
  //     showCustomToast('error', err instanceof Error ? err.message : "An error occurred during sign in") 
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { strength: "weak", color: "bg-red-500" }
    if (password.length < 10) return { strength: "medium", color: "bg-yellow-500" }
    return { strength: "strong", color: "bg-emerald-500" }
  }

  const passwordStrength = getPasswordStrength(formData.password)
  const ValidationItem = ({ isValid, text }: { isValid: boolean; text: string }) => (
    <div className="flex items-center gap-2">
      {isValid ? (
        <CheckCircle className="w-4 h-4 text-green-400" />
      ) : (
        <div className="w-4 h-4 rounded-full border-2 border-gray-600"></div>
      )}
      <span className={`text-xs font-mono ${isValid ? "text-green-400" : "text-gray-400"}`}>
        {text}
      </span>
    </div>
  )

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 font-mono">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
    <AuthToastHandler />
    {/* Background Effects */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute top-96 left-2 w-96 h-96 bg-teal-500 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-96 right-2 w-96 h-96 bg-cyan-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r from-teal-500/15 via-cyan-500/15 to-green-500/15 rounded-full blur-3xl"></div>
    </div>

    {/* Home Button */}
    <div className="fixed top-6 right-6 z-50">
      <button
        onClick={handleHomeClick}
        className="backdrop-blur-xl bg-gray-800/50 border border-gray-700 hover:border-teal-500/50 text-white rounded-md p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      >
        <Home className="w-5 h-5" />
      </button>
    </div>

    {/* Header */}
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-b border-gray-700">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center">
          <h1 className="text-5xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-cyan-500 to-teal-500">
            CREATE YOUR ACCOUNT
          </h1>
          <p className="text-gray-300 font-mono text-lg mt-2">
            Start hosting amazing hackathons
          </p>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-3 pt-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-teal-500 border-2 border-teal-300 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-black" />
              </div>
              <span className="text-gray-400 font-mono text-sm">User Type</span>
            </div>
            <div className="h-px w-12 bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 border-2 border-gray-600 flex items-center justify-center font-bold text-white">
                2
              </div>
              <span className="text-white font-mono text-sm font-bold">Account</span>
            </div>
            <div className="h-px w-12 bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-600 flex items-center justify-center">
                <span className="text-gray-400 font-bold">3</span>
              </div>
              <span className="text-gray-400 font-mono text-sm">Profile</span>
            </div>
          </div>

          {/* Progress Bar Component */}
          <div className="text-center flex mx-auto max-w-2xl mt-6">
            <ProgressIndicator currentStep={2} totalSteps={3} />
          </div>
        </div>
      </div>
    </div>

    {/* Main Content */}
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-md p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="text-red-400" />
          </div>
          <span className="text-red-300 text-sm font-mono">{error}</span>
        </div>
      )}

      {/* Email Form - Primary */}
      <div className="mb-6 bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-teal-500/30 rounded-md overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        <div className="relative p-8">
          {authMethod === "signin" ? (
            /* Sign In Form */
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative w-full h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-blackops text-teal-300 mb-2">SIGN IN</h2>
                <p className="text-gray-300 font-mono text-sm">Welcome back to HackerFlow</p>
              </div>

              <div className="space-y-2">
                <label className="text-gray-200 text-sm font-mono">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@company.com"
                  className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 focus:outline-none focus:border-teal-500 font-mono"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-gray-200 text-sm font-mono">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 pr-12 focus:outline-none focus:border-teal-500 font-mono"
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

              <button
                type="button"
                onClick={handleSignIn}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 via-cyan-500 to-teal-500 text-white font-mono font-bold py-4 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Users className="w-5 h-5" />
                    Sign In
                  </div>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setAuthMethod(null)}
                  className="text-sm text-gray-400 hover:text-gray-300 font-mono transition-colors"
                >
                  ← Back to sign up
                </button>
              </div>
            </div>
          ) : (
            /* Sign Up Form */
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative w-full h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-blackops text-teal-300 mb-2">CREATE ACCOUNT</h2>
                <p className="text-gray-300 font-mono text-sm">Start your journey as an organizer</p>
              </div>

              <div className="space-y-2">
                <label className="text-gray-200 text-sm font-mono">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="John Doe"
                  className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 focus:outline-none focus:border-teal-500 font-mono"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-gray-200 text-sm font-mono">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@company.com"
                  className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 focus:outline-none focus:border-teal-500 font-mono"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-gray-200 text-sm font-mono">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => {
                      const newPassword = e.target.value
                      setFormData({ ...formData, password: newPassword })
                      validatePassword(newPassword)
                    }}
                    placeholder="••••••••••••"
                    className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 pr-12 focus:outline-none focus:border-teal-500 font-mono"
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

                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.color} transition-all duration-500 rounded-full`}
                          style={{
                            width:
                              formData.password.length < 6
                                ? "33%"
                                : formData.password.length < 10
                                  ? "66%"
                                  : "100%",
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 font-mono capitalize min-w-fit">
                        {passwordStrength.strength}
                      </span>
                    </div>
                  </div>
                )}

                {formData.password && (
                  <div className="space-y-4 mt-4 bg-gray-800/40 border border-gray-700 rounded-md p-4">
                    <p className="text-gray-200 text-xs font-mono font-bold">Password Requirements:</p>
                    <ValidationItem isValid={validations.minLength} text="At least 8 characters" />
                    <ValidationItem isValid={validations.hasUpperCase} text="One uppercase letter (A-Z)" />
                    <ValidationItem isValid={validations.hasLowerCase} text="One lowercase letter (a-z)" />
                    <ValidationItem isValid={validations.hasNumber} text="One number (0-9)" />
                    <ValidationItem isValid={validations.hasSpecialChar} text="One special character (!@#$%^&*)" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-gray-200 text-sm font-mono">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 pr-12 focus:outline-none focus:border-teal-500 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
              type="button"
              onClick={handleSignIn}
              disabled={isLoading || !Object.values(validations).every(Boolean)}
              className="w-full bg-gradient-to-r from-green-500 via-cyan-500 to-teal-500 text-white font-mono font-bold py-4 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
                {isLoading && !authMethod ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Users className="w-5 h-5" />
                    Create Account
                  </div>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="relative py-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-gray-900 px-6 py-2 text-sm text-gray-400 font-mono border border-gray-700 rounded-md">
            or sign up with
          </span>
        </div>
      </div>

      {/* Social Auth Options */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={async () => {
            setAuthMethod("google")
            setIsLoading(true)
            await signInWithGoogleOrganizer()
          }}
          disabled={isLoading}
          className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 hover:border-blue-500/50 text-white font-mono py-4 rounded-md transition-all hover:shadow-lg hover:shadow-blue-500/10 disabled:opacity-50"
        >
          <div className="flex items-center justify-center gap-2">
            <FcGoogle className="w-5 h-5" />
            Sign up with Google
          </div>
        </button>

        <button
          type="button"
          onClick={async () => {
            setAuthMethod("github")
            setIsLoading(true)
            await signInWithGithubOrganizer()
          }}
          disabled={isLoading}
          className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 hover:border-gray-500/50 text-white font-mono py-4 rounded-md transition-all hover:shadow-lg hover:shadow-gray-500/10 disabled:opacity-50"
        >
          <div className="flex items-center justify-center gap-2">
            <Github className="w-5 h-5" />
            Sign up with GitHub
          </div>
        </button>
      </div>

      {/* Footer Links */}
      <div className="text-center space-y-4 pt-8">
        <p className="text-gray-400 font-mono text-sm">
          Already have an account?{" "}
          <button 
            onClick={() => router.push("/auth/login")}
            className="text-teal-400 hover:text-teal-300 font-bold transition-colors"
          >
            Log In
          </button>
        </p>
        <button
          onClick={() => router.push("/onboarding/user-type")}
          className="text-sm text-gray-500 hover:text-gray-300 font-mono transition-colors"
        >
          ← Back to user selection
        </button>
      </div>
    </div>
  </div>
  )
}

export default OrganizerAuth