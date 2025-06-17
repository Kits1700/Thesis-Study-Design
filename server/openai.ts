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
    // Extract author names for explicit examples
    const extractedAuthors: Array<{ author: string; year: string }> = [];
    paperAbstracts!.forEach((paper) => {
      if (paper.citation) {
        const match = paper.citation.match(/^([^,]+),.*?\((\d{4})\)/);
        if (match) {
          extractedAuthors.push({ author: match[1].trim(), year: match[2] });
        }
      }
    });

    prompt += `
SOURCES FOR YOUR LITERATURE REVIEW:
${abstractBlock}

🔥 CRITICAL CITATION RULES - READ CAREFULLY:
When writing about these sources, you MUST use these EXACT author names and years:
${extractedAuthors.map((a, i) => `Source ${i+1}: Always write "${a.author} (${a.year})" or "(${a.author}, ${a.year})"`).join('\n')}

🚫 ABSOLUTELY FORBIDDEN - DO NOT WRITE:
- "Paper 1", "Paper 2", "Paper 3", "Paper 4", "Paper 5"
- "In Paper X", "The first paper", "The second study"  
- "This paper", "This study", "Another study"

✅ EXAMPLES OF REQUIRED WRITING STYLE:
${extractedAuthors.slice(0,3).map(a => `- "${a.author} (${a.year}) found that..."`).join('\n')}
${extractedAuthors.slice(0,2).map(a => `- "Research shows (${a.author}, ${a.year}) that..."`).join('\n')}

🔥 FINAL WARNING: If you write "Paper 1" or "Paper 2" anywhere, you have completely failed this task.

${citationMapInstructions}
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

  // Log the prompt for debugging
  console.log("=== TASK 2 PROMPT DEBUG ===");
  console.log("Topic:", topic);
  console.log("Has abstracts:", hasAbstracts);
  console.log("Prompt length:", prompt.length);
  console.log("First 500 chars:", prompt.substring(0, 500));
  console.log("===============================");

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an academic writing assistant. 

CRITICAL RULE: You must NEVER use these phrases anywhere in your response:
"Paper 1", "Paper 2", "Paper 3", "Paper 4", "Paper 5", "this paper", "this study", "another paper", "the first study", "the second research", "one study"

CITATION REQUIREMENTS:
- Extract author surnames from provided APA citations
- Use (Author, Year) format: (Smith, 2023) or Smith (2023)
- Follow citation mapping in user prompt exactly
- Never use generic phrases without specific author citations

TABLE REQUIREMENT:
- Include comparison table in section 4 with HTML table tags
- Columns: Author(s), Year, Method, Key Findings
- Use actual author names from citations

If you write any forbidden phrase like "Paper 1" or "this study", your response will be rejected.`,
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
