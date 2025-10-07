import { z } from 'zod';

export const createHackathonStep1Schema = z.object({
  logo: z.string().min(1, 'Please upload a logo image'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  organization: z.string().min(2, 'Organization name is required').max(100, 'Organization name must be less than 100 characters'),
  websiteUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  visibility: z.enum(['public', 'invite']),
  mode: z.enum(['online', 'offline']),
  categories: z.array(z.string()).min(1, 'Please select at least one category'),
  about: z.string().min(500, 'About section must be at least 500 characters').max(10000, 'About section must be less than 10000 characters'),
});

export type CreateHackathonStep1FormData = z.infer<typeof createHackathonStep1Schema>;

export const createHackathonStep2Schema = z.object({
    participationType: z.enum(['individual', 'team']),
    teamSizeMin: z.number().min(1, 'Minimum team size must be at least 1'),
    teamSizeMax: z.number().min(1, 'Maximum team size must be at least 1'),
    registrationStartDate: z.string().min(1, 'Registration start date is required'),
    registrationEndDate: z.string().min(1, 'Registration end date is required'),
    maxRegistrations: z.number().optional().nullable(),
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