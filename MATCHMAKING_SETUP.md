# Find Your Hackathon Buddy - Matchmaking Feature Setup Guide

## Overview

This document provides instructions for setting up the AI-powered Tinder-style matchmaking feature for HackerFlow. This feature allows hackers to discover potential teammates through intelligent matching based on skills, experience, GitHub activity, and more.

## Features Implemented

### ✅ Core Features
- **Tinder-style Swipe Interface**: Swipe right to like, left to pass
- **AI-Powered Matching**: Compatibility scoring algorithm (0-100%)
- **Real-time GitHub Integration**: Displays contribution graphs, repos, and activity
- **Mutual Match Detection**: Automatic notification when both users like each other
- **Match Insights**: AI-generated explanations of why users match well
- **Preferences System**: Customizable matchmaking filters
- **Matches Dashboard**: View all mutual matches with filtering and search

### 📊 Compatibility Algorithm

The algorithm calculates a compatibility score based on 6 factors:

1. **Skill Overlap (30%)**: Programming languages, frameworks, and technical skills
2. **Experience Compatibility (20%)**: Hackathon participation and win rates
3. **GitHub Activity (20%)**: Contributions, repos, and coding activity level
4. **Hackathon Experience (15%)**: Shared interests in hackathon categories
5. **Location (10%)**: Geographic proximity for offline collaboration
6. **Recent Activity (5%)**: Profile engagement and activity level

### 🎨 UI Components

- **Profile Cards**: Large cards with photos, skills, and experience
- **Match Score Badge**: Visual indicator of compatibility percentage
- **AI Match Insights**: Personalized reasons why users match well
- **GitHub Contribution Graph**: Visual representation of coding activity
- **Recent Projects Showcase**: Display of user's top GitHub projects
- **Match Modal**: Celebratory animation with confetti when matches occur

## Setup Instructions

### Step 1: Apply Database Migration

The matchmaking feature requires three new database tables. Apply the migration using one of these methods:

#### Option A: Using Supabase CLI (Recommended)

```bash
# Make sure Docker Desktop is running
# Then reset the database to apply all migrations
npx supabase db reset
```

#### Option B: Manual SQL Execution

If you prefer to apply the migration manually:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to your project
3. Go to SQL Editor
4. Copy the contents of `supabase/migrations/20250201000000_create_matchmaking_tables.sql`
5. Paste and execute the SQL

The migration creates:
- `hacker_connections` table (stores likes, passes, and matches)
- `match_preferences` table (user matchmaking preferences)
- `match_insights` table (calculated compatibility scores and factors)

### Step 2: Verify Database Setup

After applying the migration, verify the tables exist:

```sql
-- Check if tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('hacker_connections', 'match_preferences', 'match_insights');

-- Should return 3 rows
```

### Step 3: Test the Feature

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to the matchmaking page**:
   ```
   http://localhost:3000/find-teammates
   ```

3. **Test the flow**:
   - View profiles and swipe right/left
   - Check if compatibility scores are calculated
   - Test mutual matching
   - Visit matches page
   - Adjust preferences

### Step 4: Seed Test Data (Optional)

For testing purposes, you can create some test user profiles:

```sql
-- Insert test hacker profiles (run in Supabase SQL Editor)

-- First, create test auth users (you'll need to do this via Supabase Auth UI)
-- Then create their profiles:

INSERT INTO user_profiles (
  user_id,
  user_primary_type,
  full_name,
  bio,
  city,
  state,
  country,
  programming_languages,
  frameworks,
  experience_level,
  github_username
) VALUES
(
  'uuid-of-test-user-1',
  'hacker',
  'Alice Johnson',
  'Full-stack developer passionate about AI and machine learning',
  'San Francisco',
  'California',
  'USA',
  ARRAY['Python', 'JavaScript', 'TypeScript'],
  ARRAY['React', 'Node.js', 'TensorFlow'],
  'Advanced',
  'alice-codes'
),
(
  'uuid-of-test-user-2',
  'hacker',
  'Bob Smith',
  'Backend engineer with a love for scalable systems',
  'San Francisco',
  'California',
  'USA',
  ARRAY['Go', 'Python', 'Rust'],
  ARRAY['Django', 'FastAPI', 'Docker'],
  'Intermediate',
  'bob-builds'
);

-- Create some hackathon participation records
INSERT INTO hackathon_registrations (
  user_id,
  hackathon_id,
  participant_type,
  registration_status
) VALUES
  ('uuid-of-test-user-1', 'some-hackathon-id', 'team', 'confirmed'),
  ('uuid-of-test-user-2', 'some-hackathon-id', 'individual', 'confirmed');
```

