import { z } from 'zod';

export const createHackathonStep1Schema = z.object({
  logo: z.string().min(1, 'Please upload a logo image'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  organization: z.string().min(2, 'Organization name is required').max(100, 'Organization name must be less than 100 characters'),
  websiteUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  visibility: z.enum(['public', 'invite']),
  mode: z.enum(['online', 'offline', 'hybrid']),
  location: z.string().optional(),
  categories: z.array(z.string()).min(1, 'Please select at least one category'),
  about: z.string().min(500, 'About section must be at least 500 characters').max(10000, 'About section must be less than 10000 characters'),
}).refine((data) => {
  // Make location required for offline and hybrid modes
  if ((data.mode === 'offline' || data.mode === 'hybrid') && !data.location) {
    return false
  }
  return true
}, {
  message: 'Location is required for offline and hybrid events',
  path: ['location'],
});

export type CreateHackathonStep1FormData = z.infer<typeof createHackathonStep1Schema>;

export const createHackathonStep2Schema = z.object({
    participationType: z.enum(['individual', 'team']),
    teamSizeMin: z.number().min(1, 'Minimum team size must be at least 1'),
    teamSizeMax: z.number().min(1, 'Maximum team size must be at least 1'),
    registrationStartDate: z.string().min(1, 'Registration start date is required'),
    registrationEndDate: z.string().min(1, 'Registration end date is required'),
    maxRegistrations: z.union([z.number().positive('Must be a positive number if specified'), z.null()]).optional(),
  }).refine((data) => data.teamSizeMax >= data.teamSizeMin, {
    message: 'Maximum team size must be greater than or equal to minimum team size',
    path: ['teamSizeMax'],
  }).superRefine((data, ctx) => {
    const now = new Date()
    const parse = (v: string) => new Date(v)

    const start = parse(data.registrationStartDate)
    const end = parse(data.registrationEndDate)

    if (!(start instanceof Date) || isNaN(start.getTime())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['registrationStartDate'], message: 'Invalid start date' })
    } else if (start < now) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['registrationStartDate'], message: 'Registration start date cannot be in the past' })
    }

    if (!(end instanceof Date) || isNaN(end.getTime())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['registrationEndDate'], message: 'Invalid end date' })
    } else if (end < now) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['registrationEndDate'], message: 'Registration end date cannot be in the past' })
    }

    if (start instanceof Date && !isNaN(start.getTime()) && end instanceof Date && !isNaN(end.getTime())) {
      if (end <= start) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['registrationEndDate'], message: 'Registration end date must be after start date' })
      }
    }
  });
  
  export type CreateHackathonStep2FormData = z.infer<typeof createHackathonStep2Schema>;

  export const createHackathonStep3Schema = z.object({
    // Step 1 fields
    title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
    organizer: z.string().min(2, 'Organizer name is required').max(100, 'Organizer name must be less than 100 characters'),
    websiteUrl: z.string().url().optional().or(z.literal('')),
    visibility: z.enum(['public', 'invite']),
    mode: z.enum(['online', 'offline', 'hybrid']),
    location: z.string().optional(),
    
    // Step 2 fields
    participationType: z.enum(['individual', 'team']),
    teamSizeMin: z.number().min(1).optional(),
    teamSizeMax: z.number().min(1).optional(),
    registrationStartDate: z.string().min(1, 'Registration start date is required'),
    registrationEndDate: z.string().min(1, 'Registration end date is required'),
    
    // Step 3 fields
    teams: z.number().min(0, 'Teams cannot be negative'),
    participants: z.number().min(0, 'Participants cannot be negative'),
    maxParticipants: z.number().min(1, 'Max participants must be at least 1'),
    totalPrizePool: z.string().min(1, 'Prize pool is required'),
    bannerUrl: z.string().optional(),
    logoUrl: z.string().optional(),
    about: z.string().min(100, 'About section must be at least 100 characters').max(10000, 'About section must be less than 10000 characters'),
    duration: z.string().min(1, 'Duration is required'),
    registrationDeadline: z.string().min(1, 'Registration deadline is required'),
    eligibility: z.array(z.string()).min(1, 'Please select at least one eligibility criteria'),
    requirements: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
    prizes: z.array(z.object({
      position: z.string().min(1, 'Prize position is required'),
      amount: z.string().optional(),
      description: z.string().optional(),
      type: z.string().min(1, 'Prize type is required')
    })).optional().refine((prizes) => {
      // Validate that non-certificate prizes have an amount
      if (!prizes) return true;
      return prizes.every(prize =>
        prize.type === 'Certificate' || (prize.amount && prize.amount.trim().length > 0)
      );
    }, {
      message: 'Cash prizes must have an amount specified'
    }),
    timeline: z.array(z.object({
      title: z.string().min(1, 'Timeline title is required'),
      startDate: z.string().min(1, 'Start date is required'),
      endDate: z.string().min(1, 'End date is required'),
      description: z.string().optional()
    })).optional(),
    importantDates: z.array(z.object({
      title: z.string().min(1, 'Date title is required'),
      date: z.string().min(1, 'Date is required'),
      time: z.string().min(1, 'Time is required'),
      description: z.string().optional()
    })).optional(),
    faq: z.array(z.object({
      question: z.string().min(1, 'Question is required'),
      answer: z.string().min(1, 'Answer is required')
    })).optional(),
    organizers: z.array(z.object({
      name: z.string().min(1, 'Organizer name is required'),
      role: z.string().min(1, 'Organizer role is required'),
      email: z.string().email('Valid email is required'),
      phone: z.string().optional(),
      profileUrl: z.string().optional(),
      photo: z.string().optional()
    })).optional(),
    sponsors: z.array(z.object({
      name: z.string().min(1, 'Sponsor name is required'),
      tier: z.string().min(1, 'Sponsor tier is required'),
      website: z.string().optional(),
      logo: z.string().optional(),
      description: z.string().optional()
    })).optional()
  }).refine((data) => {
    // Make location required for offline and hybrid modes
    if ((data.mode === 'offline' || data.mode === 'hybrid') && !data.location) {
      return false
    }
    return true
  }, {
    message: 'Location is required for offline and hybrid events',
    path: ['location'],
  }).refine((data) => {
    // Validate team sizes when participation type is team
    if (data.participationType === 'team') {
      if (!data.teamSizeMin || !data.teamSizeMax) return false
      if (data.teamSizeMin > data.teamSizeMax) return false
    }
    return true
  }, {
    message: 'Team size min must be less than or equal to team size max',
    path: ['teamSizeMax'],
  })

export type CreateHackathonStep3FormData = z.infer<typeof createHackathonStep3Schema>;