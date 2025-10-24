import { generateText } from 'ai';
import { openai } from "@ai-sdk/openai";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const {
      messages,
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

    const systemPrompt = `You are an expert hackathon idea generator. Generate innovative, feasible project ideas tailored to the user's profile.
${hackathonTitle ? `Target Hackathon: ${hackathonTitle}` : ''}
${hackathonCategories?.length ? `Categories: ${hackathonCategories.join(', ')}` : ''}
${resumeText ? `User Skills/Experience: ${resumeText.substring(0, 2000)}` : ''}
${inspiration ? `User Inspiration: ${inspiration}` : ''}

Generate a comprehensive hackathon project idea in the following JSON format (return ONLY valid JSON, no markdown or extra text):
{
  "title": "Clear, engaging project title",
  "description": "One paragraph elevator pitch",
  "problemStatement": "What problem does this solve?",
  "vision": "What's the end goal?",
  "implementation": {
    "phases": [
      {
        "name": "Phase name",
        "duration": "X hours",
        "tasks": ["Task 1", "Task 2", "Task 3"]
      }
    ]
  },
  "techStack": ["Technology 1", "Technology 2"],
  "estimatedTime": "Total hours",
  "skillsRequired": ["Skill 1", "Skill 2"],
  "successMetrics": ["Metric 1", "Metric 2"]
}

Make it innovative, achievable within a hackathon timeframe, and aligned with the user's skills.`;

    // Using generateText for complete JSON response (not streaming)
    console.log('Generating idea with OpenAI...');
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