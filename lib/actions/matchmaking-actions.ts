'use server'

import { createClient } from '@/lib/supabase/server'
import {
  calculateCompatibilityScore,
  UserProfile,
  HackathonStats,
  GitHubStats,
  CompatibilityResult,
  MatchingFactors
} from '@/lib/algorithms/matchmaking'
import { createNotification } from '@/lib/actions/dashboard-actions'

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface MatchProfile extends UserProfile {
  age?: number;
  profileImage?: string;
  hackathonStats: HackathonStats;
  githubStats: GitHubStats;
  compatibilityScore: number;
  matchingFactors: MatchingFactors;
  recentProjects: RecentProject[];
}

export interface RecentProject {
  name: string;
  description: string;
  techStack: string[];
  awards: string[];
  stars: number;
  url: string;
}

export interface Connection {
  id: string;
  user_id: string;
  target_user_id: string;
  connection_type: 'like' | 'pass' | 'match' | 'block';
  matched: boolean;
  matched_at: string | null;
  created_at: string;
}

export interface MatchPreferences {
  id?: string;
  user_id: string;
  preferred_languages?: string[];
  preferred_frameworks?: string[];
  preferred_skills?: string[];
  experience_level_preference?: string;
  location_preference?: string;
  max_distance_km?: number;
  preferred_hackathon_categories?: string[];
  min_hackathons_participated?: number;
  min_hackathons_won?: number;
  looking_for_team?: boolean;
  available_for_online?: boolean;
  available_for_offline?: boolean;
  available_for_hybrid?: boolean;
  preferred_team_size?: number;
  prefer_active_github?: boolean;
  min_github_contributions?: number;
  only_show_verified?: boolean;
  hide_profile?: boolean;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Calculate age from graduation year (rough estimate)
 */
function calculateAge(graduationYear?: number): number | undefined {
  if (!graduationYear) return undefined;

  const currentYear = new Date().getFullYear();
  const estimatedBirthYear = graduationYear - 22; // Assume graduation at ~22
  const age = currentYear - estimatedBirthYear;

  return age > 0 && age < 100 ? age : undefined;
}

/**
 * Fetch user profile with all necessary data
 */
async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !profile) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return profile as UserProfile;
}

/**
 * Fetch hackathon statistics for a user
 */
async function fetchHackathonStats(userId: string): Promise<HackathonStats> {
  const supabase = await createClient();

  // Get total participations
  const { count: participated } = await supabase
    .from('hackathon_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('registration_status', 'confirmed');

  // Get total wins
  const { count: won } = await supabase
    .from('hackathon_winners')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Get recent hackathon
  const { data: recentReg } = await supabase
    .from('hackathon_registrations')
    .select(`
      hackathons (
        title
      )
    `)
    .eq('user_id', userId)
    .eq('registration_status', 'confirmed')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const recentHackathon = (recentReg as any)?.hackathons?.title;

  // Get favorite categories (most participated)
  const { data: categoriesData } = await supabase
    .from('hackathon_registrations')
    .select(`
      hackathons (
        categories
      )
    `)
    .eq('user_id', userId)
    .eq('registration_status', 'confirmed');

  const categoryCounts: { [key: string]: number } = {};
  categoriesData?.forEach((item: any) => {
    const categories = item.hackathons?.categories || [];
    categories.forEach((cat: string) => {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
  });

  const favoriteCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat);

  const totalParticipated = participated || 0;
  const totalWon = won || 0;
  const winRate = totalParticipated > 0 ? (totalWon / totalParticipated) * 100 : 0;

  return {
    participated: totalParticipated,
    won: totalWon,
    winRate,
    recentHackathon,
    favoriteCategories
  };
}

/**
 * Fetch GitHub statistics for a user
 */
async function fetchGitHubStats(userId: string): Promise<GitHubStats> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('github_username, github_repos_count, github_access_token')
    .eq('user_id', userId)
    .single();

  if (!profile?.github_username) {
    return {
      repositories: 0,
      contributions: 0,
      followers: 0,
      topLanguages: []
    };
  }

  // If we have cached data, use it
  const cachedStats = {
    repositories: profile.github_repos_count || 0,
    contributions: 0,
    followers: 0,
    topLanguages: []
  };

  // Try to fetch fresh data if access token exists
  if (profile.github_access_token) {
    try {
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${profile.github_access_token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
        cache: 'no-store'
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();

        // Fetch contribution data via GraphQL
        const query = `
          query {
            user(login: "${profile.github_username}") {
              contributionsCollection {
                contributionCalendar {
                  totalContributions
                }
              }
            }
          }
        `;

        const graphqlResponse = await fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${profile.github_access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
          cache: 'no-store'
        });

        const graphqlResult = await graphqlResponse.json();
        const contributions = graphqlResult.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions || 0;

        return {
          repositories: userData.public_repos || 0,
          contributions,
          followers: userData.followers || 0,
          topLanguages: []
        };
      }
    } catch (error) {
      console.error('Error fetching GitHub stats:', error);
    }
  }

  return cachedStats;
}

