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
- Use ONLY author-year citations like "Smith (2023)" or "(Smith, 2023)"
- NEVER use "Paper 1", "Paper 2", "Study 1", etc.
- Include a comparison table in section 4
- Write clearly and accessibly with comprehensive explanations`;

  // Extract authors for direct citation usage
  const authorCitations: string[] = [];
  
  if (hasAbstracts && paperAbstracts) {
    prompt += "\n\nIMPORTANT - Use ONLY these specific author citations:";
    
    paperAbstracts.forEach((paper, i) => {
      if (paper.citation && paper.abstract) {
        const match = paper.citation.match(/^([^,]+),.*?\((\d{4})\)/);
        if (match) {
          const author = match[1].trim();
          const year = match[2];
          const authorCitation = `${author} (${year})`;
          authorCitations.push(authorCitation);
          prompt += `\n- Always cite as "${authorCitation}" when discussing this research`;
        }
      }
    });

    prompt += "\n\nSource materials - CITE USING AUTHOR NAMES ONLY:";
    paperAbstracts.forEach((paper, i) => {
      if (paper.citation && paper.abstract) {
        const match = paper.citation.match(/^([^,]+),.*?\((\d{4})\)/);
        if (match) {
          const author = match[1].trim();
          const year = match[2];
          prompt += `\n\n${author} (${year}):\nCitation: ${paper.citation}\nAbstract: ${paper.abstract}\nIMPORTANT: When discussing this research, write "${author} (${year})" or "(${author}, ${year})"`;
        }
      }
    });

    prompt += "\n\nCRITICAL REQUIREMENTS:\n- Use author names like 'Davis (2023)' when citing\n- Include References section with full citations\n- Never use generic terms like 'the first paper' or 'this study'";
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an academic writing assistant. You must use specific author-year citations like 'Smith (2023)' or '(Smith, 2023)'. Never use phrases like 'Paper 1', 'Study 1', 'the first paper', 'this study', 'the research', or 'the authors'. Always refer to studies by their specific author names and years.",
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

  // Aggressive post-processing to fix any remaining issues
  let finalContent = content;
  
  if (hasAbstracts && paperAbstracts) {
    // Replace numbered references with proper author citations
    authorCitations.forEach((authorCitation, index) => {
      const paperNum = index + 1;
      const patterns = [
        new RegExp(`\\bPaper ${paperNum}\\b`, 'g'),
        new RegExp(`\\bpaper ${paperNum}\\b`, 'g'),
        new RegExp(`\\bStudy ${paperNum}\\b`, 'g'),
        new RegExp(`\\bstudy ${paperNum}\\b`, 'g'),
        new RegExp(`\\bSource ${paperNum}\\b`, 'g'),
        new RegExp(`\\bsource ${paperNum}\\b`, 'g'),
      ];
      
      patterns.forEach(pattern => {
        finalContent = finalContent.replace(pattern, authorCitation);
      });
    });

    // Replace generic phrases with author citations
    const genericPatterns = [
      { pattern: /\bthe first paper\b/gi, replacement: authorCitations[0] },
      { pattern: /\bthe second paper\b/gi, replacement: authorCitations[1] },
      { pattern: /\bthis study\b/gi, replacement: authorCitations[0] },
      { pattern: /\bthis research\b/gi, replacement: authorCitations[0] },
      { pattern: /\bthe research\b/gi, replacement: authorCitations[0] },
      { pattern: /\bthe authors\b/gi, replacement: authorCitations[0] },
      { pattern: /\banother study\b/gi, replacement: authorCitations[1] || authorCitations[0] },
      { pattern: /\bone study\b/gi, replacement: authorCitations[0] },
    ];

    genericPatterns.forEach(({ pattern, replacement }) => {
      if (replacement) {
        finalContent = finalContent.replace(pattern, replacement);
      }
    });

    // Force proper References section with actual citations
    const referencesHtml = paperAbstracts
      .filter(paper => paper.citation)
      .map(paper => `<p>${paper.citation}</p>`)
      .join('\n');
    
    const referencesPattern = /<h3>6\.\s*References<\/h3>[\s\S]*?(?=<h3>|$)/;
    const referencesSection = `<h3>6. References</h3>\n\n${referencesHtml}`;
    
    if (referencesPattern.test(finalContent)) {
      finalContent = finalContent.replace(referencesPattern, referencesSection);
    } else {
      finalContent += `\n\n${referencesSection}`;
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