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

**EXTREMELY IMPORTANT INSTRUCTIONS ON CITATIONS:**
You will be given a set of source papers. For each paper, you will be given a unique placeholder tag.
**When you cite a paper, you MUST use its exact placeholder tag.**
DO NOT write (Author, Year) yourself. DO NOT write (Paper 1), (Source 2), etc.
You MUST insert the placeholder tag exactly as provided. For example, if a paper's tag is [CITE_SMITH_2020], your text must look like: "The research showed a significant effect [CITE_SMITH_2020]."

The table in section 4 must be a valid HTML <table> with columns: Author(s), Year, Topic, Methodology, Key Findings.
The "References" section must list the full citations for the papers I provide.
In the "Suggestions for Further Reading" section, suggest 3-5 additional relevant scholarly papers that were NOT provided in the source materials.
`;

  // This map will hold our placeholders and their final replacement text.
  const citationMap = new Map<string, string>();

  if (hasAbstracts) {
    let sourcesBlock = `
---
**SOURCE MATERIALS TO USE FOR THE REVIEW:**
Synthesize the information from the following papers. Cite them using only their given placeholder tags.

`;

    paperAbstracts!.forEach((paper) => {
      const citation = paper.citation?.trim();
      const abstract = paper.abstract?.trim();
      if (citation && abstract) {
        const match = citation.match(/^([^,]+),.*?\((\d{4})\)/);
        if (match) {
          const author = match[1].trim();
          const year = match[2];

          // Create a unique, clean placeholder tag.
          const sanitizedAuthor = author
            .replace(/[^a-zA-Z0-9]/g, "")
            .toUpperCase();
          const placeholder = `[CITE_${sanitizedAuthor}_${year}]`;

          // The final text we will replace the placeholder with.
          const finalCitationText = `(${author}, ${year})`;

          // Store the mapping for our post-processing step.
          citationMap.set(placeholder, finalCitationText);

          // Add the clearly defined block to the prompt.
          sourcesBlock += `
[BEGIN PAPER]
FULL_CITATION: ${citation}
ABSTRACT: ${abstract}
**USE THIS EXACT TAG FOR CITATION:** ${placeholder}
[END PAPER]
---
`;
        }
      }
    });

    prompt += sourcesBlock;
    prompt += `**FINAL REMINDER:** Your primary task is to write a great review. Your secondary, but equally critical, task is to use the exact placeholder tags like [CITE_AUTHOR_YEAR] for all citations. Failure to use the tags will make the output unusable. Do not invent your own citations.`;
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
        content: `You are a meticulous academic writing assistant. Your most important duty is to follow user instructions for formatting and citation with 100% accuracy. You will be given placeholder tags for citations. You MUST use these tags. You must not invent your own citation formats like (Paper 1).`,
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

  if (!rawContent) {
    return "Error generating literature review.";
  }

  // --- CRITICAL POST-PROCESSING STEP ---
  let finalContent = rawContent;
  citationMap.forEach((citation, placeholder) => {
    // Use replaceAll to catch every instance of the placeholder.
    finalContent = finalContent.replaceAll(placeholder, citation);
  });

  return finalContent;
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