## File Structure

```
app/find-teammates/
├── page.tsx                    # Main swipe interface
├── components.tsx              # UI components (ProfileCard, MatchScore, etc.)
├── matches/
│   └── page.tsx               # Matches list page
└── preferences/
    └── page.tsx               # Preferences settings page

lib/
├── actions/
│   └── matchmaking-actions.ts # Server actions for matchmaking
└── algorithms/
    └── matchmaking.ts         # Compatibility scoring algorithm

supabase/migrations/
└── 20250201000000_create_matchmaking_tables.sql
```

## API Documentation

### Server Actions

#### `getNextMatch(filters?)`
Returns the next potential match based on compatibility score and user preferences.

**Returns:**
```typescript
{
  success: boolean;
  data: MatchProfile | null;
  message?: string;
  error?: string;
}
```

#### `swipeRight(targetUserId)`
Records a "like" and checks for mutual match.

**Returns:**
```typescript
{
  success: boolean;
  matched: boolean;
  connection: Connection;
}
```

#### `swipeLeft(targetUserId)`
Records a "pass" on a user.

#### `getMatches()`
Retrieves all mutual matches for the current user.

#### `updateMatchPreferences(preferences)`
Updates user's matchmaking preferences.

#### `getMatchPreferences()`
Retrieves user's current preferences.

#### `undoLastSwipe()`
Undoes the last swipe (within 30 seconds).

### Compatibility Algorithm

#### `calculateCompatibilityScore(user, target, userStats, targetStats, userGithub, targetGithub)`
Main function that calculates the compatibility score between two users.

**Parameters:**
- `user`: UserProfile - Current user's profile
- `target`: UserProfile - Target user's profile
- `userStats`: HackathonStats - Current user's hackathon statistics
- `targetStats`: HackathonStats - Target user's hackathon statistics
- `userGithub`: GitHubStats - Current user's GitHub statistics
- `targetGithub`: GitHubStats - Target user's GitHub statistics

**Returns:**
```typescript
{
  totalScore: number;           // 0-100
  skillScore: number;           // 0-30
  experienceScore: number;      // 0-20
  githubScore: number;          // 0-20
  hackathonScore: number;       // 0-15
  locationScore: number;        // 0-10
  activityScore: number;        // 0-5
  matchingFactors: MatchingFactors;
}
```

## Troubleshooting

### Issue: No profiles showing up

**Solution:**
- Make sure there are other hacker profiles in the database
- Check that your own profile is complete (has skills, location, etc.)
- Verify match_preferences table allows the filtering criteria

### Issue: Compatibility scores are always 0

**Solution:**
- Ensure GitHub data is populated in user_profiles
- Verify hackathon_registrations and hackathon_winners tables have data
- Check that programming_languages and frameworks arrays are populated

### Issue: Swipe actions not working

**Solution:**
- Check browser console for errors
- Verify authentication is working (user is logged in)
- Check RLS policies are correctly set up in Supabase
- Ensure the triggers for mutual match detection are created

### Issue: Match modal doesn't show confetti

**Solution:**
- Verify canvas-confetti library is installed: `npm list canvas-confetti`
- Check browser console for JavaScript errors
- Ensure animations are enabled in browser settings

## Customization

### Adjusting Compatibility Weights

To change how much each factor contributes to the compatibility score, edit `lib/algorithms/matchmaking.ts`:

