const https = require('https');
const http = require('http');

function testTask2Citations() {
  const postData = JSON.stringify({
    topic: "Human-Computer Interaction",
    participantId: "test123",
    taskId: 2,
    paperAbstracts: [
      {
        citation: "Smith, J. A. (2023). Human-AI collaboration in decision making. Journal of Technology Studies, 15(2), 123-145.",
        abstract: "This study examines how humans and AI systems can work together effectively in complex decision-making scenarios."
      },
      {
        citation: "Johnson, M. (2022). Machine learning interfaces for user experience. Computer Science Review, 8(3), 78-92.",
        abstract: "An exploration of how machine learning can enhance user interface design and interaction patterns."
      }
    ]
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/generate/literature-review/stream',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('Testing Task 2 citation system...\n');

  const req = http.request(options, (res) => {
    let fullContent = '';
    let chunkCount = 0;

    res.on('data', (chunk) => {
      const data = chunk.toString();
      const lines = data.split('\n');
      
      lines.forEach(line => {
        if (line.startsWith('data: ')) {
          try {
            const jsonData = JSON.parse(line.substring(6));
            if (jsonData.content) {
              fullContent += jsonData.content;
              chunkCount++;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      });

      if (chunkCount > 50) { // Stop after reasonable amount of content
        req.destroy();
        analyzeContent(fullContent);
      }
    });

    res.on('end', () => {
      if (fullContent) {
        analyzeContent(fullContent);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Request error: ${e.message}`);
  });

  req.write(postData);
  req.end();

  // Timeout after 25 seconds
  setTimeout(() => {
    req.destroy();
    console.log('Test timed out - analyzing partial content...');
  }, 25000);
}

function analyzeContent(content) {
  console.log('=== ANALYSIS RESULTS ===\n');
  
  // Show first part of content
  console.log('Content preview:');
  console.log(content.substring(0, 500) + '...\n');
  
  // Check for forbidden phrases
  const forbiddenPhrases = ['Paper 1', 'Paper 2', 'Paper 3', 'In Paper', 'this paper', 'this study'];
  const foundForbidden = [];
  
  forbiddenPhrases.forEach(phrase => {
    if (content.toLowerCase().includes(phrase.toLowerCase())) {
      foundForbidden.push(phrase);
    }
  });
  
  if (foundForbidden.length > 0) {
    console.log('❌ FOUND FORBIDDEN PHRASES:');
    foundForbidden.forEach(phrase => console.log(`   - "${phrase}"`));
  } else {
    console.log('✅ NO FORBIDDEN PHRASES FOUND');
  }
  
  // Check for proper citations
  const properCitations = [];
  if (content.includes('Smith (2023)') || content.includes('(Smith, 2023)')) {
    properCitations.push('Smith (2023)');
  }
  if (content.includes('Johnson (2022)') || content.includes('(Johnson, 2022)')) {
    properCitations.push('Johnson (2022)');
  }
  
  if (properCitations.length > 0) {
    console.log('✅ FOUND PROPER CITATIONS:');
    properCitations.forEach(citation => console.log(`   - ${citation}`));
  } else {
    console.log('❌ NO PROPER CITATIONS FOUND');
  }
  
  // Check for table
  if (content.includes('<table') || content.includes('<TABLE')) {
    console.log('✅ TABLE FOUND');
  } else {
    console.log('❌ TABLE MISSING');
  }
  
  // Check for required sections
  const sections = ['Introduction', 'Thematic Organization', 'Methodological Comparison', 'Critical Analysis', 'Conclusion', 'References'];
  const foundSections = [];
  
  sections.forEach(section => {
    if (content.includes(section)) {
      foundSections.push(section);
    }
  });
  
  console.log(`\n📋 SECTIONS FOUND: ${foundSections.length}/6`);
  foundSections.forEach(section => console.log(`   ✓ ${section}`));
  
  const missingSeconds = sections.filter(s => !foundSections.includes(s));
  if (missingSeconds.length > 0) {
    missingSeconds.forEach(section => console.log(`   ❌ Missing: ${section}`));
  }
  
  console.log('\n=== TEST COMPLETE ===');
  process.exit(0);
}

testTask2Citations();