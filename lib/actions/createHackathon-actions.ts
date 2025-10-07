'use server'

import { createClient } from '@/lib/supabase/server';
import { CreateHackathonStep1FormData, CreateHackathonStep2FormData } from '@/lib/validations/createHackathons';

export async function createHackathon(data: CreateHackathonStep1FormData, hackathonId?: string) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // If hackathonId exists, update the existing record
    if (hackathonId) {
      const { data: hackathon, error: updateError } = await supabase
        .from('hackathons')
        .update({
          logo_url: data.logo,
          title: data.title,
          organization: data.organization,
          website_url: data.websiteUrl || null,
          visibility: data.visibility,
          mode: data.mode,
          categories: data.categories,
          about: data.about,
          updated_at: new Date().toISOString(),
        })
        .eq('id', hackathonId)
        .eq('created_by', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
        return { success: false, error: updateError.message };
      }

      return { success: true, data: hackathon, isUpdate: true };
    }

    // Otherwise, create a new record
    // Insert hackathon data
    const { data: hackathon, error: insertError } = await supabase
      .from('hackathons')
      .insert({
        logo_url: data.logo, 
        title: data.title,
        organization: data.organization,
        website_url: data.websiteUrl || null,
        visibility: data.visibility,
        mode: data.mode,
        categories: data.categories,
        about: data.about,
        created_by: user.id,
        step: 1, // Track which step user is on
        status: 'draft'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return { success: false, error: insertError.message };
    }

    return { success: true, data: hackathon };
  } catch (error) {
    console.error('Server error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function updateHackathonStep2(hackathonId: string, data: CreateHackathonStep2FormData) {
    try {
      const supabase = await createClient();
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return { success: false, error: 'User not authenticated' };
      }
  
      const { data: hackathon, error: updateError } = await supabase
        .from('hackathons')
        .update({
          participation_type: data.participationType,
          team_size_min: data.teamSizeMin,
          team_size_max: data.teamSizeMax,
          registration_start_date: data.registrationStartDate,
          registration_end_date: data.registrationEndDate,
          max_registrations: data.maxRegistrations || null,
          step: 2,
          updated_at: new Date().toISOString(),
        })
        .eq('id', hackathonId)
        .eq('created_by', user.id)
        .select()
        .single();
  
      if (updateError) {
        console.error('Update error:', updateError);
        return { success: false, error: updateError.message };
      }
  
      return { success: true, data: hackathon };
    } catch (error) {
      console.error('Server error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  export async function uploadHackathonLogo(file: File) {
    try {
      const supabase = await createClient();
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return { success: false, error: 'User not authenticated' };
      }
  
      // Validate file
      if (!file.type.startsWith('image/')) {
        return { success: false, error: 'Please upload an image file (PNG/JPG)' };
      }
  
      if (file.size > 1024 * 1024) { // 1MB
        return { success: false, error: 'Image size must be less than 1MB' };
      }
  
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `hackathon-logos/${fileName}`;
  
      const { error: uploadError } = await supabase.storage
        .from('hackathons')
        .upload(filePath, file);
  
      if (uploadError) {
        console.error('Upload error:', uploadError);
        return { success: false, error: 'Failed to upload image' };
      }
  
      const { data: { publicUrl } } = supabase.storage
        .from('hackathons')
        .getPublicUrl(filePath);
  
      return { success: true, url: publicUrl };
    } catch (error) {
      console.error('Upload error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
  
  export async function getHackathonById(hackathonId: string) {
    try {
      const supabase = await createClient();
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return { success: false, error: 'User not authenticated' };
      }
  
      const { data, error } = await supabase
        .from('hackathons')
        .select('*')
        .eq('id', hackathonId)
        .eq('created_by', user.id)
        .single();
  
      if (error) {
        return { success: false, error: error.message };
      }
  
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  }