"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Home,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Mail,
  Lock
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { showCustomToast } from "@/components/toast-notification"

export default function AdminLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [error, setError] = useState("")

  // Check if user is already logged in when page loads
  useEffect(() => {
    checkExistingSession()
  }, [])

  const checkExistingSession = async () => {
    setIsCheckingSession(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // User is already logged in, check their role
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role, full_name')
          .eq('user_id', user.id)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
          showCustomToast('error', 'Failed to verify admin access. Please try again.')
          setIsCheckingSession(false)
          return
        }

        // Check if user has admin or superadmin role
        if (profile && (profile.role === 'admin' || profile.role === 'superadmin')) {
          showCustomToast('success', `Welcome back, ${profile.full_name || profile.role}!`)
          router.push("/admin/dashboard")
        } else {
          // User is logged in but not an admin
          showCustomToast('error', 'Access denied. Only administrators can access this portal.')
          setTimeout(() => {
            router.push("/")
          }, 2000)
        }
      }
    } catch (error) {
      console.error('Error checking session:', error)
    } finally {
      setIsCheckingSession(false)
    }
  }

  const handleHomeClick = () => {
    router.push("/")
  }

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const supabase = createClient()

      // Sign in with credentials
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })
      if (signInError) throw signInError

      // Get user data
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("User not found")

      // Check if user has admin or superadmin role
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role, full_name')
        .eq('user_id', user.id)
        .single()

      if (profileError) throw profileError

      // Verify admin access
      if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
        // Sign out if not admin
        await supabase.auth.signOut()
        setError("Access denied. Only administrators can access this portal.")
        showCustomToast('error', 'Access denied. Only administrators can access this portal.')
        setTimeout(() => {
          router.push("/")
        }, 2000)
        return
      }

      showCustomToast('success', `Welcome back, ${profile.full_name || profile.role}!`)
      router.push("/admin/dashboard")

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during sign in"
      setError(errorMessage)
      showCustomToast('error', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading screen while checking existing session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-lg opacity-50 animate-pulse"></div>
            <div className="relative w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-white animate-pulse" />
            </div>
          </div>
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-mono text-lg">Checking admin access...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Background Effects - Purple/Pink theme for admin */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-96 left-2 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-96 right-2 w-96 h-96 bg-pink-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/15 via-pink-500/15 to-orange-500/15 rounded-full blur-3xl"></div>
      </div>

      {/* Home Button */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={handleHomeClick}
          className="backdrop-blur-xl bg-gray-800/50 border border-gray-700 hover:border-purple-500/50 text-white rounded-md p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <Home className="w-5 h-5" />
        </button>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-5xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
              ADMIN PORTAL
            </h1>
            <p className="text-gray-300 font-mono text-lg mt-2">
              Authorized Access Only
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-md p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="text-red-400" />
            </div>
            <span className="text-red-300 text-sm font-mono">{error}</span>
          </div>
        )}

        {/* Admin Login Form */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-md overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

          <div className="relative p-8">
            <div className="text-center mb-6">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-10 h-10 text-white" />
                </div>
              </div>

              <h2 className="text-2xl font-blackops text-purple-300 mb-2">ADMIN LOGIN</h2>
              <p className="text-gray-300 font-mono text-sm">Enter your administrator credentials</p>
              <div className="mt-4 bg-cyan-500/10 border border-cyan-500/30 rounded-md p-3">
                <p className="text-cyan-300 font-mono text-xs">
                  💡 Already logged in? Just visit this page and you'll be automatically verified!
                </p>
              </div>
            </div>

            <form onSubmit={handleAdminSignIn} className="space-y-6">
              <div className="space-y-2">
                <label className="text-gray-200 text-sm font-mono flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@hackerflow.com"
                  className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 focus:outline-none focus:border-purple-500 font-mono"
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
                    className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 pr-12 focus:outline-none focus:border-purple-500 font-mono"
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
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-mono font-bold py-4 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Authenticating...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    Access Admin Portal
                  </div>
                )}
              </button>
            </form>

            {/* Warning Notice */}
            <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-md p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-200 font-mono">
                  <p className="font-bold mb-1">Security Notice</p>
                  <p>This portal is restricted to authorized administrators only. All access attempts are logged and monitored.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center space-y-4 pt-8">
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
