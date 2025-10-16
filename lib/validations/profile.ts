import { z } from 'zod';

const WorkExperienceSchema = z.object({
  id: z.string(),
  company: z.string().min(1, 'Company name is required').max(100, 'Company name must be less than 100 characters'),
  position: z.string().min(1, 'Position is required').max(100, 'Position must be less than 100 characters'),
  duration: z.string().min(1, 'Duration is required').max(100, 'Duration must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  isInternship: z.boolean().default(false)
});

export const HackerProfileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional().or(z.literal('')),
  profileType: z.enum(['student', 'working']).refine(val => val, 'Please select a profile type'),
  city: z.string().min(1, 'City is required').max(50, 'City must be less than 50 characters'),
  state: z.string().min(1, 'State is required').max(50, 'State must be less than 50 characters'),
  country: z.string().default('Malaysia'),
  
  // Student fields
  university: z.string().min(1, 'University is required').max(100, 'University must be less than 100 characters'),
  course: z.string().min(1, 'Course is required').max(100, 'Course must be less than 100 characters'),
  yearOfStudy: z.string().min(1, 'Year of study is required'),
  graduationYear: z.string().min(4, 'Graduation year is required').max(4, 'Invalid year format'),
  
  // Technical skills
  programmingLanguages: z.array(z.string()).min(1, 'Select at least one programming language'),
  frameworks: z.array(z.string()).default([]),
  otherSkills: z.array(z.string()).default([]),
  experienceLevel: z.string().optional().or(z.literal('')),
  
  // Work experience
  hasWorkExperience: z.boolean().default(false),
  workExperiences: z.array(WorkExperienceSchema).default([]),
  
  // Social links
  githubUsername: z.string().max(39, 'Invalid GitHub username').optional().or(z.literal('')),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  twitterUsername: z.string().max(15, 'Invalid Twitter username').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Invalid portfolio URL').optional().or(z.literal('')),
  instagramUsername: z.string().max(30, 'Invalid Instagram username').optional().or(z.literal('')),
  
  // Other
  openToRecruitment: z.boolean().default(false)
});

export const OrganizerProfileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional().or(z.literal('')),
  organizationType: z.string().min(1, 'Organization type is required'),
  organizationName: z.string().min(1, 'Organization name is required').max(100, 'Organization name must be less than 100 characters'),
  position: z.string().min(1, 'Position is required').max(100, 'Position must be less than 100 characters'),
  organizationSize: z.string().optional().or(z.literal('')),
  organizationWebsite: z.string().url('Invalid website URL').optional().or(z.literal('')),
  organizationDescription: z.string().max(500, 'Description must be less than 500 characters').optional().or(z.literal('')),
  
  // Experience
  eventOrganizingExperience: z.string().min(1, 'Experience level is required'),
  previousEvents: z.array(z.any()).default([]),
  
  // Location
  city: z.string().min(1, 'City is required').max(50, 'City must be less than 50 characters'),
  state: z.string().min(1, 'State is required').max(50, 'State must be less than 50 characters'),
  country: z.string().default('Malaysia'),
  willingToTravelFor: z.boolean().default(false),
  preferredEventTypes: z.array(z.string()).default([]),
  
  // Budget & Resources
  typicalBudgetRange: z.string().optional().or(z.literal('')),
  hasVenue: z.boolean().default(false),
  venueDetails: z.string().optional().or(z.literal('')),
  hasSponsorConnections: z.boolean().default(false),
  sponsorDetails: z.string().optional().or(z.literal('')),
  
  // Technical capabilities
  techSetupCapability: z.string().optional().or(z.literal('')),
  livestreamCapability: z.boolean().default(false),
  photographyCapability: z.boolean().default(false),
  marketingCapability: z.boolean().default(false),
  
  // Goals
  primaryGoals: z.array(z.string()).default([]),
  targetAudience: z.array(z.string()).default([]),
  
  // Social links
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  twitterUsername: z.string().max(15, 'Invalid Twitter username').optional().or(z.literal('')),
  websiteUrl: z.string().url('Invalid website URL').optional().or(z.literal('')),
  instagramUsername: z.string().max(30, 'Invalid Instagram username').optional().or(z.literal('')),
  
  // Other
  lookingForCoOrganizers: z.boolean().default(false),
  willingToMentor: z.boolean().default(false),
  availableForConsulting: z.boolean().default(false)
});

export type HackerProfileFormData = z.infer<typeof HackerProfileSchema>;
export type OrganizerProfileFormData = z.infer<typeof OrganizerProfileSchema>;