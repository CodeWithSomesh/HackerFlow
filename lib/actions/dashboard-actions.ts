'use server'

import { createClient } from '@/lib/supabase/server';

// =====================================================
// TYPES & INTERFACES
// =====================================================

export interface HackerDashboardStats {
  totalParticipations: number;
  hackathonsWon: number;
  totalPrizeMoney: number;
  activeRegistrations: number;
  winRate: number;
}

export interface OrganizerDashboardStats {
  totalHackathons: number;
  totalParticipants: number;
  activeHackathons: number;
  totalPrizePoolDistributed: number;
  avgParticipantsPerHackathon: number;
}

export interface ParticipationHistory {
  id: string;
  hackathon_id: string;
  hackathon_title: string;
  hackathon_logo: string | null;
  organization: string;
  start_date: string;
  end_date: string;
  participant_type: 'individual' | 'team';
  team_name: string | null;
  team_id: string | null;
  registration_status: string;
  result: 'won' | 'participated' | 'pending';
  prize_position: string | null;
  prize_amount: number | null;
}

export interface PrizeTracker {
  id: string;
  hackathon_id: string;
  hackathon_title: string;
  organization: string;
  prize_position: string;
  prize_amount: number;
  payment_status: 'pending' | 'processing' | 'credited';
  payment_date: string | null;
  payment_reference: string | null;
  created_at: string;
}

export interface TeamMembership {
  id: string;
  team_id: string;
  team_name: string;
  hackathon_id: string;
  hackathon_title: string;
  is_leader: boolean;
  team_size_current: number;
  team_size_max: number;
  status: string;
  members: Array<{
    id: string;
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
    is_leader: boolean;
  }>;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
  metadata: any;
}

export interface Badge {
  id: string;
  badge_type: string;
  badge_name: string;
  badge_description: string | null;
  badge_icon: string | null;
  earned_at: string;
}

// =====================================================
// HACKER DASHBOARD ACTIONS
// =====================================================

