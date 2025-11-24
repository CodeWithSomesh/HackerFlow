"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { saveHackerProfile, saveGitHubProjects, testDatabaseConnection } from "@/lib/actions/profile-actions"
// import { getMockGitHubRepositories, analyzeGitHubRepositories } from "@/lib/utils/github-utils"
import { GitHubProject } from "@/lib/actions/profile-actions"
import { ProgressIndicator } from "./progress-indicator"
import { 
  Github, 
  CheckCircle, 
  Loader2, 
  Code2, 
  Users, 
  GraduationCap, 
  Briefcase,
  Link,
  Twitter,
  Linkedin,
  Globe,
  Instagram,
  Sparkles,
  AlertCircle,
  TriangleAlert
} from "lucide-react"
import { useGitHubIntegration } from "@/hooks/useGitHubIntegration"
import { createClient } from '@/lib/supabase/client';
// import toast from "react-hot-toast"
import { showCustomToast } from "@/components/toast-notification"
import { triggerSideCannons, 
  // triggerFireworks, triggerCustomShapes, triggerEmoji, triggerStars 
} from "@/lib/confetti"
import type { User } from "@supabase/supabase-js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProfileSetupToastHandler } from "../toasts/profileSetup-toastHandler"


export function HackerProfileSetup() {
  const router = useRouter()

  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false)
  const [githubConnected, setGithubConnected] = useState(false)
  // const [githubAnalyzing, setGithubAnalyzing] = useState(false)
  // const [showGithubProjects, setShowGithubProjects] = useState(false)
  // const [selectedProjects, _setSelectedProjects] = useState<number[]>([])
  const [githubRepositories, setGithubRepositories] = useState<GitHubProject[]>([])
  const [error, setError] = useState<string | null>(null)
  const [userAuthMethod, setUserAuthMethod] = useState<string | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    profileType: "student", // "student" or "working"
    city: "",
    state: "",
    country: "Malaysia",
    
    // Student fields
    university: "",
    course: "",
    yearOfStudy: "",
    graduationYear: "",
    
    // Working professional fields
    company: "",
    position: "",
    workExperience: "",
    
    // Work experience for both - CHANGED TO ARRAY
    hasWorkExperience: false,
    workExperiences: [] as Array<{
      id: string;
      company: string;
      position: string;
      duration: string;
      description: string;
      isInternship: boolean;
    }>, // Array of work experience objects
    
    // Technical skills - ADDED otherSkills
    programmingLanguages: [] as string[],
    frameworks: [] as string[],
    otherSkills: [] as string[], // NEW
    experienceLevel: "",
    
    // Social links
    githubUsername: "",
    linkedinUrl: "",
    twitterUsername: "",
    portfolioUrl: "",
    instagramUsername: "",
    
    // Other
    openToRecruitment: false,
  })

  // Check if all required fields are filled
  useEffect(() => {
    const requiredFieldsFilled = 
      formData.fullName.trim() !== '' &&
      formData.profileType !== '' &&
      formData.city.trim() !== '' &&
      formData.state.trim() !== '' &&
      (formData.profileType === 'student' 
        ? formData.university?.trim() !== '' && formData.course?.trim() !== ''
        : formData.company?.trim() !== '' && formData.position?.trim() !== '') &&
      formData.programmingLanguages.length > 0;
    
    setIsProfileComplete(requiredFieldsFilled)
  }, [formData])

  // Prevent browser back/close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isProfileComplete) {
        e.preventDefault()
        e.returnValue = 'Please complete your profile registration before leaving.'
        return 'Please complete your profile registration before leaving.'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isProfileComplete])

  // Prevent browser back button
  useEffect(() => {
    if (!isProfileComplete) {
      window.history.pushState(null, '', window.location.href)
      
      const handlePopState = () => {
        window.history.pushState(null, '', window.location.href)
        showCustomToast('warning', 'Please complete your profile registration before leaving this page.')
      }

      window.addEventListener('popstate', handlePopState)
      return () => window.removeEventListener('popstate', handlePopState)
    }
  }, [isProfileComplete])
  
  // Add this authentication check at the top of your component
  useEffect(() => {
    const checkAndSetupAuth = async () => {
      const supabase = createClient();
      
      try {
        // First check if we have a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          router.push('/auth/login');
          return;
        }

        if (!session) {
          console.log('No session found, redirecting to signin');
          router.push('/auth/login');
          return;
        }

        // If we have a session, get the user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('User error:', userError);
          router.push('/auth/login');
          return;
        }

        console.log('User authenticated successfully:', user.id);
        setUser(user);
        
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth/login');
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkAndSetupAuth();
  }, [router]);

  useEffect(() => {
    // Check how the user signed up
    const checkUserAuthMethod = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check the auth provider used for signup
        const authProvider = user.app_metadata?.provider || 'email';
        setUserAuthMethod(authProvider);
        
        // If user signed up with GitHub, auto-populate GitHub username
        if (authProvider === 'github') {
          const githubUsername = user.user_metadata?.user_name || user.user_metadata?.preferred_username;
          if (githubUsername) {
            setFormData(prev => ({
              ...prev,
              githubUsername: githubUsername
            }));
          }
        }
      }
    };
    
    checkUserAuthMethod();
  }, []);

  // Add this useEffect to handle OAuth callback
  useEffect(() => {
    if (!user) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('github_code');
    const error = urlParams.get('github_error');
    
    console.log('OAuth callback detected:', { code, error });
    
    if (error) {
      showCustomToast('error', `GitHub connection failed: ${error}`)
      setError(`GitHub connection failed: ${error}`);
      return;
    }
    
    if (code) {
      console.log('Processing GitHub OAuth code:', code);
      handleOAuthCallback(code).then((data) => {
        console.log('GitHub integration successful:', data);
        
        // FIXED: Store in state AND localStorage for persistence
        const githubToken = data.accessToken; // Make sure your handleOAuthCallback returns this
        const githubUser = data.user;
        
        // Store in localStorage for handleSubmit to access
        localStorage.setItem('github_access_token', githubToken);
        localStorage.setItem('github_user', JSON.stringify(githubUser));
        
        // Update form with GitHub data
        setFormData(prev => ({
          ...prev,
          githubUsername: data.user.login,
          fullName: prev.fullName || data.user.name || '',
          bio: prev.bio || data.user.bio || '',
          programmingLanguages: data.skills.programmingLanguages,
          frameworks: data.skills.frameworks,
        }));
        
        // Convert GitHub repos to your format
        const convertedRepos = data.repositories.map(repo => ({
          id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description || '',
          language: repo.language || 'Unknown',
          stars_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          watchers_count: repo.watchers_count,
          open_issues_count: repo.open_issues_count,
          size: repo.size,
          default_branch: repo.default_branch,
          topics: repo.topics || [],
          homepage: repo.homepage,
          html_url: repo.html_url,
          clone_url: repo.clone_url,
          ssh_url: repo.ssh_url,
          created_at: repo.created_at,
          updated_at: repo.updated_at,
          pushed_at: repo.pushed_at,
          is_private: repo.private,
          is_fork: repo.fork,
          is_archived: repo.archived,
          is_disabled: repo.disabled,
        }));
        
        setGithubRepositories(convertedRepos);
        setGithubConnected(true);
        
        console.log('GitHub data processed:', { 
          repositories: convertedRepos.length, 
          skills: data.skills,
          connected: true 
        });
        
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
      }).catch((err) => {
        console.error('GitHub integration failed:', err);
        showCustomToast('error', `GitHub integration failed: ${err.message}`)
        setError(`GitHub integration failed: ${err.message}`);
      });
    }
  }, [user]);

  useEffect(() => {
    testDatabaseConnection();
  }, []);

  // Check if user is already registered (has a profile record) and redirect if so
  useEffect(() => {
    const checkProfileExists = async () => {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        console.log('No authenticated user, redirecting to Login Page');
        router.push('/auth/login');
        return;
      }

      // Check if profile record exists (user is already registered)
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      // If profile exists, user is already registered - redirect to hackathons
      if (profile && !profileError) {
        console.log('User already registered, redirecting to hackathons');
        showCustomToast('info', "You're already registered!");
        router.push('/hackathons');
        return;
      }

      console.log('New user - allowing access to profile setup');
    };

    checkProfileExists();
  }, [router]);

  // GitHub integration hook
  const { isConnecting, isAnalyzing, 
    // error: githubError, data: githubData, 
    connectGitHub, handleOAuthCallback } = useGitHubIntegration();

  // Show loading while checking auth
  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Checking authentication...</div>
      </div>
    );
  }

  // Don't render the form if no user
  if (!user) {
    return null;
  }
  
  
  

  // Remove mock data - we'll use real GitHub data

  // useEffect(() => {
  //   // Check if user signed up with GitHub
  //   const authMethod = localStorage.getItem("authMethod")
  //   if (authMethod === "github") {
  //     handleConnectGitHub()
  //   }
  // }, [])

  

  

  // Replace your handleConnectGitHub function with:
  const handleConnectGitHub = () => {
    connectGitHub();
  };

  const programmingLanguages = [
    "JavaScript", "Python", "Java", "C++", "C#", "Go", "Rust", "TypeScript", 
    "PHP", "Swift", "Kotlin", "Dart", "Ruby", "C", "Scala", "R"
  ]

  const frameworks = [
    "React", "Vue", "Angular", "Node.js", "Django", "Flask", "Spring", "Docker", 
    "Kubernetes", "Next.js", "Express", "FastAPI", "Laravel", "Rails", "Flutter", 
    "React Native", "TensorFlow", "PyTorch"
  ]

  const otherSkills = [
    "UI/UX Design", "Graphic Design", "Video Editing", "Photo Editing", "Figma", 
    "Adobe Creative Suite", "Sketch", "Webflow", "WordPress", "Squarespace", 
    "3D Modeling", "Animation", "Sound Design", "Music Production", "Digital Marketing", 
    "Content Writing", "Technical Writing", "SEO", "Social Media Marketing", 
    "Project Management", "Agile/Scrum", "Data Analysis", "Business Analysis", 
    "Product Management", "Public Speaking", "Teaching/Mentoring"
  ]

  const addWorkExperience = () => {
    setFormData(prev => ({
      ...prev,
      workExperiences: [...prev.workExperiences, {
        id: Date.now().toString(),
        company: "",
        position: "",
        duration: "",
        description: "",
        isInternship: false
      }]
    }))
  }
  
  const updateWorkExperience = (id: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      workExperiences: prev.workExperiences.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }))
  }
  
  const removeWorkExperience = (id: string) => {
    setFormData(prev => ({
      ...prev,
      workExperiences: prev.workExperiences.filter(exp => exp.id !== id)
    }))
  }

  // const handleHomeClick = () => {
  //   router.push("/")
  // }

  const handleSkillToggle = (
    skill: string,
    category: "programmingLanguages" | "frameworks" | "otherSkills", // ADDED otherSkills
  ) => {
    setFormData((prev) => ({
      ...prev,
      [category]: prev[category].includes(skill)
        ? prev[category].filter((s) => s !== skill)
        : [...prev[category], skill],
    }))
  }

  // const handleProjectToggle = (projectId: number) => {
  //   setSelectedProjects(prev => 
  //     prev.includes(projectId) 
  //       ? prev.filter(id => id !== projectId)
  //       : [...prev, projectId]
  //   )
  // }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
  
    // Basic validation
    if (!formData.fullName || !formData.profileType || !formData.city || !formData.state) {
      showCustomToast('error', 'Please fill in all required fields (Name, Profile Type, City, State)')
      setError('Please fill in all required fields (Name, Profile Type, City, State)')
      setIsLoading(false)
      return
    }
  
    // Profile type specific validation
    if (formData.profileType === 'student') {
      if (!formData.university || !formData.course || !formData.yearOfStudy || !formData.graduationYear) {
        showCustomToast('error', 'Please fill in all required academic information')
        setError('Please fill in all required academic information')
        setIsLoading(false)
        return
      }
    } else if (formData.profileType === 'working') {
      if (!formData.company || !formData.position || !formData.workExperience) {
        showCustomToast('error', 'Please fill in all required professional information')
        setError('Please fill in all required professional information')
        setIsLoading(false)
        return
      }
    }
  
    try {
      // Get GitHub data from localStorage
      const githubToken = localStorage.getItem('github_access_token');
      const githubUserDataStr = localStorage.getItem('github_user');
      const githubUserData = githubUserDataStr ? JSON.parse(githubUserDataStr) : null;
      
      // ADD THIS DEBUGGING
      console.log('=== GITHUB DATA DEBUG ===');
      console.log('Token from localStorage:', githubToken);
      console.log('User data from localStorage:', githubUserData);
      console.log('GitHub connected state:', githubConnected);
      console.log('Form githubUsername:', formData.githubUsername);
      console.log('========================');
      
      // Save profile data - pass GitHub token if available
      const result = await saveHackerProfile(
        formData,
      )
      
      console.log('=== SAVE RESULT ===');
      console.log('Result:', result);
      console.log('==================');
      
      if (!result.success) {
        showCustomToast('error', "Failed To Create Your Profile")
        throw new Error(result.error || 'Failed to save profile')
      }
  
      setIsProfileComplete(true)
  
      // Save GitHub projects if connected
      if (githubConnected && githubRepositories.length > 0) {
        const githubResult = await saveGitHubProjects(githubRepositories, [])
        
        if (!githubResult.success) {
          console.error('Failed to save GitHub projects:', githubResult.error)
        }
      }
      
      // Clear localStorage after successful save
      if (githubToken) {
        localStorage.removeItem('github_access_token');
        localStorage.removeItem('github_user');
      }
      
      showCustomToast('success', "Successfully Created Your Profile!")
      triggerSideCannons();
      router.push("/hackathons")
    } catch (err) {
      console.error('Error saving profile:', err)
      showCustomToast('error', "Failed To Create Your Profile")
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setIsLoading(false)
    }
  }        

  return (
    <div className="min-h-screen">
      <ProfileSetupToastHandler />
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-96 left-2 w-96 h-96 bg-pink-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-pink-500/15 to-purple-500/15 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-5xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-400 to-yellow-500">
              HACKER PROFILE SETUP
            </h1>
            <p className="text-gray-300 font-mono text-lg mt-2">
              Build your profile to find the perfect hackathon team
            </p>
            
            {/* Progress Indicator */}
            <div className="flex items-center justify-center gap-3 pt-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-pink-500 border-2 border-pink-300 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-black" />
                </div>
                <span className="text-gray-400 font-mono text-sm">Account</span>
              </div>
              <div className="h-px w-12 bg-gray-600"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-pink-500 border-2 border-pink-300 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-black" />
                </div>
                <span className="text-gray-400 font-mono text-sm">Role</span>
              </div>
              <div className="h-px w-12 bg-gray-600"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-pink-500 border-2 border-pink-300 flex items-center justify-center font-bold text-black">
                  3
                </div>
                <span className="text-white font-mono text-sm font-bold">Profile</span>
              </div>
            </div>

            <div className="text-center flex mx-auto max-w-2xl mt-8">
              <ProgressIndicator currentStep={3} totalSteps={3} />
            </div>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <TriangleAlert className="text-yellow-400" />
          </div>
          <p className="text-yellow-300 text-sm font-mono">
            Complete all required fields (*) before leaving this page to ensure your account is properly set up.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-md p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="text-red-400" />
              </div>
              <span className="text-red-300 text-sm font-mono">{error}</span>
            </div>
          )}


          {/* Basic Information */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-md">
        <div className="px-8 py-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Users className="w-7 h-7 text-pink-400" />
            <h2 className="text-2xl font-bold text-white" style={{fontFamily: 'monospace'}}>BASIC INFORMATION</h2>
          </div>
        </div>
        
        <div className="px-8 py-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-gray-200 text-sm" style={{fontFamily: 'monospace'}}>Full Name *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                placeholder="John Doe"
                className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 focus:outline-none focus:border-pink-500"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-gray-200 text-sm" style={{fontFamily: 'monospace'}}>I am a *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, profileType: "student"})}
                  className={`flex items-center gap-2 p-3 rounded-md border transition-colors ${
                    formData.profileType === "student"
                      ? 'border-pink-400 bg-pink-500/10'
                      : 'border-gray-700 bg-gray-900/40 hover:bg-gray-800/40'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-pink-400" />
                  <span className="text-white text-sm" style={{fontFamily: 'monospace'}}>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, profileType: "working"})}
                  className={`flex items-center gap-2 p-3 rounded-md border transition-colors ${
                    formData.profileType === "working"
                      ? 'border-purple-400 bg-purple-500/10'
                      : 'border-gray-700 bg-gray-900/40 hover:bg-gray-800/40'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-purple-400" />
                  <span className="text-white text-sm" style={{fontFamily: 'monospace'}}>Working</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-gray-200 text-sm" style={{fontFamily: 'monospace'}}>City *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                placeholder="Kuala Lumpur"
                className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 focus:outline-none focus:border-pink-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-gray-200 text-sm" style={{fontFamily: 'monospace'}}>State *</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
                placeholder="Selangor"
                className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 focus:outline-none focus:border-pink-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-gray-200 text-sm" style={{fontFamily: 'monospace'}}>Country</label>
              <input
                type="text"
                value={formData.country}
                readOnly
                className="w-full bg-gray-800 border border-gray-700 text-gray-400 rounded-md px-4 py-3"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-gray-200 text-sm" style={{fontFamily: 'monospace'}}>Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              placeholder="Tell us about yourself, your interests, and what you love building..."
              className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 resize-none focus:outline-none focus:border-pink-500"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Academic/Professional Information */}
      {formData.profileType && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-md">
          <div className="px-8 py-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
              {formData.profileType === "student" ? (
                <GraduationCap className="w-7 h-7 text-pink-400" />
              ) : (
                <Briefcase className="w-7 h-7 text-purple-400" />
              )}
              <h2 className="text-2xl font-bold text-white" style={{fontFamily: 'monospace'}}>
                {formData.profileType === "student" ? "ACADEMIC INFORMATION" : "PROFESSIONAL INFORMATION"}
              </h2>
            </div>
          </div>
          
          <div className="px-8 py-6 space-y-6">
            {formData.profileType === "student" ? (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-gray-200 text-sm" style={{fontFamily: 'monospace'}}>University *</label>
                    <input
                      type="text"
                      value={formData.university}
                      onChange={(e) => setFormData({...formData, university: e.target.value})}
                      placeholder="University of Malaya"
                      className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-200 text-sm" style={{fontFamily: 'monospace'}}>Course/Major *</label>
                    <input
                      type="text"
                      value={formData.course}
                      onChange={(e) => setFormData({...formData, course: e.target.value})}
                      placeholder="Computer Science"
                      className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-gray-200 text-sm" style={{fontFamily: 'monospace'}}>Current Year *</label>
                    <Select value={formData.yearOfStudy} onValueChange={(value) => setFormData({...formData, yearOfStudy: value})}>
                      <SelectTrigger className="bg-black border-gray-700 text-gray-200 py-6 text-md">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-gray-700">
                        <SelectItem value="Year 1">Year 1</SelectItem>
                        <SelectItem value="Year 2">Year 2</SelectItem>
                        <SelectItem value="Year 3">Year 3</SelectItem>
                        <SelectItem value="Year 4">Year 4</SelectItem>
                        <SelectItem value="Year 5">Year 5</SelectItem>
                        <SelectItem value="Final Year">Final Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-200 text-sm" style={{fontFamily: 'monospace'}}>Expected Graduation *</label>
                    <input
                      type="number"
                      min="2024"
                      max="2030"
                      value={formData.graduationYear}
                      onChange={(e) => setFormData({...formData, graduationYear: e.target.value})}
                      placeholder="2025"
                      className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-gray-200 text-sm" style={{fontFamily: 'monospace'}}>Company *</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      placeholder="Tech Company Sdn Bhd"
                      className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-200 text-sm" style={{fontFamily: 'monospace'}}>Position *</label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      placeholder="Software Developer"
                      className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-gray-200 text-sm" style={{fontFamily: 'monospace'}}>Years of Experience *</label>
                  <Select value={formData.workExperience} onValueChange={(value) => setFormData({...formData, workExperience: value})}>
                    <SelectTrigger className="bg-black border-gray-700 text-gray-200 py-6 text-md">
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-gray-700">
                      <SelectItem value="<1 year">Less than 1 year</SelectItem>
                      <SelectItem value="1-2 years">1-2 years</SelectItem>
                      <SelectItem value="3-5 years">3-5 years</SelectItem>
                      <SelectItem value="5-10 years">5-10 years</SelectItem>
                      <SelectItem value="10+ years">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Work Experience Section */}
            <div className="space-y-4 pt-4 border-t border-gray-700">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasWorkExperience}
                  onChange={(e) => setFormData({...formData, hasWorkExperience: e.target.checked})}
                  className="w-4 h-4 text-pink-500 bg-gray-900 border-gray-600 rounded focus:ring-pink-500"
                />
                <span className="text-gray-200 text-sm" style={{fontFamily: 'monospace'}}>
                  {formData.profileType === "student" ? "I have internship/work experience" : "Add additional work experience details"}
                </span>
              </label>
              
              {formData.hasWorkExperience && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-gray-200 text-sm font-semibold" style={{fontFamily: 'monospace'}}>Work Experience Details</label>
                    <button
                      type="button"
                      onClick={addWorkExperience}
                      className="bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 font-bold text-white text-sm px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
                      style={{fontFamily: 'monospace'}}
                    >
                      + Add Experience
                    </button>
                  </div>
                  
                  {formData.workExperiences.map((experience, index) => (
                    <div key={experience.id} className="p-4 bg-gray-800/30 border border-gray-700/50 rounded-md space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white" style={{fontFamily: 'monospace'}}>Experience #{index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeWorkExperience(experience.id)}
                          className="text-red-400 hover:text-red-300 transition-colors text-sm"
                          style={{fontFamily: 'monospace'}}
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-gray-300 text-xs" style={{fontFamily: 'monospace'}}>Company/Organization</label>
                          <input
                            type="text"
                            value={experience.company}
                            onChange={(e) => updateWorkExperience(experience.id, "company", e.target.value)}
                            placeholder="Company name"
                            className="w-full bg-gray-900 border border-gray-600 text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-gray-300 text-xs" style={{fontFamily: 'monospace'}}>Position/Role</label>
                          <input
                            type="text"
                            value={experience.position}
                            onChange={(e) => updateWorkExperience(experience.id, "position", e.target.value)}
                            placeholder="Your role"
                            className="w-full bg-gray-900 border border-gray-600 text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-gray-300 text-xs" style={{fontFamily: 'monospace'}}>Duration</label>
                        <input
                          type="text"
                          value={experience.duration}
                          onChange={(e) => updateWorkExperience(experience.id, "duration", e.target.value)}
                          placeholder="e.g., Jun 2023 - Aug 2023, 6 months, Currently working"
                          className="w-full bg-gray-900 border border-gray-600 text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-gray-300 text-xs" style={{fontFamily: 'monospace'}}>Description</label>
                        <textarea
                          value={experience.description}
                          onChange={(e) => updateWorkExperience(experience.id, "description", e.target.value)}
                          placeholder="Describe your responsibilities, achievements, and technologies used..."
                          className="w-full bg-gray-900 border border-gray-600 text-gray-100 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:border-pink-500"
                          rows={3}
                        />
                      </div>
                      
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={experience.isInternship}
                          onChange={(e) => updateWorkExperience(experience.id, "isInternship", e.target.checked)}
                          className="w-4 h-4 text-pink-500 bg-gray-900 border-gray-600 rounded focus:ring-pink-500"
                        />
                        <span className="text-gray-300 text-sm" style={{fontFamily: 'monospace'}}>This was an internship</span>
                      </label>
                    </div>
                  ))}
                  
                  {formData.workExperiences.length === 0 && (
                    <p className="text-gray-400 text-sm italic text-center py-4" style={{fontFamily: 'monospace'}}>
                      Click &apos;Add Experience&apos; to add your work or internship experience
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

          {/* Technical Skills Card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-md">
            <div className="px-8 py-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <Code2 className="w-7 h-7 text-yellow-400" />
                <h2 className="text-2xl font-blackops text-white">TECHNICAL SKILLS</h2>
              </div>
            </div>
            
            <div className="px-8 py-6 space-y-6">
              {/* Programming Languages - update badge colors */}
              <div className="space-y-3">
                <label className="text-gray-200 font-mono text-sm">Programming Languages *</label>
                <div className="flex flex-wrap gap-2">
                  {programmingLanguages.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => handleSkillToggle(lang, "programmingLanguages")}
                      className={`px-4 py-2 rounded-md border text-sm font-mono transition-colors ${
                        formData.programmingLanguages.includes(lang)
                          ? 'bg-pink-500/20 border-pink-400 text-pink-300'
                          : 'bg-gray-900/40 border-gray-700 text-gray-400 hover:bg-pink-500/10 hover:border-pink-500/50'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frameworks - purple theme */}
              <div className="space-y-3">
                <label className="text-gray-200 font-mono text-sm">Frameworks & Tools</label>
                <div className="flex flex-wrap gap-2">
                  {frameworks.map((framework) => (
                    <button
                      key={framework}
                      type="button"
                      onClick={() => handleSkillToggle(framework, "frameworks")}
                      className={`px-4 py-2 rounded-md border text-sm font-mono transition-colors ${
                        formData.frameworks.includes(framework)
                          ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                          : 'bg-gray-900/40 border-gray-700 text-gray-400 hover:bg-purple-500/10 hover:border-purple-500/50'
                      }`}
                    >
                      {framework}
                    </button>
                  ))}
                </div>
              </div>

              {/* Other Skills - yellow theme */}
              <div className="space-y-3">
                <label className="text-gray-200 font-mono text-sm">Other Skills</label>
                <div className="flex flex-wrap gap-2">
                  {otherSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillToggle(skill, "otherSkills")}
                      className={`px-4 py-2 rounded-md border text-sm font-mono transition-colors ${
                        formData.otherSkills.includes(skill)
                          ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300'
                          : 'bg-gray-900/40 border-gray-700 text-gray-400 hover:bg-yellow-500/10 hover:border-yellow-500/50'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Social Links & Portfolio */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-md">
            <div className="px-8 py-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <Link className="w-7 h-7 text-pink-400" />
                <h2 className="text-2xl font-blackops text-white">SOCIAL LINKS & PORTFOLIO</h2>
              </div>
            </div>
            
            <div className="px-8 py-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-gray-200 font-mono text-sm flex items-center gap-2">
                    <Github className="w-4 h-4 text-gray-300" />
                    GitHub Username
                  </label>
                  <input
                    type="text"
                    value={formData.githubUsername}
                    onChange={(e) => setFormData({...formData, githubUsername: e.target.value})}
                    placeholder="johndoe"
                    className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-gray-200 font-mono text-sm flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-blue-400" />
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})}
                    placeholder="https://linkedin.com/in/johndoe"
                    className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-gray-200 font-mono text-sm flex items-center gap-2">
                    <Globe className="w-4 h-4 text-pink-400" />
                    Portfolio Website
                  </label>
                  <input
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({...formData, portfolioUrl: e.target.value})}
                    placeholder="https://johndoe.dev"
                    className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-gray-200 font-mono text-sm flex items-center gap-2">
                    <Twitter className="w-4 h-4 text-blue-400" />
                    Twitter Username
                  </label>
                  <input
                    type="text"
                    value={formData.twitterUsername}
                    onChange={(e) => setFormData({...formData, twitterUsername: e.target.value})}
                    placeholder="@johndoe"
                    className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-gray-200 font-mono text-sm flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-400" />
                  Instagram Username
                </label>
                <input
                  type="text"
                  value={formData.instagramUsername}
                  onChange={(e) => setFormData({...formData, instagramUsername: e.target.value})}
                  placeholder="johndoe"
                  className="w-full bg-black border border-gray-700 text-gray-100 rounded-md px-4 py-3 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-700">
                <input
                  type="checkbox"
                  id="openToRecruitment"
                  checked={formData.openToRecruitment}
                  onChange={(e) => setFormData({...formData, openToRecruitment: e.target.checked})}
                  className="w-4 h-4 text-pink-500 bg-gray-900 border-gray-600 rounded focus:ring-pink-500"
                />
                <label htmlFor="openToRecruitment" className="text-gray-200 font-mono text-sm">
                  I&apos;m open to recruitment opportunities
                </label>
              </div>
            </div>
          </div>

          {/* GitHub Integration */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-md">
            <div className="px-8 py-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <Github className="w-7 h-7 text-gray-400" />
                <h2 className="text-2xl font-blackops text-white">GITHUB INTEGRATION</h2>
              </div>
            </div>
            
            <div className="px-8 py-6">
              {githubConnected ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-md">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <div>
                        <h4 className="font-mono text-green-300 font-semibold">GitHub Connected Successfully!</h4>
                        <p className="text-sm text-green-200 font-mono">
                          {formData.githubUsername ? `Connected as @${formData.githubUsername}` : 'GitHub account connected'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {githubRepositories.length > 0 && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-md">
                      <h4 className="font-mono text-blue-300 font-semibold mb-2">Repository Analysis Complete</h4>
                      <p className="text-sm text-blue-200 font-mono mb-3">
                        Found {githubRepositories.length} repositories and detected your skills automatically.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formData.programmingLanguages.slice(0, 5).map((lang) => (
                          <span key={lang} className="px-2 py-1 bg-blue-500/20 border border-blue-400/50 text-blue-200 text-xs font-mono rounded">
                            {lang}
                          </span>
                        ))}
                        {formData.programmingLanguages.length > 5 && (
                          <span className="px-2 py-1 bg-blue-500/20 border border-blue-400/50 text-blue-200 text-xs font-mono rounded">
                            +{formData.programmingLanguages.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : isConnecting || isAnalyzing ? (
                <div className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-md">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                    <div>
                      <h4 className="font-mono text-blue-300 font-semibold text-lg">
                        {isConnecting ? 'Connecting to GitHub...' : 'Analyzing your repositories...'}
                      </h4>
                      <p className="text-sm text-blue-200 font-mono">
                        {isConnecting ? 'Redirecting to GitHub for authorization' : 'Extracting your skills and projects'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : userAuthMethod === 'github' ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-md">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <div>
                        <h4 className="font-mono text-green-300 font-semibold">GitHub Account Connected</h4>
                        <p className="text-sm text-green-200 font-mono">You signed up with GitHub ({formData.githubUsername})</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-md">
                    <h4 className="font-mono text-blue-300 font-semibold mb-2">Import Your GitHub Data</h4>
                    <p className="text-sm text-blue-200 font-mono mb-4">
                      Connect your GitHub account to import your repositories and automatically detect your skills.
                    </p>
                    <button
                      type="button"
                      onClick={handleConnectGitHub}
                      className="w-full bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white font-mono px-6 py-3 rounded-md transition-all flex items-center justify-center gap-2"
                    >
                      <Github className="w-5 h-5" />
                      Import GitHub Data
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-gray-800/30 border border-gray-700/50 rounded-md space-y-4">
                  <h4 className="font-mono text-white font-semibold text-lg">Connect GitHub for Enhanced Profile</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-300 font-mono">
                      <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
                      <span>Showcase your best repositories</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300 font-mono">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-yellow-500 rounded-full"></div>
                      <span>Auto-detect your technical skills</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300 font-mono">
                      <div className="w-2 h-2 bg-gradient-to-r from-yellow-500 to-pink-500 rounded-full"></div>
                      <span>Get matched with compatible teammates</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleConnectGitHub}
                    className="w-full bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white font-mono px-6 py-3 rounded-md transition-all flex items-center justify-center gap-2"
                  >
                    <Github className="w-5 h-5" />
                    Connect GitHub Account
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center py-4">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 text-white font-mono font-bold px-12 py-4 rounded-md hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Completing Profile...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Complete Profile
                  </>
                )}
              </div>
            </button>
            
            {/* <button
              type="button"
              onClick={handleSkip}
              className="border border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 font-mono px-12 py-4 rounded-md transition-colors"
            >
              Skip for Now
            </button> */}
          </div>
        </form>
      </div>
    </div>
  )
}

export default HackerProfileSetup