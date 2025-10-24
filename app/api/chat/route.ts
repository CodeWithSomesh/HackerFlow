// app/api/chat/route.ts
import { streamText, convertToCoreMessages } from 'ai';
import { openai } from "@ai-sdk/openai";
import { createClient } from '@/lib/supabase/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const {
      messages,
      model,
      hackathonTitle,
      hackathonCategories,
      hackathonId,
    } = await req.json();

    console.log('Received request:', { model, hackathonId, messageCount: messages?.length });

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

    // Enhanced system prompt with hackathon context
    const systemPrompt = `You are an expert hackathon coach and idea generator. You're helping a participant prepare for and win a hackathon.

${hackathonDetails ? `
🎯 HACKATHON DETAILS:
- Title: ${hackathonDetails.title}
- Organization: ${hackathonDetails.organization || 'N/A'}
- Mode: ${hackathonDetails.mode || 'N/A'}
- Categories: ${hackathonDetails.categories?.join(', ') || 'N/A'}
- About: ${hackathonDetails.about || 'N/A'}

📅 IMPORTANT DATES:
- Registration Start: ${hackathonDetails.registration_start_date || 'N/A'}
- Registration End: ${hackathonDetails.registration_end_date || 'N/A'}
${hackathonDetails.important_dates ? `- Other Important Dates: ${JSON.stringify(hackathonDetails.important_dates)}` : ''}

⏱️ TIMELINE:
${hackathonDetails.timeline ? JSON.stringify(hackathonDetails.timeline) : 'N/A'}

✅ ELIGIBILITY:
${hackathonDetails.eligibility || 'N/A'}

📋 REQUIREMENTS:
${hackathonDetails.requirements || 'N/A'}

🏆 PRIZES:
${hackathonDetails.prizes ? JSON.stringify(hackathonDetails.prizes) : 'N/A'}

👥 TEAM INFO:
- Participation Type: ${hackathonDetails.participation_type || 'N/A'}
- Team Size: ${hackathonDetails.team_size_min || 'N/A'} - ${hackathonDetails.team_size_max || 'N/A'}
` : `
Currently discussing hackathon ideas for: ${hackathonTitle || 'general hackathon'}
Categories: ${hackathonCategories?.join(', ') || 'N/A'}
`}

YOUR ROLE:
1. **Be Encouraging**: Always remind the user they CAN DO THIS! You believe in their potential.
2. **Be Strategic**: Give advice based on the hackathon's specific categories, timeline, and judging criteria.
3. **Be Practical**: Consider the time constraints and team size when suggesting ideas.
4. **Be Detailed**: Reference specific dates, requirements, and prizes when relevant.
5. **Be Motivational**: End responses with encouraging messages about their ability to succeed.

RESPONSE STYLE:
- Use emojis to make responses engaging (🚀💡🎯✨🔥)
- Break down complex ideas into actionable steps
- Always consider the hackathon's timeline when giving advice
- Reference the prize categories to align ideas with winning potential
- Be conversational and supportive, like a mentor

When suggesting ideas:
- Align with the hackathon categories
- Consider the submission timeline
- Match the team size capabilities
- Reference relevant prizes
- Explain WHY the idea could win

Always end with: "You've got this! 💪 The skills and creativity you bring are exactly what this hackathon needs. Let's make something amazing together! 🚀"`;

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

    const result = await streamText({
      model: openai('gpt-4o-mini'),
      messages: convertToCoreMessages(messages),
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