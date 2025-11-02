/**
 * Matchmaking Algorithm for HackerFlow - "Find Your Hackathon Buddy"
 *
 * This file contains the core compatibility scoring algorithm that calculates
 * how well two hackers would work together as teammates based on multiple factors.
 *
 * Total Score: 100 points
 * - Skill Overlap: 30 points
 * - Experience Compatibility: 20 points
 * - GitHub Activity: 20 points
 * - Hackathon Experience: 15 points
 * - Location: 10 points
 * - Recent Activity: 5 points
 */

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface UserProfile {
  user_id: string;
  full_name: string;
  bio?: string;
  city?: string;
  state?: string;
  country?: string;
  position?: string;
  company?: string;
  university?: string;
  course?: string;
  graduation_year?: number;
  programming_languages?: string[];
  frameworks?: string[];
  other_skills?: string[];
  experience_level?: string;
  github_username?: string;
  github_repos_count?: number;
  updated_at?: string;
}

export interface HackathonStats {
  participated: number;
  won: number;
  winRate: number;
  recentHackathon?: string;
  favoriteCategories: string[];
}

export interface GitHubStats {
  repositories: number;
  contributions: number;
  followers: number;
  topLanguages: string[];
  contributionGraph?: number[][];
}

export interface MatchingFactors {
  sharedLanguages: string[];
  sharedFrameworks: string[];
  complementarySkills: {
    userUniqueSkills: string[];
    targetUniqueSkills: string[];
  };
  experienceGap: number;
  locationMatch: 'same_city' | 'same_state' | 'same_country' | 'different';
  githubActivityLevel: 'both_active' | 'one_active' | 'both_moderate' | 'both_inactive';
  sharedInterests: string[];
  strengthAreas: string[];
  whyGreatTogether: string[];
}

