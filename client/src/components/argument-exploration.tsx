import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useStudyStore } from "@/lib/study-store";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, RefreshCw } from "lucide-react";

export default function ArgumentExploration() {
  const { currentTask, setCurrentStep } = useStudyStore();
  const [topic, setTopic] = useState("");
  const [initialThoughts, setInitialThoughts] = useState("");
  const [counterarguments, setCounterarguments] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isPreparatoryComplete, setIsPreparatoryComplete] = useState(false);

  const generateArgumentsMutation = useMutation({
    mutationFn: async (data: { topic: string; initialThoughts?: string; counterarguments?: string }) => {
      const response = await apiRequest("POST", "/api/generate/argument-exploration", data);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedContent(data.content);
    },
  });

  const handleGenerateArguments = () => {
    if (currentTask?.frictionType === "selective_friction") {
      if (!topic || !initialThoughts || !counterarguments) {
        alert("Please complete all preparatory work before generating arguments.");
        return;
      }
      setIsPreparatoryComplete(true);
    }
    
    generateArgumentsMutation.mutate({ 
      topic: topic || "Should students pursue Masters in the US?",
      initialThoughts,
      counterarguments
    });
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
            Task {currentTask?.id}: Brainstorming & Argument Exploration{" "}
            <span className={isSelectiveFriction ? "text-primary" : "text-secondary"}>
              ({isSelectiveFriction ? "Selective Friction" : "Full AI Assistance"})
            </span>
          </h1>
          <p className="text-secondary">
            {isSelectiveFriction 
              ? "Complete your preparatory brainstorming work first, then unlock AI assistance to enhance and expand your ideas."
              : "Enter your topic or question and receive immediate AI assistance for comprehensive brainstorming and argument exploration"
            }
          </p>
        </div>

        {!isSelectiveFriction ? (
          <Card className="surface border border-border mb-8">
            <CardHeader>
              <CardTitle>Topic or Question</CardTitle>
              <p className="text-secondary text-sm">Provide any topic, question, or problem you'd like to explore. AI will immediately help you brainstorm ideas and arguments</p>
            </CardHeader>
            <CardContent>
              <Textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Should students pursue Masters in the US?"
                className="bg-accent border-border text-foreground placeholder-secondary mb-4"
                rows={3}
              />
              <Button 
                onClick={handleGenerateArguments}
                disabled={generateArgumentsMutation.isPending}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {generateArgumentsMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Arguments...
                  </>
                ) : (
                  "Generate Arguments"
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          !isPreparatoryComplete && (
            <>
              <Card className="surface border border-border mb-6">
                <CardHeader>
                  <CardTitle>Topic or Question</CardTitle>
                  <p className="text-secondary text-sm">Provide a clear topic or question you want to explore</p>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Should students pursue Masters in the US?"
                    className="bg-accent border-border text-foreground placeholder-secondary"
                    rows={4}
                  />
                </CardContent>
              </Card>

              <Card className="surface border border-border mb-6">
                <CardHeader>
                  <CardTitle>Your Initial Thoughts & Ideas</CardTitle>
                  <p className="text-secondary text-sm">Write your own initial brainstorming and thoughts on this topic:</p>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={initialThoughts}
                    onChange={(e) => setInitialThoughts(e.target.value)}
                    placeholder="Share your initial thoughts, ideas"
                    className="bg-accent border-border text-foreground placeholder-secondary"
                    rows={4}
                  />
                </CardContent>
              </Card>

              <Card className="surface border border-border mb-8">
                <CardHeader>
                  <CardTitle>Potential Counterarguments</CardTitle>
                  <p className="text-secondary text-sm">Identify potential counterarguments or challenges to your ideas</p>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={counterarguments}
                    onChange={(e) => setCounterarguments(e.target.value)}
                    placeholder="What are the potential counterarguments"
                    className="bg-accent border-border text-foreground placeholder-secondary"
                    rows={4}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-center mb-8">
                <Button 
                  onClick={handleGenerateArguments}
                  disabled={generateArgumentsMutation.isPending}
                  className="w-full max-w-md bg-primary hover:bg-primary/90"
                >
                  {generateArgumentsMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Arguments...
                    </>
                  ) : (
                    "Generate Arguments"
                  )}
                </Button>
              </div>
            </>
          )
        )}

        {generatedContent && (
          <Card className="surface border border-border mb-8">
            <CardContent className="p-6">
              <div className="mb-4">
                <p className="text-secondary text-sm mb-4">
                  Whether students should pursue a Master's degree in the US depends on several personal, professional, and financial factors. Here's a breakdown of the key pros and cons to help with a well-informed decision:
                </p>
              </div>

              <div className="space-y-6">
                <div dangerouslySetInnerHTML={{ __html: generatedContent }} />
              </div>

              <div className="flex justify-center mt-8">
                <Button variant="outline" className="btn-surface">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Start New Session
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center space-x-4">
          <Button variant="outline" className="btn-surface">
            Back
          </Button>
          <Button onClick={handleNext} className="bg-primary hover:bg-primary/90">
            Next
          </Button>
        </div>
      </div>
    </section>
  );
}
