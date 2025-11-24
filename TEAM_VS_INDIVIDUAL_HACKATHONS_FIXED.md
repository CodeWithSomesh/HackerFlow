# ✅ TEAM VS INDIVIDUAL HACKATHONS - COMPLETE FIX

## 🎯 What Was Fixed

### Understanding the Problem
You have **two types of hackathons:**
1. **Team-based hackathons** (`participation_type: 'team'`) - Teams compete
2. **Individual hackathons** (`participation_type: 'individual'`) - Individual participants compete

**The Issue:**
- Manage Participants Teams tab was filtering `hackathon_registrations` by `participant_type = 'team'` ❌
- Should have been fetching from `hackathon_teams` table directly ✅
- Winners page showed individual participants for ALL hackathons ❌
- Should show teams for team hackathons, participants for individual hackathons ✅

---

## ✅ Fixes Applied

### 1. Manage Participants Page - Teams Tab Fixed

**File:** `app/dashboard/organizer/hackathons/[id]/participants/page.tsx`

**What Changed:**

#### Before (WRONG):
```typescript
// Always fetched from hackathon_registrations
const result = await getHackathonParticipants(hackathonId, {
  type: 'team', // Filtered by participant_type = 'team'
})
```

#### After (CORRECT):
```typescript
if (typeFilter === 'team') {
  // Fetch teams from hackathon_teams table
  const result = await getHackathonTeams(hackathonId)
  setTeams(result.data)
} else {
  // Fetch participants from hackathon_registrations
  const result = await getHackathonParticipants(hackathonId, {...})
  setParticipants(result.data)
}
```

**Teams Table Now Shows:**
- Team Name
- Team Leader (from `hackathon_team_members` where `is_leader = true`)
- Members count with icon
- Team size (current/max)
- Created date

**Search:** By team name

---

### 2. Winners Page - Team vs Individual Hackathons

**File:** `app/dashboard/organizer/hackathons/[id]/winners/page.tsx`

**What Changed:**

#### Intelligent Loading Based on Hackathon Type:
```typescript
async function loadData() {
  // Fetch hackathon details first
  const hackathonResult = await getHackathonById(hackathonId)

  // Check participation_type
  const isTeamHackathon = hackathonResult.data.participation_type === 'team'

  if (isTeamHackathon) {
    // Fetch teams for team-based hackathons
    const teamsResult = await getHackathonTeams(hackathonId)
    setTeams(teamsResult.data)
  } else {
    // Fetch participants for individual hackathons
    const participantsResult = await getHackathonParticipants(hackathonId, { limit: 1000 })
    setParticipants(participantsResult.data)
  }
}
```

#### Dynamic Table Rendering:
**For Team Hackathons:**
- Header: "Select Winning Team"
- Table columns: Team Name | Team Leader | Members | Action
- Search: By team name
- Excludes teams already declared as winners

**For Individual Hackathons:**
- Header: "Select Winner from Participants"
- Table columns: Name | Email | Type | Action
- Search: By name or email
- Excludes participants already declared as winners

#### Smart Winner Assignment:
```typescript
if (isTeamHackathon) {
  // For team hackathons
  const leader = selectedParticipant.hackathon_team_members?.find(m => m.is_leader)
  winnerData = {
    user_id: leader.user_id,      // Team leader's ID
    team_id: selectedParticipant.id, // Team ID
    prize_position: prize.position,
    prize_amount: prizeAmount,
  }
} else {
  // For individual hackathons
  winnerData = {
    user_id: selectedParticipant.user_id,
    team_id: undefined,
    prize_position: prize.position,
    prize_amount: prizeAmount,
  }
}
```

#### Modal Displays Correctly:
**For Teams:**
```
Selected Team
─────────────
MeowHackers
Leader: John Doe
Members: 3
```

**For Individuals:**
```
Selected Participant
────────────────────
John Doe
john@example.com
```

---

## 🗂️ Database Structure Understanding

### Tables Involved:

#### 1. `hackathons`
```sql
- id
- participation_type ('team' or 'individual')  ← KEY FIELD
- prizes (JSON)
```

#### 2. `hackathon_teams` (for team hackathons)
```sql
- id
- hackathon_id
- team_name
- team_size_current
- team_size_max
- created_at
```

