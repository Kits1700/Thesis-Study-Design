const { generateLiteratureReview } = require('./server/openai.js');

const testPapers = [
  {
    citation: "Smith, J. A. (2023). Human-AI collaboration in decision making. Journal of Technology Studies, 15(2), 123-145.",
    abstract: "This study examines how humans and AI systems can work together effectively in complex decision-making scenarios."
  },
  {
    citation: "Johnson, M. (2022). Machine learning interfaces for user experience. Computer Science Review, 8(3), 78-92.",
    abstract: "An exploration of how machine learning can enhance user interface design and interaction patterns."
  }
];

async function testTask2() {
  console.log("Testing Task 2 Literature Review Generation...\n");
  
  try {
    const result = await generateLiteratureReview("Human-Computer Interaction", testPapers);
    
    console.log("=== GENERATED CONTENT ===");
    console.log(result.substring(0, 1000) + "...\n");
    
    // Check for forbidden phrases
    const forbiddenPhrases = ["Paper 1", "Paper 2", "Paper 3", "In Paper"];
    let hasForbidden = false;
    
    forbiddenPhrases.forEach(phrase => {
      if (result.includes(phrase)) {
        console.log(`❌ FOUND FORBIDDEN PHRASE: "${phrase}"`);
        hasForbidden = true;
      }
    });
    
    if (!hasForbidden) {
      console.log("✅ No forbidden phrases found");
    }
    
    // Check for proper citations
    if (result.includes("Smith (2023)") || result.includes("(Smith, 2023)")) {
      console.log("✅ Found proper Smith citation");
    } else {
      console.log("❌ Missing proper Smith citation");
    }
    
    if (result.includes("Johnson (2022)") || result.includes("(Johnson, 2022)")) {
      console.log("✅ Found proper Johnson citation");
    } else {
      console.log("❌ Missing proper Johnson citation");
    }
    
    // Check for table
    if (result.includes("<table")) {
      console.log("✅ Table found");
    } else {
      console.log("❌ Table missing");
    }
    
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

testTask2();