```typescript
// Current weights:
// - Skill Overlap: 30 points
// - Experience: 20 points
// - GitHub: 20 points
// - Hackathon Experience: 15 points
// - Location: 10 points
// - Recent Activity: 5 points

// Modify the score calculation functions to adjust weights
```

### Adding New Matching Factors

1. Update the `MatchingFactors` interface in `lib/algorithms/matchmaking.ts`
2. Add a new scoring function
3. Include it in the `calculateCompatibilityScore` function
4. Update `match_insights` table schema if storing new factors

### Customizing UI Theme

Colors and styling can be adjusted in the component files:
- Main theme colors are defined using Tailwind classes
- Gradients use: `purple-600`, `pink-600`, `blue-600`, `green-600`
- Change these throughout the components for different color schemes

## Performance Optimization

### Caching Strategy

The feature implements caching for:
- **GitHub data**: Cached for 24 hours to reduce API calls
- **Compatibility scores**: Stored in `match_insights` table
- **User profiles**: Loaded once per swipe session

### Database Indexes

The migration includes indexes on:
- `hacker_connections(user_id, target_user_id, matched)`
- `match_insights(user_id, compatibility_score DESC)`
- `match_preferences(user_id, looking_for_team)`

### Future Optimizations

- Implement Redis caching for frequently accessed profiles
- Use background jobs for compatibility score pre-calculation
- Add pagination for matches list
- Lazy load contribution graphs

## Security Considerations

### RLS Policies

All tables have Row Level Security enabled:
- Users can only view their own connections and preferences
- Match insights are private to each user
- Blocked users are never shown again

### Data Privacy

- User location is only used for matching, not displayed to others
- GitHub access tokens are never exposed to frontend
- Match insights are stored encrypted

### Rate Limiting

Consider implementing rate limiting for:
- Swipe actions (max 100/day)
- Preference updates (max 10/day)
- Profile views

## Analytics & Monitoring

### Key Metrics to Track

1. **Engagement Metrics**:
   - Daily active users on matchmaking page
   - Average swipes per session
   - Like rate (swipes right / total swipes)

2. **Match Quality**:
   - Match rate (mutual likes / total likes)
   - Average compatibility score of matches
   - Message rate after matching

3. **Technical Metrics**:
   - Page load time
   - API response times
   - GitHub API quota usage

### Implementing Analytics

Add analytics events in `app/find-teammates/page.tsx`:

```typescript
// Example using your analytics service
analytics.track('Profile Viewed', {
  targetUserId: profile.user_id,
  compatibilityScore: profile.compatibilityScore
})

analytics.track('Swipe Action', {
  direction: 'right',
  matched: result.matched,
  compatibilityScore: currentProfile.compatibilityScore
})
```

## Future Enhancements

### Phase 2 Features (Recommended)

1. **Chat System**: Real-time messaging between matched users
2. **Team Formation**: Multi-person team matching (3-4 members)
3. **Hackathon-Specific Matching**: Match users for specific upcoming hackathons
4. **Video Profiles**: Allow users to add video introductions
5. **Endorsements**: Let past teammates endorse skills

### Phase 3 Features (Advanced)

1. **Machine Learning**: Improve matching based on successful team outcomes
2. **Success Stories**: Showcase winning teams formed through matchmaking
3. **Team Chemistry Score**: Analyze communication styles and working preferences
4. **Smart Recommendations**: Proactive suggestions based on user behavior

## Support & Contribution

### Getting Help

If you encounter issues:
1. Check this documentation
2. Review the code comments in the implementation files
3. Check Supabase logs for database errors
4. Review browser console for frontend errors

### Contributing

To extend the matchmaking feature:
1. Follow the existing code structure
2. Add tests for new functionality
3. Update this documentation
4. Ensure RLS policies are maintained

## License

This feature is part of HackerFlow and follows the same license as the main project.

---

**Built with**: Next.js 15, React 19, Supabase, Framer Motion, TypeScript
**Last Updated**: January 2025
