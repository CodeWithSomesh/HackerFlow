// =====================================================
// DUMMY DATA FOR ADMIN DASHBOARD
// =====================================================
// ⚠️ REMOVE THIS ENTIRE FILE BEFORE PRODUCTION ⚠️
//
// This file contains mock data for development and testing purposes.
// It allows you to test the admin dashboard UI without real data.
//
// TO REMOVE FOR PRODUCTION:
// 1. Delete this entire file: lib/dummy-data/admin-dummy-data.ts
// 2. Remove all imports of this file from:
//    - app/admin/dashboard/approvals/page.tsx
//    - app/admin/dashboard/users/page.tsx
//    - app/admin/dashboard/layout.tsx
// 3. Remove all usages of:
//    - DUMMY_PENDING_HACKATHONS
//    - DUMMY_USERS
//    - isDummyDataEnabled()
//    - mergeDummyData()
// 4. Remove the DummyDataToggle component from the layout
// 5. Search codebase for "DUMMY DATA" comments and clean up
//
// =====================================================

export const DUMMY_PENDING_HACKATHONS = [
  {
    id: 'dummy-hack-1',
    title: 'AI Innovation Challenge 2025',
    organization: 'TechStartup Inc.',
    about: 'A 48-hour hackathon focused on building innovative AI solutions for real-world problems. Participants will work in teams to create prototypes using machine learning, natural language processing, and computer vision technologies.',
    identity_document_url: 'https://example.com/identity-doc-1.pdf',
    authorization_letter_url: 'https://example.com/auth-letter-1.pdf',
    verification_status: 'pending',
    status: 'waiting_for_approval',
    created_by: 'dummy-user-1',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    approved_by: null,
    approved_at: null,
    rejected_by: null,
    rejected_at: null,
    rejection_reason: null,
    organizer_name: 'Sarah Johnson',
    organizer_email: 'sarah.johnson@techstartup.com',
    organizer_organization: 'TechStartup Inc.'
  },
  {
    id: 'dummy-hack-2',
    title: 'Blockchain & Web3 Hackfest',
    organization: 'CryptoVerse Foundation',
    about: 'Join us for an exciting weekend of blockchain development! Build decentralized applications, smart contracts, and explore the future of Web3. Prizes worth $50,000 USD to be won!',
    identity_document_url: 'https://example.com/identity-doc-2.pdf',
    authorization_letter_url: 'https://example.com/auth-letter-2.pdf',
    verification_status: 'verified',
    status: 'published',
    created_by: 'dummy-user-2',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    approved_by: 'admin-user-1',
    approved_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    rejected_by: null,
    rejected_at: null,
    rejection_reason: null,
    organizer_name: 'Michael Chen',
    organizer_email: 'm.chen@cryptoverse.org',
    organizer_organization: 'CryptoVerse Foundation'
  },
  {
    id: 'dummy-hack-3',
    title: 'Sustainable Tech Hackathon',
    organization: 'Green Earth Initiative',
    about: 'Create technology solutions to combat climate change and promote sustainability. Focus areas include renewable energy, waste management, carbon tracking, and sustainable agriculture.',
    identity_document_url: 'https://example.com/identity-doc-3.pdf',
    authorization_letter_url: 'https://example.com/auth-letter-3.pdf',
    verification_status: 'rejected',
    status: 'draft',
    created_by: 'dummy-user-3',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    approved_by: null,
    approved_at: null,
    rejected_by: 'admin-user-1',
    rejected_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    rejection_reason: 'Insufficient documentation. Please provide more details about your organization and event planning.',
    organizer_name: 'Emma Rodriguez',
    organizer_email: 'emma.r@greenearth.org',
    organizer_organization: 'Green Earth Initiative'
  },
  {
    id: 'dummy-hack-4',
    title: 'HealthTech Innovation Summit',
    organization: 'MediCare Solutions',
    about: 'Develop healthcare technology solutions that improve patient care, streamline medical processes, and make healthcare more accessible. Categories include telemedicine, health tracking, and medical AI.',
    identity_document_url: 'https://example.com/identity-doc-4.pdf',
    authorization_letter_url: 'https://example.com/auth-letter-4.pdf',
    verification_status: 'pending',
    status: 'waiting_for_approval',
    created_by: 'dummy-user-4',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    approved_by: null,
    approved_at: null,
    rejected_by: null,
    rejected_at: null,
    rejection_reason: null,
    organizer_name: 'Dr. James Patterson',
    organizer_email: 'j.patterson@medicare-solutions.com',
    organizer_organization: 'MediCare Solutions'
  },
  {
    id: 'dummy-hack-5',
    title: 'EdTech Revolution 2025',
    organization: 'Future Learning Academy',
    about: 'Transform education through technology! Build innovative solutions for online learning, student engagement, assessment tools, and educational games. Open to students and professionals.',
    identity_document_url: 'https://example.com/identity-doc-5.pdf',
    authorization_letter_url: 'https://example.com/auth-letter-5.pdf',
    verification_status: 'verified',
    status: 'published',
    created_by: 'dummy-user-5',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    approved_by: 'admin-user-1',
    approved_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    rejected_by: null,
    rejected_at: null,
    rejection_reason: null,
    organizer_name: 'Prof. Lisa Wong',
    organizer_email: 'l.wong@futurelearning.edu',
    organizer_organization: 'Future Learning Academy'
  }
]

