'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Types
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

export interface FriendRequest {
  id: string
  sender_id: string
  receiver_id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
  sender?: {
    full_name: string
    email: string
    profile_image?: string
    bio?: string
    user_primary_type: string
    programming_languages?: string[]
    frameworks?: string[]
    position?: string
    organization_name?: string
  }
  receiver?: {
    full_name: string
    email: string
    profile_image?: string
    bio?: string
    user_primary_type: string
  }
}

export interface Friendship {
  id: string
  user_id_1: string
  user_id_2: string
  created_at: string
  friend?: {
    user_id: string
    full_name: string
    email: string
    profile_image?: string
    bio?: string
    user_primary_type: string
    programming_languages?: string[]
    frameworks?: string[]
    position?: string
    organization_name?: string
    city?: string
    state?: string
    country?: string
  }
}

// =====================================================
// SEARCH USERS
// =====================================================
export async function searchUsers(query: string) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    if (!query || query.trim().length === 0) {
      return { success: true, data: [] }
    }

    // Use the database function for searching
    const { data, error } = await supabase
      .rpc('search_users', {
        p_search_query: query.trim(),
        p_current_user_id: user.id,
        p_limit: 20
      })

    if (error) {
      console.error('Search error:', error)
      return { success: false, error: `Search failed: ${error.message}` }
    }

    return { success: true, data: data as SearchUserResult[] }
  } catch (error) {
    console.error('Error in searchUsers:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// =====================================================
// SEND FRIEND REQUEST
// =====================================================
export async function sendFriendRequest(receiverId: string) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    if (user.id === receiverId) {
      return { success: false, error: 'Cannot send friend request to yourself' }
    }

    // Check if users are already friends
    const { data: existingFriendship, error: friendshipError } = await supabase
      .from('friendships')
      .select('id')
      .or(`and(user_id_1.eq.${user.id < receiverId ? user.id : receiverId},user_id_2.eq.${user.id < receiverId ? receiverId : user.id}),and(user_id_1.eq.${user.id < receiverId ? receiverId : user.id},user_id_2.eq.${user.id < receiverId ? user.id : receiverId})`)
      .maybeSingle()

    if (existingFriendship) {
      return { success: false, error: 'You are already friends with this user' }
    }

    // Check if a PENDING friend request already exists
    const { data: existingRequest, error: requestError } = await supabase
      .from('friend_requests')
      .select('id, status, sender_id')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
      .eq('status', 'pending')
      .maybeSingle()

    if (existingRequest) {
      if (existingRequest.sender_id === user.id) {
        return { success: false, error: 'Friend request already sent' }
      } else {
        return { success: false, error: 'This user has already sent you a friend request' }
      }
    }

    // Delete any old rejected or accepted requests to allow sending again
    await supabase
      .from('friend_requests')
      .delete()
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
      .in('status', ['rejected', 'accepted'])

    // Create friend request
    const { data: newRequest, error: createError } = await supabase
      .from('friend_requests')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        status: 'pending'
      })
      .select()
      .single()

    if (createError) {
      console.error('Create request error:', createError)
      return { success: false, error: `Failed to send friend request: ${createError.message}` }
    }

    // Create notification for receiver
    await supabase
      .from('notifications')
      .insert({
        user_id: receiverId,
        type: 'friend_request',
        title: 'New Friend Request',
        message: 'You have received a new friend request',
        link: '/profile?tab=requests',
        metadata: {
          sender_id: user.id,
          request_id: newRequest.id
        }
      })

    revalidatePath('/profile')
    return { success: true, data: newRequest }
  } catch (error) {
    console.error('Error in sendFriendRequest:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// =====================================================
// ACCEPT FRIEND REQUEST
// =====================================================
export async function acceptFriendRequest(requestId: string) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Get the friend request
    const { data: request, error: requestError } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('id', requestId)
      .eq('receiver_id', user.id)
      .eq('status', 'pending')
      .single()

    if (requestError || !request) {
      return { success: false, error: 'Friend request not found' }
    }

    // Update request status to accepted
    const { error: updateError } = await supabase
      .from('friend_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId)

    if (updateError) {
      console.error('Update error:', updateError)
      return { success: false, error: `Failed to accept request: ${updateError.message}` }
    }

    // The trigger function will automatically create the friendship
    // and send notifications to both users

    revalidatePath('/profile')
    return { success: true, senderId: request.sender_id, receiverId: request.receiver_id }
  } catch (error) {
    console.error('Error in acceptFriendRequest:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// =====================================================
// REJECT FRIEND REQUEST
// =====================================================
export async function rejectFriendRequest(requestId: string) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Update request status to rejected
    const { error: updateError } = await supabase
      .from('friend_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId)
      .eq('receiver_id', user.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return { success: false, error: `Failed to reject request: ${updateError.message}` }
    }

    revalidatePath('/profile')
    return { success: true }
  } catch (error) {
    console.error('Error in rejectFriendRequest:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// =====================================================
// CANCEL FRIEND REQUEST (for sender)
// =====================================================
export async function cancelFriendRequest(requestId: string) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Delete the request (only if user is the sender)
    const { error: deleteError } = await supabase
      .from('friend_requests')
      .delete()
      .eq('id', requestId)
      .eq('sender_id', user.id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return { success: false, error: `Failed to cancel request: ${deleteError.message}` }
    }

    revalidatePath('/profile')
    return { success: true }
  } catch (error) {
    console.error('Error in cancelFriendRequest:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// =====================================================
// GET PENDING FRIEND REQUESTS (received)
// =====================================================
export async function getPendingFriendRequests() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Get friend requests without joins
    const { data: requests, error } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('receiver_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Get requests error:', error)
      return { success: false, error: `Failed to get requests: ${error.message}` }
    }

    if (!requests || requests.length === 0) {
      return { success: true, data: [] }
    }

    // Manually fetch sender profiles
    const enrichedRequests = await Promise.all(
      requests.map(async (request) => {
        const { data: senderProfile } = await supabase
          .from('user_profiles')
          .select('user_id, full_name, email, profile_image, bio, user_primary_type, programming_languages, frameworks, position, organization_name')
          .eq('user_id', request.sender_id)
          .single()

        return {
          ...request,
          sender: senderProfile
        }
      })
    )

    return { success: true, data: enrichedRequests }
  } catch (error) {
    console.error('Error in getPendingFriendRequests:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// =====================================================
// GET SENT FRIEND REQUESTS
// =====================================================
export async function getSentFriendRequests() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Get friend requests without joins
    const { data: requests, error } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('sender_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Get sent requests error:', error)
      return { success: false, error: `Failed to get sent requests: ${error.message}` }
    }

    if (!requests || requests.length === 0) {
      return { success: true, data: [] }
    }

    // Manually fetch receiver profiles
    const enrichedRequests = await Promise.all(
      requests.map(async (request) => {
        const { data: receiverProfile } = await supabase
          .from('user_profiles')
          .select('user_id, full_name, email, profile_image, bio, user_primary_type')
          .eq('user_id', request.receiver_id)
          .single()

        return {
          ...request,
          receiver: receiverProfile
        }
      })
    )

    return { success: true, data: enrichedRequests }
  } catch (error) {
    console.error('Error in getSentFriendRequests:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// =====================================================
// GET FRIENDS LIST
// =====================================================
export async function getFriendsList() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('friendships')
      .select(`
        id,
        user_id_1,
        user_id_2,
        created_at
      `)
      .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Get friends error:', error)
      return { success: false, error: `Failed to get friends: ${error.message}` }
    }

    // Get friend profiles
    const friendsWithProfiles = await Promise.all(
      data.map(async (friendship) => {
        const friendId = friendship.user_id_1 === user.id ? friendship.user_id_2 : friendship.user_id_1

        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('user_id, full_name, email, profile_image, bio, user_primary_type, programming_languages, frameworks, position, organization_name, city, state, country')
          .eq('user_id', friendId)
          .single()

        if (profileError) {
          console.error('Profile error:', profileError)
          return { ...friendship, friend: null }
        }

        return { ...friendship, friend: profile }
      })
    )

    return { success: true, data: friendsWithProfiles.filter(f => f.friend !== null) }
  } catch (error) {
    console.error('Error in getFriendsList:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// =====================================================
// GET FRIENDS LIST FOR A SPECIFIC USER (for viewing other user's friends)
// =====================================================
export async function getFriendsListForUser(targetUserId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('friendships')
      .select(`
        id,
        user_id_1,
        user_id_2,
        created_at
      `)
      .or(`user_id_1.eq.${targetUserId},user_id_2.eq.${targetUserId}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Get friends error:', error)
      return { success: false, error: `Failed to get friends: ${error.message}` }
    }

    // Get friend profiles
    const friendsWithProfiles = await Promise.all(
      data.map(async (friendship) => {
        const friendId = friendship.user_id_1 === targetUserId ? friendship.user_id_2 : friendship.user_id_1

        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('user_id, full_name, email, profile_image, bio, user_primary_type, programming_languages, frameworks, position, organization_name, city, state, country')
          .eq('user_id', friendId)
          .single()

        if (profileError) {
          console.error('Profile error:', profileError)
          return { ...friendship, friend: null }
        }

        return { ...friendship, friend: profile }
      })
    )

    return { success: true, data: friendsWithProfiles.filter(f => f.friend !== null) }
  } catch (error) {
    console.error('Error in getFriendsListForUser:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// =====================================================
// REMOVE FRIEND (UNFRIEND)
// =====================================================
export async function removeFriend(friendshipId: string) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // First, get the friendship to find the user IDs
    const { data: friendship, error: fetchError } = await supabase
      .from('friendships')
      .select('user_id_1, user_id_2')
      .eq('id', friendshipId)
      .single()

    if (fetchError || !friendship) {
      console.error('Fetch friendship error:', fetchError)
      return { success: false, error: 'Friendship not found' }
    }

    // Delete the friendship
    const { error: deleteError } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId)
      .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)

    if (deleteError) {
      console.error('Delete friendship error:', deleteError)
      return { success: false, error: `Failed to remove friend: ${deleteError.message}` }
    }

    // Delete the corresponding accepted friend request to allow new requests
    await supabase
      .from('friend_requests')
      .delete()
      .eq('status', 'accepted')
      .or(`and(sender_id.eq.${friendship.user_id_1},receiver_id.eq.${friendship.user_id_2}),and(sender_id.eq.${friendship.user_id_2},receiver_id.eq.${friendship.user_id_1})`)

    revalidatePath('/profile')
    return { success: true }
  } catch (error) {
    console.error('Error in removeFriend:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// =====================================================
// GET FRIEND COUNTS
// =====================================================
export async function getFriendCounts() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Get friend count
    const { data: friendCount, error: friendError } = await supabase
      .rpc('get_friend_count', { p_user_id: user.id })

    // Get pending request count
    const { data: pendingCount, error: pendingError } = await supabase
      .rpc('get_pending_request_count', { p_user_id: user.id })

    return {
      success: true,
      data: {
        friendCount: friendCount || 0,
        pendingRequestCount: pendingCount || 0
      }
    }
  } catch (error) {
    console.error('Error in getFriendCounts:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: { friendCount: 0, pendingRequestCount: 0 }
    }
  }
}

// =====================================================
// CHECK FRIENDSHIP STATUS
// =====================================================
export async function checkFriendshipStatus(otherUserId: string) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Check if friends
    const userId1 = user.id < otherUserId ? user.id : otherUserId
    const userId2 = user.id < otherUserId ? otherUserId : user.id

    const { data: friendship, error: friendshipError } = await supabase
      .from('friendships')
      .select('id')
      .eq('user_id_1', userId1)
      .eq('user_id_2', userId2)
      .maybeSingle()

    if (friendship) {
      return { success: true, status: 'friends', friendshipId: friendship.id }
    }

    // Check for pending request
    const { data: request, error: requestError } = await supabase
      .from('friend_requests')
      .select('id, sender_id, status')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
      .maybeSingle()

    if (request) {
      if (request.status === 'pending') {
        return {
          success: true,
          status: 'request_pending',
          direction: request.sender_id === user.id ? 'sent' : 'received',
          requestId: request.id
        }
      }
    }

    return { success: true, status: 'none' }
  } catch (error) {
    console.error('Error in checkFriendshipStatus:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
