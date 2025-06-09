import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useStudyStore } from "@/lib/study-store";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, RefreshCw, CheckCircle } from "lucide-react";

export default function LiteratureReview() {
  const { currentTask, setCurrentStep } = useStudyStore();
  const [topic, setTopic] = useState("");
  const [initialThoughts, setInitialThoughts] = useState("");
  const [paperAbstracts, setPaperAbstracts] = useState("");
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

  const handleGenerateReview = () => {
    if (currentTask?.frictionType === "selective_friction") {
      if (!topic || !initialThoughts || !paperAbstracts) {
        alert("Please complete all preparatory work before generating the review.");
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
                <CardTitle>Topic or Question</CardTitle>
                <p className="text-secondary text-sm">Provide a clear topic or question you want to explore</p>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Should students pursue Masters in the US?"
                  className="surface-variant border-border bg-accent text-foreground placeholder-secondary"
                  rows={3}
                />
              </CardContent>
            </Card>

            <Card className="surface border border-border mb-8">
              <CardHeader>
                <CardTitle>Your Initial Research & Thoughts</CardTitle>
                <p className="text-secondary text-sm">Write your own initial research findings and thoughts on this topic:</p>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={initialThoughts}
                  onChange={(e) => setInitialThoughts(e.target.value)}
                  placeholder="Share your initial research findings, key insights, and thoughts"
                  className="surface-variant border-border bg-accent text-foreground placeholder-secondary"
                  rows={4}
                />
              </CardContent>
            </Card>

            <Card className="surface border border-border mb-8">
              <CardHeader>
                <CardTitle>Paper Abstracts & Rankings</CardTitle>
                <p className="text-secondary text-sm">Find and list 5-7 academic paper abstracts relevant to your topic, ranked by relevance:</p>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={paperAbstracts}
                  onChange={(e) => setPaperAbstracts(e.target.value)}
                  placeholder="1. [Most relevant] Title: ... Abstract: ... &#10;2. Title: ... Abstract: ... &#10;3. Title: ... Abstract: ..."
                  className="surface-variant border-border bg-accent text-foreground placeholder-secondary"
                  rows={6}
                />
              </CardContent>
            </Card>

            <div className="flex justify-center mb-8">
              <Button 
                onClick={handleGenerateReview}
                disabled={generateReviewMutation.isPending}
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
              <div className="text-center mb-8">
                <Button 
                  onClick={handleGenerateReview}
                  disabled={generateReviewMutation.isPending}
                  className="bg-primary hover:bg-primary/90 px-8 py-3"
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
