import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "sk-test-key"
});

export async function generateLiteratureReview(topic: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert academic researcher. Generate comprehensive, well-structured literature reviews that synthesize current research, identify gaps, and provide scholarly insights. Format your response as HTML with proper headings and structure."
        },
        {
          role: "user",
          content: `Generate a comprehensive academic literature review on: "${topic}". 

Requirements:
- Include introduction, theoretical foundations, current research landscape, methodological approaches, key findings, research gaps, and conclusion
- Use proper academic tone and structure
- Include realistic citations and references (you may create plausible academic citations)
- Format as HTML with h3, h4, p, ul, li tags
- Aim for approximately 800-1000 words
- Provide scholarly analysis and synthesis of the field`
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "Error generating literature review.";
  } catch (error: any) {
    console.error("Error generating literature review:", error);
    throw new Error(`Failed to generate literature review: ${error.message}`);
  }
}

export async function generateArgumentExploration(
  topic: string, 
  initialThoughts?: string, 
  counterarguments?: string
): Promise<string> {
  try {
    let userContext = "";
    
    if (initialThoughts) {
      userContext += `\n\nBuild upon these initial thoughts from the user: "${initialThoughts}"`;
    }
    
    if (counterarguments) {
      userContext += `\n\nAddress and explore these counterarguments provided by the user: "${counterarguments}"`;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert critical thinking facilitator and academic researcher. Generate balanced, nuanced argument explorations that examine multiple perspectives, consider various stakeholders, and provide thoughtful analysis. Format your response as HTML with proper headings and structure."
        },
        {
          role: "user",
          content: `Explore multiple perspectives and arguments on the topic: "${topic}".${userContext}

Requirements:
- Examine at least 3 different perspectives or viewpoints
- Analyze potential benefits and drawbacks
- Consider contextual factors that influence the debate
- Provide balanced analysis without taking a definitive stance
- Include synthesis and recommendations for decision-making
- Format as HTML with h3, h4, h5, p, ul, li, ol tags
- Aim for approximately 700-900 words
- Encourage critical thinking and nuanced understanding`
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "Error generating argument exploration.";
  } catch (error: any) {
    console.error("Error generating argument exploration:", error);
    throw new Error(`Failed to generate argument exploration: ${error.message}`);
  }
}

export async function generatePersonalizedContent(
  type: "literature_review" | "argument_exploration",
  topic: string,
  userInput?: {
    initialThoughts?: string;
    counterarguments?: string;
    paperAbstracts?: string;
  }
): Promise<string> {
  try {
    if (type === "literature_review") {
      // For literature reviews, we could enhance with user's research inputs
      // For now, using the base function but this could be expanded
      return await generateLiteratureReview(topic);
    } else {
      return await generateArgumentExploration(topic, userInput?.initialThoughts, userInput?.counterarguments);
    }
  } catch (error: any) {
    console.error("Error generating personalized content:", error);
    throw new Error(`Failed to generate personalized content: ${error.message}`);
  }
}