/**
 * Fetch recent projects for a user
 */
async function fetchRecentProjects(userId: string): Promise<RecentProject[]> {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from('github_projects')
    .select('*')
    .eq('user_id', userId)
    .eq('is_selected', true)
    .order('stars_count', { ascending: false })
    .limit(3);

  if (!projects || projects.length === 0) {
    return [];
  }

  return projects.map(p => ({
    name: p.name,
    description: p.description || 'No description',
    techStack: [p.language, ...(p.topics || [])].filter(Boolean),
    awards: [], // Could be fetched from a separate awards table
    stars: p.stars_count || 0,
    url: p.html_url
  }));
}

// =====================================================
// MAIN MATCHMAKING ACTIONS
// =====================================================

/**
 * Get the next match profile for the user
 */
export async function getNextMatch(filters?: Partial<MatchPreferences>) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get user's preferences
    const { data: prefs } = await supabase
      .from('match_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const preferences = prefs || {};

    // Build query to find potential matches
    let query = supabase
      .from('user_profiles')
      .select('*')
      .eq('user_primary_type', 'hacker') // Only hackers
      .neq('user_id', user.id); // Not the current user

    // Exclude users already swiped on
    const { data: existingConnections } = await supabase
      .from('hacker_connections')
      .select('target_user_id')
      .eq('user_id', user.id);

    const excludedUserIds = existingConnections?.map(c => c.target_user_id) || [];

    if (excludedUserIds.length > 0) {
      query = query.not('user_id', 'in', `(${excludedUserIds.join(',')})`);
    }

    // Apply preferences filters
    if (preferences.location_preference === 'same_city') {
      const { data: currentUser } = await supabase
        .from('user_profiles')
        .select('city')
        .eq('user_id', user.id)
        .single();

      if (currentUser?.city) {
        query = query.eq('city', currentUser.city);
      }
    } else if (preferences.location_preference === 'same_state') {
      const { data: currentUser } = await supabase
        .from('user_profiles')
        .select('state')
        .eq('user_id', user.id)
        .single();

      if (currentUser?.state) {
        query = query.eq('state', currentUser.state);
      }
    } else if (preferences.location_preference === 'same_country') {
      const { data: currentUser } = await supabase
        .from('user_profiles')
        .select('country')
        .eq('user_id', user.id)
        .single();

      if (currentUser?.country) {
        query = query.eq('country', currentUser.country);
      }
    }

    // Get potential matches
    const { data: potentialMatches, error: matchError } = await query
      .order('updated_at', { ascending: false })
      .limit(10);

    if (matchError || !potentialMatches || potentialMatches.length === 0) {
      return { success: true, data: null, message: 'No more profiles to show' };
    }

    // Calculate compatibility scores for all potential matches
    const currentUserProfile = await fetchUserProfile(user.id);
    if (!currentUserProfile) {
      return { success: false, error: 'Could not load user profile' };
    }

    const currentUserStats = await fetchHackathonStats(user.id);
    const currentUserGithub = await fetchGitHubStats(user.id);

    const matchesWithScores = await Promise.all(
      potentialMatches.map(async (match) => {
        const targetStats = await fetchHackathonStats(match.user_id);
        const targetGithub = await fetchGitHubStats(match.user_id);
        const targetProjects = await fetchRecentProjects(match.user_id);

        const compatibility = calculateCompatibilityScore(
          currentUserProfile,
          match,
          currentUserStats,
          targetStats,
          currentUserGithub,
          targetGithub
        );

        return {
          ...match,
          age: calculateAge(match.graduation_year),
          profileImage: null, // TODO: Add profile image support
          hackathonStats: targetStats,
          githubStats: targetGithub,
          compatibilityScore: compatibility.totalScore,
          matchingFactors: compatibility.matchingFactors,
          recentProjects: targetProjects
        };
      })
    );

    // Sort by compatibility score and return the best match
    matchesWithScores.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    // Apply minimum score threshold if needed
    const minScore = preferences.min_hackathons_participated > 5 ? 50 : 30;
    const bestMatch = matchesWithScores.find(m => m.compatibilityScore >= minScore) || matchesWithScores[0];

    // Store the insight in the database
    if (bestMatch) {
      const compatibility = calculateCompatibilityScore(
        currentUserProfile,
        bestMatch,
        currentUserStats,
        bestMatch.hackathonStats,
        currentUserGithub,
        bestMatch.githubStats
      );

      await supabase
        .from('match_insights')
        .upsert({
          user_id: user.id,
          target_user_id: bestMatch.user_id,
          compatibility_score: compatibility.totalScore,
          skill_overlap_score: compatibility.skillScore,
          experience_compatibility_score: compatibility.experienceScore,
          location_score: compatibility.locationScore,
          github_activity_score: compatibility.githubScore,
          hackathon_experience_score: compatibility.hackathonScore,
          recent_activity_score: compatibility.activityScore,
          matching_factors: compatibility.matchingFactors
        });
    }

    return { success: true, data: bestMatch };
  } catch (error) {
    console.error('Error in getNextMatch:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Swipe right (like) on a user
 */
export async function swipeRight(targetUserId: string) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if target user has already liked this user (potential match)
    const { data: existingLike } = await supabase
      .from('hacker_connections')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('target_user_id', user.id)
      .eq('connection_type', 'like')
      .single();

    const isMatch = !!existingLike;

    // Insert the like
    const { data: connection, error: insertError } = await supabase
      .from('hacker_connections')
      .insert({
        user_id: user.id,
        target_user_id: targetUserId,
        connection_type: isMatch ? 'match' : 'like',
        matched: isMatch,
        matched_at: isMatch ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting connection:', insertError);
      return { success: false, error: insertError.message };
    }

    // If it's a match, the trigger will handle updating both records and creating notifications
    // But we need to manually update the existing like to a match
    if (isMatch && existingLike) {
      await supabase
        .from('hacker_connections')
        .update({
          connection_type: 'match',
          matched: true,
          matched_at: new Date().toISOString()
        })
        .eq('id', existingLike.id);
    }

    return {
      success: true,
      matched: isMatch,
      connection: connection as Connection
    };
  } catch (error) {
    console.error('Error in swipeRight:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Swipe left (pass) on a user
 */
export async function swipeLeft(targetUserId: string) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data: connection, error: insertError } = await supabase
      .from('hacker_connections')
      .insert({
        user_id: user.id,
        target_user_id: targetUserId,
        connection_type: 'pass'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting pass:', insertError);
      return { success: false, error: insertError.message };
    }

    return { success: true, connection: connection as Connection };
  } catch (error) {
    console.error('Error in swipeLeft:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Block a user
 */
export async function blockUser(targetUserId: string) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Delete any existing connection and create a block
    await supabase
      .from('hacker_connections')
      .delete()
      .eq('user_id', user.id)
      .eq('target_user_id', targetUserId);

    const { data: connection, error: insertError } = await supabase
      .from('hacker_connections')
      .insert({
        user_id: user.id,
        target_user_id: targetUserId,
        connection_type: 'block'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting block:', insertError);
      return { success: false, error: insertError.message };
    }

    return { success: true, connection: connection as Connection };
  } catch (error) {
    console.error('Error in blockUser:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get all mutual matches for the current user
 */
export async function getMatches() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get all matched connections
    const { data: connections, error: connectionsError } = await supabase
      .from('hacker_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('matched', true)
      .order('matched_at', { ascending: false });

    if (connectionsError) {
      console.error('Error fetching matches:', connectionsError);
      return { success: false, error: connectionsError.message };
    }

    if (!connections || connections.length === 0) {
      return { success: true, data: [] };
    }

    // Get profiles for all matched users
    const matchedUserIds = connections.map(c => c.target_user_id);
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('*')
      .in('user_id', matchedUserIds);

    if (!profiles) {
      return { success: true, data: [] };
    }

    // Get insights for all matches
    const { data: insights } = await supabase
      .from('match_insights')
      .select('*')
      .eq('user_id', user.id)
      .in('target_user_id', matchedUserIds);

    const insightsMap = new Map(
      insights?.map(i => [i.target_user_id, i]) || []
    );

    // Fetch additional data for each match
    const matches = await Promise.all(
      profiles.map(async (profile) => {
        const stats = await fetchHackathonStats(profile.user_id);
        const github = await fetchGitHubStats(profile.user_id);
        const projects = await fetchRecentProjects(profile.user_id);
        const insight = insightsMap.get(profile.user_id);

        return {
          ...profile,
          age: calculateAge(profile.graduation_year),
          profileImage: null,
          hackathonStats: stats,
          githubStats: github,
          compatibilityScore: insight?.compatibility_score || 0,
          matchingFactors: insight?.matching_factors || {},
          recentProjects: projects,
          matchedAt: connections.find(c => c.target_user_id === profile.user_id)?.matched_at
        };
      })
    );

    return { success: true, data: matches };
  } catch (error) {
    console.error('Error in getMatches:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get match insight details for a specific user
 */
export async function getMatchInsight(targetUserId: string) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Try to get existing insight
    const { data: insight, error: insightError } = await supabase
      .from('match_insights')
      .select('*')
      .eq('user_id', user.id)
      .eq('target_user_id', targetUserId)
      .single();

    if (insight) {
      return { success: true, data: insight };
    }

    // If no insight exists, calculate it
    const currentUserProfile = await fetchUserProfile(user.id);
    const targetUserProfile = await fetchUserProfile(targetUserId);

    if (!currentUserProfile || !targetUserProfile) {
      return { success: false, error: 'Could not load profiles' };
    }

    const currentUserStats = await fetchHackathonStats(user.id);
    const targetUserStats = await fetchHackathonStats(targetUserId);
    const currentUserGithub = await fetchGitHubStats(user.id);
    const targetUserGithub = await fetchGitHubStats(targetUserId);

    const compatibility = calculateCompatibilityScore(
      currentUserProfile,
      targetUserProfile,
      currentUserStats,
      targetUserStats,
      currentUserGithub,
      targetUserGithub
    );

    // Store the insight
    const { data: newInsight, error: insertError } = await supabase
      .from('match_insights')
      .insert({
        user_id: user.id,
        target_user_id: targetUserId,
        compatibility_score: compatibility.totalScore,
        skill_overlap_score: compatibility.skillScore,
        experience_compatibility_score: compatibility.experienceScore,
        location_score: compatibility.locationScore,
        github_activity_score: compatibility.githubScore,
        hackathon_experience_score: compatibility.hackathonScore,
        recent_activity_score: compatibility.activityScore,
        matching_factors: compatibility.matchingFactors
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting insight:', insertError);
      // Return the calculated data even if we couldn't store it
      return {
        success: true,
        data: {
          compatibility_score: compatibility.totalScore,
          matching_factors: compatibility.matchingFactors
        }
      };
    }

    return { success: true, data: newInsight };
  } catch (error) {
    console.error('Error in getMatchInsight:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Update match preferences
 */
export async function updateMatchPreferences(preferences: Partial<MatchPreferences>) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data: updated, error: upsertError } = await supabase
      .from('match_preferences')
      .upsert({
        user_id: user.id,
        ...preferences
      })
      .select()
      .single();

    if (upsertError) {
      console.error('Error updating preferences:', upsertError);
      return { success: false, error: upsertError.message };
    }

    return { success: true, data: updated };
  } catch (error) {
    console.error('Error in updateMatchPreferences:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get match preferences for the current user
 */
export async function getMatchPreferences() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data: preferences, error: prefsError } = await supabase
      .from('match_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (prefsError && prefsError.code !== 'PGRST116') {
      // PGRST116 is "not found" which is fine - means no preferences set yet
      console.error('Error fetching preferences:', prefsError);
      return { success: false, error: prefsError.message };
    }

    return {
      success: true,
      data: preferences || {
        user_id: user.id,
        looking_for_team: true,
        available_for_online: true,
        available_for_offline: true,
        available_for_hybrid: true,
        location_preference: 'any',
        preferred_team_size: 4
      }
    };
  } catch (error) {
    console.error('Error in getMatchPreferences:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Undo the last swipe (if within last 30 seconds)
 */
export async function undoLastSwipe() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get the most recent connection
    const { data: lastConnection } = await supabase
      .from('hacker_connections')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!lastConnection) {
      return { success: false, error: 'No swipe to undo' };
    }

    // Check if it's within 30 seconds
    const thirtySecondsAgo = new Date(Date.now() - 30000);
    const connectionTime = new Date(lastConnection.created_at);

    if (connectionTime < thirtySecondsAgo) {
      return { success: false, error: 'Swipe is too old to undo' };
    }

    // Delete the connection
    const { error: deleteError } = await supabase
      .from('hacker_connections')
      .delete()
      .eq('id', lastConnection.id);

    if (deleteError) {
      console.error('Error deleting connection:', deleteError);
      return { success: false, error: deleteError.message };
    }

    return { success: true, data: lastConnection };
  } catch (error) {
    console.error('Error in undoLastSwipe:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get user's GitHub summary data (for display)
 */
export async function getUserGitHubSummary(userId: string) {
  try {
    const githubStats = await fetchGitHubStats(userId);
    return { success: true, data: githubStats };
  } catch (error) {
    console.error('Error in getUserGitHubSummary:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get user's hackathon stats (for display)
 */
export async function getUserHackathonStats(userId: string) {
  try {
    const stats = await fetchHackathonStats(userId);
    return { success: true, data: stats };
  } catch (error) {
    console.error('Error in getUserHackathonStats:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get user's recent projects (for display)
 */
export async function getUserRecentProjects(userId: string) {
  try {
    const projects = await fetchRecentProjects(userId);
    return { success: true, data: projects };
  } catch (error) {
    console.error('Error in getUserRecentProjects:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