export interface CompatibilityResult {
  totalScore: number;
  skillScore: number;
  experienceScore: number;
  githubScore: number;
  hackathonScore: number;
  locationScore: number;
  activityScore: number;
  matchingFactors: MatchingFactors;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Calculate Jaccard Similarity between two arrays
 * Formula: |A ∩ B| / |A ∪ B|
 */
export function calculateJaccardSimilarity(set1: string[], set2: string[]): number {
  if (!set1 || !set2 || set1.length === 0 || set2.length === 0) {
    return 0;
  }

  const intersection = set1.filter(item =>
    set2.some(item2 => item2.toLowerCase() === item.toLowerCase())
  ).length;

  const union = new Set([
    ...set1.map(s => s.toLowerCase()),
    ...set2.map(s => s.toLowerCase())
  ]).size;

  return union === 0 ? 0 : intersection / union;
}

/**
 * Get intersection of two string arrays (case-insensitive)
 */
export function getIntersection(arr1: string[], arr2: string[]): string[] {
  if (!arr1 || !arr2) return [];

  return arr1.filter(item =>
    arr2.some(item2 => item2.toLowerCase() === item.toLowerCase())
  );
}

/**
 * Get difference between two arrays (items in arr1 not in arr2)
 */
export function getDifference(arr1: string[], arr2: string[]): string[] {
  if (!arr1) return [];
  if (!arr2) return arr1;

  return arr1.filter(item =>
    !arr2.some(item2 => item2.toLowerCase() === item.toLowerCase())
  );
}

/**
 * Normalize experience level to a numeric value
 */
export function normalizeExperienceLevel(level?: string): number {
  if (!level) return 1;

  const normalized = level.toLowerCase();
  if (normalized.includes('beginner') || normalized.includes('entry')) return 1;
  if (normalized.includes('intermediate') || normalized.includes('mid')) return 2;
  if (normalized.includes('advanced') || normalized.includes('expert') || normalized.includes('senior')) return 3;

  return 1; // Default to beginner
}

// =====================================================
// SCORING FUNCTIONS
// =====================================================

/**
 * Calculate Skill Overlap Score (30 points max)
 * - Programming languages: 15 points
 * - Frameworks: 10 points
 * - Other skills: 5 points
 */
export function calculateSkillOverlapScore(
  user: UserProfile,
  target: UserProfile
): number {
  const languages1 = user.programming_languages || [];
  const languages2 = target.programming_languages || [];
  const frameworks1 = user.frameworks || [];
  const frameworks2 = target.frameworks || [];
  const skills1 = user.other_skills || [];
  const skills2 = target.other_skills || [];

  const languageOverlap = calculateJaccardSimilarity(languages1, languages2);
  const frameworkOverlap = calculateJaccardSimilarity(frameworks1, frameworks2);
  const skillsOverlap = calculateJaccardSimilarity(skills1, skills2);

  const languageScore = languageOverlap * 15;
  const frameworkScore = frameworkOverlap * 10;
  const skillsScore = skillsOverlap * 5;

  return languageScore + frameworkScore + skillsScore;
}

/**
 * Calculate Experience Compatibility Score (20 points max)
 * - Hackathon participation similarity: 10 points
 * - Win rate similarity: 5 points
 * - Experience level match: 5 points
 */
export function calculateExperienceCompatibilityScore(
  user: UserProfile,
  target: UserProfile,
  userStats: HackathonStats,
  targetStats: HackathonStats
): number {
  // Participation similarity (10 points)
  const participationGap = Math.abs(userStats.participated - targetStats.participated);
  let participationScore = 10;

  if (participationGap <= 3) {
    participationScore = 10;
  } else if (participationGap <= 10) {
    participationScore = 8;
  } else if (participationGap <= 20) {
    participationScore = 5;
  } else {
    participationScore = 2;
  }

  // Win rate similarity (5 points)
  const winRateGap = Math.abs(userStats.winRate - targetStats.winRate);
  let winRateScore = 5;

  if (winRateGap <= 10) {
    winRateScore = 5;
  } else if (winRateGap <= 25) {
    winRateScore = 3;
  } else {
    winRateScore = 1;
  }

  // Experience level match (5 points)
  const userLevel = normalizeExperienceLevel(user.experience_level);
  const targetLevel = normalizeExperienceLevel(target.experience_level);
  const levelDiff = Math.abs(userLevel - targetLevel);

  let experienceLevelScore = 5;
  if (levelDiff === 0) {
    experienceLevelScore = 5;
  } else if (levelDiff === 1) {
    experienceLevelScore = 3;
  } else {
    experienceLevelScore = 1;
  }

  return participationScore + winRateScore + experienceLevelScore;
}

/**
 * Calculate GitHub Activity Score (20 points max)
 * - Contribution frequency match: 10 points
 * - Repository count similarity: 5 points
 * - Language diversity: 5 points
 */
export function calculateGitHubActivityScore(
  userGithub: GitHubStats,
  targetGithub: GitHubStats
): number {
  // Contribution frequency match (10 points)
  const userContributions = userGithub.contributions || 0;
  const targetContributions = targetGithub.contributions || 0;

  let contributionScore = 3; // Base score for having any activity

  if (userContributions > 500 && targetContributions > 500) {
    contributionScore = 10; // Both very active
  } else if (userContributions > 250 && targetContributions > 250) {
    contributionScore = 8; // Both active
  } else if (userContributions > 100 && targetContributions > 100) {
    contributionScore = 6; // Both moderately active
  } else if ((userContributions > 250 && targetContributions > 50) ||
             (targetContributions > 250 && userContributions > 50)) {
    contributionScore = 6; // One active, one moderate
  }

  // Repository count similarity (5 points)
  const userRepos = userGithub.repositories || 0;
  const targetRepos = targetGithub.repositories || 0;
  const repoGap = Math.abs(userRepos - targetRepos);

  let repoScore = 5;
  if (repoGap <= 5) {
    repoScore = 5;
  } else if (repoGap <= 15) {
    repoScore = 3;
  } else {
    repoScore = 1;
  }

  // Language diversity (5 points)
  const userLanguages = userGithub.topLanguages || [];
  const targetLanguages = targetGithub.topLanguages || [];
  const languageSimilarity = calculateJaccardSimilarity(userLanguages, targetLanguages);
  const languageScore = languageSimilarity * 5;

  return contributionScore + repoScore + languageScore;
}

/**
 * Calculate Hackathon Experience Score (15 points max)
 * - Category preference match: 10 points
 * - Participation history similarity: 5 points
 */
export function calculateHackathonExperienceScore(
  userStats: HackathonStats,
  targetStats: HackathonStats
): number {
  // Category overlap (10 points)
  const categoryOverlap = calculateJaccardSimilarity(
    userStats.favoriteCategories,
    targetStats.favoriteCategories
  );
  const categoryScore = categoryOverlap * 10;

  // Participation level similarity (5 points)
  const bothExperienced = userStats.participated >= 5 && targetStats.participated >= 5;
  const bothNewbies = userStats.participated <= 2 && targetStats.participated <= 2;

  let participationScore = 2; // Default
  if (bothExperienced || bothNewbies) {
    participationScore = 5; // Similar experience levels
  } else {
    participationScore = 3; // Mixed experience (good for mentoring)
  }

  return categoryScore + participationScore;
}

/**
 * Calculate Location Score (10 points max)
 * - Same city: 10 points
 * - Same state: 7 points
 * - Same country: 5 points
 * - Different country: 2 points
 */
export function calculateLocationScore(
  user: UserProfile,
  target: UserProfile
): number {
  const userCity = user.city?.toLowerCase().trim();
  const targetCity = target.city?.toLowerCase().trim();
  const userState = user.state?.toLowerCase().trim();
  const targetState = target.state?.toLowerCase().trim();
  const userCountry = user.country?.toLowerCase().trim();
  const targetCountry = target.country?.toLowerCase().trim();

  if (userCity && targetCity && userCity === targetCity) {
    return 10; // Same city
  }

  if (userState && targetState && userState === targetState) {
    return 7; // Same state
  }

  if (userCountry && targetCountry && userCountry === targetCountry) {
    return 5; // Same country
  }

  return 2; // Different country
}

/**
 * Determine location match type
 */
export function getLocationMatchType(
  user: UserProfile,
  target: UserProfile
): 'same_city' | 'same_state' | 'same_country' | 'different' {
  const userCity = user.city?.toLowerCase().trim();
  const targetCity = target.city?.toLowerCase().trim();
  const userState = user.state?.toLowerCase().trim();
  const targetState = target.state?.toLowerCase().trim();
  const userCountry = user.country?.toLowerCase().trim();
  const targetCountry = target.country?.toLowerCase().trim();

  if (userCity && targetCity && userCity === targetCity) {
    return 'same_city';
  }

  if (userState && targetState && userState === targetState) {
    return 'same_state';
  }

  if (userCountry && targetCountry && userCountry === targetCountry) {
    return 'same_country';
  }

  return 'different';
}

/**
 * Calculate Recent Activity Score (5 points max)
 * Based on profile update recency
 */
export function calculateRecentActivityScore(
  user: UserProfile,
  target: UserProfile
): number {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const userUpdated = user.updated_at ? new Date(user.updated_at) : new Date(0);
  const targetUpdated = target.updated_at ? new Date(target.updated_at) : new Date(0);

  const userActive = userUpdated >= thirtyDaysAgo;
  const targetActive = targetUpdated >= thirtyDaysAgo;

  if (userActive && targetActive) {
    return 5; // Both active recently
  } else if (userActive || targetActive) {
    return 3; // One active
  } else {
    return 1; // Neither active recently
  }
}

/**
 * Determine GitHub activity level for both users
 */
export function getGitHubActivityLevel(
  userGithub: GitHubStats,
  targetGithub: GitHubStats
): 'both_active' | 'one_active' | 'both_moderate' | 'both_inactive' {
  const userContributions = userGithub.contributions || 0;
  const targetContributions = targetGithub.contributions || 0;

  const userActive = userContributions > 500;
  const targetActive = targetContributions > 500;
  const userModerate = userContributions > 100;
  const targetModerate = targetContributions > 100;

  if (userActive && targetActive) {
    return 'both_active';
  } else if (userActive || targetActive) {
    return 'one_active';
  } else if (userModerate && targetModerate) {
    return 'both_moderate';
  } else {
    return 'both_inactive';
  }
}

// =====================================================
// AI INSIGHT GENERATION
// =====================================================

/**
 * Generate human-readable insights about why two users match well
 */
export function generateInsights(
  user: UserProfile,
  target: UserProfile,
  userStats: HackathonStats,
  targetStats: HackathonStats,
  userGithub: GitHubStats,
  targetGithub: GitHubStats,
  scores: {
    skillScore: number;
    experienceScore: number;
    githubScore: number;
    hackathonScore: number;
  }
): string[] {
  const insights: string[] = [];

  // Skill-based insights
  const sharedLanguages = getIntersection(
    user.programming_languages || [],
    target.programming_languages || []
  );

  if (sharedLanguages.length > 0 && scores.skillScore > 15) {
    const top2Languages = sharedLanguages.slice(0, 2).join(' and ');
    insights.push(`You both excel in ${top2Languages}`);
  }

  // Complementary skills
  const userFrontend = (user.frameworks || []).some((f: string) =>
    ['React', 'Vue', 'Angular', 'Next.js', 'Svelte'].some(fe =>
      f.toLowerCase().includes(fe.toLowerCase())
    )
  );
  const targetBackend = (target.frameworks || []).some((f: string) =>
    ['Node.js', 'Express', 'Django', 'Flask', 'Spring', 'FastAPI', 'NestJS'].some(be =>
      f.toLowerCase().includes(be.toLowerCase())
    )
  );
  const targetFrontend = (target.frameworks || []).some((f: string) =>
    ['React', 'Vue', 'Angular', 'Next.js', 'Svelte'].some(fe =>
      f.toLowerCase().includes(fe.toLowerCase())
    )
  );
  const userBackend = (user.frameworks || []).some((f: string) =>
    ['Node.js', 'Express', 'Django', 'Flask', 'Spring', 'FastAPI', 'NestJS'].some(be =>
      f.toLowerCase().includes(be.toLowerCase())
    )
  );

  if ((userFrontend && targetBackend) || (targetFrontend && userBackend)) {
    insights.push('Complementary backend/frontend skills');
  }

  // Experience level insights
  if (scores.experienceScore > 15) {
    insights.push('Similar hackathon experience level');
  }

  // Category interests
  const sharedCategories = getIntersection(
    userStats.favoriteCategories,
    targetStats.favoriteCategories
  );

  if (sharedCategories.length > 0) {
    insights.push(`Shared interest in ${sharedCategories[0]}`);
  }

  // GitHub activity
  if (scores.githubScore > 15) {
    insights.push('Both actively contributing on GitHub');
  }

  // Location
  if (user.city && target.city && user.city.toLowerCase() === target.city.toLowerCase()) {
    insights.push(`Both based in ${user.city}`);
  }

  // Win rate
  if (userStats.won > 0 && targetStats.won > 0) {
    insights.push('Both have won hackathons before');
  }

  // Return top 4-5 insights
  return insights.slice(0, 5);
}

// =====================================================
// MAIN COMPATIBILITY CALCULATION
// =====================================================

/**
 * Calculate overall compatibility score between two users
 * This is the main function that combines all scoring factors
 */
export function calculateCompatibilityScore(
  user: UserProfile,
  target: UserProfile,
  userStats: HackathonStats,
  targetStats: HackathonStats,
  userGithub: GitHubStats,
  targetGithub: GitHubStats
): CompatibilityResult {
  // Calculate individual scores
  const skillScore = calculateSkillOverlapScore(user, target);
  const experienceScore = calculateExperienceCompatibilityScore(user, target, userStats, targetStats);
  const githubScore = calculateGitHubActivityScore(userGithub, targetGithub);
  const hackathonScore = calculateHackathonExperienceScore(userStats, targetStats);
  const locationScore = calculateLocationScore(user, target);
  const activityScore = calculateRecentActivityScore(user, target);

  // Calculate total score
  const totalScore = Math.min(100, Math.round(
    skillScore + experienceScore + githubScore + hackathonScore + locationScore + activityScore
  ));

  // Generate matching factors
  const matchingFactors: MatchingFactors = {
    sharedLanguages: getIntersection(
      user.programming_languages || [],
      target.programming_languages || []
    ),
    sharedFrameworks: getIntersection(
      user.frameworks || [],
      target.frameworks || []
    ),
    complementarySkills: {
      userUniqueSkills: getDifference(
        user.programming_languages || [],
        target.programming_languages || []
      ),
      targetUniqueSkills: getDifference(
        target.programming_languages || [],
        user.programming_languages || []
      )
    },
    experienceGap: Math.abs(userStats.participated - targetStats.participated),
    locationMatch: getLocationMatchType(user, target),
    githubActivityLevel: getGitHubActivityLevel(userGithub, targetGithub),
    sharedInterests: getIntersection(
      userStats.favoriteCategories,
      targetStats.favoriteCategories
    ),
    strengthAreas: getIntersection(
      user.programming_languages || [],
      target.programming_languages || []
    ).slice(0, 3),
    whyGreatTogether: generateInsights(
      user,
      target,
      userStats,
      targetStats,
      userGithub,
      targetGithub,
      { skillScore, experienceScore, githubScore, hackathonScore }
    )
  };

  return {
    totalScore,
    skillScore: Math.round(skillScore * 100) / 100,
    experienceScore: Math.round(experienceScore * 100) / 100,
    githubScore: Math.round(githubScore * 100) / 100,
    hackathonScore: Math.round(hackathonScore * 100) / 100,
    locationScore: Math.round(locationScore * 100) / 100,
    activityScore: Math.round(activityScore * 100) / 100,
    matchingFactors
  };
}
