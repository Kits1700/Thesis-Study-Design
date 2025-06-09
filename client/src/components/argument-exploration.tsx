import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useStudyStore } from "@/lib/study-store";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, RefreshCw, CheckCircle } from "lucide-react";

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

  const handleBack = () => {
    setCurrentStep("task_selection");
  };

  const isSelectiveFriction = currentTask?.frictionType === "selective_friction";

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">
            Task {currentTask?.id}: Argument Exploration{" "}
            <span className="text-purple-400">
              (Generative Task)
            </span>
          </h1>
          <p className="text-gray-300">
            {isSelectiveFriction 
              ? "Complete your preparatory brainstorming work first, then unlock AI assistance to enhance and expand your ideas."
              : "Your goal is to explore complex arguments on a topic of your choice by directly receiving help from the AI to develop comprehensive perspectives."
            }
          </p>
        </div>

        {!isSelectiveFriction ? (
          <Card className="bg-gray-800 border border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Topic or Question</CardTitle>
              <p className="text-gray-300 text-sm">Provide any topic, question, or problem you'd like to explore. AI will immediately help you brainstorm ideas and arguments</p>
            </CardHeader>
            <CardContent>
              <Textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Should students pursue Masters in the US?"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 mb-4"
                rows={3}
              />
              <Button 
                onClick={handleGenerateArguments}
                disabled={generateArgumentsMutation.isPending}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
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
          <>
            {!isPreparatoryComplete && (
              <>
                <Card className="bg-gray-800 border border-gray-700 mb-8">
                  <CardHeader>
                    <CardTitle className="text-white">Topic or Question</CardTitle>
                    <p className="text-gray-300 text-sm">What topic, question, or problem would you like to explore?</p>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. Should students pursue Masters in the US?"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      rows={3}
                    />
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border border-gray-700 mb-8">
                  <CardHeader>
                    <CardTitle className="text-white">Initial Thoughts</CardTitle>
                    <p className="text-gray-300 text-sm">Before getting AI help, brainstorm your own initial thoughts and ideas about this topic</p>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={initialThoughts}
                      onChange={(e) => setInitialThoughts(e.target.value)}
                      placeholder="Write your initial thoughts, ideas, or perspectives on this topic..."
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      rows={5}
                    />
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border border-gray-700 mb-8">
                  <CardHeader>
                    <CardTitle className="text-white">Counterarguments</CardTitle>
                    <p className="text-gray-300 text-sm">Think of potential counterarguments or opposing viewpoints to your initial thoughts</p>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={counterarguments}
                      onChange={(e) => setCounterarguments(e.target.value)}
                      placeholder="What are the potential counterarguments or opposing views..."
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      rows={5}
                    />
                  </CardContent>
                </Card>

                <div className="text-center mb-8">
                  <Button 
                    onClick={handleGenerateArguments}
                    disabled={generateArgumentsMutation.isPending || !topic || !initialThoughts || !counterarguments}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
                  >
                    {generateArgumentsMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Arguments...
                      </>
                    ) : (
                      "Generate Enhanced Arguments"
                    )}
                  </Button>
                </div>
              </>
            )}

            {isPreparatoryComplete && (
              <Card className="bg-gray-800 border border-gray-700 mb-8">
                <CardHeader>
                  <CardTitle className="text-white">Topic Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-300 mb-2">Topic:</h4>
                    <p className="text-gray-400">{topic}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-300 mb-2">Your Initial Thoughts:</h4>
                    <p className="text-gray-400">{initialThoughts}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-300 mb-2">Counterarguments:</h4>
                    <p className="text-gray-400">{counterarguments}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {generatedContent && (
          <Card className="bg-gray-800 border border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                Generated Argument Exploration
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
                Generate New Arguments
              </Button>
            )}
            <Button 
              onClick={handleNext} 
              disabled={!generatedContent}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}