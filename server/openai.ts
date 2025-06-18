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

/**
 * Generate Task 1: Basic Literature Review (without specific paper abstracts)
 */
export async function generateTask1LiteratureReview(
  topic: string,
): Promise<string> {
  if (!openai) throw new Error("OpenAI API key not configured");

  const prompt = `Generate a comprehensive academic literature review on "${topic}".

✅ REQUIRED STRUCTURE (Use exact HTML format):
<h3>1. Introduction</h3>
<h3>2. Thematic Organization of the Literature</h3>
<h3>3. Methodological Comparison</h3>
<h3>4. Critical Analysis and Synthesis</h3>
<h3>5. Conclusion</h3>
<h3>6. References</h3>

📚 REQUIREMENTS:
- Write 800-1000 words with detailed analysis
- Include rich theoretical background and context
- Provide thorough explanations of concepts and frameworks
- Discuss methodological approaches in depth
- Synthesize findings across multiple dimensions
- Include critical evaluation of strengths and limitations
- Make content accessible while maintaining academic rigor
- Use clear logical flow and smooth transitions between sections
- Use credible scholarly sources with realistic author names and years
- Include proper APA citations: "Smith (2023)" or "(Smith, 2023)"
- Add a References section with full APA citations
- Include an HTML comparison table in section 4 with columns: Author(s), Year, Method, Key Findings`;

  console.log("=== TASK 1 GENERATION ===");
  console.log("Topic:", topic);
  console.log("Prompt length:", prompt.length);
  console.log("========================");

  const response = await openai.chat.completions.create({
    model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    messages: [
      {
        role: "system",
        content: `You are an expert academic writing assistant specializing in comprehensive literature reviews.

Create detailed, well-structured academic content that is both rigorous and accessible. Use proper APA citation format and include a comparison table in section 4.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    stream: true,
  });

  let content = "";
  for await (const chunk of response) {
    content += chunk.choices[0]?.delta?.content || "";
  }

  return content || "Error generating literature review.";
}

/**
 * Generate Task 2: Literature Review with Specific Paper Abstracts
 */
export async function generateTask2LiteratureReview(
  topic: string,
  paperAbstracts: { citation?: string; abstract?: string }[],
): Promise<string> {
  if (!openai) throw new Error("OpenAI API key not configured");

  // Extract author names for citation mapping
  const citationMap = new Map<string, string>();
  const extractedAuthors: string[] = [];

  paperAbstracts.forEach((paper, index) => {
    if (paper.citation) {
      const match = paper.citation.match(/^([^,]+),.*?\((\d{4})\)/);
      if (match) {
        const author = match[1].trim();
        const year = match[2];
        extractedAuthors.push(`${author} (${year})`);
        
        // Create citation mapping to replace any generic references
        citationMap.set(`Paper ${index + 1}`, `${author} (${year})`);
        citationMap.set(`paper ${index + 1}`, `${author} (${year})`);
        citationMap.set(`Study ${index + 1}`, `${author} (${year})`);
        citationMap.set(`study ${index + 1}`, `${author} (${year})`);
        citationMap.set(`Source ${index + 1}`, `${author} (${year})`);
        citationMap.set(`source ${index + 1}`, `${author} (${year})`);
      }
    }
  });

  let prompt = `Generate a comprehensive, detailed academic literature review on "${topic}".

🔥 ABSOLUTE PROHIBITION - NEVER USE THESE PHRASES:
- "Paper 1", "Paper 2", "Paper 3", "Paper 4", "Paper 5"
- "paper 1", "paper 2", "paper 3", "paper 4", "paper 5"  
- "Study 1", "Study 2", "Study 3", "Study 4", "Study 5"
- "study 1", "study 2", "study 3", "study 4", "study 5"
- "Source 1", "Source 2", "Source 3", "Source 4", "Source 5"
- "source 1", "source 2", "source 3", "source 4", "source 5"
- "this paper", "this study", "another paper", "the research"
- "one study", "another study", "the first study", "the second study"

✅ REQUIRED STRUCTURE (Use exact HTML format):
<h3>1. Introduction</h3>
<h3>2. Thematic Organization of the Literature</h3>
<h3>3. Methodological Comparison</h3>
<h3>4. Critical Analysis and Synthesis</h3>
<h3>5. Conclusion</h3>
<h3>6. References</h3>

📚 COMPREHENSIVE REQUIREMENTS:
- Write 1200-1500 words with detailed analysis
- Include rich theoretical background and context
- Provide thorough explanations of concepts and frameworks
- Discuss methodological approaches in depth
- Synthesize findings across multiple dimensions
- Include critical evaluation of strengths and limitations
- Make content accessible while maintaining academic rigor
- Use clear logical flow and smooth transitions between sections

🎯 CITATION INSTRUCTIONS:
You must use these EXACT author citations when referencing the provided papers:
`;

  paperAbstracts.forEach((paper, index) => {
    if (paper.citation) {
      const match = paper.citation.match(/^([^,]+),.*?\((\d{4})\)/);
      if (match) {
        const author = match[1].trim();
        const year = match[2];
        prompt += `\n- For paper ${index + 1}: ALWAYS write "${author} (${year})" or "(${author}, ${year})"`;
      }
    }
  });

  prompt += `

📊 SECTION 4 TABLE REQUIREMENT:
Include an HTML comparison table with these columns:
<table border="1" style="width:100%; border-collapse: collapse;">
<tr><th>Author(s)</th><th>Year</th><th>Method</th><th>Key Findings</th></tr>
[Add rows for each paper using the exact author names above]
</table>

📖 SOURCE MATERIALS:
`;

  paperAbstracts.forEach((paper, index) => {
    if (paper.citation && paper.abstract) {
      const match = paper.citation.match(/^([^,]+),.*?\((\d{4})\)/);
      if (match) {
        const author = match[1].trim();
        const year = match[2];
        prompt += `

[${author} (${year})]
Full Citation: ${paper.citation}
Abstract: ${paper.abstract}
REMEMBER: Always cite this as "${author} (${year})" - NEVER as "Paper ${index + 1}"
`;
      }
    }
  });

  prompt += `

🚨 FINAL WARNING: Your response will be rejected if it contains any "Paper 1", "Paper 2", "Study 1", etc. phrases. Use only the specific author names provided above.`;

  // Log the prompt for debugging
  console.log("=== TASK 2 PROMPT DEBUG ===");
  console.log("Topic:", topic);
  console.log("Papers provided:", paperAbstracts.length);
  console.log("Extracted authors:", extractedAuthors);
  console.log("Citation map size:", citationMap.size);
  console.log("Prompt length:", prompt.length);
  console.log("===============================");

  const response = await openai.chat.completions.create({
    model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    messages: [
      {
        role: "system",
        content: `You are an expert academic writing assistant specializing in comprehensive literature reviews.

🔥 CRITICAL RULES:
1. NEVER write "Paper 1", "Paper 2", "Study 1", "Study 2", or any numbered references
2. ALWAYS use specific author names: "Smith (2023)" or "(Smith, 2023)"
3. Write comprehensive, detailed content with rich explanations
4. Include thorough theoretical background and context
5. Provide in-depth methodological analysis
6. Create accessible but academically rigorous content
7. Include HTML comparison table in section 4

Your response will be automatically rejected if it contains any prohibited phrases like "Paper 1" or "Study 1".`,
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

  // Post-processing to replace any remaining generic references
  let finalContent = rawContent;
  citationMap.forEach((citation, placeholder) => {
    finalContent = finalContent.replaceAll(placeholder, citation);
  });

  return finalContent;
}

/**
 * Legacy function that routes to appropriate task-specific function
 */
export async function generateLiteratureReview(
  topic: string,
  paperAbstracts?: { citation?: string; abstract?: string }[],
): Promise<string> {
  const hasValidAbstracts = paperAbstracts?.some(
    (p) => p.abstract && p.abstract.trim().length > 10,
  );

  if (hasValidAbstracts && paperAbstracts) {
    return await generateTask2LiteratureReview(topic, paperAbstracts);
  } else {
    return await generateTask1LiteratureReview(topic);
  }
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
