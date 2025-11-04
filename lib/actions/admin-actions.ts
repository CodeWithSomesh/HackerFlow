'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Check if the current user is an admin or superadmin
 */
export async function checkAdminAccess() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'User not authenticated', isAdmin: false }
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (error) throw error

    const isAdmin = profile.role === 'admin' || profile.role === 'superadmin'
    const isSuperadmin = profile.role === 'superadmin'

    return {
      success: true,
      isAdmin,
      isSuperadmin,
      role: profile.role
    }
  } catch (error) {
    console.error('Error checking admin access:', error)
    return { success: false, message: 'Failed to check admin access', isAdmin: false }
  }
}

/**
 * Get revenue statistics for admin dashboard
 */
export async function getRevenueStats() {
  try {
    const supabase = await createClient()

    // Check admin access
    const accessCheck = await checkAdminAccess()
    if (!accessCheck.isAdmin) {
      return { success: false, message: 'Unauthorized access' }
    }

    const { data, error } = await supabase
      .from('admin_revenue_stats')
      .select('*')
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching revenue stats:', error)
    return { success: false, message: 'Failed to fetch revenue statistics' }
  }
}

/**
 * Get pending hackathons awaiting admin approval
 */
export async function getPendingHackathons() {
  try {
    const supabase = await createClient()

    // Check admin access
    const accessCheck = await checkAdminAccess()
    if (!accessCheck.isAdmin) {
      return { success: false, message: 'Unauthorized access' }
    }

    const { data, error } = await supabase
      .from('admin_pending_hackathons')
      .select('*')

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching pending hackathons:', error)
    return { success: false, message: 'Failed to fetch pending hackathons' }
  }
}

/**
 * Get ALL hackathons for admin (pending, verified, rejected)
 */
export async function getAllHackathonsForAdmin() {
  try {
    const supabase = await createClient()

    // Check admin access
    const accessCheck = await checkAdminAccess()
    if (!accessCheck.isAdmin) {
      return { success: false, message: 'Unauthorized access' }
    }

    // Fetch hackathons
    const { data: hackathonsData, error: hackathonsError } = await supabase
      .from('hackathons')
      .select('*')
      .order('created_at', { ascending: false })

    if (hackathonsError) throw hackathonsError

    // Fetch user profiles separately
    const { data: profilesData, error: profilesError } = await supabase
      .from('user_profiles')
      .select('user_id, full_name, email, organization_name')

    // Don't throw error if profiles fail, just continue without them
    const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || [])

    // Transform the data to match the expected format
    const transformedData = hackathonsData?.map(h => {
      const profile = profilesMap.get(h.created_by)
      return {
        id: h.id,
        title: h.title,
        organization: h.organization,
        about: h.about,
        identity_document_url: h.identity_document_url,
        authorization_letter_url: h.authorization_letter_url,
        verification_status: h.verification_status,
        status: h.status,
        created_by: h.created_by,
        created_at: h.created_at,
        approved_by: h.approved_by,
        approved_at: h.approved_at,
        rejected_by: h.rejected_by,
        rejected_at: h.rejected_at,
        rejection_reason: h.rejection_reason,
        organizer_name: profile?.full_name || 'N/A',
        organizer_email: profile?.email || 'N/A',
        organizer_organization: profile?.organization_name || ''
      }
    }) || []

    return { success: true, data: transformedData }
  } catch (error) {
    console.error('Error fetching all hackathons:', error)
    return { success: false, message: 'Failed to fetch hackathons' }
  }
}

/**
 * Get user statistics for admin dashboard
 */
export async function getUserStats() {
  try {
    const supabase = await createClient()

    // Check admin access
    const accessCheck = await checkAdminAccess()
    if (!accessCheck.isAdmin) {
      return { success: false, message: 'Unauthorized access' }
    }

    const { data, error } = await supabase
      .from('admin_user_stats')
      .select('*')
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return { success: false, message: 'Failed to fetch user statistics' }
  }
}

/**
 * Approve a hackathon (admin only)
 */
export async function approveHackathon(hackathonId: string) {
  try {
    const supabase = await createClient()

    // Check admin access
    const accessCheck = await checkAdminAccess()
    if (!accessCheck.isAdmin) {
      return { success: false, message: 'Unauthorized access' }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, message: 'User not authenticated' }
    }

    // Call the approve_hackathon function
    const { error } = await supabase.rpc('approve_hackathon', {
      p_hackathon_id: hackathonId,
      p_admin_id: user.id
    })

    if (error) throw error

    revalidatePath('/admin/dashboard/approvals')
    revalidatePath('/admin/dashboard/revenue')

    return { success: true, message: 'Hackathon approved successfully' }
  } catch (error) {
    console.error('Error approving hackathon:', error)
    return { success: false, message: 'Failed to approve hackathon' }
  }
}

/**
 * Reject a hackathon (admin only)
 */
