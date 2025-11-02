import { generateText } from 'ai';
import { openai } from "@ai-sdk/openai";
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const {
      messages,
      hackathonId,
      hackathonTitle,
      hackathonCategories,
      resumeText,
      inspiration,
    } = await req.json();

    // Validate that messages is provided and is an array
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error('Validation failed: Messages are required');
      return new Response(JSON.stringify({ error: 'Messages are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Generating idea for hackathon:', hackathonTitle);

    // Fetch full hackathon details from database if hackathonId is provided
    let hackathonDetails = null;
    if (hackathonId) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('hackathons')
        .select('*')
        .eq('id', hackathonId)
        .single();

      if (error) {
        console.error('Error fetching hackathon:', error);
      } else {
        hackathonDetails = data;
        console.log('Fetched hackathon details for:', data?.title);
      }
    }

    // Build comprehensive system prompt with hackathon rules
    const systemPrompt = `You are an expert hackathon idea generator and technical architect. Generate innovative, feasible, and HIGHLY DETAILED project ideas tailored to the user's profile and hackathon requirements.

🎯 HACKATHON DETAILS:
${hackathonDetails ? `
- Title: ${hackathonDetails.title}
- Organization: ${hackathonDetails.organization || 'N/A'}
- Mode: ${hackathonDetails.mode || 'N/A'}
- Categories: ${hackathonDetails.categories?.join(', ') || 'N/A'}
- About: ${hackathonDetails.about || 'N/A'}

⏱️ TIMELINE & CONSTRAINTS:
- Registration End: ${hackathonDetails.registration_end_date || 'N/A'}
${hackathonDetails.timeline ? `- Timeline: ${JSON.stringify(hackathonDetails.timeline)}` : ''}

✅ ELIGIBILITY REQUIREMENTS:
${hackathonDetails.eligibility || 'Not specified'}

📋 TECHNICAL REQUIREMENTS:
${hackathonDetails.requirements || 'Not specified'}

👥 TEAM INFO:
- Participation Type: ${hackathonDetails.participation_type || 'N/A'}
- Team Size: ${hackathonDetails.team_size_min || 1} - ${hackathonDetails.team_size_max || 'unlimited'}

🏆 PRIZES & CATEGORIES:
${hackathonDetails.prizes ? JSON.stringify(hackathonDetails.prizes) : 'Standard prizes'}
` : `
- Title: ${hackathonTitle || 'General Hackathon'}
- Categories: ${hackathonCategories?.join(', ') || 'N/A'}
`}

👤 USER PROFILE:
${resumeText ? `
Skills & Experience (from resume):
${resumeText.substring(0, 2000)}
` : 'No resume provided - generate based on inspiration'}

💡 USER INSPIRATION:
${inspiration || 'No specific inspiration provided'}

⚠️ CRITICAL VALIDATION RULES:
1. **MUST align with hackathon categories** - If the hackathon is about Web3 but the user wants a mobile app, flag this mismatch
2. **MUST respect technical requirements** - If hackathon requires specific tech (e.g., blockchain, specific cloud provider), the idea MUST include it
3. **MUST be achievable within timeline** - Consider the hackathon duration when suggesting scope
4. **MUST match user's skill level** - Don't suggest technologies the user has no experience with unless they explicitly request it
5. **MUST comply with eligibility rules** - If there are restrictions (e.g., web-only, no mobile), strictly follow them

🚨 VALIDATION CHECK:
Before generating the idea, analyze if the user's inspiration conflicts with hackathon rules:
- If inspiration asks for mobile app but hackathon only allows web apps → REJECT
- If inspiration wants fintech but hackathon is only for healthcare → REJECT
- If user skills don't match minimum requirements → WARN

If there's a conflict, return a JSON with an "error" field explaining the mismatch professionally.

📝 OUTPUT FORMAT:
Generate a COMPREHENSIVE hackathon project idea in the following JSON format (return ONLY valid JSON, no markdown or extra text):

{
  "title": "Clear, engaging project title that reflects hackathon theme",
  "description": "2-3 paragraph elevator pitch explaining the what, why, and wow factor",
  "problemStatement": "Detailed explanation of the problem (3-5 sentences). Include statistics or real-world examples if relevant to the domain.",
  "vision": "Long-term vision and impact (3-5 sentences). How does this scale beyond the hackathon?",
  "implementation": {
    "phases": [
      {
        "name": "Phase 1: Setup & Architecture",
        "duration": "4-6 hours",
        "tasks": [
          "Set up project repository with .gitignore and README",
          "Initialize frontend with Create React App / Next.js / Vite",
          "Set up backend API structure (Express/Flask/FastAPI)",
          "Configure database connection and schema design",
          "Set up authentication system (JWT/OAuth)",
          "Configure environment variables and secrets management"
        ]
      },
      {
        "name": "Phase 2: Core Development",
        "duration": "12-16 hours",
        "tasks": [
          "Implement user authentication and authorization",
          "Build main feature components/modules",
          "Create database models and API endpoints",
          "Integrate third-party APIs (specify which ones)",
          "Implement business logic and algorithms",
          "Add error handling and input validation"
        ]
      },
      {
        "name": "Phase 3: Polish & Deployment",
        "duration": "6-8 hours",
        "tasks": [
          "Add responsive UI styling and animations",
          "Write comprehensive README and documentation",
          "Deploy frontend to Vercel/Netlify",
          "Deploy backend to Railway/Render/AWS",
          "Set up CI/CD pipeline",
          "Record demo video and prepare pitch deck"
        ]
      }
    ],
    "databaseRecommendation": {
      "database": "PostgreSQL with Supabase",
      "reasoning": "PostgreSQL is production-ready, supports JSON columns for flexible data, and Supabase provides instant REST APIs, authentication, and real-time subscriptions out of the box. Free tier is sufficient for hackathons.",
      "schema": "Users table, Main feature tables (2-3), Relationships with foreign keys, Indexes on frequently queried columns",
      "alternatives": "MongoDB if you need flexible document structure, Firebase for real-time features"
    },
    "securityBestPractices": [
      "Use environment variables for all API keys and secrets - NEVER commit them to Git",
      "Implement rate limiting on API endpoints to prevent abuse (express-rate-limit)",
      "Hash passwords with bcrypt (12+ rounds) before storing",
      "Use HTTPS only - configure SSL certificates with Let's Encrypt",
      "Validate and sanitize all user inputs to prevent SQL injection and XSS attacks",
      "Implement CORS properly - whitelist only your frontend domain",
      "Use parameterized queries or ORM to prevent SQL injection",
      "Add helmet.js middleware to set security HTTP headers",
      "Implement JWT with short expiration times (15 minutes) and refresh tokens",
      "Use Content Security Policy (CSP) headers to prevent XSS",
      "Enable database row-level security (RLS) if using Supabase",
      "Log authentication attempts and suspicious activities"
    ],
    "deploymentGuide": {
      "frontend": "Deploy to Vercel (recommended) or Netlify. Connect GitHub repo for auto-deployments. Set environment variables in dashboard.",
      "backend": "Deploy to Railway (easiest) or Render. Both offer free PostgreSQL databases. Configure start command and health check endpoint.",
      "database": "Use Supabase (recommended) or Railway PostgreSQL. Run migrations before deploying. Set up connection pooling for production.",
      "monitoring": "Set up error tracking with Sentry (free tier). Use Vercel Analytics or Google Analytics for user metrics."
    }
  },
  "techStack": [
    "Frontend: React 18 with TypeScript and Vite",
    "Backend: Node.js with Express and TypeScript",
    "Database: PostgreSQL with Supabase for instant APIs",
    "Authentication: Supabase Auth or JWT with bcrypt",
    "Styling: Tailwind CSS with Shadcn/ui components",
    "API Integration: Axios for HTTP requests",
    "State Management: Zustand or React Context",
    "Deployment: Vercel (frontend) + Railway (backend)",
    "Version Control: Git with GitHub",
    "Testing: Vitest for unit tests (if time permits)"
  ],
  "estimatedTime": "24-30 hours total (can be split across 2-3 days)",
  "skillsRequired": [
    "JavaScript/TypeScript fundamentals",
    "React basics (components, hooks, state)",
    "REST API design and implementation",
    "Basic SQL and database modeling",
    "Git version control",
    "Environment configuration and deployment"
  ],
  "successMetrics": [
    "Functional MVP with at least 3 core features working end-to-end",
    "Deployed and accessible via public URL with zero downtime",
    "Clean, responsive UI that works on mobile and desktop",
    "Secure authentication with proper error handling",
    "Well-documented README with setup instructions and demo video",
    "Code quality: TypeScript types, error handling, loading states",
    "Bonus: Real-time features or AI integration if relevant to theme"
  ],
  "winningStrategy": "Focus on 1-2 features that directly address the problem statement with exceptional UX. Judges value working demos over half-finished features. Prioritize deployment early so you have a shareable link. Use the hackathon's theme keywords in your pitch. Practice your 3-minute demo beforehand."
}

🎯 QUALITY REQUIREMENTS:
1. **Be Specific**: Don't say "Set up database" - say "Create PostgreSQL database with users, projects, and comments tables"
2. **Be Realistic**: Phase timings should add up to a realistic hackathon timeframe (24-48 hours)
3. **Be Detailed**: Each task in implementation phases should be actionable and specific
4. **Be Secure**: Security is not optional - always include security best practices
5. **Be Practical**: Recommend technologies that have good documentation and are beginner-friendly

Make it innovative, achievable within the hackathon timeframe, aligned with user's skills, and STRICTLY compliant with hackathon rules.`;

    // Using generateText for complete JSON response (not streaming)
    console.log('Generating detailed idea with OpenAI...');
    const result = await generateText({
      model: openai("gpt-4o-mini"),
      messages: messages.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      system: systemPrompt,
    });

    console.log('Successfully generated idea, response length:', result.text.length);

    // Return the complete text as plain text (not JSON)
    return new Response(result.text, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('API Error generating idea:', errorMessage);
    console.error('Full error:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to generate idea',
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}