export const DUMMY_USERS = [
  {
    user_id: 'dummy-user-1',
    email: 'alice.developer@email.com',
    full_name: 'Alice Developer',
    role: 'user',
    user_primary_type: 'hacker',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
  },
  {
    user_id: 'dummy-user-2',
    email: 'bob.organizer@email.com',
    full_name: 'Bob Organizer',
    role: 'user',
    user_primary_type: 'organizer',
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    user_id: 'dummy-user-3',
    email: 'charlie.hacker@email.com',
    full_name: 'Charlie Hacker',
    role: 'user',
    user_primary_type: 'hacker',
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    user_id: 'dummy-user-4',
    email: 'diana.admin@email.com',
    full_name: 'Diana Admin',
    role: 'admin',
    user_primary_type: 'organizer',
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    user_id: 'dummy-user-5',
    email: 'eve.developer@email.com',
    full_name: 'Eve Developer',
    role: 'user',
    user_primary_type: 'hacker',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    user_id: 'dummy-user-6',
    email: 'frank.organizer@email.com',
    full_name: 'Frank Organizer',
    role: 'user',
    user_primary_type: 'organizer',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    user_id: 'dummy-user-7',
    email: 'grace.hacker@email.com',
    full_name: 'Grace Hacker',
    role: 'user',
    user_primary_type: 'hacker',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    user_id: 'dummy-user-8',
    email: 'henry.developer@email.com',
    full_name: 'Henry Developer',
    role: 'user',
    user_primary_type: 'hacker',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    user_id: 'dummy-user-9',
    email: 'isabelle.coder@email.com',
    full_name: 'Isabelle Coder',
    role: 'user',
    user_primary_type: 'hacker',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    user_id: 'dummy-user-10',
    email: 'jack.organizer@email.com',
    full_name: 'Jack Organizer',
    role: 'user',
    user_primary_type: 'organizer',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
]

export const DUMMY_REVENUE_STATS = {
  total_paid_hackathons: 47,
  total_revenue: 940.00,
  revenue_last_6_months: 820.00,
  revenue_this_month: 180.00,
  revenue_today: 40.00,
  pending_approvals: 5,
  approved_hackathons: 42,
  rejected_hackathons: 5
}

export const DUMMY_USER_STATS = {
  total_users: 247,
  total_admins: 3,
  total_superadmins: 1,
  total_hackers: 178,
  total_organizers: 69,
  new_users_this_month: 23,
  new_users_today: 5
}

export const DUMMY_REVENUE_OVER_TIME = [
  { month: 'Aug 2024', revenue: 120.00 },
  { month: 'Sep 2024', revenue: 140.00 },
  { month: 'Oct 2024', revenue: 100.00 },
  { month: 'Nov 2024', revenue: 160.00 },
  { month: 'Dec 2024', revenue: 180.00 },
  { month: 'Jan 2025', revenue: 120.00 },
  { month: 'Feb 2025', revenue: 180.00 }
]

export const DUMMY_HACKATHONS = [
  {
    id: 'hack-1',
    title: 'Summer Code Sprint 2024',
    organization: 'Tech University',
    verification_status: 'confirmed',
    status: 'completed',
    posting_fee: 20.00,
    posting_fee_paid: true,
    posting_fee_paid_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
    user_profiles: {
      full_name: 'Prof. Anderson',
      email: 'anderson@tech.edu',
      organization_name: 'Tech University'
    }
  },
  {
    id: 'hack-2',
    title: 'Startup Weekend Hackathon',
    organization: 'Innovation Hub',
    verification_status: 'confirmed',
    status: 'published',
    posting_fee: 20.00,
    posting_fee_paid: true,
    posting_fee_paid_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    user_profiles: {
      full_name: 'Sarah Startup',
      email: 'sarah@innovationhub.com',
      organization_name: 'Innovation Hub'
    }
  }
]

export const DUMMY_REGISTRATIONS = [
  {
    id: 'reg-1',
    user_id: 'dummy-user-1',
    hackathon_id: 'hack-1',
    team_id: null,
    registration_type: 'individual',
    created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    hackathons: {
      title: 'Summer Code Sprint 2024',
      organization: 'Tech University'
    },
    user_profiles: {
      full_name: 'Alice Developer',
      email: 'alice.developer@email.com'
    }
  },
  {
    id: 'reg-2',
    user_id: 'dummy-user-3',
    hackathon_id: 'hack-2',
    team_id: 'team-1',
    registration_type: 'team',
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    hackathons: {
      title: 'Startup Weekend Hackathon',
      organization: 'Innovation Hub'
    },
    user_profiles: {
      full_name: 'Charlie Hacker',
      email: 'charlie.hacker@email.com'
    }
  }
]

export const DUMMY_TEAMS = [
  {
    id: 'team-1',
    team_name: 'Code Warriors',
    hackathon_id: 'hack-2',
    team_leader_id: 'dummy-user-3',
    max_members: 4,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    hackathons: {
      title: 'Startup Weekend Hackathon',
      organization: 'Innovation Hub'
    },
    user_profiles: {
      full_name: 'Charlie Hacker',
      email: 'charlie.hacker@email.com'
    }
  }
]

// ===== HELPER FUNCTIONS - REMOVE BEFORE PRODUCTION =====

// Helper function to check if dummy data is enabled
// Reads from localStorage (set by DummyDataToggle component)
export function isDummyDataEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem('useDummyData')
  return stored === 'true'
}

// Helper function to merge real data with dummy data
// When dummy data is enabled, it prepends dummy data to real data
export function mergeDummyData<T>(realData: T[], dummyData: T[]): T[] {
  if (isDummyDataEnabled()) {
    return [...dummyData, ...realData]
  }
  return realData
}

// ========================================================