export async function rejectHackathon(hackathonId: string, rejectionReason: string) {
  try {
    const supabase = await createClient()

    // Check admin access
    const accessCheck = await checkAdminAccess()
    if (!accessCheck.isAdmin) {
      return { success: false, message: 'Unauthorized access' }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, message: 'User not authenticated' }
    }

    // Call the reject_hackathon function
    const { error } = await supabase.rpc('reject_hackathon', {
      p_hackathon_id: hackathonId,
      p_admin_id: user.id,
      p_rejection_reason: rejectionReason
    })

    if (error) throw error

    revalidatePath('/admin/dashboard/approvals')

    return { success: true, message: 'Hackathon rejected' }
  } catch (error) {
    console.error('Error rejecting hackathon:', error)
    return { success: false, message: 'Failed to reject hackathon' }
  }
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers() {
  try {
    const supabase = await createClient()

    // Check admin access
    const accessCheck = await checkAdminAccess()
    if (!accessCheck.isAdmin) {
      return { success: false, message: 'Unauthorized access' }
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('user_id, full_name, email, role, user_primary_type, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching all users:', error)
    return { success: false, message: 'Failed to fetch users' }
  }
}

/**
 * Search users by email (admin only)
 */
export async function searchUsersByEmail(emailQuery: string) {
  try {
    const supabase = await createClient()

    // Check admin access
    const accessCheck = await checkAdminAccess()
    if (!accessCheck.isAdmin) {
      return { success: false, message: 'Unauthorized access' }
    }

    if (!emailQuery || emailQuery.trim().length === 0) {
      return { success: true, data: [] }
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('user_id, full_name, email, role, user_primary_type, organization_name, created_at')
      .ilike('email', `%${emailQuery}%`)
      .order('email', { ascending: true })
      .limit(20)

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error searching users by email:', error)
    return { success: false, message: 'Failed to search users' }
  }
}

/**
 * Promote user to admin (superadmin only)
 */
export async function promoteToAdmin(userId: string) {
  try {
    const supabase = await createClient()

    // Check superadmin access
    const accessCheck = await checkAdminAccess()
    if (!accessCheck.isSuperadmin) {
      return { success: false, message: 'Unauthorized: Only superadmins can promote users' }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, message: 'User not authenticated' }
    }

    // Call the promote_to_admin function
    const { error } = await supabase.rpc('promote_to_admin', {
      p_user_id: userId,
      p_superadmin_id: user.id
    })

    if (error) throw error

    revalidatePath('/admin/dashboard/users')

    return { success: true, message: 'User promoted to admin successfully' }
  } catch (error) {
    console.error('Error promoting user to admin:', error)
    return { success: false, message: 'Failed to promote user to admin' }
  }
}

/**
 * Demote admin to user (superadmin only)
 */
export async function demoteToUser(userId: string) {
  try {
    const supabase = await createClient()

    // Check superadmin access
    const accessCheck = await checkAdminAccess()
    if (!accessCheck.isSuperadmin) {
      return { success: false, message: 'Unauthorized: Only superadmins can demote admins' }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, message: 'User not authenticated' }
    }

    // Call the demote_to_user function
    const { error } = await supabase.rpc('demote_to_user', {
      p_user_id: userId,
      p_superadmin_id: user.id
    })

    if (error) throw error

    revalidatePath('/admin/dashboard/users')

    return { success: true, message: 'Admin demoted to user successfully' }
  } catch (error) {
    console.error('Error demoting admin to user:', error)
    return { success: false, message: 'Failed to demote admin to user' }
  }
}

/**
 * Get all hackathons with details (admin only)
 */
export async function getAllHackathons() {
  try {
    const supabase = await createClient()

    // Check admin access
    const accessCheck = await checkAdminAccess()
    if (!accessCheck.isAdmin) {
      return { success: false, message: 'Unauthorized access' }
    }

    const { data, error } = await supabase
      .from('hackathons')
      .select(`
        *,
        user_profiles!hackathons_created_by_fkey (
          full_name,
          email,
          organization_name
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching all hackathons:', error)
    return { success: false, message: 'Failed to fetch hackathons' }
  }
}

/**
 * Get all registrations (admin only)
 */
export async function getAllRegistrations() {
  try {
    const supabase = await createClient()

    // Check admin access
    const accessCheck = await checkAdminAccess()
    if (!accessCheck.isAdmin) {
      return { success: false, message: 'Unauthorized access' }
    }

    const { data, error } = await supabase
      .from('hackathon_registrations')
      .select(`
        *,
        hackathons (
          title,
          organization
        ),
        user_profiles (
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching all registrations:', error)
    return { success: false, message: 'Failed to fetch registrations' }
  }
}

/**
 * Get all teams (admin only)
 */
export async function getAllTeams() {
  try {
    const supabase = await createClient()

    // Check admin access
    const accessCheck = await checkAdminAccess()
    if (!accessCheck.isAdmin) {
      return { success: false, message: 'Unauthorized access' }
    }

    const { data, error } = await supabase
      .from('hackathon_teams')
      .select(`
        *,
        hackathons (
          title,
          organization
        ),
        user_profiles!hackathon_teams_team_leader_id_fkey (
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching all teams:', error)
    return { success: false, message: 'Failed to fetch teams' }
  }
}

/**
 * Get revenue data for charts (last 6 months)
 */
export async function getRevenueOverTime() {
  try {
    const supabase = await createClient()

    // Check admin access
    const accessCheck = await checkAdminAccess()
    if (!accessCheck.isAdmin) {
      return { success: false, message: 'Unauthorized access' }
    }

    const { data, error } = await supabase
      .from('hackathons')
      .select('posting_fee, posting_fee_paid_at')
      .eq('posting_fee_paid', true)
      .not('posting_fee_paid_at', 'is', null)
      .gte('posting_fee_paid_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
      .order('posting_fee_paid_at', { ascending: true })

    if (error) throw error

    // Group by month
    const revenueByMonth: { [key: string]: number } = {}
    data?.forEach((item) => {
      if (item.posting_fee_paid_at) {
        const month = new Date(item.posting_fee_paid_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        revenueByMonth[month] = (revenueByMonth[month] || 0) + (item.posting_fee || 0)
      }
    })

    const chartData = Object.entries(revenueByMonth).map(([month, revenue]) => ({
      month,
      revenue
    }))

    return { success: true, data: chartData }
  } catch (error) {
    console.error('Error fetching revenue over time:', error)
    return { success: false, message: 'Failed to fetch revenue data' }
  }
}
