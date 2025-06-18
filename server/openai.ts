import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateLiteratureReview(
  topic: string,
  paperAbstracts?: { citation?: string; abstract?: string }[],
): Promise<string> {
  const hasAbstracts = paperAbstracts?.some(p => p.abstract && p.abstract.trim().length > 10);
  
  let prompt = `Write a comprehensive literature review on "${topic}".

Structure:
<h3>1. Introduction</h3>
<h3>2. Thematic Organization of the Literature</h3>
<h3>3. Methodological Comparison</h3>
<h3>4. Critical Analysis and Synthesis</h3>
<h3>5. Conclusion</h3>
<h3>6. References</h3>

Requirements:
- 2000-3000 words with extensive detailed analysis
- Use proper APA citations with author names and years
- Include a comparison table in section 4
- Write clearly and accessibly with comprehensive explanations
- Provide thorough theoretical background and context
- Include detailed methodological discussions
- Synthesize findings across multiple dimensions
- Expand each section with rich content and detailed explanations
- Include extensive critical analysis and evaluation
- Provide comprehensive coverage of all aspects of the topic`;

  if (hasAbstracts && paperAbstracts) {
    prompt += "\n\nCitation mapping - Use these exact author citations:";
    
    paperAbstracts.forEach((paper, i) => {
      if (paper.citation && paper.abstract) {
        const match = paper.citation.match(/^([^,]+),.*?\((\d{4})\)/);
        if (match) {
          const author = match[1].trim();
          const year = match[2];
          prompt += `\nPaper ${i + 1}: Always cite as "${author} (${year})" or "(${author}, ${year})"`;
        }
      }
    });

    prompt += "\n\nPapers to reference:";
    paperAbstracts.forEach((paper, i) => {
      if (paper.citation && paper.abstract) {
        const match = paper.citation.match(/^([^,]+),.*?\((\d{4})\)/);
        const author = match ? match[1].trim() : "Author";
        const year = match ? match[2] : "Year";
        
        prompt += `\n\n[${author} (${year})]
Full Citation: ${paper.citation}
Abstract: ${paper.abstract}`;
      }
    });
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an academic writing assistant. Write comprehensive literature reviews using proper author-year citations. Always use the specific author names provided in the citation mapping.",
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

  // Post-process to replace any remaining generic references
  let finalContent = content;
  if (hasAbstracts && paperAbstracts) {
    paperAbstracts.forEach((paper, i) => {
      if (paper.citation) {
        const match = paper.citation.match(/^([^,]+),.*?\((\d{4})\)/);
        if (match) {
          const author = match[1].trim();
          const year = match[2];
          const authorCitation = `${author} (${year})`;
          
          // Replace any Paper X references with author citations
          const paperPattern = new RegExp(`Paper ${i + 1}`, 'g');
          finalContent = finalContent.replace(paperPattern, authorCitation);
        }
      }
    });

    // Add proper References section with actual citations
    const referencesSection = "\n\n<h3>6. References</h3>\n\n";
    const citations = paperAbstracts
      .filter(paper => paper.citation)
      .map(paper => `<p>${paper.citation}</p>`)
      .join('\n');
    
    // Replace the References section with actual citations
    const referencesPattern = /<h3>6\.\s*References<\/h3>[\s\S]*?(?=<h3>|$)/;
    if (referencesPattern.test(finalContent)) {
      finalContent = finalContent.replace(referencesPattern, referencesSection + citations);
    } else {
      // If no References section found, append it
      finalContent += referencesSection + citations;
    }
  }

  return finalContent || "Error generating literature review.";
}

export async function generateArgumentExploration(
  topic: string,
  initialThoughts?: string,
  counterarguments?: string,
): Promise<string> {
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