import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { openai } from "@ai-sdk/openai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    hackathonTitle,
    hackathonCategories,
    resumeText,
    inspiration,
  }: { 
    messages: any[]; 
    hackathonTitle?: string;
    hackathonCategories?: string[];
    resumeText?: string;
    inspiration?: string;
  } = await req.json();

  // Enhanced system prompt for idea generation
  const systemPrompt = `You are an expert hackathon idea generator. Generate innovative, feasible project ideas tailored to the user's profile.
  ${hackathonTitle ? `Target Hackathon: ${hackathonTitle}` : ''}
  ${hackathonCategories?.length ? `Categories: ${hackathonCategories.join(', ')}` : ''}
  ${resumeText ? `User Skills/Experience: ${resumeText.substring(0, 2000)}` : ''}
  ${inspiration ? `User Inspiration: ${inspiration}` : ''}
  
  Generate a comprehensive hackathon project idea in the following JSON format:
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

  // const result = streamText({
  //   model: webSearch ? 'perplexity/sonar' : model,
  //   messages: convertToModelMessages(messages),
  //   system:
  //     'You are a helpful assistant that can answer questions and help with tasks',
  // });

  const result = streamText({
    model: openai("gpt-4.1-nano"),
    messages: convertToModelMessages(messages),
    system: systemPrompt,
  });

  result.usage.then((usage) => {
    console.log({
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      totalTokens: usage.totalTokens,
    });
  });

  // send sources and reasoning back to the client
  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}