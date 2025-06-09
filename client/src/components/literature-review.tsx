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
      const newAbstracts = [...paperAbstracts];
      const draggedItem = newAbstracts[dragIndex];
      newAbstracts.splice(dragIndex, 1);
      newAbstracts.splice(dropIndex, 0, draggedItem);
      
      // Update IDs to reflect new order (1 = most relevant)
      const reorderedAbstracts = newAbstracts.map((paper, index) => ({
        ...paper,
        id: index + 1,
        ranking: index + 1
      }));
      
      setPaperAbstracts(reorderedAbstracts);
    }
  };

  const handleGenerateReview = () => {
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

  const isSelectiveFriction = currentTask?.frictionType === "selective_friction";

  return (
    <section className="py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Task {currentTask?.id}: Literature Review{" "}
            <span className={isSelectiveFriction ? "text-primary" : "text-secondary"}>
              ({isSelectiveFriction ? "Selective Friction" : "Full AI Assistance"})
            </span>
          </h1>
          <p className="text-secondary">
            {isSelectiveFriction 
              ? "Complete your preparatory work first. Find 5-7 paper abstracts on your topic and rank them by relevance before accessing AI assistance."
              : "Receive immediate AI assistance for comprehensive literature review generation."
            }
          </p>
        </div>

        {isSelectiveFriction && !isPreparatoryComplete && (
          <>
            <Card className="surface border border-border mb-8">
              <CardHeader>
                <CardTitle>Research Topic</CardTitle>
                <p className="text-secondary text-sm">
                  Provide a clear and specific research topic for your literature review. The more detailed your topic, the better the AI can assist you.
                </p>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter Research Topic for Literature Review (e.g. Human LLM interaction)"
                  className="bg-accent border-border text-foreground placeholder-secondary"
                  rows={3}
                />
              </CardContent>
            </Card>

            <Card className="surface border border-border mb-8">
              <CardHeader>
                <CardTitle>Paper Abstracts & Rankings</CardTitle>
                <p className="text-secondary text-sm">
                  Find 5 paper abstracts and rank them by relevance (1 = most relevant, 5 = least relevant).
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {paperAbstracts.map((paper, index) => (
                  <div 
                    key={paper.id} 
                    className="border border-border rounded-lg p-4 bg-card cursor-move hover:bg-accent/50 transition-colors"
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <div className="flex items-center gap-2">
                        <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <label className="text-sm font-medium text-foreground">Paper {index + 1}</label>
                      </div>
                      {index === 0 && <span className="text-xs text-green-600 font-medium">Most Relevant</span>}
                      {index === 4 && <span className="text-xs text-orange-600 font-medium">Least Relevant</span>}
                    </div>
                    <Textarea
                      value={paper.abstract}
                      onChange={(e) => updatePaperAbstract(paper.id, e.target.value)}
                      placeholder="Copy Paste the Abstract"
                      className="bg-background border-border text-foreground placeholder-secondary min-h-[100px]"
                      rows={4}
                    />
                  </div>
                ))}
                <div className="text-center text-sm text-muted-foreground mt-4 p-3 bg-muted/50 rounded-lg">
                  💡 Drag papers up and down to rank them by relevance (1 = most relevant, 5 = least relevant)
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center mb-8">
              <Button 
                onClick={handleGenerateReview}
                disabled={generateReviewMutation.isPending || !topic.trim() || paperAbstracts.filter(p => p.abstract.trim()).length < 5}
                className="w-full max-w-md bg-primary hover:bg-primary/90"
              >
                {generateReviewMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Review...
                  </>
                ) : (
                  "Generate Literature Review"
                )}
              </Button>
            </div>
          </>
        )}

        {(!isSelectiveFriction || isPreparatoryComplete) && (
          <>
            {!generatedContent && (
              <>
                <Card className="surface border border-border mb-8">
                  <CardHeader>
                    <CardTitle>Research Topic</CardTitle>
                    <p className="text-secondary text-sm">
                      Provide a clear and specific research topic for your literature review. The more detailed your topic, the better the AI can assist you.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Enter Research Topic for Literature Review (e.g. Human LLM interaction)"
                      className="bg-accent border-border text-foreground placeholder-secondary mb-4"
                      rows={3}
                    />
                  </CardContent>
                </Card>

                <div className="text-center mb-8">
                  <Button 
                    onClick={handleGenerateReview}
                    disabled={generateReviewMutation.isPending || !topic.trim()}
                    className="bg-primary hover:bg-primary/90 px-8 py-3 w-full max-w-md"
                  >
                    {generateReviewMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Review...
                      </>
                    ) : (
                      "Generate Literature Review"
                    )}
                  </Button>
                </div>
              </>
            )}

            {generatedContent && (
              <Card className="surface border border-border mb-8">
                <CardHeader>
                  <CardTitle>Literature Review: Cancer Vaccines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-sm leading-relaxed">
                  <div dangerouslySetInnerHTML={{ __html: generatedContent }} />
                  
                  <div className="p-4 surface-variant rounded-lg">
                    <div className="flex items-center space-x-2 text-secondary">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Literature Review Generated Successfully</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        <div className="flex justify-center space-x-4">
          {generatedContent && (
            <Button variant="outline" className="btn-surface">
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate New Review
            </Button>
          )}
          <Button onClick={handleNext} className="bg-primary hover:bg-primary/90">
            Next
          </Button>
        </div>
      </div>
    </section>
  );
}
