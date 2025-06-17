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
        userPrompt += `\n\nIMPORTANT: Base your literature review on these specific papers provided by the user and expand with related research. You MUST use proper in-text citations extracted from the full citations provided.\n\n`;

        validAbstracts.forEach((paper) => {
          if (paper.citation && paper.citation.trim()) {
            userPrompt += `Citation: ${paper.citation}\n`;
          }
          userPrompt += `Abstract: ${paper.abstract}\n\n`;
        });

        userPrompt += `\n\nCITATION INSTRUCTIONS:
- Always reference papers using proper **author-date** in-text citations (e.g., Smith, 2023).
- Extract author names and years from the full citations provided.
- Do NOT use labels like "Paper 1" or "Paper A"—**only cite using author and year**.
- List the provided citations first in the "6. References" section, in the order given, followed by any additional sources alphabetically.

You MUST write a comprehensive academic literature review using the provided papers as the primary sources. You must also include relevant related work to enrich the analysis.

STRUCTURE REQUIREMENTS:
Include ALL 6 sections with EXACT numbered HTML headings:

<h3>1. Introduction</h3>
- Define the topic or research question
- Explain the importance and scope
- Identify the goals of the literature review

<h3>2. Thematic Organization of the Literature</h3>
- Organize content into clear themes or topical areas
- Synthesize findings under each theme
- Compare, contrast, and critique studies
- Highlight debates, patterns, or inconsistencies

<h3>3. Methodological Comparison</h3>
- Compare research methodologies used across studies
- Identify strengths, weaknesses, and patterns
- Evaluate differences in data sources, tools, and design

<h3>4. Critical Analysis and Synthesis</h3>
- Identify trends, relationships, and gaps
- Discuss broader implications
- Show how studies build on one another

<h3>5. Conclusion</h3>
- Summarize the overall findings and insights
- Reiterate key knowledge gaps
- Suggest directions for future research

<h3>6. References</h3>
- Include all citations from the abstracts first, in order
- Add any additional literature used, sorted alphabetically
- Use full formal academic citations, one per line

RESEARCH QUALITY STANDARDS:
- Use formal academic language throughout
- Synthesize (not just summarize) ideas
- Cite all claims with (Author, Year)
- Expand on the abstracts by adding seminal or related literature
- Ensure analytical depth, critical comparison, and scholarly tone

TECHNICAL FORMATTING:
- Use proper HTML heading tags (<h3>, <h4>, <p>, <ul>, etc.)
- Word count: 1500–2000 words
- References section is **mandatory** and must include all cited works

CRITICAL: Do not use placeholder phrases like "Paper 1" or "this study." Always use proper author-date citations for clarity and academic rigor.
`;
      } else {
        userPrompt += `You MUST write a comprehensive academic literature review on this topic.

MANDATORY STRUCTURE - Include ALL 6 sections with exact numbered headings:

<h3>1. Introduction</h3>
- Explain the topic or research problem
- Define the scope and boundaries of the review (what's included/excluded)
- State the objectives or research questions guiding the review
- Explain why the topic is important

<h3>2. Thematic Organization of the Literature</h3>
- Organize literature by themes or topics
- For each theme: summary and synthesis of key studies
- Compare, contrast, and critique research findings
- Identify gaps or controversies within each theme

<h3>3. Methodological Comparison</h3>
- Compare methods used in different studies
- Discuss strengths and limitations of various approaches
- Highlight trends in research design or data collection

<h3>4. Critical Analysis and Synthesis</h3>
- Identify patterns, gaps, and contradictions
- Discuss implications of findings
- Show how research builds upon existing work

<h3>5. Conclusion</h3>
- Summarize the main insights from the literature
- Reiterate the gaps in knowledge
- Explain areas for future research

<h3>6. References</h3>
- Include all sources cited in the review
- Use consistent academic citation format

DO NOT deviate from this 6-section structure. Each section must have the exact heading format shown above.`;
      }
    } else {
      userPrompt += `You MUST write a comprehensive academic literature review on the specified topic.

MANDATORY STRUCTURE - Include ALL 6 sections with exact numbered headings:

<h3>1. Introduction</h3>
- Explain the topic or research problem
- Define the scope and boundaries of the review (what's included/excluded)
- State the objectives or research questions guiding the review
- Explain why the topic is important

<h3>2. Thematic Organization of the Literature</h3>
- Organize literature by themes or topics
- For each theme: summary and synthesis of key studies
- Compare, contrast, and critique research findings
- Identify gaps or controversies within each theme

<h3>3. Methodological Comparison</h3>
- Compare methods used in different studies
- Discuss strengths and limitations of various approaches
- Highlight trends in research design or data collection

<h3>4. Critical Analysis and Synthesis</h3>
- Identify patterns, gaps, and contradictions
- Discuss implications of findings
- Show how research builds upon existing work

<h3>5. Conclusion</h3>
- Summarize the main insights from the literature
- Reiterate the gaps in knowledge
- Explain areas for future research

<h3>6. References</h3>
- Include all sources cited in the review
- Use consistent academic citation format

DO NOT deviate from this 6-section structure. Each section must have the exact heading format shown above.

TECHNICAL REQUIREMENTS:
- Format as HTML with proper heading hierarchy (h3, h4, p, ul, li tags)
- Target length: 1500-2000 words for comprehensive coverage
- Include realistic citations and references (you may create plausible academic citations)
- MANDATORY: Include section "6. References" with <h3>6. References</h3> heading
- The References section MUST include all cited works from throughout the review
- List each reference on a separate line using proper academic format
- Create a publication-ready literature review suitable for academic journals

CRITICAL: Your literature review MUST end with a complete "6. References" section containing all cited works. Do not omit this section.`;
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a senior academic researcher and published scholar with expertise in writing formal literature reviews for peer-reviewed journals. You MUST strictly follow the 6-section structure provided in the user prompt. Always include numbered headings exactly as specified: 1. Introduction, 2. Thematic Organization of the Literature, 3. Methodological Comparison, 4. Critical Analysis and Synthesis, 5. Conclusion, 6. References. Never omit any section. CRITICAL: Never use 'Paper 1', 'Paper 2', 'Paper 3', 'Paper 4', 'Paper 5' or any similar numbering - always use proper author citations like (Smith, 2023) or (Johnson et al., 2022). Extract author names from provided citations and use standard academic referencing throughout."
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
