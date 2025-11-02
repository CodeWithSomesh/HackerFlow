'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Types (same as friend-actions.ts)
export interface SearchUserResult {
  user_id: string
  full_name: string
  email: string
  bio?: string
  city?: string
  state?: string
  country?: string
  profile_image?: string
  user_primary_type: 'hacker' | 'organizer'
  programming_languages?: string[]
  frameworks?: string[]
  experience_level?: string
  organization_name?: string
  position?: string
  is_friend: boolean
  friend_request_status?: 'pending' | 'accepted' | 'rejected'
  friend_request_direction?: 'sent' | 'received'
}

// =====================================================
// SEARCH USERS (Direct Query - No RPC)
// =====================================================
export async function searchUsersDirect(query: string) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('🔍 Search - Current User:', user?.id)

    if (authError || !user) {
      console.error('❌ Auth Error:', authError)
      return { success: false, error: 'User not authenticated' }
    }

    if (!query || query.trim().length === 0) {
      console.log('⚠️ Empty query')
      return { success: true, data: [] }
    }

    console.log('🔍 Searching for:', query.trim())

    // Direct query without RPC function
    const searchQuery = `%${query.trim()}%`

    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select(`
        user_id,
        full_name,
        email,
        bio,
        city,
        state,
        country,
        profile_image,
        user_primary_type,
        programming_languages,
        frameworks,
        experience_level,
        organization_name,
        position
      `)
      .neq('user_id', user.id)
      .or(`full_name.ilike.${searchQuery},email.ilike.${searchQuery}`)
      .order('full_name')
      .limit(20)

    console.log('📊 Profile Results:', profiles?.length)
    console.log('❌ Profile Error:', error)

    if (error) {
      console.error('Search error:', error)
      return { success: false, error: `Search failed: ${error.message}` }
    }

    if (!profiles || profiles.length === 0) {
      console.log('⚠️ No profiles found')
      return { success: true, data: [] }
    }

    // Enrich each profile with friendship status
    const enrichedData = await Promise.all(
      profiles.map(async (profile) => {
        // Determine the ordered user IDs for friendship lookup
        const userId1 = user.id < profile.user_id ? user.id : profile.user_id
        const userId2 = user.id < profile.user_id ? profile.user_id : user.id

        // Check if already friends
        const { data: friendship } = await supabase
          .from('friendships')
          .select('id')
          .eq('user_id_1', userId1)
          .eq('user_id_2', userId2)
          .maybeSingle()

        // Check for friend request
        const { data: sentRequest } = await supabase
          .from('friend_requests')
          .select('id, status')
          .eq('sender_id', user.id)
          .eq('receiver_id', profile.user_id)
          .maybeSingle()

        const { data: receivedRequest } = await supabase
          .from('friend_requests')
          .select('id, status')
          .eq('sender_id', profile.user_id)
          .eq('receiver_id', user.id)
          .maybeSingle()

        const request = sentRequest || receivedRequest
        const direction = sentRequest ? 'sent' : receivedRequest ? 'received' : null

        return {
          ...profile,
          is_friend: !!friendship,
          friend_request_status: (request?.status as any) || undefined,
          friend_request_direction: direction as any
        }
      })
    )

    console.log('✅ Enriched Results:', enrichedData.length)

    return { success: true, data: enrichedData as SearchUserResult[] }
  } catch (error) {
    console.error('❌ Error in searchUsersDirect:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// =====================================================
// GET FRIEND COUNTS (Direct Query - No RPC)
// =====================================================
export async function getFriendCountsDirect() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Count friendships
    const { count: friendCount, error: friendError } = await supabase
      .from('friendships')
      .select('*', { count: 'exact', head: true })
      .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)

    // Count pending requests
    const { count: pendingCount, error: pendingError } = await supabase
      .from('friend_requests')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('status', 'pending')

    if (friendError || pendingError) {
      console.error('Count errors:', { friendError, pendingError })
    }

    return {
      success: true,
      data: {
        friendCount: friendCount || 0,
        pendingRequestCount: pendingCount || 0
      }
    }
  } catch (error) {
    console.error('Error in getFriendCountsDirect:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: { friendCount: 0, pendingRequestCount: 0 }
    }
  }
}
