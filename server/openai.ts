import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY || "sk-..."; // Replace with secure handling

const openai = apiKey ? new OpenAI({ apiKey }) : null;

if (!openai) {
  console.warn("OpenAI API key not configured. AI features disabled.");
}

/**
 * Generate a comprehensive academic literature review
 * - Selectively uses provided paper abstracts if available
 * - Produces APA-formatted HTML content in 6 academic sections
 */
export async function generateLiteratureReview(
  topic: string,
  paperAbstracts?: { citation?: string; abstract?: string }[],
): Promise<string> {
  if (!openai) throw new Error("OpenAI API key not configured");

  let prompt = `Generate a comprehensive academic literature review on the topic: "${topic}".\n`;

  const hasAbstracts = paperAbstracts?.some(
    (p) => p.abstract != null && p.abstract.trim().length > 10,
  );

  if (hasAbstracts) {
    prompt += `
You are provided with key scholarly sources (citations and abstracts). These sources must form the foundation of the literature review.

CRITICAL CITATION REQUIREMENTS:
- Extract author surnames and publication years directly from the APA-style references provided below
- Use proper in-text citations: (Author, Year) or Author (Year)
- Example: If reference is "Smith, J. A. (2023). Title..." then cite as (Smith, 2023)
- For multiple authors: (FirstAuthor et al., Year)
- NEVER use "Paper 1", "Paper 2", "this study", or any numbered references
- Integrate these works thematically and methodologically across all sections
- Synthesize and compare findings - do not just summarize individual papers
- Use formal academic tone and critical analysis throughout
- The exact APA references provided must appear in your References section
- Format in HTML and use exactly the following section headers:

<h3>1. Introduction</h3>
<h3>2. Thematic Organization of the Literature</h3>
<h3>3. Methodological Comparison</h3>
<h3>4. Critical Analysis and Synthesis</h3>
<h3>5. Conclusion</h3>
<h3>6. References</h3>

- Word count target: 1500–2000.
- Reference section must use full APA style. List provided citations first (in given order), then any additional ones alphabetically.
`;

    paperAbstracts!.forEach((paper) => {
      if (paper.citation && paper.abstract) {
        prompt += `\nReference: ${paper.citation}\nAbstract: ${paper.abstract}\n`;
      }
    });
  } else {
    prompt += `
Write a full academic literature review with six clearly formatted HTML sections:

<h3>1. Introduction</h3>
<h3>2. Thematic Organization of the Literature</h3>
<h3>3. Methodological Comparison</h3>
<h3>4. Critical Analysis and Synthesis</h3>
<h3>5. Conclusion</h3>
<h3>6. References</h3>

- Use APA in-text citations (e.g., Smith, 2020).
- The References section must follow APA style.
- Length: 1500–2000 words.
- HTML tags must be used throughout.
- Write in a formal, analytical tone.
`;
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an academic writing assistant specializing in literature reviews. 
MANDATORY REQUIREMENTS:
- Extract author surnames and years from provided APA references for in-text citations
- Use format: (Author, Year) or Author (Year) - never "Paper 1" or numbered labels  
- Structure into exactly 6 HTML sections: Introduction, Thematic Organization, Methodological Comparison, Critical Analysis, Conclusion, References
- List provided APA references first in References section, then additional sources alphabetically
- Synthesize across sources rather than summarizing individual papers
- Use the exact APA references provided by the user in your References section`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    stream: true,
  });

  let fullContent = "";
  for await (const chunk of response) {
    fullContent += chunk.choices[0]?.delta?.content || "";
  }

  return fullContent || "Error generating literature review.";
}

/**
 * Generate a critical argument exploration across multiple perspectives
 */
export async function generateArgumentExploration(
  topic: string,
  initialThoughts?: string,
  counterarguments?: string,
): Promise<string> {
  if (!openai) throw new Error("OpenAI API key not configured");

  let userInput = `Explore multiple perspectives on the topic: "${topic}".\n`;

  if (initialThoughts) {
    userInput += `\nBuild on the following initial thoughts: "${initialThoughts}"`;
  }

  if (counterarguments) {
    userInput += `\nAlso address these counterarguments: "${counterarguments}"`;
  }

  userInput += `
Requirements:
- Analyze at least 3 different perspectives
- Consider benefits, drawbacks, and context
- Do not take a side; provide balanced insight
- Conclude with synthesis and recommendations
- Use APA in-text citations and APA-style reference list
- Format using HTML (h3, h4, p, ul, etc.)
- Target length: 700–900 words
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a critical thinking facilitator. 
Provide a multi-perspective analysis in HTML format. 
Use APA citation style and avoid bias.`,
      },
      {
        role: "user",
        content: userInput,
      },
    ],
    max_tokens: 2000,
    temperature: 0.7,
  });

  return (
    response.choices[0]?.message?.content ||
    "Error generating argument exploration."
  );
}
