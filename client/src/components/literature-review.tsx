import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useStudyStore } from "@/lib/study-store";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, RefreshCw, CheckCircle, GripVertical, Download } from "lucide-react";

export default function LiteratureReview() {
  const { currentTask, setCurrentStep, participantId, markTaskComplete } = useStudyStore();
  const [topic, setTopic] = useState("");
  const [initialThoughts, setInitialThoughts] = useState("");
  const [paperAbstracts, setPaperAbstracts] = useState([
    { id: 1, abstract: "", citation: "", ranking: 0 },
    { id: 2, abstract: "", citation: "", ranking: 0 },
    { id: 3, abstract: "", citation: "", ranking: 0 },
    { id: 4, abstract: "", citation: "", ranking: 0 },
    { id: 5, abstract: "", citation: "", ranking: 0 }
  ]);
  const [generatedContent, setGeneratedContent] = useState("");
  const [isPreparatoryComplete, setIsPreparatoryComplete] = useState(false);
  const [taskCreated, setTaskCreated] = useState(false);

  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        console.error("Failed to create task:", response.status);
        return null;
      }
      return response.json();
    },
  });

  const generateReviewMutation = useMutation({
    mutationFn: async (data: { topic: string; paperAbstracts?: any[] }) => {
      // Create task record first if not already created
      if (!taskCreated && currentTask && participantId) {
        await createTaskMutation.mutateAsync({
          participantId,
          taskId: currentTask.id,
          taskType: currentTask.taskType,
          frictionType: currentTask.frictionType,
          topic: data.topic,
          initialThoughts,
          generatedContent: {},
        });
        setTaskCreated(true);
      }

      const response = await fetch("/api/generate/literature-review/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          participantId,
          taskId: currentTask?.id,
          paperAbstracts: currentTask?.frictionType === "selective_friction" ? paperAbstracts : null,
        }),
      });

      if (!response.ok) {
        console.error("Failed to generate literature review:", response.status);
        return { content: "Error generating content. Please try again." };
      }

      const reader = response.body?.getReader();
      if (!reader) {
        console.error("No response body available");
        return { content: "Error reading response. Please try again." };
      }

      setGeneratedContent(""); // Clear previous content
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullContent = data.content;
                setGeneratedContent(fullContent);
              }
              if (data.done) {
                return { content: fullContent };
              }
              if (data.error) {
                console.error("Generation error:", data.error);
                return { content: "Error in generation. Please try again." };
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      return { content: fullContent };
    },
    onSuccess: (data) => {
      // Content is already set via streaming
    },
  });

  const updatePaperAbstract = (id: number, abstract: string) => {
    setPaperAbstracts(prev => 
      prev.map(paper => 
        paper.id === id ? { ...paper, abstract } : paper
      )
    );
  };

  const updatePaperCitation = (id: number, citation: string) => {
    setPaperAbstracts(prev => 
      prev.map(paper => 
        paper.id === id ? { ...paper, citation } : paper
      )
    );
  };

  const updatePaperRanking = (id: number, ranking: number) => {
    setPaperAbstracts(prev => 
      prev.map(paper => 
        paper.id === id ? { ...paper, ranking } : paper
      )
    );
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"));
    
    if (dragIndex !== dropIndex) {
      const newPapers = [...paperAbstracts];
      const draggedPaper = newPapers[dragIndex];
      newPapers.splice(dragIndex, 1);
      newPapers.splice(dropIndex, 0, draggedPaper);
      
      // Update rankings based on new order
      const updatedPapers = newPapers.map((paper, index) => ({
        ...paper,
        ranking: index + 1
      }));
      
      setPaperAbstracts(updatedPapers);
    }
  };

  const checkPreparatoryWork = () => {
    if (currentTask?.frictionType === "selective_friction") {
      if (!topic.trim()) {
        alert("Please enter a research topic.");
        return;
      }
      const filledAbstracts = paperAbstracts.filter(p => p.abstract.trim().length > 10);
      if (filledAbstracts.length < 5) {
        alert("Please complete all 5 paper abstracts with at least 10 characters each before generating the review.");
        return;
      }
      setIsPreparatoryComplete(true);
    }
    
    generateReviewMutation.mutate({ 
      topic: topic || "Cancer Vaccines",
      paperAbstracts: isSelectiveFriction ? paperAbstracts : undefined
    });
  };

  const handleNext = () => {
    // Save comprehensive task data to local storage
    if (currentTask) {
      markTaskComplete({
        taskId: currentTask.id,
        taskType: currentTask.taskType,
        frictionType: currentTask.frictionType,
        topic: topic || "No topic specified",
        initialThoughts: initialThoughts || "No initial thoughts provided",
        generatedContent: {
          literatureReview: generatedContent,
          paperAbstracts: paperAbstracts.filter(p => p.abstract.trim()),
          userPrompts: {
            topic: topic,
            preparatoryWork: isSelectiveFriction ? paperAbstracts : null
          }
        },
      });
    }
    // Scroll to top when moving to questionnaire
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep("questionnaire");
  };

  const handleBack = () => {
    setCurrentStep("task_selection");
  };

  const downloadLiteratureReview = () => {
    if (!generatedContent) return;
    
    const textContent = `Literature Review: ${topic || "Generated Review"}\n\n${generatedContent.replace(/<[^>]*>/g, '')}`;
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `literature_review_${topic ? topic.replace(/[^a-zA-Z0-9]/g, '_') : 'generated'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isSelectiveFriction = currentTask?.frictionType === "selective_friction";

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">
            Task {currentTask?.id}: Literature Review{" "}
            <span className="text-teal-400">
              (Summative Task)
            </span>
          </h1>
          <p className="text-gray-300">
            {isSelectiveFriction 
              ? "Complete your preparatory work first. Find 5 paper abstracts on your topic and rank them by relevance before accessing AI assistance."
              : "Your goal is to create a short literature review on a topic of your choice by directly receiving help from the AI to generate a structured summary"
            }
          </p>
          
          {isSelectiveFriction && (
            <div className="mt-6 bg-blue-900/30 border border-blue-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-300 mb-3">Suggested Approach (not the only way):</h3>
              <div className="space-y-2 text-sm text-blue-200">
                <p><strong>1.</strong> Open <a href="https://scholar.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300">Google Scholar</a> and search for your topic</p>
                <p><strong>2.</strong> Find relevant papers and copy their abstracts</p>
                <p><strong>3.</strong> For citations, paste the DOI into <a href="https://quillbot.com/citation-generator/folders/lq9KnS5PuonR1VOznH4Kk/lists/1MgxGJbCDg0lRAVOSqc8Cx/sources/4TzPwcC8h6n6L1YIIFM6Kp" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300">QuillBot citation generator</a> or similar tool</p>
                <p><strong>4.</strong> Rank the papers by relevance to your research question</p>
                <p className="text-blue-300 italic mt-3">Feel free to use any method you prefer to find and organize academic sources.</p>
              </div>
            </div>
          )}
        </div>

        {isSelectiveFriction && !isPreparatoryComplete && (
          <>
            <Card className="bg-gray-800 border border-gray-700 mb-8">
              <CardHeader>
                <CardTitle className="text-white">Research Topic</CardTitle>
                <p className="text-gray-300 text-sm">
                  Provide a clear and specific research topic for your literature review. The more detailed your topic, the better the AI can assist you.
                </p>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter Research Topic for Literature Review (e.g. Human LLM interaction)"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  rows={3}
                />
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border border-gray-700 mb-8">
              <CardHeader>
                <CardTitle className="text-white">Paper Abstracts & Citations</CardTitle>
                <p className="text-gray-300 text-sm">
                  Find and input 5 paper abstracts and their full citations related to your topic. Drag and drop to rank them by relevance (1 = most relevant).
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {paperAbstracts.map((paper, index) => (
                  <div
                    key={paper.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className="bg-gray-700 border border-gray-600 rounded-lg p-4 cursor-move hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex flex-col items-center space-y-1">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Paper {paper.id} Citation
                          </label>
                          <Textarea
                            value={paper.citation}
                            onChange={(e) => updatePaperCitation(paper.id, e.target.value)}
                            placeholder={`Enter full citation for paper ${paper.id} (e.g., Author, A. (2023). Title. Journal, 10(2), 123-145.)`}
                            className="bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                            rows={2}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Paper {paper.id} Abstract
                          </label>
                          <Textarea
                            value={paper.abstract}
                            onChange={(e) => updatePaperAbstract(paper.id, e.target.value)}
                            placeholder={`Enter abstract for paper ${paper.id}...`}
                            className="bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="text-center mb-8">
              <Button 
                onClick={checkPreparatoryWork}
                disabled={generateReviewMutation.isPending || !topic.trim() || paperAbstracts.filter(p => p.abstract.trim().length > 10 && p.citation.trim().length > 10).length < 5}
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3"
              >
                {generateReviewMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Literature Review...
                  </>
                ) : (
                  "Generate Literature Review"
                )}
              </Button>
            </div>
          </>
        )}

        {(!isSelectiveFriction || isPreparatoryComplete) && (
          <Card className="bg-gray-800 border border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Research Topic</CardTitle>
              <p className="text-gray-300 text-sm">
                Provide a clear and specific research topic for your literature review. The more detailed your topic, the better the AI can assist you.
              </p>
            </CardHeader>
            <CardContent>
              <Textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter Research Topic for Literature Review (e.g. Human LLM interaction)"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 mb-4"
                rows={3}
              />
              <Button 
                onClick={checkPreparatoryWork}
                disabled={generateReviewMutation.isPending || !topic.trim()}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
              >
                {generateReviewMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Literature Review...
                  </>
                ) : (
                  "Generate Literature Review"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {generatedContent && (
          <Card className="bg-gray-800 border border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                Generated Literature Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="prose prose-invert max-w-none text-gray-300"
                dangerouslySetInnerHTML={{ __html: generatedContent }} 
              />
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between">
          <Button 
            onClick={handleBack}
            variant="outline" 
            className="px-6 py-2 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Back
          </Button>
          
          <div className="flex space-x-4">
            {generatedContent && (
              <>
                <Button 
                  variant="outline" 
                  onClick={downloadLiteratureReview}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Review
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setGeneratedContent("");
                    if (isSelectiveFriction) {
                      setIsPreparatoryComplete(false);
                    }
                  }}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate New Review
                </Button>
              </>
            )}
            <Button 
              onClick={handleNext} 
              disabled={!generatedContent || generateReviewMutation.isPending}
              className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50"
            >
              {generateReviewMutation.isPending ? "Generating..." : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}