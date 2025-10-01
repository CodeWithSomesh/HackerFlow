"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { saveHackerProfile, saveGitHubProjects, testDatabaseConnection } from "@/lib/actions/profile-actions"
// import { getMockGitHubRepositories, analyzeGitHubRepositories } from "@/lib/utils/github-utils"
import { GitHubProject } from "@/lib/actions/profile-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
  AlertCircle
} from "lucide-react"
import { useGitHubIntegration } from "@/hooks/useGitHubIntegration"
import { createClient } from '@/lib/supabase/client';
// import toast from "react-hot-toast"
import { showCustomToast } from "@/components/toast-notification"
import { triggerSideCannons, 
  // triggerFireworks, triggerCustomShapes, triggerEmoji, triggerStars 
} from "@/lib/confetti"


export function HackerProfileSetup() {
  const router = useRouter()

  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false)
  const [githubConnected, setGithubConnected] = useState(false)
  // const [githubAnalyzing, setGithubAnalyzing] = useState(false)
  // const [showGithubProjects, setShowGithubProjects] = useState(false)
  const [selectedProjects, _setSelectedProjects] = useState<number[]>([])
  const [githubRepositories, setGithubRepositories] = useState<GitHubProject[]>([])
  const [error, setError] = useState<string | null>(null)
  const [userAuthMethod, setUserAuthMethod] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    profileType: "", // "student" or "working"
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
  
  // Add this authentication check at the top of your component
  useEffect(() => {
    const checkAndSetupAuth = async () => {
      const supabase = createClient();
      
      try {
        // First check if we have a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          router.push('/auth/signin');
          return;
        }

        if (!session) {
          console.log('No session found, redirecting to signin');
          router.push('/auth/signin');
          return;
        }

        // If we have a session, get the user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('User error:', userError);
          router.push('/auth/signin');
          return;
        }

        console.log('User authenticated successfully:', user.id);
        setUser(user);
        
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth/signin');
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
      setError(`GitHub connection failed: ${error}`);
      return;
    }
    
    if (code) {
      console.log('Processing GitHub OAuth code:', code);
      handleOAuthCallback(code).then((data) => {
        console.log('GitHub integration successful:', data);
        
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
        // setShowGithubProjects(true);
        
        console.log('GitHub data processed:', { 
          repositories: convertedRepos.length, 
          skills: data.skills,
          connected: true 
        });
        
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
      }).catch((err) => {
        console.error('GitHub integration failed:', err);
        setError(`GitHub integration failed: ${err.message}`);
      });
    }
  }, [user]);

  useEffect(() => {
    testDatabaseConnection();
  }, []); 

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.log('No authenticated user, redirecting to sign in');
        router.push('/auth/signin');
        return;
      }
      
      console.log('User authenticated:', user.id);
    };
    
    checkAuth();
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

    // // Check authentication first
    // const supabase = createClient();
    // const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // if (authError || !user) {
    //   setError('You must be logged in to create a profile. Please sign in again.');
    //   setIsLoading(false);
    //   router.push('/auth/signin'); // Redirect to sign in
    //   return;
    // }
  
    // Basic validation
    if (!formData.fullName || !formData.profileType || !formData.city || !formData.state) {
      setError('Please fill in all required fields (Name, Profile Type, City, State)')
      setIsLoading(false)
      return
    }
  
    // Profile type specific validation
    if (formData.profileType === 'student') {
      if (!formData.university || !formData.course || !formData.yearOfStudy || !formData.graduationYear) {
        setError('Please fill in all required academic information')
        setIsLoading(false)
        return
      }
    } else if (formData.profileType === 'working') {
      if (!formData.company || !formData.position || !formData.workExperience) {
        setError('Please fill in all required professional information')
        setIsLoading(false)
        return
      }
    }
  
    console.log('Submitting form data:', formData); // Debug log
  
    try {
      // Save profile data to database
      const result = await saveHackerProfile(formData)
      
      console.log('Profile save result:', result); // Debug log
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save profile')
      }
  
      // Save GitHub projects if connected
      if (githubConnected && githubRepositories.length > 0) {
        const githubResult = await saveGitHubProjects(githubRepositories, [])
        
        if (!githubResult.success) {
          console.error('Failed to save GitHub projects:', githubResult.error)
          // Don't throw error here, profile is already saved
        }
      }
      
      showCustomToast('success', "Successfully Created Hacker Profile") //Show Success Toast
      triggerSideCannons(); //Trigger Confetti
      router.push("/hackathons") //Redirect to Hackathon Page
    } catch (err) {
      console.error('Error saving profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    router.push("/onboarding/complete")
  }

  // const handleConnectGitHub = async () => {
  //   setGithubAnalyzing(true)
  //   setGithubConnected(true)
  //   setError(null)

  //   try {
  //     // For now, use mock data. In production, you'd implement real GitHub OAuth
  //     const repositories = getMockGitHubRepositories()
  //     setGithubRepositories(repositories)
      
  //     // Analyze repositories to extract skills
  //     const skills = analyzeGitHubRepositories(repositories)
      
  //     // Auto-populate skills based on analysis
  //     setFormData((prev) => ({
  //       ...prev,
  //       programmingLanguages: skills.programmingLanguages,
  //       frameworks: skills.frameworks,
  //       githubUsername: "johndoe" // In production, get from GitHub API
  //     }))

  //     setGithubAnalyzing(false)
  //     setShowGithubProjects(true)
  //   } catch (err) {
  //     console.error('Error connecting to GitHub:', err)
  //     setError('Failed to connect to GitHub')
  //     setGithubConnected(false)
  //     setGithubAnalyzing(false)
  //   }
  // }

  return (
    <div className="min-h-screen ">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-3xl"></div>
      </div>

      {/* Home Button - Floating in top right */}
      {/* <div className="fixed top-6 right-6 z-50">
        <Button
          onClick={handleHomeClick}
          className="group relative backdrop-blur-xl bg-slate-800/30 border border-white hover:border-slate-500/50 text-white hover:text-white rounded-2xl p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          size="sm"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-cyan-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Home className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
          <span className="s-only">Go to Home</span>
        </Button>
      </div> */}

      <div className="relative flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <ProgressIndicator currentStep={3} totalSteps={3} />
          </div>

          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 rounded-2xl blur-xl"></div>
              <h1 className="relative text-4xl font-bold mb- bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Complete Your Hacker Profile
              </h1>
            </div>
            <p className="text-white text-lg">Help us find your perfect hackathon teammates and opportunities</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Error Display */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl flex items-center gap-3 backdrop-blur-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Basic Information */}
            <Card className="backdrop-blur-xl bg-slate-800/50 border border-slate-400 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl text-white">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-slate-300 font-medium">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="John Doe"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl py-3"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300 font-medium">I am a *</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={formData.profileType === "student" ? "default" : "outline"}
                        onClick={() => setFormData({ ...formData, profileType: "student" })}
                        className={`py-3 rounded-xl ${
                          formData.profileType === "student"
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                            : "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-blue-500/10 hover:border-blue-500/50"
                        }`}
                      >
                        <GraduationCap className="w-4 h-4 mr-2" />
                        Student
                      </Button>
                      <Button
                        type="button"
                        variant={formData.profileType === "working" ? "default" : "outline"}
                        onClick={() => setFormData({ ...formData, profileType: "working" })}
                        className={`py-3 rounded-xl ${
                          formData.profileType === "working"
                            ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                            : "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-emerald-500/10 hover:border-emerald-500/50"
                        }`}
                      >
                        <Briefcase className="w-4 h-4 mr-2" />
                        Working
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-slate-300 font-medium">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Kuala Lumpur"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl py-3"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-slate-300 font-medium">State *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="Selangor"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl py-3"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-slate-300 font-medium">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl py-3"
                      readOnly
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-slate-300 font-medium">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself, your interests, and what you love building..."
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl resize-none"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Academic/Professional Information */}
            {formData.profileType && (
              <Card className="backdrop-blur-xl bg-slate-800/50 border border-slate-400 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl text-white">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      formData.profileType === "student" 
                        ? "bg-gradient-to-r from-blue-600 to-purple-600"
                        : "bg-gradient-to-r from-emerald-600 to-teal-600"
                    }`}>
                      {formData.profileType === "student" ? 
                        <GraduationCap className="w-5 h-5 text-white" /> : 
                        <Briefcase className="w-5 h-5 text-white" />
                      }
                    </div>
                    {formData.profileType === "student" ? "Academic Information" : "Professional Information"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {formData.profileType === "student" ? (
                    <>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="university" className="text-slate-300 font-medium">University *</Label>
                          <Input
                            id="university"
                            value={formData.university}
                            onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                            placeholder="University of Malaya"
                            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl py-3"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="course" className="text-slate-300 font-medium">Course/Major *</Label>
                          <Input
                            id="course"
                            value={formData.course}
                            onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                            placeholder="Computer Science"
                            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl py-3"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="yearOfStudy" className="text-slate-300 font-medium">Current Year *</Label>
                          <select
                            id="yearOfStudy"
                            value={formData.yearOfStudy}
                            onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                            className="w-full py-[9px] px-3 text-sm bg-slate-700/50 border border-slate-600 rounded-xl text-white"
                            required
                          >
                            <option value="Year 1">Year 1</option>
                            <option value="Year 2">Year 2</option>
                            <option value="Year 3">Year 3</option>
                            <option value="Year 4">Year 4</option>
                            <option value="Year 5">Year 5</option>
                            <option value="Final Year">Final Year</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="graduationYear" className="text-slate-300 font-medium">Expected Graduation *</Label>
                          <Input
                            id="graduationYear"
                            type="number"
                            min="2024"
                            max="2030"
                            value={formData.graduationYear}
                            onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                            placeholder="2025"
                            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl py-3"
                            required
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="company" className="text-slate-300 font-medium">Company *</Label>
                          <Input
                            id="company"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            placeholder="Tech Company Sdn Bhd"
                            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl py-3"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="position" className="text-slate-300 font-medium">Position *</Label>
                          <Input
                            id="position"
                            value={formData.position}
                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            placeholder="Software Developer"
                            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl py-3"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="workExperience" className="text-slate-300 font-medium">Years of Experience *</Label>
                        <select
                          id="workExperience"
                          value={formData.workExperience}
                          onChange={(e) => setFormData({ ...formData, workExperience: e.target.value })}
                          className="w-full py-3 px-3 text-sm bg-slate-700/50 border border-slate-600 rounded-xl text-white"
                          required
                        >
                          <option value="">Select experience</option>
                          <option value="<1 year">Less than 1 year</option>
                          <option value="1-2 years">1-2 years</option>
                          <option value="3-5 years">3-5 years</option>
                          <option value="5-10 years">5-10 years</option>
                          <option value="10+ years">10+ years</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Work Experience Section for both */}
                  <div className="space-y-4 pt-4 border-t border-slate-700">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="hasWorkExperience"
                        checked={formData.hasWorkExperience}
                        onChange={(e) => setFormData({ ...formData, hasWorkExperience: e.target.checked })}
                        className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                      />
                      <Label htmlFor="hasWorkExperience" className="text-slate-300">
                        {formData.profileType === "student" ? "I have internship/work experience" : "Add additional work experience details"}
                      </Label>
                    </div>
                    
                    {formData.hasWorkExperience && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-slate-300 font-medium">Work Experience Details</Label>
                          <Button
                            type="button"
                            onClick={addWorkExperience}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm px-4 py-2 rounded-lg"
                          >
                            + Add Experience
                          </Button>
                        </div>
                        
                        {formData.workExperiences.map((experience, index) => (
                          <div key={experience.id} className="p-4 bg-slate-700/30 border border-slate-600/50 rounded-xl space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-white font-medium">Experience #{index + 1}</h4>
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => removeWorkExperience(experience.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm px-3 py-1"
                              >
                                Remove
                              </Button>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-slate-300 text-sm">Company/Organization</Label>
                                <Input
                                  value={experience.company}
                                  onChange={(e) => updateWorkExperience(experience.id, "company", e.target.value)}
                                  placeholder="Company name"
                                  className="bg-slate-600/50 border-slate-500 text-white placeholder:text-slate-400 rounded-lg py-2"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-slate-300 text-sm">Position/Role</Label>
                                <Input
                                  value={experience.position}
                                  onChange={(e) => updateWorkExperience(experience.id, "position", e.target.value)}
                                  placeholder="Your role"
                                  className="bg-slate-600/50 border-slate-500 text-white placeholder:text-slate-400 rounded-lg py-2"
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-slate-300 text-sm">Duration</Label>
                              <Input
                                value={experience.duration}
                                onChange={(e) => updateWorkExperience(experience.id, "duration", e.target.value)}
                                placeholder="e.g., Jun 2023 - Aug 2023, 6 months, Currently working"
                                className="bg-slate-600/50 border-slate-500 text-white placeholder:text-slate-400 rounded-lg py-2"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-slate-300 text-sm">Description</Label>
                              <Textarea
                                value={experience.description}
                                onChange={(e) => updateWorkExperience(experience.id, "description", e.target.value)}
                                placeholder="Describe your responsibilities, achievements, and technologies used..."
                                className="bg-slate-600/50 border-slate-500 text-white placeholder:text-slate-400 rounded-lg resize-none"
                                rows={3}
                              />
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id={`internship-${experience.id}`}
                                checked={experience.isInternship}
                                onChange={(e) => updateWorkExperience(experience.id, "isInternship", e.target.checked)}
                                className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                              />
                              <Label htmlFor={`internship-${experience.id}`} className="text-slate-300 text-sm">
                                This was an internship
                              </Label>
                            </div>
                          </div>
                        ))}
                        
                        {formData.workExperiences.length === 0 && (
                          <p className="text-slate-400 text-sm italic text-center py-4">
                            Click &lsquo;Add Experience&lsquo; to add your work or internship experience
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Technical Skills */}
            <Card className="backdrop-blur-xl bg-slate-800/50 border border-slate-400 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl text-white">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <Code2 className="w-5 h-5 text-white" />
                  </div>
                  Technical Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Programming Languages */}
                <div className="space-y-3">
                  <Label className="text-slate-300 font-medium">Programming Languages</Label>
                  <div className="flex flex-wrap gap-2">
                    {programmingLanguages.map((lang) => (
                      <Badge
                        key={lang}
                        variant={formData.programmingLanguages.includes(lang) ? "default" : "outline"}
                        className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                          formData.programmingLanguages.includes(lang)
                            ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                            : "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-pink-500/10 hover:border-pink-500/50"
                        }`}
                        onClick={() => handleSkillToggle(lang, "programmingLanguages")}
                      >
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Frameworks & Tools */}
                <div className="space-y-3">
                  <Label className="text-slate-300 font-medium">Frameworks & Tools</Label>
                  <div className="flex flex-wrap gap-2">
                    {frameworks.map((framework) => (
                      <Badge
                        key={framework}
                        variant={formData.frameworks.includes(framework) ? "default" : "outline"}
                        className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                          formData.frameworks.includes(framework)
                            ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                            : "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-purple-500/10 hover:border-purple-500/50"
                        }`}
                        onClick={() => handleSkillToggle(framework, "frameworks")}
                      >
                        {framework}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* OTHER SKILLS - NEW SECTION */}
                <div className="space-y-">
                  <Label className="text-slate-300 font-medium">Other Skills</Label>
                  <p className="text-sm text-slate-400 mb-3">Design, content creation, and other valuable skills for hackathons</p>
                  <div className="flex flex-wrap gap-2">
                    {otherSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant={formData.otherSkills.includes(skill) ? "default" : "outline"}
                        className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                          formData.otherSkills.includes(skill)
                            ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg"
                            : "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-teal-500/10 hover:border-teal-500/50"
                        }`}
                        onClick={() => handleSkillToggle(skill, "otherSkills")}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="backdrop-blur-xl bg-slate-800/50 border border-slate-400 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl text-white">
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center">
                    <Link className="w-5 h-5 text-white" />
                  </div>
                  Social Links & Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="githubUsername" className="text-slate-300 font-medium flex items-center gap-2">
                      <Github className="w-4 h-4" />
                      GitHub Username
                    </Label>
                    <Input
                      id="githubUsername"
                      value={formData.githubUsername}
                      onChange={(e) => setFormData({ ...formData, githubUsername: e.target.value })}
                      placeholder="johndoe"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl py-3"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedinUrl" className="text-slate-300 font-medium flex items-center gap-2">
                      <Linkedin className="w-4 h-4" />
                      LinkedIn Profile
                    </Label>
                    <Input
                      id="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                      placeholder="https://linkedin.com/in/johndoe"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl py-3"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="portfolioUrl" className="text-slate-300 font-medium flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Portfolio Website
                    </Label>
                    <Input
                      id="portfolioUrl"
                      value={formData.portfolioUrl}
                      onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                      placeholder="https://johndoe.dev"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl py-3"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitterUsername" className="text-slate-300 font-medium flex items-center gap-2">
                      <Twitter className="w-4 h-4" />
                      Twitter Username
                    </Label>
                    <Input
                      id="twitterUsername"
                      value={formData.twitterUsername}
                      onChange={(e) => setFormData({ ...formData, twitterUsername: e.target.value })}
                      placeholder="@johndoe"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl py-3"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagramUsername" className="text-slate-300 font-medium flex items-center gap-2">
                    <Instagram className="w-4 h-4" />
                    Instagram Username
                  </Label>
                  <Input
                    id="instagramUsername"
                    value={formData.instagramUsername}
                    onChange={(e) => setFormData({ ...formData, instagramUsername: e.target.value })}
                    placeholder="johndoe"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl py-3"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-4 border-t border-slate-700">
                  <input
                    type="checkbox"
                    id="openToRecruitment"
                    checked={formData.openToRecruitment}
                    onChange={(e) => setFormData({ ...formData, openToRecruitment: e.target.checked })}
                    className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                  />
                  <Label htmlFor="openToRecruitment" className="text-slate-300">
                    I&lsquo;m open to recruitment opportunities
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* GitHub Integration */}
            <Card className="backdrop-blur-xl bg-slate-800/50 border border-slate-400 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl text-white">
                  <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-gray-800 rounded-xl flex items-center justify-center">
                    <Github className="w-5 h-5 text-white" />
                  </div>
                  GitHub Integration
                </CardTitle>
              </CardHeader>
              {/* <CardContent className="space-y-6">
                {githubConnected ? (
                  <div className="space-y-6">
                    {githubAnalyzing ? (
                      <div className="flex items-center gap-3 p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                        <div>
                          <h4 className="font-semibold text-blue-300 text-lg">GitHub Connected!</h4>
                          <p className="text-sm text-blue-200">We're analyzing your repositories and extracting your skills...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 p-6 bg-green-500/10 border border-green-500/30 rounded-xl">
                          <CheckCircle className="w-6 h-6 text-green-400" />
                          <div>
                            <h4 className="font-semibold text-green-300 text-lg">Analysis Complete!</h4>
                            <p className="text-sm text-green-200">We've detected your skills and found your repositories</p>
                          </div>
                        </div>

                        {showGithubProjects && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-lg font-semibold text-white">Select Projects to Showcase</h4>
                              <Badge variant="outline" className="bg-slate-700/50 border-slate-600 text-slate-300">
                                {selectedProjects.length} selected
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-400 mb-4">
                              Choose your best projects to display on your profile. These will help teammates understand your expertise.
                            </p>
                            
                            <div className="grid gap-4 max-h-96 overflow-y-auto">
                              {githubRepositories.map((project) => (
                                <div
                                  key={project.id}
                                  className={`group cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${
                                    selectedProjects.includes(project.id)
                                      ? "border-purple-500/50 bg-purple-500/10 shadow-lg"
                                      : "border-slate-600/50 bg-slate-700/30 hover:border-purple-400/50 hover:bg-purple-500/5"
                                  }`}
                                  onClick={() => handleProjectToggle(project.id)}
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-3 h-3 rounded-full ${
                                        project.language === "JavaScript" ? "bg-yellow-400" :
                                        project.language === "Python" ? "bg-blue-500" :
                                        project.language === "TypeScript" ? "bg-blue-600" :
                                        project.language === "Solidity" ? "bg-gray-400" : "bg-gray-500"
                                      }`}></div>
                                      <h5 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                                        {project.name}
                                      </h5>
                                    </div>
                                    <div className={`w-5 h-5 rounded border-2 transition-all ${
                                      selectedProjects.includes(project.id)
                                        ? "bg-purple-500 border-purple-500"
                                        : "border-slate-500 group-hover:border-purple-400"
                                    }`}>
                                      {selectedProjects.includes(project.id) && (
                                        <CheckCircle className="w-3 h-3 text-white m-0.5" />
                                      )}
                                    </div>
                                  </div>
                                  
                                  <p className="text-sm text-slate-300 mb-3">
                                    {project.description}
                                  </p>
                                  
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-xs text-slate-400">
                                      <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3" />
                                        {project.stars_count}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <GitFork className="w-3 h-3" />
                                        {project.forks_count}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(project.updated_at).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-1 mt-3">
                                    {project.topics.map((topic) => (
                                      <Badge
                                        key={topic}
                                        variant="outline"
                                        className="text-xs bg-slate-800/50 border-slate-600 text-slate-300"
                                      >
                                        {topic}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-6 bg-slate-700/30 rounded-xl border border-slate-600/50">
                      <h4 className="font-semibold mb-3 text-white text-lg">Connect GitHub for Enhanced Profile</h4>
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                          <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                          <span>Showcase your best repositories</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                          <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full"></div>
                          <span>Auto-detect your technical skills</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                          <span>Get matched with compatible teammates</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={handleConnectGitHub}
                        className="bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white py-3 px-6 rounded-xl"
                      >
                        <Github className="w-5 h-5 mr-2" />
                        Connect GitHub
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent> */}
              <CardContent>
                {githubConnected ? (
                  // GitHub is connected - show success state
                  <div className="space-y-4">
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <div>
                          <h4 className="font-semibold text-green-300">GitHub Connected Successfully!</h4>
                          <p className="text-sm text-green-200">
                            {formData.githubUsername ? `Connected as @${formData.githubUsername}` : 'GitHub account connected'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {githubRepositories.length > 0 && (
                      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                        <h4 className="font-semibold text-blue-300 mb-2">Repository Analysis Complete</h4>
                        <p className="text-sm text-blue-200 mb-3">
                          Found {githubRepositories.length} repositories and detected your skills automatically.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {formData.programmingLanguages.slice(0, 5).map((lang) => (
                            <Badge key={lang} variant="outline" className="bg-blue-500/20 border-blue-400/50 text-blue-200">
                              {lang}
                            </Badge>
                          ))}
                          {formData.programmingLanguages.length > 5 && (
                            <Badge variant="outline" className="bg-blue-500/20 border-blue-400/50 text-blue-200">
                              +{formData.programmingLanguages.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : isConnecting || isAnalyzing ? (
                  // Loading state
                  <div className="space-y-4">
                    <div className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                        <div>
                          <h4 className="font-semibold text-blue-300 text-lg">
                            {isConnecting ? 'Connecting to GitHub...' : 'Analyzing your repositories...'}
                          </h4>
                          <p className="text-sm text-blue-200">
                            {isConnecting ? 'Redirecting to GitHub for authorization' : 'Extracting your skills and projects'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : userAuthMethod === 'github' ? (
                  // User signed up with GitHub - show enhanced integration
                  <div className="space-y-4">
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <div>
                          <h4 className="font-semibold text-green-300">GitHub Account Connected</h4>
                          <p className="text-sm text-green-200">You signed up with GitHub ({formData.githubUsername})</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                      <h4 className="font-semibold text-blue-300 mb-2">Import Your GitHub Data</h4>
                      <p className="text-sm text-blue-200 mb-4">
                        Connect your GitHub account to import your repositories and automatically detect your skills.
                      </p>
                      <Button
                        onClick={handleConnectGitHub}
                        className="w-full bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white"
                      >
                        <Github className="w-5 h-5 mr-2" />
                        Import GitHub Data
                      </Button>
                    </div>
                  </div>
                ) : (
                  // User signed up with email/Google - show regular integration
                  <div className="space-y-4">
                    <div className="p-6 bg-slate-700/30 rounded-xl border border-slate-600/50">
                      <h4 className="font-semibold mb-3 text-white text-lg">Connect GitHub for Enhanced Profile</h4>
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                          <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                          <span>Showcase your best repositories</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                          <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full"></div>
                          <span>Auto-detect your technical skills</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                          <span>Get matched with compatible teammates</span>
                        </div>
                      </div>
                      <Button
                        onClick={handleConnectGitHub}
                        className="w-full bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white"
                      >
                        <Github className="w-5 h-5 mr-2" />
                        Connect GitHub Account
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                type="submit"
                disabled={isLoading || !formData.fullName || !formData.profileType}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-12 py-4 rounded-2xl shadow-lg hover:shadow-pink-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Completing Profile...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Complete Profile
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                className="border-2 border-slate-600/50 bg-slate-700/30 hover:bg-slate-600/50 text-slate-300 hover:text-white px-12 py-4 rounded-2xl backdrop-blur-sm transition-all duration-300"
                size="lg"
              >
                Skip for Now
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default HackerProfileSetup