import OpenAI from "openai";
import dotenv from 'dotenv';

// Initialize environment variables from a .env file
dotenv.config();

// Configure the OpenAI client with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- Helper Function (No changes needed) ---
function processPaperAbstracts(paperAbstracts: { citation?: string; abstract?: string }[]) {
    // ... (This function is correct and remains unchanged)
    return paperAbstracts
    ?.filter(p => p.citation && p.abstract)
    .map(paper => {
      const citation = paper.citation!;
      const abstract = paper.abstract!;
      const yearMatch = citation.match(/\((\d{4})\)/);
      const year = yearMatch?.[1];
      if (!year) return null;
      const authorsRaw = citation.split('(')[0].trim();
      const authorLastNames = authorsRaw
        .split(/,\s*(?=[A-Z]\.)/g)
        .map(a => a.split(',')[0].trim())
        .filter(Boolean);
      const firstAuthor = authorLastNames[0];
      if (!firstAuthor) return null;
      let authorCitation = '';
      if (authorLastNames.length === 1) {
        authorCitation = `${firstAuthor} (${year})`;
      } else if (authorLastNames.length === 2) {
        authorCitation = `${authorLastNames[0]} & ${authorLastNames[1]} (${year})`;
      } else {
        authorCitation = `${firstAuthor} et al. (${year})`;
      }
      return { year, citation, abstract, authorCitation };
    })
    .filter(Boolean) as {
      year: string;
      citation: string;
      abstract: string;
      authorCitation: string;
    }[];
}

// --- Task 1 Function ---
export async function generateZeroShotLiteratureReview(topic: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{
      role: "system",
      content: "Write comprehensive academic literature reviews with proper APA citations."
    }, {
      role: "user",
      content: `Write a 1500-2000 word literature review on "${topic}". Use thematic structure with author-year citations (Smith, 2023). Include References section in APA format.`
    }],
    temperature: 0.6,
  });

  return response.choices[0]?.message?.content || "Error: Could not generate literature review.";
}

// --- Task 2 Function (CRITICALLY REVISED) ---

export async function generateLiteratureReviewFromSources(
  topic: string,
  paperAbstracts: { citation?: string; abstract?: string }[],
): Promise<string> {

  const processedPapers = processPaperAbstracts(paperAbstracts);

  if (!processedPapers || processedPapers.length === 0) {
    return "Error: No valid papers with citations and abstracts provided.";
  }

  // Build minimal source block
  let sources = "Starting materials:\n";
  processedPapers.forEach(p => {
    sources += `${p.authorCitation}: ${p.abstract}\n\n`;
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{
      role: "system",
      content: "Synthesize literature thematically. Never use numbered references like Paper 1 or Study 2."
    }, {
      role: "user",
      content: `Write a literature review on "${topic}" using these as starting points. Organize by themes, not by individual papers. Use only the author citations provided.

${sources}`
    }],
    stream: true,
  });

  let content = "";
  for await (const chunk of response) {
    content += chunk.choices[0]?.delta?.content || "";
  }

  return content.trim() || "Error: Could not generate literature review.";
}

// Main function that routes between Task 1 and Task 2
export async function generateLiteratureReview(
  topic: string,
  paperAbstracts?: { citation?: string; abstract?: string }[],
): Promise<string> {
  const hasAbstracts = paperAbstracts?.some(p => p.abstract && p.abstract.trim().length > 10);
  
  if (!hasAbstracts || !paperAbstracts) {
    // Task 1: Generate without specific papers
    return generateZeroShotLiteratureReview(topic);
  } else {
    // Task 2: Generate with specific papers using thematic synthesis
    return generateLiteratureReviewFromSources(topic, paperAbstracts);
  }
}

export async function generateArgumentExploration(
  topic: string,
  initialThoughts?: string,
  counterarguments?: string,
): Promise<string> {
  let prompt = `Analyze multiple perspectives on "${topic}".`;
  
  if (initialThoughts) {
    prompt += ` Build on: ${initialThoughts}`;
  }
  
  if (counterarguments) {
    prompt += ` Address: ${counterarguments}`;
  }

  prompt += ` Write 700-900 words in HTML format with balanced analysis and APA citations.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{
      role: "system",
      content: "Provide balanced multi-perspective analysis in HTML format with APA citations."
    }, {
      role: "user",
      content: prompt
    }],
    max_tokens: 2000,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || "Error generating argument exploration.";
}