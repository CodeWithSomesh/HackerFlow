'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
// import { redirect } from 'next/navigation'

// Types
export interface HackerProfileData {
  fullName: string
  profileImage?: string
  bio?: string
  profileType: string
  city: string
  state: string
  country: string
  
  // Student fields
  university?: string
  course?: string
  yearOfStudy?: string
  graduationYear?: string
  
  // Working professional fields
  company?: string
  position?: string
  workExperience?: string
  
  // Technical skills
  programmingLanguages: string[]
  frameworks: string[]
  otherSkills: string[]
  experienceLevel?: string
  
  // Work experience
  hasWorkExperience: boolean
  workExperiences: Array<{
    id: string
    company: string
    position: string
    duration: string
    description: string
    isInternship: boolean
  }>
  
  // Social links
  githubUsername?: string
  linkedinUrl?: string
  twitterUsername?: string
  portfolioUrl?: string
  instagramUsername?: string
  
  // Other
  openToRecruitment: boolean
}

export interface OrganizerProfileData {
  fullName: string
  bio?: string
  profileImage?: string
  organizationType: string
  
  // Organization details
  organizationName: string
  position: string
  organizationSize?: string
  organizationWebsite?: string
  organizationDescription?: string
  
  // Experience
  eventOrganizingExperience: string
  previousEvents: Array<{
    id: string
    eventName: string
    eventType: string
    participantCount: string
    date: string
    description: string
    role: string
  }>
  
  // Location & Preferences
  city: string
  state: string
  country: string
  willingToTravelFor: boolean
  preferredEventTypes: string[]
  
  // Budget & Resources
  typicalBudgetRange?: string
  hasVenue: boolean
  venueDetails?: string
  hasSponsorConnections: boolean
  sponsorDetails?: string
  
  // Technical capabilities
  techSetupCapability?: string
  livestreamCapability: boolean
  photographyCapability: boolean
  marketingCapability: boolean
  
  // Goals & Focus
  primaryGoals: string[]
  targetAudience: string[]
  
  // Social links
  linkedinUrl?: string
  twitterUsername?: string
  websiteUrl?: string
  instagramUsername?: string
  
  // Other
  lookingForCoOrganizers: boolean
  willingToMentor: boolean
  availableForConsulting: boolean
}

export interface GitHubProject {
  id: number
  name: string
  full_name: string
  description?: string | null
  language?: string
  stars_count: number
  forks_count: number
  watchers_count: number
  open_issues_count: number
  size: number
  default_branch: string
  topics: string[]
  homepage?: string
  html_url: string
  clone_url: string
  ssh_url: string
  created_at: string
  updated_at: string
  pushed_at?: string
  is_private: boolean
  is_fork: boolean
  is_archived: boolean
  is_disabled: boolean
}

interface GitHubIntegrationData {
  login: string
  id: number
  avatar_url: string
  html_url: string
  name?: string
  email?: string
  repos_url: string
  [key: string]: unknown
}

// Add this function to your profile-actions.ts file
export async function testDatabaseConnection() {
  try {
    const supabase = await createClient();
    
    // Test auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth test:', { user: user?.id, error: authError });
    
    // Test database read
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count(*)')
      .single();
      
    console.log('Database test:', { data, error });
    
    return { success: !error, user, data, error };
  } catch (error) {
    console.error('Database connection test failed:', error);
    return { success: false, error };
  }
}

