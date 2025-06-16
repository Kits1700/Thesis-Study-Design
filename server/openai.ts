import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const apiKey = process.env.OPENAI_API_KEY || "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";

console.log("OpenAI API key configured:", apiKey ? `${apiKey.substring(0, 10)}...` : 'none');

if (!apiKey) {
  console.warn("OpenAI API key not found. AI features will be disabled.");
} else {
  console.log("OpenAI API key loaded successfully. AI features enabled.");
}

const openai = apiKey ? new OpenAI({ 
  apiKey: apiKey
}) : null;

export async function generateLiteratureReview(topic: string, paperAbstracts?: any[]): Promise<string> {
  try {
    if (!openai) {
      throw new Error("OpenAI API key not configured");
    }
    
    console.log("Generating literature review for topic:", topic);
    
    let userPrompt = `Generate a comprehensive academic literature review on: "${topic}".`;
    
    // If paper abstracts are provided (selective friction mode), incorporate them
    if (paperAbstracts && paperAbstracts.length > 0) {
      const validAbstracts = paperAbstracts.filter(p => p.abstract && p.abstract.trim().length > 10);
      if (validAbstracts.length > 0) {
        userPrompt += `\n\nIMPORTANT: Base your literature review on these specific paper abstracts provided by the user. Synthesize and analyze these papers as the core foundation of your review:\n\n`;
        
        validAbstracts.forEach((paper, index) => {
          userPrompt += `Paper ${index + 1}:\n${paper.abstract}\n\n`;
        });
        
        userPrompt += `Requirements:
- Build your literature review primarily around these ${validAbstracts.length} papers as the foundation
- Synthesize findings and themes across these specific abstracts
- Identify connections, contradictions, and patterns among these studies
- Reference these papers directly in your analysis
- EXPAND THE REVIEW by incorporating knowledge of similar and related papers in the field
- Add theoretical context, seminal works, and broader field knowledge to create a comprehensive review
- Include discussion of methodological approaches used across the field
- Identify research gaps and future directions based on the provided papers and field knowledge
- Create a robust literature review that goes beyond just the provided abstracts
- Use proper academic tone and structure with scholarly depth
- Format as HTML with h3, h4, p, ul, li tags
- Aim for approximately 1200-1500 words for a comprehensive review
- Provide thorough scholarly analysis that demonstrates deep understanding of the research area`;
      } else {
        userPrompt += `\n\nRequirements:
- Include introduction, theoretical foundations, current research landscape, methodological approaches, key findings, research gaps, and conclusion
- Use proper academic tone and structure
- Include realistic citations and references (you may create plausible academic citations)
- Format as HTML with h3, h4, p, ul, li tags
- Aim for approximately 800-1000 words
- Provide scholarly analysis and synthesis of the field`;
      }
    } else {
      userPrompt += `\n\nRequirements:
- Include introduction, theoretical foundations, current research landscape, methodological approaches, key findings, research gaps, and conclusion
- Use proper academic tone and structure
- Include realistic citations and references (you may create plausible academic citations)
- Format as HTML with h3, h4, p, ul, li tags
- Aim for approximately 800-1000 words
- Provide scholarly analysis and synthesis of the field`;
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert academic researcher with deep knowledge across multiple fields. Generate comprehensive, well-structured literature reviews that synthesize current research, identify gaps, and provide scholarly insights. When provided with specific paper abstracts, use them as the foundation but expand significantly by incorporating your knowledge of related work, seminal papers, theoretical frameworks, and methodological approaches in the field. Create robust reviews that demonstrate comprehensive understanding of the research area."
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
      stream: true,
    });

    let fullContent = "";
    for await (const chunk of response) {
      const content = chunk.choices[0]?.delta?.content || "";
      fullContent += content;
    }
    
    console.log("OpenAI streaming response received successfully");
    return fullContent || "Error generating literature review.";
  } catch (error: any) {
    console.error("Error generating literature review:", error);
    console.error("Error details:", {
      message: error.message,
      status: error.status,
      code: error.code
    });
    throw new Error(`Failed to generate literature review: ${error.message}`);
  }
}

export async function generateArgumentExploration(
  topic: string, 
  initialThoughts?: string, 
  counterarguments?: string
): Promise<string> {
  try {
    if (!openai) {
      throw new Error("OpenAI API key not configured");
    }
    
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
