'use server'

import { createClient } from '@/lib/supabase/server';

export interface SaveIdeaData {
  hackathonId: string;
  title: string;
  description: string;
  problemStatement: string;
  vision: string;
  techStack: string[];
  estimatedTime: string;
  skillsRequired: string[];
  successMetrics: string[];
  implementation: {
    phases: Array<{
      name: string;
      duration: string;
      tasks: string[];
    }>;
  };
  inspiration?: string;
  resumeAnalyzed: boolean;
}

export async function saveGeneratedIdea(data: SaveIdeaData) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data: idea, error } = await supabase
      .from('generated_ideas')
      .insert({
        user_id: user.id,
        hackathon_id: data.hackathonId,
        title: data.title,
        description: data.description,
        problem_statement: data.problemStatement,
        vision: data.vision,
        tech_stack: data.techStack,
        estimated_time: data.estimatedTime,
        skills_required: data.skillsRequired,
        success_metrics: data.successMetrics,
        implementation: data.implementation,
        inspiration: data.inspiration,
        resume_analyzed: data.resumeAnalyzed,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving idea:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: idea };
  } catch (error) {
    console.error('Server error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function fetchUserIdeas() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated', data: [] };
    }

    const { data, error } = await supabase
      .from('generated_ideas')
      .select(`
        *,
        hackathons (
          id,
          title,
          logo_url,
          organization
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ideas:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Server error:', error);
    return { success: false, error: 'An unexpected error occurred', data: [] };
  }
}

export async function fetchIdeaById(ideaId: string) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated', data: null };
    }

    const { data, error } = await supabase
      .from('generated_ideas')
      .select(`
        *,
        hackathons (
          id,
          title,
          logo_url,
          organization
        )
      `)
      .eq('id', ideaId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching idea:', error);
      return { success: false, error: error.message, data: null };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Server error:', error);
    return { success: false, error: 'An unexpected error occurred', data: null };
  }
}