// Save Hacker Profile
// User fills form → saveHackerProfile() receives data
//                           ↓
//               Transform camelCase to snake_case
//                           ↓
//               Add user_id from authenticated session
//                           ↓
//               UPSERT to user_profiles table
//                           ↓
//               Database checks UNIQUE constraint
//                           ↓
//          INSERT (new user) or UPDATE (existing user)
export async function saveHackerProfile(
  formData: HackerProfileData, 
  githubToken?: string, 
  githubUserData?: any
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error:', authError);
      return { success: false, error: `Authentication error: ${authError.message}` };
    }
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    console.log('User authenticated:', user.id);

    const profileData = {
      user_id: user.id,
      email: user.email,
      profile_image: formData.profileImage || null,
      user_primary_type: 'hacker',
      full_name: formData.fullName,
      bio: formData.bio || null,
      city: formData.city,
      state: formData.state,
      country: formData.country || 'Malaysia',
      profile_type: formData.profileType,
      
      // Student fields
      university: formData.university || null,
      course: formData.course || null,
      year_of_study: formData.yearOfStudy || null,
      graduation_year: formData.graduationYear ? parseInt(formData.graduationYear) : null,
      
      // Working fields
      company: formData.company || null,
      position: formData.position || null,
      work_experience: formData.workExperience || null,
      
      // Skills
      programming_languages: formData.programmingLanguages || [],
      frameworks: formData.frameworks || [],
      other_skills: formData.otherSkills || [],
      
      // Work experience
      has_work_experience: formData.hasWorkExperience || false,
      work_experiences: formData.workExperiences || [],
      
      // Social links
      github_username: formData.githubUsername || null,
      linkedin_url: formData.linkedinUrl || null,
      twitter_username: formData.twitterUsername || null,
      portfolio_url: formData.portfolioUrl || null,
      instagram_username: formData.instagramUsername || null,
      
      // Preferences
      open_to_recruitment: formData.openToRecruitment || false,
      
      // GitHub integration (ADD THESE)
      github_access_token: githubToken || null,
      github_connected_at: githubToken ? new Date().toISOString() : null,
    };

    console.log('Profile data to save:', JSON.stringify(profileData, null, 2));

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(profileData, { onConflict: 'user_id' })
      .select();

    if (error) {
      console.error('Database error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return { success: false, error: `Database error: ${error.message}` };
    }

    console.log('Profile saved successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Caught error in saveHackerProfile:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}


// Save Organizer Profile
export async function saveOrganizerProfile(profileData: OrganizerProfileData) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Prepare data for database
    const dbData = {
      user_id: user.id,
      user_primary_type: 'organizer',
      profile_image: profileData.profileImage || null,
      full_name: profileData.fullName,
      bio: profileData.bio,
      city: profileData.city,
      state: profileData.state,
      country: profileData.country,
      organization_type: profileData.organizationType,
      organization_name: profileData.organizationName,
      position: profileData.position,
      organization_size: profileData.organizationSize,
      organization_website: profileData.organizationWebsite,
      organization_description: profileData.organizationDescription,
      event_organizing_experience: profileData.eventOrganizingExperience,
      previous_events: profileData.previousEvents,
      preferred_event_types: profileData.preferredEventTypes,
      typical_budget_range: profileData.typicalBudgetRange,
      has_venue: profileData.hasVenue,
      venue_details: profileData.venueDetails,
      has_sponsor_connections: profileData.hasSponsorConnections,
      sponsor_details: profileData.sponsorDetails,
      tech_setup_capability: profileData.techSetupCapability,
      livestream_capability: profileData.livestreamCapability,
      photography_capability: profileData.photographyCapability,
      marketing_capability: profileData.marketingCapability,
      primary_goals: profileData.primaryGoals,
      target_audience: profileData.targetAudience,
      linkedin_url: profileData.linkedinUrl,
      twitter_username: profileData.twitterUsername,
      website_url: profileData.websiteUrl,
      instagram_username: profileData.instagramUsername,
      looking_for_co_organizers: profileData.lookingForCoOrganizers,
      willing_to_mentor: profileData.willingToMentor,
      available_for_consulting: profileData.availableForConsulting,
      willing_to_travel_for: profileData.willingToTravelFor,
    }

    // Insert or update profile
    const { error } = await supabase
      .from('user_profiles')
      .upsert(dbData, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      })

    if (error) {
      console.error('Error saving organizer profile:', error)
      throw new Error('Failed to save profile')
    }

    revalidatePath('/onboarding/organizer/profile-setup')
    return { success: true }
  } catch (error) {
    console.error('Error in saveOrganizerProfile:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Get User Profile
export async function getUserProfile(userType: 'hacker' | 'organizer') {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .eq('user_primary_type', userType)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error('Failed to fetch profile')
    }

    return { success: true, profile }
  } catch (error) {
    console.error('Error in getUserProfile:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Save GitHub Projects
// export async function saveGitHubProjects(projects: GitHubProject[], selectedProjectIds: number[]) {
export async function saveGitHubProjects(projects: GitHubProject[], selectedProjectIds: number[]) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Prepare projects data
    const projectsData = projects.map(project => ({
      user_id: user.id,
      github_repo_id: project.id,
      name: project.name,
      full_name: project.full_name,
      description: project.description,
      language: project.language,
      stars_count: project.stars_count,
      forks_count: project.forks_count,
      watchers_count: project.watchers_count,
      open_issues_count: project.open_issues_count,
      size: project.size,
      default_branch: project.default_branch,
      topics: project.topics,
      homepage: project.homepage,
      html_url: project.html_url,
      clone_url: project.clone_url,
      ssh_url: project.ssh_url,
      created_at: project.created_at,
      updated_at: project.updated_at,
      pushed_at: project.pushed_at,
      is_private: project.is_private,
      is_fork: project.is_fork,
      is_archived: project.is_archived,
      is_disabled: project.is_disabled,
      is_selected: selectedProjectIds.includes(project.id),
    }))

    // Upsert projects
    const { error } = await supabase
      .from('github_projects')
      .upsert(projectsData, { 
        onConflict: 'user_id,github_repo_id',
        ignoreDuplicates: false 
      })

    if (error) {
      console.error('Error saving GitHub projects:', error)
      throw new Error('Failed to save GitHub projects')
    }

    revalidatePath('/onboarding/hacker/profile-setup')
    return { success: true }
  } catch (error) {
    console.error('Error in saveGitHubProjects:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Get User's GitHub Projects
export async function getUserGitHubProjects() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Not authenticated')
    }

    // Get GitHub token from profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('github_access_token, github_username')
      .eq('user_id', user.id)
      .single()

    if (!profile?.github_access_token) {
      return { success: false, error: 'GitHub not connected with token' }
    }

    // Fetch repositories
    const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        'Authorization': `Bearer ${profile.github_access_token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'HackerFlow-App'
      }
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const repos = await response.json()
    
    // Map to your project format
    const projects = repos.slice(0, 10).map((repo: any) => ({
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stars_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      html_url: repo.html_url,
      is_selected: false // You can add logic to select pinned repos
    }))

    return { success: true, projects }
  } catch (error) {
    console.error('Error fetching GitHub projects:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Update Selected GitHub Projects
export async function updateSelectedGitHubProjects(selectedProjectIds: number[]) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // First, unselect all projects
    await supabase
      .from('github_projects')
      .update({ is_selected: false })
      .eq('user_id', user.id)

    // Then, select the specified projects
    if (selectedProjectIds.length > 0) {
      const { error } = await supabase
        .from('github_projects')
        .update({ is_selected: true })
        .in('github_repo_id', selectedProjectIds)
        .eq('user_id', user.id)

      if (error) {
        throw new Error('Failed to update selected projects')
      }
    }

    revalidatePath('/onboarding/hacker/profile-setup')
    return { success: true }
  } catch (error) {
    console.error('Error in updateSelectedGitHubProjects:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function saveGitHubIntegrationData(
  userId: string,
  githubData: GitHubIntegrationData,
  accessToken: string
) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('user_profiles')
    .update({
      github_username: githubData.login,
      github_access_token: accessToken,
      github_connected_at: new Date().toISOString(),
    })
    .eq('user_id', userId);
  
  if (error) {
    throw new Error(`Failed to save GitHub integration: ${error.message}`);
  }
  
  return { success: true };
}

// Upload Profile Image
export async function uploadProfileImage(file: File) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Validate file
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Please upload an image file (PNG/JPG/GIF)' };
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      return { success: false, error: 'Image size must be less than 5MB' };
    }

    // Delete old profile image if exists
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('profile_image')
      .eq('user_id', user.id)
      .single();

    if (profile?.profile_image) {
      // Extract file path from URL
      const oldImagePath = profile.profile_image.split('/').slice(-2).join('/');
      await supabase.storage
        .from('profile-images')
        .remove([oldImagePath]);
    }

    // Upload new image
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/profile.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(fileName, file, {
        upsert: true, // Replace if exists
        contentType: file.type
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: `Failed to upload image: ${uploadError.message}` };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(fileName);

    // Update user profile with new image URL
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ profile_image: publicUrl })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Profile update error:', updateError);
      return { success: false, error: 'Failed to update profile with new image' };
    }

    revalidatePath('/profile');
    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}