"use client"

import { useRouter } from "next/navigation"
import { 
  Home, 
  Mail,
  CheckCircle,
  ArrowRight
} from "lucide-react"

export default function SignUpSuccessPage() {
  const router = useRouter()

  const handleHomeClick = () => {
    router.push("/")
  }

  const handleLoginClick = () => {
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-96 left-2 w-96 h-96 bg-green-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-96 right-2 w-96 h-96 bg-emerald-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r from-green-500/15 via-emerald-500/15 to-teal-500/15 rounded-full blur-3xl"></div>
      </div>

      {/* Home Button */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={handleHomeClick}
          className="backdrop-blur-xl bg-gray-800/50 border border-gray-700 hover:border-green-500/50 text-white rounded-md p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <Home className="w-5 h-5" />
        </button>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-5xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">
              ACCOUNT CREATED
            </h1>
            <p className="text-gray-300 font-mono text-lg mt-2">
              You&apos;re almost there!
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-md overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="relative p-8">
            {/* Success Icon */}
            <div className="text-center mb-8">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative w-full h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <h2 className="text-3xl font-blackops text-green-300 mb-3">THANK YOU FOR SIGNING UP!</h2>
              <p className="text-gray-300 font-mono text-lg">Check your email to confirm your account</p>
            </div>

            {/* Instructions Card */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-md p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-mono font-bold mb-2">Email Confirmation Required</h3>
                  <p className="text-gray-300 font-mono text-sm leading-relaxed">
                    We&apos;ve sent a confirmation email to your inbox. Please click the link in the email to verify your account before signing in.
                  </p>
                </div>
              </div>
            </div>

            {/* What's Next Section */}
            <div className="space-y-4 mb-8">
              <h3 className="text-white font-mono font-bold text-lg">What&apos;s Next?</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-400 font-mono text-xs font-bold">1</span>
                  </div>
                  <p className="text-gray-300 font-mono text-sm">Check your email inbox (and spam folder)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-emerald-400 font-mono text-xs font-bold">2</span>
                  </div>
                  <p className="text-gray-300 font-mono text-sm">Click the confirmation link in the email</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-teal-400 font-mono text-xs font-bold">3</span>
                  </div>
                  <p className="text-gray-300 font-mono text-sm">Sign in and complete your profile setup</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleLoginClick}
                className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white font-mono font-bold py-4 rounded-md hover:opacity-90 transition-opacity"
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Go to Login</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </button>

              <button
                onClick={handleHomeClick}
                className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 hover:border-green-500/50 text-white font-mono py-4 rounded-md transition-all"
              >
                Back to Home
              </button>
            </div>

            {/* Help Text */}
            {/* <div className="mt-8 pt-6 border-t border-gray-700">
              <p className="text-gray-400 font-mono text-sm text-center">
                Didn't receive the email?{" "}
                <button className="text-green-400 hover:text-green-300 font-bold transition-colors">
                  Resend confirmation
                </button>
              </p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  )
}