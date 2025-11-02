'use server'

import { createClient } from '@/lib/supabase/server';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export async function createConversation(hackathonId: string, ideaId: string, initialMessages: Message[] = []) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        hackathon_id: hackathonId,
        idea_id: ideaId,
        messages: JSON.stringify(initialMessages),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Server error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function updateConversation(conversationId: string, messages: Message[]) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('conversations')
      .update({
        messages: JSON.stringify(messages),
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating conversation:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Server error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function fetchConversationByIdeaId(ideaId: string) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated', data: null };
    }

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('idea_id', ideaId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code === 'PGRST116') {
      // No conversation found, return null
      return { success: true, data: null };
    }

    if (error) {
      console.error('Error fetching conversation:', error);
      return { success: false, error: error.message, data: null };
    }

    // Parse messages from JSON
    const parsedData = {
      ...data,
      messages: data.messages ? JSON.parse(data.messages) : [],
    };

    return { success: true, data: parsedData };
  } catch (error) {
    console.error('Server error:', error);
    return { success: false, error: 'An unexpected error occurred', data: null };
  }
}

export async function fetchConversationById(conversationId: string) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated', data: null };
    }

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching conversation:', error);
      return { success: false, error: error.message, data: null };
    }

    // Parse messages from JSON
    const parsedData = {
      ...data,
      messages: data.messages ? JSON.parse(data.messages) : [],
    };

    return { success: true, data: parsedData };
  } catch (error) {
    console.error('Server error:', error);
    return { success: false, error: 'An unexpected error occurred', data: null };
  }
}
