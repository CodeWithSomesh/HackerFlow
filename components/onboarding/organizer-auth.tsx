"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgressIndicator } from "./progress-indicator"
import { AlertCircle, Github, Home, Mail, Eye, EyeOff, Users } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { signInWithGoogleOrganizer, signInWithGithubOrganizer } from "@/app/utils/actions"
import { createClient } from "@/lib/supabase/client"

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
  const [authMethod, setAuthMethod] = useState<"google" | "github" | null>(null)
  const [error, setError] = useState("")

  const handleHomeClick = () => {
    router.push("/")
  }


  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Basic validation
    if (!formData.fullName.trim()) {
      setError("Full name is required")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?user_type=organizer`,
          data: { user_type: "organizer", full_name: formData.fullName },
        },
      })
      if (error) throw error

      router.push("/auth/sign-up-success")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred during sign up")
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { strength: "weak", color: "bg-red-500" }
    if (password.length < 10) return { strength: "medium", color: "bg-yellow-500" }
    return { strength: "strong", color: "bg-emerald-500" }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  return (
    <div className="min-h-screen flex items-center justify-center p-4 ">
      {/* Home Button - Floating in top right */}
      <div className="fixed top-6 right-6 z-50">
        <Button
          onClick={handleHomeClick}
          className="group relative backdrop-blur-xl bg-slate-800/30 border border-white hover:border-slate-500/50 text-white hover:text-white rounded-2xl p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          size="sm"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-green-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Home className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
          <span className="s-only">Go to Home</span>
        </Button>
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-3xl mx-auto mt-16">
        {/* Progress Indicator */}
        <div className="mb-8">
          <ProgressIndicator currentStep={2} totalSteps={3} />
        </div>

        {/* Main Card */}
        <Card className="backdrop-blur-xl bg-slate-800/50 border-2 border-slate-400 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            {/* Icon with glow effect */}
            <div className="relative mx-auto w-16 h-16 mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl blur-md opacity-75"></div>
              <div className="relative w-full h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-green-400 bg-clip-text text-transparent">
                Create Your Organizer Account
              </h1>
              <p className="text-slate-400 text-sm">Start hosting amazing hackathons</p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl flex items-center gap-3 backdrop-blur-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Email Form - Primary */}
            <form onSubmit={handleEmailSignup} className="space-y-4">
              {/* Full Name Field */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-slate-300 font-medium text-sm">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="John Doe"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-lg h-12 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 font-medium text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@company.com"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-lg h-12 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300 font-medium text-sm">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-lg h-12 pr-12 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-600/50 rounded-lg"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
                  </Button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
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
                      <span className="text-xs text-slate-400 capitalize font-medium min-w-fit">
                        {passwordStrength.strength}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-300 font-medium text-sm">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-lg h-12 pr-12 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-600/50 rounded-lg"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading && !authMethod}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold h-12 rounded-lg shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 mt-6"
              >
                {isLoading && !authMethod ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-slate-800 px-4 py-1 text-xs text-slate-400 rounded-full border border-slate-700/50 backdrop-blur-sm">
                  OR SIGN UP WITH
                </span>
              </div>
            </div>

            {/* Social Auth Options */}
            <div className="grid grid-cols-2 gap-4">
              {/* Google Auth */}
              <form action={signInWithGoogleOrganizer}>
                <Button
                  type="submit"
                  variant="outline"
                  disabled={isLoading}
                  className="border border-slate-600 hover:border-slate-500 hover:bg-slate-700/50 h-12 rounded-lg backdrop-blur-sm transition-all duration-300 group"
                >
                  {isLoading && authMethod === "google" ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FcGoogle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  )}
                </Button>
              </form>

              {/* GitHub Auth */}
              <form action={signInWithGithubOrganizer}>
                <Button
                  type="submit"
                  variant="outline"
                  disabled={isLoading}
                  className="border border-slate-600 hover:border-slate-500 hover:bg-slate-700/50 h-12 rounded-lg backdrop-blur-sm transition-all duration-300 group"
                >
                  {isLoading && authMethod === "github" ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Github className="w-5 h-5 text-slate-400 group-hover:scale-110 transition-transform" />
                  )}
                </Button>
              </form>
            </div>

            {/* Footer Links */}
            <div className="text-center space-y-3 pt-4">
              <p className="text-slate-400 text-sm">
                Already have an account?{" "}
                <button className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                  Sign in
                </button>
              </p>
              <button
                onClick={() => router.push("/onboarding/user-type")}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                ← Back to user selection
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default OrganizerAuth