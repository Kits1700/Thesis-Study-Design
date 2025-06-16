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
        userPrompt += `\n\nIMPORTANT: Base your literature review on these specific papers provided by the user. Use both the citations and abstracts to create an authentic, well-referenced review:\n\n`;
        
        validAbstracts.forEach((paper, index) => {
          userPrompt += `Paper ${index + 1}:\n`;
          if (paper.citation && paper.citation.trim()) {
            userPrompt += `Citation: ${paper.citation}\n`;
          }
          userPrompt += `Abstract: ${paper.abstract}\n\n`;
        });
        
        userPrompt += `Write a comprehensive academic literature review using these ${validAbstracts.length} papers as your primary sources. Structure this as a formal research literature review with the following requirements:

ACADEMIC STRUCTURE:
- Introduction: Define the research domain and scope
- Theoretical Framework: Establish key concepts and theoretical foundations
- Current Research Landscape: Synthesize findings from the provided papers and related work
- Methodological Analysis: Compare and evaluate research approaches
- Critical Analysis: Identify strengths, limitations, and contradictions
- Research Gaps: Highlight unexplored areas and limitations
- Future Directions: Propose research opportunities and recommendations
- Conclusion: Summarize key insights and implications
- References: Complete bibliography of all cited works

RESEARCH QUALITY STANDARDS:
- Use formal academic language and scholarly tone throughout
- Synthesize rather than simply summarize the provided abstracts
- Draw connections between studies and identify patterns or contradictions
- EXPAND BEYOND PROVIDED PAPERS: Incorporate related work, seminal studies, and theoretical foundations that connect to the themes in the provided abstracts
- Identify and cite influential papers in the same research area based on the topics covered in the abstracts
- Provide critical evaluation of methodologies and findings across both provided and related literature
- Demonstrate deep analytical thinking and scholarly insight by connecting the provided papers to broader research traditions
- Support arguments with evidence from both the provided literature and related work in the field
- Maintain objective, analytical perspective while showing comprehensive field knowledge

TECHNICAL REQUIREMENTS:
- Format as HTML with proper heading hierarchy (h3, h4, p, ul, li tags)
- Target length: 1500-2000 words for comprehensive coverage
- Use the provided citations exactly as given when referencing these papers
- Include proper in-text citations throughout the review (e.g., Author, Year)
- Reference the provided papers directly within your analysis using their actual citations
- Add related work citations based on the research themes identified in the provided abstracts
- MANDATORY: End with a comprehensive "References" section (use <h3>References</h3> heading)
- The References section MUST include all cited works: both provided citations and related literature
- List each reference on a separate line using proper academic format
- Create a publication-ready literature review suitable for academic journals
- When citing the provided papers, use the exact citation format provided by the user
- For related work, create realistic academic citations following standard format

IMPORTANT: Your literature review MUST include all 9 sections including the References section at the end.`;
      } else {
        userPrompt += `Write a comprehensive academic literature review on the specified topic. Structure this as a formal research literature review with the following requirements:

ACADEMIC STRUCTURE:
- Introduction: Define the research domain and scope
- Theoretical Framework: Establish key concepts and theoretical foundations
- Current Research Landscape: Synthesize findings from relevant literature
- Methodological Analysis: Compare and evaluate research approaches
- Critical Analysis: Identify strengths, limitations, and contradictions
- Research Gaps: Highlight unexplored areas and limitations
- Future Directions: Propose research opportunities and recommendations
- Conclusion: Summarize key insights and implications

RESEARCH QUALITY STANDARDS:
- Use formal academic language and scholarly tone throughout
- Synthesize rather than simply summarize research findings
- Draw connections between studies and identify patterns or contradictions
- Incorporate broader field knowledge and cite seminal works where relevant
- Provide critical evaluation of methodologies and findings
- Demonstrate deep analytical thinking and scholarly insight
- Support arguments with evidence from the literature
- Maintain objective, analytical perspective

TECHNICAL REQUIREMENTS:
- Format as HTML with proper heading hierarchy (h3, h4, p, ul, li tags)
- Target length: 1500-2000 words for comprehensive coverage
- Include realistic citations and references (you may create plausible academic citations)
- Create a publication-ready literature review suitable for academic journals`;
      }
    } else {
      userPrompt += `Write a comprehensive academic literature review on the specified topic. Structure this as a formal research literature review with the following requirements:

ACADEMIC STRUCTURE:
- Introduction: Define the research domain and scope
- Theoretical Framework: Establish key concepts and theoretical foundations
- Current Research Landscape: Synthesize findings from relevant literature
- Methodological Analysis: Compare and evaluate research approaches
- Critical Analysis: Identify strengths, limitations, and contradictions
- Research Gaps: Highlight unexplored areas and limitations
- Future Directions: Propose research opportunities and recommendations
- Conclusion: Summarize key insights and implications
- References: Complete bibliography of all cited works

RESEARCH QUALITY STANDARDS:
- Use formal academic language and scholarly tone throughout
- Synthesize rather than simply summarize research findings
- Draw connections between studies and identify patterns or contradictions
- Incorporate broader field knowledge and cite seminal works where relevant
- Provide critical evaluation of methodologies and findings
- Demonstrate deep analytical thinking and scholarly insight
- Support arguments with evidence from the literature
- Maintain objective, analytical perspective

TECHNICAL REQUIREMENTS:
- Format as HTML with proper heading hierarchy (h3, h4, p, ul, li tags)
- Target length: 1500-2000 words for comprehensive coverage
- Include realistic citations and references (you may create plausible academic citations)
- MANDATORY: End with a comprehensive "References" section (use <h3>References</h3> heading)
- The References section MUST include all cited works from throughout the review
- List each reference on a separate line using proper academic format
- Create a publication-ready literature review suitable for academic journals

IMPORTANT: Your literature review MUST include all 9 sections including the References section at the end.`;
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a senior academic researcher and published scholar with expertise in writing formal literature reviews for peer-reviewed journals. Your task is to produce publication-quality literature reviews that demonstrate rigorous academic standards, critical analysis, and scholarly depth. Use formal academic writing conventions, maintain analytical objectivity, and structure reviews according to established academic formats. Synthesize research findings with critical evaluation and provide insights that advance scholarly understanding of the field."
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
