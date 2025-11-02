# Chat Feature Debug Guide

## Step 1: Apply the Fixed Migration

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the **updated** migration from `lib/supabase/migrations/001_add_conversations_and_hackathon_fields.sql`
3. Run it - it should now succeed without the "column idea_id does not exist" error

## Step 2: Verify Tables Exist

Run this in SQL Editor:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('generated_ideas', 'conversations', 'hackathons');

-- Should return 3 rows with these table names
```

## Step 3: Test Idea Generation

1. Go to `/ai-idea-generator`
2. Select a hackathon
3. Add inspiration: "I want to build a web app"
4. Click "Generate Idea"
5. Wait for the idea to be generated
6. **Check browser console (F12 → Console tab)**
   - Should see: "Successfully generated idea"
   - Should NOT see any errors

## Step 4: Save the Idea

1. Click "Save Idea" button (now the prominent teal button)
2. Wait for the success toast
3. **Check browser console**
   - Should see: "Idea saved successfully!"
   - Should see the idea ID being set
4. **Verify in Supabase Dashboard**:
   ```sql
   SELECT id, title, user_id FROM generated_ideas ORDER BY created_at DESC LIMIT 1;
   ```
   - Should show your saved idea with a UUID

## Step 5: Test Chat Feature

1. After saving, scroll to the right chat panel
2. Type a message: "What is this project about?"
3. Press Enter or click Send
4. **Watch the browser console carefully**

### Expected Console Output:
```
Sending chat request with: {messageCount: 1, hackathonId: "...", hackathonTitle: "..."}
Chat response status: 200 OK
Received chunk, length: XX
Received chunk, length: XX
...
Full response received, length: XXX
```

### If You See Errors:

#### Error: "Failed to send message: 500"
**Problem**: Chat API is crashing
**Debug Steps**:
1. Check the terminal where `npm run dev` is running
2. Look for error messages in red
3. Common issues:
   - OpenAI API key not set
   - Rate limit exceeded
   - Network issue

**Fix**: Check your `.env.local` file:
```bash
OPENAI_API_KEY=sk-...
```

#### Error: "Please save your idea first"
**Problem**: Idea doesn't have an ID
**Fix**: Click the "Save Idea" button first

#### Error: "No hackathon selected"
**Problem**: Navigation issue
**Fix**: Go back and select a hackathon again

## Step 6: Verify Conversation Saved

After a successful chat exchange:

```sql
-- Check if conversation was created
SELECT
  c.id,
  c.user_id,
  c.idea_id,
  c.messages,
  c.created_at
FROM conversations c
ORDER BY c.created_at DESC
LIMIT 1;
```

You should see:
- A conversation record
- The `messages` field containing your chat history as JSON

## Common Issues & Fixes

### Issue 1: Chat API Returns 500 Error

**Check Terminal Output**:
```
Error: Cannot find module 'ai'
```
**Fix**: Run `npm install ai`

**Check Terminal Output**:
```
Error: Missing OpenAI API key
```
**Fix**: Add to `.env.local`:
```
OPENAI_API_KEY=your-key-here
```

### Issue 2: No Response in Chat

**Symptoms**: Message sends but no response appears

**Debug**:
1. Check browser Network tab (F12 → Network)
2. Find the `/api/chat` request
3. Click on it → Response tab
4. Check if there's any output

**Common Causes**:
- OpenAI API timeout (30 second limit)
- Network connection issue
- API key invalid

### Issue 3: Conversation Not Saving

**Symptoms**: Chat works but messages don't persist

**Debug**:
1. Check console for: "No conversation ID - messages will not be saved"
2. This means the conversation wasn't created

**Fix**:
- Make sure you saved the idea first
- Check if `conversationId` state is set
- Verify RLS policies allow your user to insert

### Issue 4: RLS Policy Blocking Access

**Symptoms**: Chat works but SQL queries show empty conversations

**Debug**: Check if you're using the right user

**Fix**: Run this to verify RLS is working:
```sql
-- As authenticated user
SELECT * FROM conversations WHERE user_id = auth.uid();
```

## Testing Checklist

- [ ] Migration applied successfully
- [ ] `generated_ideas` table exists
- [ ] `conversations` table exists
- [ ] Can generate an idea
- [ ] Can save an idea
- [ ] Idea appears in `generated_ideas` table
- [ ] Can send a chat message
- [ ] AI responds to chat message
- [ ] Response appears in chat UI
- [ ] Conversation saved to `conversations` table
- [ ] Can see saved conversation in SQL query

## Next Steps After Everything Works

Once chat is working:

1. **Test Multiple Messages**: Send several messages back and forth
2. **Test Reload**: Refresh the page and check if conversation loads
3. **Test Different Ideas**: Generate multiple ideas and verify each has its own conversation

## Need More Help?

If chat still doesn't work after following this guide:

1. Copy the **exact error message** from browser console
2. Copy the **terminal output** from where Next.js is running
3. Check the Network tab for the failing request
4. Note which step failed (idea generation, save, or chat)

## Quick Test Commands

```bash
# Start dev server
npm run dev

# Check if .env.local has OpenAI key
cat .env.local | grep OPENAI

# Test chat API directly (replace with real hackathon ID)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "test"}],
    "hackathonTitle": "Test Hackathon",
    "hackathonId": "some-uuid-here"
  }'
```

Good luck! The chat feature should work now with all the fixes applied. 🚀
