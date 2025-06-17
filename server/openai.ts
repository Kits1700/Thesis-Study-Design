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

  const hasAbstracts = paperAbstracts?.some(
    (p) => p.abstract != null && p.abstract.trim().length > 10,
  );

  let prompt = `Generate a comprehensive academic literature review on the topic: "${topic}".\n`;

  prompt += `
Format all output in structured HTML with exactly the following sections:

<h3>1. Introduction</h3>
<h3>2. Thematic Organization of the Literature</h3>
<h3>3. Methodological Comparison</h3>
<h3>4. Comparative Table</h3>
<h3>5. Critical Analysis and Synthesis</h3>
<h3>6. Conclusion</h3>
<h3>7. References</h3>

ALL SECTIONS MUST:
- Use formal academic tone and APA-style in-text citations: (Author, Year) or Author (Year)
- Cite explicitly using the author surnames and years from the reference list below
- NEVER use generic labels like "Paper 1", "this study", "another paper", "the research", etc.

REQUIRED: Include a <table> under section 4 comparing studies (columns: Author(s), Year, Topic, Methodology, Key Findings)
- Use <table>, <thead>, <tbody>, <tr>, and <td> HTML tags
- Use citations inside table cells too, if needed

Word count: 1500–2000 words.
`;

  // Generate citation mapping and source injection
  let citationMapInstructions = "";
  let abstractBlock = "";
  const citationSet: string[] = [];

  if (hasAbstracts) {
    paperAbstracts!.forEach((paper, index) => {
      const citation = paper.citation?.trim();
      const abstract = paper.abstract?.trim();

      if (citation && abstract) {
        abstractBlock += `\nReference: ${citation}\nAbstract: ${abstract}\n`;
        citationSet.push(citation);

        const match = citation.match(/^([^,]+),.*?\((\d{4})\)/);
        if (match) {
          const author = match[1].trim();
          const year = match[2];
          citationMapInstructions += `- For "${citation}", cite as (${author}, ${year}) or ${author} (${year})\n`;
        }
      }
    });
  }

  if (hasAbstracts) {
    prompt += `
Use the following reference material to inform your review. You MUST cite them using the exact author and year as mapped below.

${abstractBlock}

CITATION MAPPING RULES:
${citationMapInstructions}

ABSOLUTELY FORBIDDEN WORDS/PHRASES:
- "Paper 1", "Paper 2", etc.
- "This paper", "this study", "one study", "another paper"
- "In Paper 3", "The research shows", unless followed by (Author, Year)

REQUIRED STYLE EXAMPLES:
✓ "Zhang and Lee (2023) found that..."
✓ "Findings suggest (Chen & Patel, 2022)..."
✗ "Paper 1 shows..." — NEVER USE THIS!
`;
  } else {
    // No abstracts — fallback to a generic version but still enforce citation and table
    prompt += `
There are no specific references provided. Conduct a scholarly literature review with high-quality, published sources.

CITATION AND FORMAT RULES:
- Use formal APA-style in-text citations: (Author, Year)
- No vague phrases like "One study", "Another paper", or "This research" unless cited explicitly
- Include a <table> in section 4 comparing relevant studies
- All six content sections + References must be in HTML format
`;
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an academic writing assistant. ABSOLUTELY FORBIDDEN PHRASES:
"Paper 1", "Paper 2", "Paper 3", "Paper 4", "Paper 5", "Paper X", "In Paper", "this paper", "this study", "another paper", "the first study", "the second research"

MANDATORY REQUIREMENTS:
- Extract author surnames from APA citations and use (Author, Year) format ONLY
- When you see "Smith, J. (2023)" write "(Smith, 2023)" when citing
- Follow the citation mapping provided in user prompt exactly
- Include a comparison <table> with columns for Author/Year, Method, and Key Findings in section 4
- Use HTML formatting throughout
- If you write any forbidden phrase, you have completely failed`,
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
