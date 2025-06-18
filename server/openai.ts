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
- 1000-1500 words
- Use proper APA citations with author names and years
- Include a comparison table in section 4
- Write clearly and accessibly`;

  if (hasAbstracts && paperAbstracts) {
    prompt += "\n\nPapers to reference:";
    paperAbstracts.forEach((paper, i) => {
      if (paper.citation && paper.abstract) {
        prompt += `\n\n${paper.citation}\nAbstract: ${paper.abstract}`;
      }
    });
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an academic writing assistant. Write clear, comprehensive literature reviews using proper citations.",
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