export async function getHackerDashboardStats(userId?: string) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const targetUserId = userId || user.id;

    // Get total participations (confirmed registrations)
    const { count: totalParticipations } = await supabase
      .from('hackathon_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId)
      .eq('registration_status', 'confirmed');

    // Get total wins
    const { count: hackathonsWon } = await supabase
      .from('hackathon_winners')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId);

    // Get total prize money
    const { data: prizes } = await supabase
      .from('hackathon_winners')
      .select('prize_amount')
      .eq('user_id', targetUserId);

    const totalPrizeMoney = prizes?.reduce((sum, p) => sum + (Number(p.prize_amount) || 0), 0) || 0;

    // Get active registrations (hackathons with future end dates)
    const { count: activeRegistrations } = await supabase
      .from('hackathon_registrations')
      .select('hackathons(registration_end_date)', { count: 'exact', head: true })
      .eq('user_id', targetUserId)
      .eq('registration_status', 'confirmed')
      .gte('hackathons.registration_end_date', new Date().toISOString());

    // Calculate win rate
    const winRate = totalParticipations ? ((hackathonsWon || 0) / totalParticipations) * 100 : 0;

    const stats: HackerDashboardStats = {
      totalParticipations: totalParticipations || 0,
      hackathonsWon: hackathonsWon || 0,
      totalPrizeMoney,
      activeRegistrations: activeRegistrations || 0,
      winRate: Math.round(winRate * 10) / 10,
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error('Error fetching hacker dashboard stats:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getHackerParticipationHistory(
  userId?: string,
  filters?: {
    status?: 'all' | 'upcoming' | 'ongoing' | 'completed';
    result?: 'all' | 'won' | 'participated';
    page?: number;
    limit?: number;
  }
) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const targetUserId = userId || user.id;
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('hackathon_registrations')
      .select(`
        id,
        hackathon_id,
        participant_type,
        team_id,
        registration_status,
        hackathons (
          id,
          title,
          logo_url,
          organization,
          registration_start_date,
          registration_end_date
        ),
        hackathon_teams (
          team_name
        )
      `)
      .eq('user_id', targetUserId)
      .eq('registration_status', 'confirmed')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.status && filters.status !== 'all') {
      const now = new Date().toISOString();
      if (filters.status === 'upcoming') {
        query = query.gt('hackathons.registration_start_date', now);
      } else if (filters.status === 'ongoing') {
        query = query.lte('hackathons.registration_start_date', now)
                     .gte('hackathons.registration_end_date', now);
      } else if (filters.status === 'completed') {
        query = query.lt('hackathons.registration_end_date', now);
      }
    }

    const { data: registrations, error: regError } = await query
      .range(offset, offset + limit - 1);

    if (regError) {
      console.error('Error fetching registrations:', regError);
      return { success: false, error: regError.message };
    }

    // Get winners data for these hackathons
    const hackathonIds = registrations?.map(r => r.hackathon_id) || [];
    const { data: winners } = await supabase
      .from('hackathon_winners')
      .select('hackathon_id, prize_position, prize_amount')
      .eq('user_id', targetUserId)
      .in('hackathon_id', hackathonIds);

    // Map winners to hackathons
    const winnersMap = new Map(
      winners?.map(w => [w.hackathon_id, w]) || []
    );

    // Transform data
    const history: ParticipationHistory[] = registrations?.map(reg => {
      const hackathon = reg.hackathons as any;
      const team = reg.hackathon_teams as any;
      const winner = winnersMap.get(reg.hackathon_id);

      return {
        id: reg.id,
        hackathon_id: reg.hackathon_id,
        hackathon_title: hackathon?.title || 'Unknown',
        hackathon_logo: hackathon?.logo_url || null,
        organization: hackathon?.organization || 'Unknown',
        start_date: hackathon?.registration_start_date || '',
        end_date: hackathon?.registration_end_date || '',
        participant_type: reg.participant_type,
        team_name: team?.team_name || null,
        team_id: reg.team_id,
        registration_status: reg.registration_status,
        result: winner ? 'won' : 'participated',
        prize_position: winner?.prize_position || null,
        prize_amount: winner?.prize_amount || null,
      };
    }) || [];

    // Apply result filter
    let filteredHistory = history;
    if (filters?.result && filters.result !== 'all') {
      filteredHistory = history.filter(h => h.result === filters.result);
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('hackathon_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId)
      .eq('registration_status', 'confirmed');

    return {
      success: true,
      data: filteredHistory,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching participation history:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getHackerPrizeTracker(userId?: string) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const targetUserId = userId || user.id;

    const { data: prizes, error: prizesError } = await supabase
      .from('hackathon_winners')
      .select(`
        id,
        hackathon_id,
        prize_position,
        prize_amount,
        payment_status,
        payment_date,
        payment_reference,
        created_at,
        hackathons (
          title,
          organization
        )
      `)
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false });

    if (prizesError) {
      console.error('Error fetching prizes:', prizesError);
      return { success: false, error: prizesError.message };
    }

    const prizeTracker: PrizeTracker[] = prizes?.map(p => ({
      id: p.id,
      hackathon_id: p.hackathon_id,
      hackathon_title: (p.hackathons as any)?.title || 'Unknown',
      organization: (p.hackathons as any)?.organization || 'Unknown',
      prize_position: p.prize_position,
      prize_amount: Number(p.prize_amount) || 0,
      payment_status: p.payment_status as 'pending' | 'processing' | 'credited',
      payment_date: p.payment_date,
      payment_reference: p.payment_reference,
      created_at: p.created_at,
    })) || [];

    // Calculate summary
    const summary = {
      totalEarned: prizeTracker.reduce((sum, p) => sum + p.prize_amount, 0),
      totalCredited: prizeTracker
        .filter(p => p.payment_status === 'credited')
        .reduce((sum, p) => sum + p.prize_amount, 0),
      totalPending: prizeTracker
        .filter(p => p.payment_status === 'pending')
        .reduce((sum, p) => sum + p.prize_amount, 0),
      totalProcessing: prizeTracker
        .filter(p => p.payment_status === 'processing')
        .reduce((sum, p) => sum + p.prize_amount, 0),
    };

    return { success: true, data: prizeTracker, summary };
  } catch (error) {
    console.error('Error fetching prize tracker:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getHackerTeamMemberships(userId?: string) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const targetUserId = userId || user.id;

    // Get team memberships
    const { data: memberships, error: membershipsError } = await supabase
      .from('hackathon_team_members')
      .select(`
        id,
        team_id,
        is_leader,
        status,
        hackathon_teams (
          id,
          team_name,
          hackathon_id,
          team_size_max,
          team_size_current,
          status,
          hackathons (
            title
          )
        )
      `)
      .eq('user_id', targetUserId)
      .eq('status', 'active')
      .order('joined_at', { ascending: false });

    if (membershipsError) {
      console.error('Error fetching team memberships:', membershipsError);
      return { success: false, error: membershipsError.message };
    }

    // Get all team members for these teams
    const teamIds = memberships?.map(m => (m.hackathon_teams as any)?.id).filter(Boolean) || [];
    const { data: allMembers } = await supabase
      .from('hackathon_team_members')
      .select('id, team_id, user_id, email, first_name, last_name, is_leader')
      .in('team_id', teamIds)
      .eq('status', 'active');

    // Group members by team
    const membersByTeam = new Map<string, any[]>();
    allMembers?.forEach(member => {
      if (!membersByTeam.has(member.team_id)) {
        membersByTeam.set(member.team_id, []);
      }
      membersByTeam.get(member.team_id)?.push(member);
    });

    const teams: TeamMembership[] = memberships?.map(m => {
      const team = m.hackathon_teams as any;
      return {
        id: m.id,
        team_id: team?.id || '',
        team_name: team?.team_name || 'Unknown Team',
        hackathon_id: team?.hackathon_id || '',
        hackathon_title: team?.hackathons?.title || 'Unknown',
        is_leader: m.is_leader,
        team_size_current: team?.team_size_current || 0,
        team_size_max: team?.team_size_max || 0,
        status: team?.status || m.status,
        members: membersByTeam.get(team?.id) || [],
      };
    }) || [];

    return { success: true, data: teams };
  } catch (error) {
    console.error('Error fetching team memberships:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getHackerUpcomingDeadlines(userId?: string, limit: number = 10) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const targetUserId = userId || user.id;
    const now = new Date().toISOString();

    const { data: deadlines, error: deadlinesError } = await supabase
      .from('hackathon_registrations')
      .select(`
        id,
        hackathon_id,
        hackathons (
          title,
          logo_url,
          registration_end_date,
          organization
        )
      `)
      .eq('user_id', targetUserId)
      .eq('registration_status', 'confirmed')
      .gte('hackathons.registration_end_date', now)
      .order('hackathons(registration_end_date)', { ascending: true })
      .limit(limit);

    if (deadlinesError) {
      console.error('Error fetching deadlines:', deadlinesError);
      return { success: false, error: deadlinesError.message };
    }

    const formattedDeadlines = deadlines?.map(d => ({
      id: d.id,
      hackathon_id: d.hackathon_id,
      title: (d.hackathons as any)?.title || 'Unknown',
      logo: (d.hackathons as any)?.logo_url || null,
      organization: (d.hackathons as any)?.organization || 'Unknown',
      deadline: (d.hackathons as any)?.registration_end_date || '',
      daysLeft: Math.ceil(
        (new Date((d.hackathons as any)?.registration_end_date).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      ),
    })) || [];

    return { success: true, data: formattedDeadlines };
  } catch (error) {
    console.error('Error fetching upcoming deadlines:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getHackerPerformanceAnalytics(userId?: string) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const targetUserId = userId || user.id;

    // Get participations over time (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const { data: participations } = await supabase
      .from('hackathon_registrations')
      .select('created_at')
      .eq('user_id', targetUserId)
      .eq('registration_status', 'confirmed')
      .gte('created_at', twelveMonthsAgo.toISOString())
      .order('created_at', { ascending: true });

    // Group by month
    const monthlyData = participations?.reduce((acc, p) => {
      const month = new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Get wins vs participations
    const { count: totalParticipations } = await supabase
      .from('hackathon_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId)
      .eq('registration_status', 'confirmed');

    const { count: totalWins } = await supabase
      .from('hackathon_winners')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId);

    // Get participations by category
    const { data: categoriesData } = await supabase
      .from('hackathon_registrations')
      .select(`
        hackathons (
          categories
        )
      `)
      .eq('user_id', targetUserId)
      .eq('registration_status', 'confirmed');

    const categoryCount = categoriesData?.reduce((acc, item) => {
      const categories = (item.hackathons as any)?.categories || [];
      categories.forEach((cat: string) => {
        acc[cat] = (acc[cat] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>) || {};

    return {
      success: true,
      data: {
        participationsOverTime: Object.entries(monthlyData).map(([month, count]) => ({
          month,
          count,
        })),
        winRate: {
          won: totalWins || 0,
          participated: (totalParticipations || 0) - (totalWins || 0),
        },
        categoriesDistribution: Object.entries(categoryCount).map(([category, count]) => ({
          category,
          count,
        })),
      },
    };
  } catch (error) {
    console.error('Error fetching performance analytics:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getHackerBadges(userId?: string) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const targetUserId = userId || user.id;

    // Get earned badges
    const { data: badges, error: badgesError } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', targetUserId)
      .order('earned_at', { ascending: false });

    if (badgesError) {
      console.error('Error fetching badges:', badgesError);
      return { success: false, error: badgesError.message };
    }

    // Get participation and win counts for progress
    const { count: participationCount } = await supabase
      .from('hackathon_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId)
      .eq('registration_status', 'confirmed');

    const { count: winCount } = await supabase
      .from('hackathon_winners')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId);

    const { count: teamParticipationCount } = await supabase
      .from('hackathon_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId)
      .eq('participant_type', 'team')
      .eq('registration_status', 'confirmed');

    // Calculate progress toward next badges
    const earnedBadgeTypes = new Set(badges?.map(b => b.badge_type) || []);

    const progressTowards = [];

    if (!earnedBadgeTypes.has('5_hackathons') && (participationCount || 0) < 5) {
      progressTowards.push({
        badge_type: '5_hackathons',
        badge_name: 'Veteran',
        current: participationCount || 0,
        target: 5,
        percentage: ((participationCount || 0) / 5) * 100,
      });
    }

    if (!earnedBadgeTypes.has('10_hackathons') && (participationCount || 0) < 10) {
      progressTowards.push({
        badge_type: '10_hackathons',
        badge_name: 'Legend',
        current: participationCount || 0,
        target: 10,
        percentage: ((participationCount || 0) / 10) * 100,
      });
    }

    if (!earnedBadgeTypes.has('team_player') && (teamParticipationCount || 0) < 5) {
      progressTowards.push({
        badge_type: 'team_player',
        badge_name: 'Team Player',
        current: teamParticipationCount || 0,
        target: 5,
        percentage: ((teamParticipationCount || 0) / 5) * 100,
      });
    }

    return {
      success: true,
      data: {
        earnedBadges: badges || [],
        progress: progressTowards,
      },
    };
  } catch (error) {
    console.error('Error fetching badges:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getHackerRecentActivity(userId?: string, limit: number = 20) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const targetUserId = userId || user.id;

    // Get recent registrations
    const { data: registrations } = await supabase
      .from('hackathon_registrations')
      .select(`
        id,
        created_at,
        hackathon_id,
        participant_type,
        hackathons (
          title
        )
      `)
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Get recent wins
    const { data: wins } = await supabase
      .from('hackathon_winners')
      .select(`
        id,
        created_at,
        hackathon_id,
        prize_position,
        hackathons (
          title
        )
      `)
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Get recent badge awards
    const { data: badgeAwards } = await supabase
      .from('user_badges')
      .select('id, earned_at, badge_name, badge_type')
      .eq('user_id', targetUserId)
      .order('earned_at', { ascending: false })
      .limit(limit);

    // Combine and sort all activities
    const activities = [
      ...(registrations?.map(r => ({
        id: r.id,
        type: 'registration',
        title: `Registered for ${(r.hackathons as any)?.title}`,
        description: `Registered as ${r.participant_type}`,
        timestamp: r.created_at,
        link: `/hackathons/${r.hackathon_id}`,
      })) || []),
      ...(wins?.map(w => ({
        id: w.id,
        type: 'win',
        title: `Won ${w.prize_position} in ${(w.hackathons as any)?.title}`,
        description: 'Congratulations on your achievement!',
        timestamp: w.created_at,
        link: `/hackathons/${w.hackathon_id}`,
      })) || []),
      ...(badgeAwards?.map(b => ({
        id: b.id,
        type: 'badge',
        title: `Earned "${b.badge_name}" badge`,
        description: 'New achievement unlocked',
        timestamp: b.earned_at,
        link: '/dashboard/hacker/badges',
      })) || []),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
     .slice(0, limit);

    return { success: true, data: activities };
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// =====================================================
// ORGANIZER DASHBOARD ACTIONS
// =====================================================

export async function getOrganizerDashboardStats(userId?: string) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const targetUserId = userId || user.id;

    // Get total hackathons
    const { count: totalHackathons } = await supabase
      .from('hackathons')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', targetUserId);

    // Get total participants across all hackathons
    const { data: hackathons } = await supabase
      .from('hackathons')
      .select('id')
      .eq('created_by', targetUserId);

    const hackathonIds = hackathons?.map(h => h.id) || [];

    const { count: totalParticipants } = await supabase
      .from('hackathon_registrations')
      .select('*', { count: 'exact', head: true })
      .in('hackathon_id', hackathonIds)
      .eq('registration_status', 'confirmed');

    // Get active hackathons (published and registration still open)
    const now = new Date().toISOString();
    const { count: activeHackathons } = await supabase
      .from('hackathons')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', targetUserId)
      .eq('status', 'published')
      .gte('registration_end_date', now);

    // Get total prize pool distributed
    const { data: winners } = await supabase
      .from('hackathon_winners')
      .select('prize_amount')
      .in('hackathon_id', hackathonIds)
      .eq('payment_status', 'credited');

    const totalPrizePoolDistributed = winners?.reduce((sum, w) => sum + (Number(w.prize_amount) || 0), 0) || 0;

    // Calculate average participants per hackathon
    const avgParticipantsPerHackathon = totalHackathons ? Math.round((totalParticipants || 0) / totalHackathons) : 0;

    const stats: OrganizerDashboardStats = {
      totalHackathons: totalHackathons || 0,
      totalParticipants: totalParticipants || 0,
      activeHackathons: activeHackathons || 0,
      totalPrizePoolDistributed,
      avgParticipantsPerHackathon,
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error('Error fetching organizer dashboard stats:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getOrganizerHackathons(
  userId?: string,
  filters?: {
    status?: 'all' | 'draft' | 'published' | 'completed' | 'cancelled';
    page?: number;
    limit?: number;
  }
) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const targetUserId = userId || user.id;
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('hackathons')
      .select('*', { count: 'exact' })
      .eq('created_by', targetUserId)
      .order('created_at', { ascending: false });

    // Apply status filter
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    const { data: hackathons, error: hackathonsError, count } = await query
      .range(offset, offset + limit - 1);

    if (hackathonsError) {
      console.error('Error fetching hackathons:', hackathonsError);
      return { success: false, error: hackathonsError.message };
    }

    // Get participant counts for each hackathon
    const hackathonIds = hackathons?.map(h => h.id) || [];
    const { data: registrationCounts } = await supabase
      .from('hackathon_registrations')
      .select('hackathon_id')
      .in('hackathon_id', hackathonIds)
      .eq('registration_status', 'confirmed');

    const countsByHackathon = registrationCounts?.reduce((acc, r) => {
      acc[r.hackathon_id] = (acc[r.hackathon_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const hackathonsWithCounts = hackathons?.map(h => ({
      ...h,
      participant_count: countsByHackathon[h.id] || 0,
    })) || [];

    return {
      success: true,
      data: hackathonsWithCounts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching organizer hackathons:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getHackathonParticipants(
  hackathonId: string,
  filters?: {
    type?: 'all' | 'team' | 'individual';
    search?: string;
    page?: number;
    limit?: number;
  }
) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Verify user owns this hackathon
    const { data: hackathon } = await supabase
      .from('hackathons')
      .select('created_by')
      .eq('id', hackathonId)
      .single();

    if (!hackathon || hackathon.created_by !== user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('hackathon_registrations')
      .select(`
        *,
        hackathon_teams (
          team_name
        )
      `, { count: 'exact' })
      .eq('hackathon_id', hackathonId)
      .eq('registration_status', 'confirmed')
      .order('created_at', { ascending: false });

    // Apply type filter
    if (filters?.type && filters.type !== 'all') {
      query = query.eq('participant_type', filters.type);
    }

    // Apply search filter
    if (filters?.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    const { data: participants, error: participantsError, count } = await query
      .range(offset, offset + limit - 1);

    if (participantsError) {
      console.error('Error fetching participants:', participantsError);
      return { success: false, error: participantsError.message };
    }

    return {
      success: true,
      data: participants || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching hackathon participants:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getHackathonTeams(hackathonId: string) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Verify user owns this hackathon
    const { data: hackathon } = await supabase
      .from('hackathons')
      .select('created_by')
      .eq('id', hackathonId)
      .single();

    if (!hackathon || hackathon.created_by !== user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: teams, error: teamsError } = await supabase
      .from('hackathon_teams')
      .select(`
        *,
        hackathon_team_members (
          id,
          user_id,
          email,
          first_name,
          last_name,
          is_leader,
          status
        )
      `)
      .eq('hackathon_id', hackathonId)
      .order('created_at', { ascending: false });

    if (teamsError) {
      console.error('Error fetching teams:', teamsError);
      return { success: false, error: teamsError.message };
    }

    return { success: true, data: teams || [] };
  } catch (error) {
    console.error('Error fetching hackathon teams:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getTeamDetails(teamId: string) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data: team, error: teamError } = await supabase
      .from('hackathon_teams')
      .select(`
        *,
        hackathons (
          id,
          title,
          created_by
        ),
        hackathon_team_members (
          id,
          user_id,
          email,
          first_name,
          last_name,
          is_leader,
          status,
          joined_at
        )
      `)
      .eq('id', teamId)
      .single();

    if (teamError) {
      console.error('Error fetching team:', teamError);
      return { success: false, error: teamError.message };
    }

    // Verify user owns the hackathon or is part of the team
    const hackathon = team.hackathons as any;
    const isOrganizer = hackathon?.created_by === user.id;
    const isMember = (team.hackathon_team_members as any[])?.some(m => m.user_id === user.id);

    if (!isOrganizer && !isMember) {
      return { success: false, error: 'Unauthorized' };
    }

    return { success: true, data: team };
  } catch (error) {
    console.error('Error fetching team details:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getHackathonWinners(hackathonId: string) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Verify user owns this hackathon
    const { data: hackathon } = await supabase
      .from('hackathons')
      .select('created_by')
      .eq('id', hackathonId)
      .single();

    if (!hackathon || hackathon.created_by !== user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: winners, error: winnersError } = await supabase
      .from('hackathon_winners')
      .select(`
        *,
        hackathon_teams (
          team_name
        )
      `)
      .eq('hackathon_id', hackathonId)
      .order('created_at', { ascending: true });

    if (winnersError) {
      console.error('Error fetching winners:', winnersError);
      return { success: false, error: winnersError.message };
    }

    // Get user profiles for winners
    const userIds = winners?.map(w => w.user_id).filter(Boolean) || [];
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('user_id, full_name, email, profile_image')
      .in('user_id', userIds);

    const profilesMap = new Map(
      profiles?.map(p => [p.user_id, p]) || []
    );

    const winnersWithProfiles = winners?.map(w => ({
      ...w,
      profile: profilesMap.get(w.user_id),
    })) || [];

    return { success: true, data: winnersWithProfiles };
  } catch (error) {
    console.error('Error fetching hackathon winners:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function saveHackathonWinners(
  hackathonId: string,
  winnersData: Array<{
    user_id: string;
    team_id?: string;
    prize_position: string;
    prize_amount: number;
  }>
) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Verify user owns this hackathon
    const { data: hackathon } = await supabase
      .from('hackathons')
      .select('created_by')
      .eq('id', hackathonId)
      .single();

    if (!hackathon || hackathon.created_by !== user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Insert winners
    const winnersToInsert = winnersData.map(w => ({
      hackathon_id: hackathonId,
      user_id: w.user_id,
      team_id: w.team_id || null,
      prize_position: w.prize_position,
      prize_amount: w.prize_amount,
      payment_status: 'pending',
    }));

    const { data: insertedWinners, error: insertError } = await supabase
      .from('hackathon_winners')
      .insert(winnersToInsert)
      .select();

    if (insertError) {
      console.error('Error inserting winners:', insertError);
      return { success: false, error: insertError.message };
    }

    return { success: true, data: insertedWinners };
  } catch (error) {
    console.error('Error saving hackathon winners:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function updateWinnerPaymentStatus(
  winnerId: string,
  status: 'pending' | 'processing' | 'credited',
  paymentDate?: string,
  paymentReference?: string
) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Get winner to verify ownership
    const { data: winner } = await supabase
      .from('hackathon_winners')
      .select(`
        hackathon_id,
        hackathons (
          created_by
        )
      `)
      .eq('id', winnerId)
      .single();

    if (!winner || (winner.hackathons as any)?.created_by !== user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: updatedWinner, error: updateError } = await supabase
      .from('hackathon_winners')
      .update({
        payment_status: status,
        payment_date: paymentDate || null,
        payment_reference: paymentReference || null,
      })
      .eq('id', winnerId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating payment status:', updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true, data: updatedWinner };
  } catch (error) {
    console.error('Error updating winner payment status:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getOrganizerAnalytics(userId?: string, hackathonId?: string) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const targetUserId = userId || user.id;

    // If hackathonId provided, get analytics for that hackathon
    if (hackathonId) {
      // Verify ownership
      const { data: hackathon } = await supabase
        .from('hackathons')
        .select('created_by')
        .eq('id', hackathonId)
        .single();

      if (!hackathon || hackathon.created_by !== targetUserId) {
        return { success: false, error: 'Unauthorized' };
      }

      // Get registrations over time for this hackathon
      const { data: registrations } = await supabase
        .from('hackathon_registrations')
        .select('created_at, participant_type')
        .eq('hackathon_id', hackathonId)
        .eq('registration_status', 'confirmed')
        .order('created_at', { ascending: true });

      // Group by date
      const dailyRegistrations = registrations?.reduce((acc, r) => {
        const date = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!acc[date]) {
          acc[date] = { total: 0, team: 0, individual: 0 };
        }
        acc[date].total += 1;
        if (r.participant_type === 'team') {
          acc[date].team += 1;
        } else {
          acc[date].individual += 1;
        }
        return acc;
      }, {} as Record<string, { total: number; team: number; individual: number }>) || {};

      // Team vs Individual distribution
      const teamCount = registrations?.filter(r => r.participant_type === 'team').length || 0;
      const individualCount = registrations?.filter(r => r.participant_type === 'individual').length || 0;

      return {
        success: true,
        data: {
          registrationTimeline: Object.entries(dailyRegistrations).map(([date, counts]) => ({
            date,
            ...counts,
          })),
          participantDistribution: {
            team: teamCount,
            individual: individualCount,
          },
          totalRegistrations: registrations?.length || 0,
        },
      };
    }

    // Get overall analytics for all hackathons
    const { data: hackathons } = await supabase
      .from('hackathons')
      .select('id, title')
      .eq('created_by', targetUserId);

    const hackathonIds = hackathons?.map(h => h.id) || [];

    // Get registrations for all hackathons (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: allRegistrations } = await supabase
      .from('hackathon_registrations')
      .select('created_at, hackathon_id, participant_type')
      .in('hackathon_id', hackathonIds)
      .eq('registration_status', 'confirmed')
      .gte('created_at', sixMonthsAgo.toISOString())
      .order('created_at', { ascending: true });

    // Group by month
    const monthlyRegistrations = allRegistrations?.reduce((acc, r) => {
      const month = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Participants per hackathon
    const participantsPerHackathon = allRegistrations?.reduce((acc, r) => {
      acc[r.hackathon_id] = (acc[r.hackathon_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const hackathonParticipants = hackathons?.map(h => ({
      hackathon: h.title,
      participants: participantsPerHackathon[h.id] || 0,
    })).sort((a, b) => b.participants - a.participants).slice(0, 10) || [];

    // Team vs Individual overall
    const teamTotal = allRegistrations?.filter(r => r.participant_type === 'team').length || 0;
    const individualTotal = allRegistrations?.filter(r => r.participant_type === 'individual').length || 0;

    return {
      success: true,
      data: {
        registrationsOverTime: Object.entries(monthlyRegistrations).map(([month, count]) => ({
          month,
          count,
        })),
        participantsPerHackathon: hackathonParticipants,
        participantDistribution: {
          team: teamTotal,
          individual: individualTotal,
        },
      },
    };
  } catch (error) {
    console.error('Error fetching organizer analytics:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function exportParticipants(hackathonId: string, format: 'csv' = 'csv') {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Verify ownership
    const { data: hackathon } = await supabase
      .from('hackathons')
      .select('created_by, title')
      .eq('id', hackathonId)
      .single();

    if (!hackathon || hackathon.created_by !== user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get all participants
    const { data: participants, error: participantsError } = await supabase
      .from('hackathon_registrations')
      .select(`
        *,
        hackathon_teams (
          team_name
        )
      `)
      .eq('hackathon_id', hackathonId)
      .eq('registration_status', 'confirmed')
      .order('created_at', { ascending: false });

    if (participantsError) {
      return { success: false, error: participantsError.message };
    }

    if (format === 'csv') {
      // Generate CSV
      const headers = ['First Name', 'Last Name', 'Email', 'Mobile', 'Type', 'Team Name', 'Status', 'Registered At'];
      const rows = participants?.map(p => [
        p.first_name || '',
        p.last_name || '',
        p.email || '',
        p.mobile || '',
        p.participant_type || '',
        (p.hackathon_teams as any)?.team_name || '',
        p.registration_status || '',
        new Date(p.created_at).toLocaleDateString(),
      ]) || [];

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      return {
        success: true,
        data: csv,
        filename: `${hackathon.title.replace(/\s+/g, '_')}_participants_${new Date().toISOString().split('T')[0]}.csv`,
      };
    }

    return { success: false, error: 'Unsupported format' };
  } catch (error) {
    console.error('Error exporting participants:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// =====================================================
// SHARED ACTIONS (Notifications)
// =====================================================

export async function getUserNotifications(userId?: string, unreadOnly: boolean = false) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const targetUserId = userId || user.id;

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data: notifications, error: notificationsError } = await query;

    if (notificationsError) {
      console.error('Error fetching notifications:', notificationsError);
      return { success: false, error: notificationsError.message };
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId)
      .eq('read', false);

    return {
      success: true,
      data: notifications || [],
      unreadCount: unreadCount || 0,
    };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error: updateError } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error marking notification as read:', updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function markAllNotificationsAsRead(userId?: string) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const targetUserId = userId || user.id;

    const { error: updateError } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', targetUserId)
      .eq('read', false);

    if (updateError) {
      console.error('Error marking all notifications as read:', updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string,
  metadata?: any
) {
  try {
    const supabase = await createClient();

    const { data: notification, error: insertError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        link: link || null,
        metadata: metadata || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating notification:', insertError);
      return { success: false, error: insertError.message };
    }

    return { success: true, data: notification };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
