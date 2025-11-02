// app/api/chat/route.ts
import { streamText } from 'ai';
import { openai } from "@ai-sdk/openai";
import { createClient } from '@/lib/supabase/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Raw request body:', JSON.stringify(body, null, 2));

    const {
      messages,
      model,
      hackathonTitle,
      hackathonCategories,
      hackathonId,
      generatedIdea,
    } = body;

    console.log('Received request:', {
      model,
      hackathonId,
      messageCount: messages?.length,
      messagesType: typeof messages,
      messagesIsArray: Array.isArray(messages),
      firstMessage: messages?.[0]
    });

    // Validate messages parameter
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error('Invalid messages parameter:', messages);
      console.error('Full body was:', body);
      return new Response(
        JSON.stringify({
          error: 'Invalid request',
          details: 'Messages array is required and must not be empty'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Fetch full hackathon details from database
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
        console.log('Fetched hackathon:', data?.title);
      }
    }

    // Enhanced system prompt with hackathon AND generated idea context
    const systemPrompt = `You are an expert hackathon coach helping a participant refine and build their project idea. You're discussing their SPECIFIC project that was already generated.

${generatedIdea ? `
💡 THE USER'S GENERATED PROJECT IDEA (This is what they're building!):

📌 PROJECT TITLE: ${generatedIdea.title}

📝 DESCRIPTION:
${generatedIdea.description}

🎯 PROBLEM STATEMENT:
${generatedIdea.problemStatement}

🚀 VISION:
${generatedIdea.vision}

💻 TECH STACK SUGGESTED:
${generatedIdea.techStack?.map((tech: string) => `- ${tech}`).join('\n') || 'Not specified'}

${generatedIdea.implementation?.phases ? `
⏱️ IMPLEMENTATION PHASES:
${generatedIdea.implementation.phases.map((phase: { name: string; duration: string; tasks: string[] }, idx: number) => `
${idx + 1}. ${phase.name} (${phase.duration})
${phase.tasks?.map((task: string) => `   - ${task}`).join('\n') || ''}`).join('\n')}
` : ''}

${generatedIdea.implementation?.databaseRecommendation ? `
🗄️ DATABASE RECOMMENDATION:
- Database: ${generatedIdea.implementation.databaseRecommendation.database}
- Why: ${generatedIdea.implementation.databaseRecommendation.reasoning}
` : ''}

${generatedIdea.implementation?.securityBestPractices?.length ? `
🔒 SECURITY PRACTICES TO FOLLOW:
${generatedIdea.implementation.securityBestPractices.slice(0, 5).map((practice: string) => `- ${practice}`).join('\n')}
` : ''}

🎓 SKILLS REQUIRED:
${generatedIdea.skillsRequired?.map((skill: string) => `- ${skill}`).join('\n') || 'Not specified'}

✅ SUCCESS METRICS:
${generatedIdea.successMetrics?.map((metric: string) => `- ${metric}`).join('\n') || 'Not specified'}
` : ''}

${hackathonDetails ? `
🎯 HACKATHON CONTEXT:
- Hackathon: ${hackathonDetails.title}
- Categories: ${hackathonDetails.categories?.join(', ') || 'N/A'}
- Mode: ${hackathonDetails.mode || 'N/A'}
${hackathonDetails.requirements ? `- Requirements: ${hackathonDetails.requirements}` : ''}
` : `
🎯 HACKATHON CONTEXT:
- Hackathon: ${hackathonTitle || 'General Hackathon'}
- Categories: ${hackathonCategories?.join(', ') || 'N/A'}
`}

CRITICAL INSTRUCTIONS:
1. **ALWAYS reference their specific project idea** - Don't give generic advice, talk about THEIR project (${generatedIdea?.title || 'their idea'})
2. **Base recommendations on their chosen tech stack** - They're using: ${generatedIdea?.techStack?.slice(0, 3).join(', ') || 'the technologies mentioned above'}
3. **Answer questions about THEIR specific implementation** - Reference the phases, database, and security practices suggested
4. **Be specific, not generic** - Instead of "use a database", say "for your ${generatedIdea?.title || 'project'}, PostgreSQL with Supabase will work great because..."
5. **Stay consistent** - Don't suggest completely different technologies unless user explicitly asks to change

YOUR ROLE:
- Help them refine and improve THIS specific idea
- Answer questions about the implementation plan
- Provide specific code examples or architecture advice for their tech stack
- Help troubleshoot or clarify any part of the generated idea
- Suggest improvements while staying aligned with the original vision

RESPONSE STYLE:
- Use emojis (🚀💡🎯✨🔥)
- Be specific about THEIR project
- Reference their tech stack and implementation phases
- Keep it practical and actionable
- Always connect advice back to their specific idea

When user asks about technologies, features, or implementation:
- ALWAYS reference what was already suggested in their idea
- Explain WHY those specific choices were made for THEIR project
- Only suggest alternatives if they explicitly ask or if there's a clear problem

You've got this! 💪 Let's build an amazing ${generatedIdea?.title || 'project'} together! 🚀`;

    // Select the appropriate model
    // let selectedModel;
    // if (model === 'openai/gpt-4o') {
    //   selectedModel = openai('gpt-4.1-nano');
    // } else if (model === 'deepseek/deepseek-r1') {
    //   // You'll need to configure Deepseek if you want to use it
    //   selectedModel = openai('gpt-4o-mini'); // Fallback to a working model
    //   console.log('Deepseek not configured, using gpt-4o-mini instead');
    // } else {
    //   selectedModel = openai('gpt-4.1-nano'); // Default fallback
    // }

    // console.log('Using model:', selectedModel);

    // Convert messages to the format expected by streamText
    // Our messages are simple {role, content}, need to convert to CoreMessage format
    const coreMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.content,
    }));

    console.log('Converted messages:', coreMessages);

    const result = await streamText({
      model: openai('gpt-4o-mini'),
      messages: coreMessages,
      system: systemPrompt,
      temperature: 0.7,
      //maxCompletionTokens: 2000,
    });

    // const result = streamText({
    //   model: webSearch ? 'perplexity/sonar' : model,
    //   messages: convertToModelMessages(messages),
    //   system:
    //     'You are a helpful assistant that can answer questions and help with tasks',
    // });

    // const result = streamText({
    //   model: openai("gpt-4.1-nano"),
    //   messages: convertToModelMessages(messages),
    //   system: systemPrompt,
    // });

    // Log usage when available
    result.usage.then((usage) => {
      console.log({
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
      });
    }).catch((err: Error) => {
      console.error('Error getting usage:', err);
    });

    

    // Return the stream response
    return result.toTextStreamResponse();

  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}