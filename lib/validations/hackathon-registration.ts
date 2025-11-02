import { z } from 'zod';

export const HackathonRegistrationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  mobile: z.string().min(10, 'Please enter a valid mobile number'),
  firstName: z.string().min(1, 'First name is required').max(100, 'First name must be less than 100 characters'),
  lastName: z.string().max(100, 'Last name must be less than 100 characters').optional(),
  organizationName: z.string().max(200, 'Organization name must be less than 200 characters').optional(),
  participantType: z.enum(['College Students', 'Professional', 'High School / Primary School Student', 'Fresher']),
  passoutYear: z.string().optional(),
  domain: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

export const TeamCreationSchema = z.object({
  teamName: z.string()
    .min(3, 'Team name must be at least 3 characters')
    .max(50, 'Team name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\s_-]+$/, 'Team name can only contain letters, numbers, spaces, hyphens and underscores'),
  lookingForTeammates: z.boolean().default(true),
});

export const TeamMemberSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  mobile: z.string().min(10, 'Please enter a valid mobile number'),
  firstName: z.string().min(1, 'First name is required').max(100, 'First name must be less than 100 characters'),
  lastName: z.string().max(100, 'Last name must be less than 100 characters').optional(),
  organizationName: z.string().max(200, 'Organization name must be less than 200 characters').optional(),
  participantType: z.enum(['College Students', 'Professional', 'High School / Primary School Student', 'Fresher']),
  passoutYear: z.string().optional(),
  domain: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
});

export const TeamMemberUpdateSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  mobile: z.string().min(10, 'Please enter a valid mobile number'),
  firstName: z.string().min(1, 'First name is required').max(100, 'First name must be less than 100 characters'),
  lastName: z.string().max(100, 'Last name must be less than 100 characters').optional(),
  organizationName: z.string().max(200, 'Organization name must be less than 200 characters').optional(),
  participantType: z.enum(['College Students', 'Professional', 'High School / Primary School Student', 'Fresher']),
  passoutYear: z.string().optional(),
  domain: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
});

export type HackathonRegistrationFormData = z.infer<typeof HackathonRegistrationSchema>;
export type TeamCreationFormData = z.infer<typeof TeamCreationSchema>;
export type TeamMemberFormData = z.infer<typeof TeamMemberSchema>;
