"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Home, 
  Eye, 
  EyeOff,
  AlertCircle,
  Lock,
  ShieldCheck,
  CheckCircle2
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { showCustomToast } from "@/components/toast-notification"
import { triggerStars } from "@/lib/confetti"

export function UpdatePasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Password validation state
  const [validations, setValidations] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  })

  const handleHomeClick = () => {
    router.push("/")
  }

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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    validatePassword(newPassword)
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate password before submission
    if (!validatePassword(password)) {
      const errorMsg = "Password does not meet all requirements"
      setError(errorMsg)
      showCustomToast('error', errorMsg)
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      
      showCustomToast('success', 'Password updated successfully!')
      triggerStars();
      // Update this route to redirect to an authenticated route. The user already has an active session.
      setTimeout(() => {
        router.push("/hackathons")
      }, 1500)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      showCustomToast('error', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const ValidationItem = ({ isValid, text }: { isValid: boolean; text: string }) => (
    <div className="flex items-center gap-2">
      {isValid ? (
        <CheckCircle2 className="w-4 h-4 text-green-400" />
      ) : (
        <div className="w-4 h-4 rounded-full border-2 border-gray-600"></div>
      )}
      <span className={`text-sm font-mono ${isValid ? 'text-green-400' : 'text-gray-400'}`}>
        {text}
      </span>
    </div>
  )

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
              UPDATE PASSWORD
            </h1>
            <p className="text-gray-300 font-mono text-lg mt-2">
              Create a new secure password
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

        {/* Update Password Form */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-md overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-slate-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="relative p-8">
            <div className="text-center mb-6">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-slate-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-full h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-10 h-10 text-white" />
                </div>
              </div>
              
              <h2 className="text-2xl font-blackops text-blue-300 mb-2">RESET YOUR PASSWORD</h2>
              <p className="text-gray-300 font-mono text-sm">Please enter your new password below</p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-2">
                <label className="text-gray-200 text-sm font-mono flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
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

              {/* Password Requirements */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-md p-4 space-y-3">
                <p className="text-gray-200 text-sm font-mono font-bold mb-3">Password Requirements:</p>
                <ValidationItem isValid={validations.minLength} text="At least 8 characters" />
                <ValidationItem isValid={validations.hasUpperCase} text="One uppercase letter (A-Z)" />
                <ValidationItem isValid={validations.hasLowerCase} text="One lowercase letter (a-z)" />
                <ValidationItem isValid={validations.hasNumber} text="One number (0-9)" />
                <ValidationItem isValid={validations.hasSpecialChar} text="One special character (!@#$%^&*)" />
              </div>

              <button
                type="submit"
                disabled={isLoading || !Object.values(validations).every(Boolean)}
                className="w-full bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-mono font-bold py-4 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    Save New Password
                  </div>
                )}
              </button>
            </form>

            <div className="text-center space-y-4 pt-6">
              <button
                onClick={() => router.push("/auth/login")}
                className="text-sm text-gray-500 hover:text-gray-300 font-mono transition-colors"
              >
                ← Back to login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UpdatePasswordForm