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

// Assume 'openai' is configured elsewhere, e.g.:
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateLiteratureReview(
  topic: string,
  paperAbstracts?: { citation?: string; abstract?: string }[],
): Promise<string> {
  if (!openai) throw new Error("OpenAI API key not configured");

  const hasAbstracts = paperAbstracts?.some(
    (p) => p.abstract && p.abstract.trim().length > 10,
  );

  let prompt = `Generate a comprehensive academic literature review on the topic: "${topic}".

Your output must be structured HTML using these exact sections:
<h3>1. Introduction</h3>
<h3>2. Thematic Organization of the Literature</h3>
<h3>3. Methodological Comparison</h3>
<h3>4. Comparative Table</h3>
<h3>5. Critical Analysis and Synthesis</h3>
<h3>6. Conclusion</h3>
<h3>7. References</h3>
<h3>8. Suggestions for Further Reading</h3>

Use in-text citations in the format (Author, Year). Do not use formats like (Paper 1) or placeholder tags.
`;

  if (hasAbstracts) {
    let sourcesBlock = `
---
**SOURCE MATERIALS TO USE FOR THE REVIEW:**
Synthesize the information from the following papers. When citing them, use (Author, Year) format directly, e.g., (Smith, 2020).
`;

    paperAbstracts!.forEach((paper) => {
      const citation = paper.citation?.trim();
      const abstract = paper.abstract?.trim();
      if (citation && abstract) {
        const match = citation.match(/^([^,]+),.*?\((\d{4})\)/);
        if (match) {
          const author = match[1].trim();
          const year = match[2];

          sourcesBlock += `
[BEGIN PAPER]
CITATION: (${author}, ${year})
FULL_CITATION: ${citation}
ABSTRACT: ${abstract}
[END PAPER]
---
`;
        }
      }
    });

    prompt += sourcesBlock;
    prompt += `Please ensure all citations are in (Author, Year) format. Do not make up sources or change citation styles.`;
  } else {
    prompt += `
No abstracts were provided. Use your knowledge of credible scholarly sources to generate the literature review, including plausible but fictional author names and years for citations and references.
`;
  }

  console.log("=== LIT REVIEW PROMPT DEBUG ===");
  console.log("Prompt length:", prompt.length);
  console.log("Prompt preview:\n", prompt.substring(0, 1500));
  console.log("================================");

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a meticulous academic writing assistant. Your most important duty is to follow user instructions for formatting and citation with 100% accuracy. Use (Author, Year) for all citations.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    stream: true,
  });

  let rawContent = "";
  for await (const chunk of response) {
    rawContent += chunk.choices[0]?.delta?.content || "";
  }

  return rawContent || "Error generating literature review.";
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
