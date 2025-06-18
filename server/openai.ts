import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateLiteratureReview(
  topic: string,
  paperAbstracts?: { citation?: string; abstract?: string }[],
): Promise<string> {
  const hasAbstracts = paperAbstracts?.some(p => p.abstract && p.abstract.trim().length > 10);
  
  if (!hasAbstracts || !paperAbstracts) {
    // Task 1: Generate without specific papers
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an academic writing assistant. Write comprehensive literature reviews using proper APA citations with author names and years.",
        },
        {
          role: "user",
          content: `Write a comprehensive literature review on "${topic}".

Structure:
<h3>1. Introduction</h3>
<h3>2. Thematic Organization of the Literature</h3>
<h3>3. Methodological Comparison</h3>
<h3>4. Critical Analysis and Synthesis</h3>
<h3>5. Conclusion</h3>
<h3>6. References</h3>

Requirements:
- 2000-3000 words with extensive analysis
- Use realistic author-year citations like "Smith (2023)"
- Include comparison table in section 4
- Write clearly and accessibly`,
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

  // Task 2: Generate with specific papers
  // Extract author information upfront
  const authors = paperAbstracts.map(paper => {
    if (paper.citation) {
      const match = paper.citation.match(/^([^,]+),.*?\((\d{4})\)/);
      if (match) {
        return `${match[1].trim()} (${match[2]})`;
      }
    }
    return null;
  }).filter(Boolean);

  // Create explicit prompt with author names
  let prompt = `Write a comprehensive literature review on "${topic}".

CRITICAL: When citing research, use ONLY these exact author citations:`;
  
  authors.forEach((author, i) => {
    prompt += `\n- Research ${i + 1}: ${author}`;
  });

  prompt += `

NEVER use "Paper 1", "Paper 2", "Study 1", or similar. Always use the specific author names above.

Structure:
<h3>1. Introduction</h3>
<h3>2. Thematic Organization of the Literature</h3>
<h3>3. Methodological Comparison</h3>
<h3>4. Critical Analysis and Synthesis</h3>
<h3>5. Conclusion</h3>
<h3>6. References</h3>

Requirements:
- 2000-3000 words with extensive analysis
- Include comparison table in section 4
- Write clearly and accessibly

Source materials:`;

  paperAbstracts.forEach((paper, i) => {
    if (paper.citation && paper.abstract) {
      prompt += `\n\n${authors[i]}:\n${paper.abstract}`;
    }
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an academic writing assistant. Use ONLY the specific author-year citations provided. Never use numbered references like Paper 1, Study 1, etc.",
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

  // Aggressive post-processing to eliminate any remaining numbered references
  let finalContent = content;
  
  // Replace any Paper/Study/Source X with author citations
  for (let i = 1; i <= 10; i++) {
    const authorCitation = authors[i - 1] || authors[0] || "the research";
    const patterns = [
      new RegExp(`\\bPaper ${i}\\b`, 'g'),
      new RegExp(`\\bpaper ${i}\\b`, 'g'),
      new RegExp(`\\bStudy ${i}\\b`, 'g'),
      new RegExp(`\\bstudy ${i}\\b`, 'g'),
      new RegExp(`\\bSource ${i}\\b`, 'g'),
      new RegExp(`\\bsource ${i}\\b`, 'g'),
    ];
    
    patterns.forEach(pattern => {
      finalContent = finalContent.replace(pattern, authorCitation);
    });
  }

  // Replace generic phrases
  const replacements = [
    { from: /\bthe first paper\b/gi, to: authors[0] || "research" },
    { from: /\bthe second paper\b/gi, to: authors[1] || authors[0] || "research" },
    { from: /\bthis study\b/gi, to: authors[0] || "research" },
    { from: /\bthis research\b/gi, to: authors[0] || "research" },
    { from: /\bthe research\b/gi, to: authors[0] || "research" },
    { from: /\bthe authors\b/gi, to: authors[0] || "researchers" },
  ];

  replacements.forEach(({ from, to }) => {
    if (to && to !== "research" && to !== "researchers") {
      finalContent = finalContent.replace(from, to);
    }
  });

  // Force References section with actual citations
  const referencesHtml = paperAbstracts
    .filter(paper => paper.citation)
    .map(paper => `<p>${paper.citation}</p>`)
    .join('\n');
  
  const referencesSection = `<h3>6. References</h3>\n\n${referencesHtml}`;
  const referencesPattern = /<h3>6\.\s*References<\/h3>[\s\S]*?(?=<h3>|$)/;
  
  if (referencesPattern.test(finalContent)) {
    finalContent = finalContent.replace(referencesPattern, referencesSection);
  } else {
    finalContent += `\n\n${referencesSection}`;
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