#### 3. `hackathon_team_members`
```sql
- id
- team_id
- user_id
- email
- first_name
- last_name
- is_leader (boolean)  ← Identifies team leader
```

#### 4. `hackathon_registrations` (for individual hackathons)
```sql
- id
- hackathon_id
- user_id
- first_name
- last_name
- email
- participant_type
```

#### 5. `hackathon_winners`
```sql
- id
- hackathon_id
- user_id        ← Team leader's ID for team hackathons
- team_id        ← Team ID for team hackathons, NULL for individual
- prize_position
- prize_amount
- payment_status
```

---

## 🎨 User Experience Flow

### For Team-Based Hackathons:

**Manage Participants:**
1. Click "Teams" tab
2. See table of teams from `hackathon_teams`
3. Each row shows: Team Name, Leader, Member count, Size
4. Search by team name

**Winners Management:**
1. Section header: "Select Winning Team"
2. Table shows: Team Name | Team Leader | Members | Select as Winner
3. Search by team name
4. Click "Select as Winner"
5. Modal shows:
   - Selected Team: [Team Name]
   - Leader: [Leader Name]
   - Members: [Count]
6. Choose prize from dropdown
7. Confirm → Team declared as winner
8. Winner card shows team name (via `team_id`)

### For Individual Hackathons:

**Manage Participants:**
1. Click "All Participants" tab
2. See table of participants from `hackathon_registrations`
3. Each row shows: Name, Email, Mobile, Type, Team, Registered
4. Search by name or email

**Winners Management:**
1. Section header: "Select Winner from Participants"
2. Table shows: Name | Email | Type | Select as Winner
3. Search by name or email
4. Click "Select as Winner"
5. Modal shows:
   - Selected Participant: [Name]
   - Email: [Email]
6. Choose prize from dropdown
7. Confirm → Participant declared as winner
8. Winner card shows participant name

---

## 📊 Key Differences

| Feature | Team Hackathons | Individual Hackathons |
|---------|----------------|----------------------|
| **Data Source** | `hackathon_teams` | `hackathon_registrations` |
| **Teams Tab** | Shows teams with members | N/A (not needed) |
| **Winner Selection** | Select entire team | Select individual participant |
| **Winner Storage** | `user_id` = leader, `team_id` = team | `user_id` = participant, `team_id` = NULL |
| **Search** | By team name | By participant name/email |
| **Display** | Team Name, Leader, Members | Name, Email, Type |

---

## ✅ Testing Checklist

### Test Manage Participants - Teams Tab
- [ ] Go to a **team-based hackathon**
- [ ] Click "Teams" tab
- [ ] Verify teams from `hackathon_teams` table are displayed
- [ ] Verify columns: Team Name, Leader, Members, Size, Created
- [ ] Test search by team name
- [ ] Verify member count shows correctly

### Test Winners - Team Hackathon
- [ ] Go to a **team-based hackathon's** Winners page
- [ ] Verify section header: "Select Winning Team"
- [ ] Verify table shows teams (not individual participants)
- [ ] Verify search by team name works
- [ ] Click "Select as Winner" for a team
- [ ] Verify modal shows team name, leader, member count
- [ ] Select a prize and confirm
- [ ] Verify winner card appears with team info

### Test Winners - Individual Hackathon
- [ ] Go to an **individual hackathon's** Winners page
- [ ] Verify section header: "Select Winner from Participants"
- [ ] Verify table shows participants (not teams)
- [ ] Verify search by name/email works
- [ ] Click "Select as Winner" for a participant
- [ ] Verify modal shows participant name and email
- [ ] Select a prize and confirm
- [ ] Verify winner card appears with participant info

---

## 🚀 Summary

**Before:**
- ❌ Teams tab filtered registrations (wrong table)
- ❌ Winners page always showed participants
- ❌ No distinction between team/individual hackathons

**After:**
- ✅ Teams tab fetches from `hackathon_teams` table
- ✅ Winners page checks `participation_type` and adapts
- ✅ Team hackathons: Show teams for winner selection
- ✅ Individual hackathons: Show participants for winner selection
- ✅ Modal adapts based on hackathon type
- ✅ Winner data stored correctly (team_id set for teams)

**The system now properly handles both hackathon types! 🎉**
