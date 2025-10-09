"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Home, 
  Mail,
  AlertCircle,
  CheckCircle,
  KeyRound
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { showCustomToast } from "@/components/toast-notification"

export function ForgotPasswordForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleHomeClick = () => {
    router.push("/")
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })
      if (error) throw error
      setSuccess(true)
      showCustomToast('success', 'Password reset email sent successfully!')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      showCustomToast('error', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Background Effects */}
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
              RESET PASSWORD
            </h1>
            <p className="text-gray-300 font-mono text-lg mt-2">
              We&apos;ll send you a reset link
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto px-6 py-12">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-md p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="text-red-400" />
            </div>
            <span className="text-red-300 text-sm font-mono">{error}</span>
          </div>
        )}

        {/* Success or Form */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-md overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-slate-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="relative p-8">
            {success ? (
              <div className="text-center space-y-6">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl blur-lg opacity-50"></div>
                  <div className="relative w-full h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                </div>
                
                <div>
                  <h2 className="text-2xl font-blackops text-green-300 mb-2">CHECK YOUR EMAIL</h2>
                  <p className="text-gray-300 font-mono text-sm">Password reset instructions sent</p>
                </div>

                <div className="bg-gray-800/50 border border-gray-700 rounded-md p-6">
                  <p className="text-gray-300 font-mono text-sm leading-relaxed">
                    If you registered using your email and password, you will receive a password reset email shortly.
                  </p>
                </div>

                <button
                  onClick={() => router.push("/auth/login")}
                  className="text-blue-400 hover:text-blue-300 font-mono text-sm transition-colors"
                >
                  ← Back to login
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-slate-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative w-full h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center">
                      <KeyRound className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-blackops text-blue-300 mb-2">FORGOT PASSWORD</h2>
                  <p className="text-gray-300 font-mono text-sm">Enter your email to receive a reset link</p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-gray-200 text-sm font-mono flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 focus:outline-none focus:border-blue-500 font-mono"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-mono font-bold py-4 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Mail className="w-5 h-5" />
                        Send Reset Email
                      </div>
                    )}
                  </button>
                </form>

                <div className="text-center space-y-4 pt-6">
                  <p className="text-gray-400 font-mono text-sm">
                    Already have an account?{" "}
                    <button 
                      onClick={() => router.push("/auth/login")}
                      className="text-blue-400 hover:text-blue-300 font-bold transition-colors"
                    >
                      Login
                    </button>
                  </p>
                  <button
                    onClick={() => router.push("/")}
                    className="text-sm text-gray-500 hover:text-gray-300 font-mono transition-colors"
                  >
                    ← Back to home
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordForm