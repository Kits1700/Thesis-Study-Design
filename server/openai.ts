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
          userPrompt += `Source ${index + 1}:\n`;
          if (paper.citation && paper.citation.trim()) {
            userPrompt += `Full Citation: ${paper.citation}\n`;
          }
          userPrompt += `Abstract: ${paper.abstract}\n\n`;
        });
        
        userPrompt += `CRITICAL CITATION REQUIREMENTS - READ CAREFULLY:

ABSOLUTELY FORBIDDEN PHRASES:
- Do NOT write "Paper 1", "Paper 2", "Paper 3", "Paper 4", "Paper 5" or any "Paper X" format
- Do NOT write "Source 1", "Source 2", "Source 3" etc.
- Do NOT use any numbered reference system like "Study 1", "Study 2"

REQUIRED CITATION FORMAT:
- Extract the ACTUAL author surnames from each "Full Citation" provided above
- Use standard academic format: (Author, Year) or Author (Year)
- Example: If Full Citation is "Smith, J. & Jones, A. (2023). Title. Journal, 10(1), 1-10." 
  then write: "Smith and Jones (2023) demonstrate..." or "(Smith & Jones, 2023)"
- For 3+ authors: (FirstAuthor et al., Year)
- When adding related work, create realistic author names, never use numbered systems

CITATION EXTRACTION PROCESS:
1. Read each "Full Citation" above
2. Extract the author surname(s) and year
3. Use these ACTUAL NAMES throughout your literature review
4. Never reference by number - always by author name

EXAMPLE OF CORRECT WRITING:
✓ "Johnson et al. (2022) found that..."
✓ "Recent studies (Martinez, 2023; Lee & Kim, 2024) suggest..."
✗ "Paper 1 shows..." 
✗ "In Paper 2, the authors..."

`;
        
        userPrompt += `You MUST write a comprehensive academic literature review using these ${validAbstracts.length} papers as your primary sources. 

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
- List the exact citations provided by the user
- Include any additional sources cited
- Use consistent academic citation format

DO NOT deviate from this 6-section structure. Each section must have the exact heading format shown above.

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
- Use numbered section headings: <h3>1. Introduction</h3>, <h3>2. Thematic Organization of the Literature</h3>, etc.
- Target length: 1500-2000 words for comprehensive coverage
- MANDATORY: Include section "6. References" with <h3>6. References</h3> heading at the end
- In the References section, list the EXACT citations provided by the user first
- Follow with any additional related work citations in alphabetical order
- Each reference should be on a separate line with proper academic formatting

CITATION FORMAT ENFORCEMENT:
- Extract actual author surnames from the "Full Citation" lines above
- Write citations as (Author, Year) format throughout your review
- NEVER EVER write "Paper 1", "Paper 2", "Paper 3", "Paper 4", "Paper 5" anywhere
- If you write any "Paper X" format, you are violating academic standards
- Always use real author names extracted from the provided citations

FINAL REMINDER: This is an academic literature review - use proper author citations, not numbered references.`;
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
