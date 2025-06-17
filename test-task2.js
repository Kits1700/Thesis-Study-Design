import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "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"
});

const testPaperAbstracts = [
  {
    citation: "Smith, J. A. (2023). Human-AI collaboration in decision making. Journal of Technology Studies, 15(2), 123-145.",
    abstract: "This study examines how humans and AI systems can work together effectively in complex decision-making scenarios."
  },
  {
    citation: "Johnson, M., & Brown, K. (2022). Machine learning interfaces for user experience. Computer Science Review, 8(3), 78-92.",
    abstract: "An exploration of how machine learning can enhance user interface design and interaction patterns."
  },
  {
    citation: "Wilson, P., Davis, E., & Lee, F. (2021). Cognitive load in human-computer interaction. Psychology of Computing, 12(1), 45-67.",
    abstract: "Research on how cognitive load affects user performance when interacting with computer systems."
  }
];

async function testTask2CitationGeneration() {
  const topic = "Human-Computer Interaction";
  
  let prompt = `Generate a comprehensive academic literature review on the topic: "${topic}".\n`;
  prompt += `
You are provided with key scholarly sources (citations and abstracts). These sources must form the foundation of the literature review.

CRITICAL CITATION REQUIREMENTS:
- You MUST extract actual author surnames and years from each APA reference below
- Use these specific authors and years in parenthetical citations throughout your review: (Author, Year)
- When discussing findings, write: "Author (Year) found that..." or "Research shows (Author, Year) that..."
- For multiple authors use: (FirstAuthor et al., Year)
- COMPLETELY FORBIDDEN: "Paper 1", "Paper 2", "this study", "the research", "one study"
- REQUIRED: Every major point must include specific author-year citations from the references provided
- Integrate these works thematically across all 6 sections with proper citations
- The exact APA references provided must appear first in your References section
- Format in HTML and use exactly the following section headers:

<h3>1. Introduction</h3>
<h3>2. Thematic Organization of the Literature</h3>
<h3>3. Methodological Comparison</h3>
<h3>4. Critical Analysis and Synthesis</h3>
<h3>5. Conclusion</h3>
<h3>6. References</h3>

- Word count target: 1500–2000.
- Reference section must use full APA style. List provided citations first (in given order), then any additional ones alphabetically.
`;

  let citationMap = "";
  testPaperAbstracts.forEach((paper) => {
    if (paper.citation && paper.abstract) {
      prompt += `\nReference: ${paper.citation}\nAbstract: ${paper.abstract}\n`;
      
      const match = paper.citation.match(/^([^,]+),.*?\((\d{4})\)/);
      if (match) {
        const author = match[1].trim();
        const year = match[2];
        citationMap += `- When citing this paper, write: (${author}, ${year}) or ${author} (${year})\n`;
      }
    }
  });

  prompt += `\n\nCITATION MAPPING - USE THESE EXACT FORMATS:
${citationMap}

ABSOLUTELY FORBIDDEN WORDS/PHRASES:
- "Paper 1", "Paper 2", "Paper 3", "Paper 4", "Paper 5"
- "In Paper X", "The first paper", "The second study"
- "One study", "Another research", "This paper"

REQUIRED CITATION FORMAT EXAMPLES:
✓ "Johnson (2023) demonstrated that..."
✓ "Research findings indicate (Smith & Brown, 2022) that..."
✓ "Wilson et al. (2021) explored the relationship..."
✗ "Paper 1 shows..." (NEVER WRITE THIS)
✗ "In Paper 3, the authors..." (NEVER WRITE THIS)

CRITICAL: Every time you discuss findings from the provided sources, you MUST use the specific author names and years shown in the citation mapping above.

TABLE REQUIREMENT FOR SECTION 4:
In the "Critical Analysis and Synthesis" section, you MUST include a comparison table with this exact format:

<table border="1" style="width:100%; border-collapse: collapse;">
<tr>
<th>Author (Year)</th>
<th>Research Method</th>
<th>Key Findings</th>
</tr>
<tr>
<td>[Use actual author names from citations above]</td>
<td>[Method used in the study]</td>
<td>[Primary findings]</td>
</tr>
</table>

Create one row for each provided reference using the author names from your citation mapping.`;

  try {
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
      max_tokens: 2000,
      temperature: 0.7,
    });

    console.log("=== TASK 2 TEST RESULT ===");
    console.log(response.choices[0].message.content);
    
    // Check for forbidden phrases
    const content = response.choices[0].message.content;
    const forbiddenPhrases = ["Paper 1", "Paper 2", "Paper 3", "Paper 4", "Paper 5", "In Paper"];
    let foundForbidden = false;
    
    forbiddenPhrases.forEach(phrase => {
      if (content.includes(phrase)) {
        console.log(`\n❌ FOUND FORBIDDEN PHRASE: "${phrase}"`);
        foundForbidden = true;
      }
    });
    
    if (!foundForbidden) {
      console.log("\n✅ NO FORBIDDEN PHRASES FOUND");
    }
    
    // Check for proper citations
    if (content.includes("(Smith, 2023)") || content.includes("Smith (2023)")) {
      console.log("✅ FOUND PROPER SMITH CITATION");
    } else {
      console.log("❌ MISSING PROPER SMITH CITATION");
    }
    
    // Check for table
    if (content.includes("<table")) {
      console.log("✅ TABLE FOUND");
    } else {
      console.log("❌ TABLE MISSING");
    }
    
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

testTask2CitationGeneration();