'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Get all saved ideas for the current user
 */
export async function getSavedIdeas() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'User not authenticated', data: [] }
    }

    const { data, error } = await supabase
      .from('generated_ideas')
      .select(`
        *,
        hackathons (
          id,
          title,
          organization,
          logo_url,
          categories
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching saved ideas:', error)
    return { success: false, message: 'Failed to fetch saved ideas', data: [] }
  }
}

/**
 * Get a specific saved idea by ID
 */
export async function getSavedIdeaById(ideaId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('generated_ideas')
      .select(`
        *,
        hackathons (
          id,
          title,
          organization,
          logo_url,
          categories,
          about,
          mode,
          visibility
        )
      `)
      .eq('id', ideaId)
      .eq('user_id', user.id)
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching saved idea:', error)
    return { success: false, message: 'Failed to fetch saved idea' }
  }
}

/**
 * Delete a saved idea
 */
export async function deleteSavedIdea(ideaId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'User not authenticated' }
    }

    const { error } = await supabase
      .from('generated_ideas')
      .delete()
      .eq('id', ideaId)
      .eq('user_id', user.id)

    if (error) throw error

    return { success: true, message: 'Idea deleted successfully' }
  } catch (error) {
    console.error('Error deleting saved idea:', error)
    return { success: false, message: 'Failed to delete saved idea' }
  }
}
