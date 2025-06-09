import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useStudyStore } from "@/lib/study-store";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, RefreshCw, CheckCircle, GripVertical } from "lucide-react";

export default function LiteratureReview() {
  const { currentTask, setCurrentStep } = useStudyStore();
  const [topic, setTopic] = useState("");
  const [initialThoughts, setInitialThoughts] = useState("");
  const [paperAbstracts, setPaperAbstracts] = useState([
    { id: 1, abstract: "", ranking: 0 },
    { id: 2, abstract: "", ranking: 0 },
    { id: 3, abstract: "", ranking: 0 },
    { id: 4, abstract: "", ranking: 0 },
    { id: 5, abstract: "", ranking: 0 }
  ]);
  const [generatedContent, setGeneratedContent] = useState("");
  const [isPreparatoryComplete, setIsPreparatoryComplete] = useState(false);

  const generateReviewMutation = useMutation({
    mutationFn: async (data: { topic: string }) => {
      const response = await apiRequest("POST", "/api/generate/literature-review", data);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedContent(data.content);
    },
  });

  const updatePaperAbstract = (id: number, abstract: string) => {
    setPaperAbstracts(prev => 
      prev.map(paper => 
        paper.id === id ? { ...paper, abstract } : paper
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
      const filledAbstracts = paperAbstracts.filter(p => p.abstract.trim());
      if (filledAbstracts.length < 5) {
        alert("Please complete all 5 paper abstracts before generating the review.");
        return;
      }
      setIsPreparatoryComplete(true);
    }
    
    generateReviewMutation.mutate({ topic: topic || "Cancer Vaccines" });
  };

  const handleNext = () => {
    setCurrentStep("questionnaire");
  };

  const handleBack = () => {
    setCurrentStep("task_selection");
  };

  const isSelectiveFriction = currentTask?.frictionType === "selective_friction";

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">
            Task {currentTask?.id}: Literature Review{" "}
            <span className={isSelectiveFriction ? "text-purple-400" : "text-teal-400"}>
              ({isSelectiveFriction ? "Generative Task" : "Summative Task"})
            </span>
          </h1>
          <p className="text-gray-300">
            {isSelectiveFriction 
              ? "Complete your preparatory work first. Find 5-7 paper abstracts on your topic and rank them by relevance before accessing AI assistance."
              : "Your goal is to create a short literature review on a topic of your choice by directly receiving help from the AI to generate a structured summary"
            }
          </p>
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
                <CardTitle className="text-white">Paper Abstracts</CardTitle>
                <p className="text-gray-300 text-sm">
                  Find and input 5 paper abstracts related to your topic. Drag and drop to rank them by relevance (1 = most relevant).
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
                      <div className="flex-1">
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
                ))}
              </CardContent>
            </Card>
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
                className={`w-full ${isSelectiveFriction ? 'bg-purple-600 hover:bg-purple-700' : 'bg-teal-600 hover:bg-teal-700'} text-white`}
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
            )}
            <Button 
              onClick={handleNext} 
              disabled={!generatedContent}
              className={`px-6 py-2 ${isSelectiveFriction ? 'bg-purple-600 hover:bg-purple-700' : 'bg-teal-600 hover:bg-teal-700'} text-white`}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}