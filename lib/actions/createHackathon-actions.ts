'use server'

import { createClient } from '@/lib/supabase/server';
import { CreateHackathonStep1FormData, CreateHackathonStep2FormData, CreateHackathonStep3FormData } from '@/lib/validations/createHackathons';

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
          location: data.location || null,
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
  
  export async function uploadHackathonBanner(file: File) {
    try {
      const supabase = await createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return { success: false, error: 'User not authenticated' };
      }
  
      if (!file.type.startsWith('image/')) {
        return { success: false, error: 'Please upload an image file (PNG/JPG)' };
      }
  
      if (file.size > 2 * 1024 * 1024) { // 2MB for banners
        return { success: false, error: 'Image size must be less than 2MB' };
      }
  
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-banner-${Date.now()}.${fileExt}`;
      // Use same folder as logos since that's working
      const filePath = `hackathon-logos/${fileName}`;
  
      const { error: uploadError } = await supabase.storage
        .from('hackathons')
        .upload(filePath, file);
  
      if (uploadError) {
        console.error('Upload error:', uploadError);
        return { success: false, error: `Failed to upload banner: ${uploadError.message}` };
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

      // Add this log to see what's being returned
      console.log('Hackathon data from DB:', {
        identity_document_url: data?.identity_document_url,
        authorization_letter_url: data?.authorization_letter_url
      })
  
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  export async function updateHackathonStep3(hackathonId: string, data: CreateHackathonStep3FormData) {
    try {
      const supabase = await createClient();
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return { success: false, error: 'User not authenticated' };
      }
  
      const { data: hackathon, error: updateError } = await supabase
        .from('hackathons')
        .update({
          title: data.title,
          organization: data.organizer,
          website_url: data.websiteUrl || null,
          visibility: data.visibility,
          mode: data.mode,
          location: data.location,
          participation_type: data.participationType,
          team_size_min: data.teamSizeMin,
          team_size_max: data.teamSizeMax,
          registration_start_date: data.registrationStartDate,
          registration_end_date: data.registrationEndDate,
          participants: data.participants,
          max_participants: data.maxParticipants,
          total_prize_pool: data.totalPrizePool,
          banner_url: data.bannerUrl,
          logo_url: data.logoUrl,
          about: data.about,
          duration: data.duration,
          registration_deadline: data.registrationDeadline,
          eligibility: data.eligibility,
          requirements: data.requirements,
          categories: data.categories,
          prizes: data.prizes,
          timeline: data.timeline,
          important_dates: data.importantDates,
          faq: data.faq,
          organizers: data.organizers,
          sponsors: data.sponsors,
          step: 3,
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

export async function fetchPublishedHackathons() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('hackathons')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching hackathons:', error);
      return { success: false, error: error.message, data: [] };
    }

    // Fetch team counts and participant counts for all hackathons
    const hackathonIds = data?.map(h => h.id) || [];

    const teamCountsPromises = hackathonIds.map(id =>
      supabase
        .from('hackathon_teams')
        .select('id', { count: 'exact', head: true })
        .eq('hackathon_id', id)
    );

    const participantCountsPromises = hackathonIds.map(id =>
      supabase
        .from('hackathon_registrations')
        .select('user_id', { count: 'exact', head: true })
        .eq('hackathon_id', id)
    );

    const [teamCountsResults, participantCountsResults] = await Promise.all([
      Promise.all(teamCountsPromises),
      Promise.all(participantCountsPromises)
    ]);

    // Create maps of hackathon_id to counts
    const teamCountsMap = new Map();
    const participantCountsMap = new Map();

    hackathonIds.forEach((id, index) => {
      teamCountsMap.set(id, teamCountsResults[index]?.count || 0);
      participantCountsMap.set(id, participantCountsResults[index]?.count || 0);
    });

    // Attach counts to hackathon data
    const dataWithCounts = data?.map(hack => ({
      ...hack,
      team_count: teamCountsMap.get(hack.id) || 0,
      participant_count: participantCountsMap.get(hack.id) || 0
    }));

    return { success: true, data: dataWithCounts || [] };
  } catch (error) {
    console.error('Server error:', error);
    return { success: false, error: 'An unexpected error occurred', data: [] };
  }
}

export async function fetchHackathonById(hackathonId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('hackathons')
      .select('*')
      .eq('id', hackathonId)
      .eq('status', 'published')
      .single();

    if (error) {
      console.error('Error fetching hackathon:', error);
      return { success: false, error: error.message, data: null };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Server error:', error);
    return { success: false, error: 'An unexpected error occurred', data: null };
  }
}

export async function getHackathonTeamCount(hackathonId: string) {
  try {
    const supabase = await createClient();

    // Count unique teams registered for this hackathon
    const { count, error } = await supabase
      .from('hackathon_teams')
      .select('id', { count: 'exact', head: true })
      .eq('hackathon_id', hackathonId);

    if (error) {
      console.error('Error counting teams:', error);
      return { success: false, error: error.message, count: 0 };
    }

    return { success: true, count: count || 0 };
  } catch (error) {
    console.error('Server error:', error);
    return { success: false, error: 'An unexpected error occurred', count: 0 };
  }
}

export async function getHackathonParticipantCount(hackathonId: string) {
  try {
    const supabase = await createClient();

    // Count unique participants (users) registered for this hackathon
    const { count, error } = await supabase
      .from('hackathon_registrations')
      .select('user_id', { count: 'exact', head: true })
      .eq('hackathon_id', hackathonId);

    if (error) {
      console.error('Error counting participants:', error);
      return { success: false, error: error.message, count: 0 };
    }

    return { success: true, count: count || 0 };
  } catch (error) {
    console.error('Server error:', error);
    return { success: false, error: 'An unexpected error occurred', count: 0 };
  }
}

export async function uploadIdentityDocument(file: File, hackathonId?: string) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      return { success: false, error: 'Please upload a PDF or image file (JPG, PNG)' };
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'File size must be less than 5MB' };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    // With folder structure
    const filePath = `${user.id}/${fileName}`;
    // Without folder (simpler)
    // const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from('identity-documents')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: 'Failed to upload identity document' };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('identity-documents')
      .getPublicUrl(filePath);

    // Update the database immediately if hackathonId is provided
    if (hackathonId) {
      const { error: dbError } = await supabase
        .from('hackathons')
        .update({
          identity_document_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', hackathonId)
        .eq('created_by', user.id);

      if (dbError) {
        console.error('Database update error:', dbError);
        // Don't fail the upload if DB update fails, but log it
      }
    }

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function uploadAuthorizationLetter(file: File, hackathonId?: string) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      return { success: false, error: 'Please upload a PDF or image file (JPG, PNG)' };
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'File size must be less than 5MB' };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    // With folder structure
    const filePath = `${user.id}/${fileName}`;
    // Without folder (simpler)
    // const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from('authorization-letters')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: 'Failed to upload authorization letter' };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('authorization-letters')
      .getPublicUrl(filePath);

    // Update the database immediately if hackathonId is provided
    if (hackathonId) {
      const { error: dbError } = await supabase
        .from('hackathons')
        .update({
          authorization_letter_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', hackathonId)
        .eq('created_by', user.id);

      if (dbError) {
        console.error('Database update error:', dbError);
        // Don't fail the upload if DB update fails, but log it
      }
    }

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}