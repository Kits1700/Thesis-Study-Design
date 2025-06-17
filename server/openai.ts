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
- You MUST extract actual author surnames and years from each APA reference below
- Use these specific authors and years in parenthetical citations throughout your review: (Author, Year)
- When discussing findings, write: "Author (Year) found that..." or "Research shows (Author, Year) that..."
- For multiple authors use: (FirstAuthor et al., Year)
- COMPLETELY FORBIDDEN: "Paper 1", "Paper 2", "this study", "the research", "one study"
- REQUIRED: Every major point must include specific author-year citations from the references provided
- Integrate these works thematically across all 6 sections with proper citations
- The exact APA references provided must appear first in your References section
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

    prompt += `\n\nCITATION EXTRACTION EXAMPLES:
If you see: "Johnson, M. (2023). Title of paper. Journal Name, 15(2), 123-145."
Then cite as: (Johnson, 2023) or Johnson (2023)

If you see: "Smith, A., & Brown, B. (2022). Paper title. Conference Proceedings, 45-52."  
Then cite as: (Smith & Brown, 2022) or Smith and Brown (2022)

If you see: "Wilson, C., Davis, E., & Lee, F. (2021). Research study. Academic Journal, 8(3), 78-92."
Then cite as: (Wilson et al., 2021) or Wilson et al. (2021)

MANDATORY: Throughout your literature review, you MUST cite these papers using the actual author names and years from the APA references above. Do not write generic phrases - always use specific author-year citations.`;
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
CRITICAL CITATION ENFORCEMENT:
- Extract exact author surnames and publication years from each APA reference provided
- Use these specific names in every citation: (AuthorSurname, Year) format
- Example: From "Smith, J. A. (2023)" always write (Smith, 2023) when citing
- Write "Johnson et al. (2022) demonstrated" or "findings suggest (Wilson & Lee, 2021)"
- NEVER write vague phrases like "research shows" or "studies indicate" without specific author citations
- Every paragraph discussing the provided sources MUST include specific author-year citations
- Structure into exactly 6 HTML sections with proper headings
- References section must list provided APA citations first, then additional sources alphabetically`,
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
