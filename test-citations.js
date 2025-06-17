// Test citation extraction for Task 2
const testCitations = [
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

// Test the citation extraction regex
testCitations.forEach((paper, index) => {
  console.log(`\nTesting Paper ${index + 1}:`);
  console.log(`Citation: ${paper.citation}`);
  
  const match = paper.citation.match(/^([^,]+),.*?\((\d{4})\)/);
  if (match) {
    const author = match[1].trim();
    const year = match[2];
    console.log(`✓ Extracted: Author="${author}", Year="${year}"`);
    console.log(`✓ Citation format: (${author}, ${year}) or ${author} (${year})`);
  } else {
    console.log(`✗ Failed to extract citation info`);
  }
});

console.log("\n=== Expected Citation Mapping Output ===");
let citationMap = "";
testCitations.forEach((paper) => {
  const match = paper.citation.match(/^([^,]+),.*?\((\d{4})\)/);
  if (match) {
    const author = match[1].trim();
    const year = match[2];
    citationMap += `- When citing this paper, write: (${author}, ${year}) or ${author} (${year})\n`;
  }
});
console.log(citationMap);