import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useStudyStore } from "@/lib/study-store";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, RefreshCw, CheckCircle, Download } from "lucide-react";

export default function ArgumentExploration() {
  const { currentTask, setCurrentStep, participantId, markTaskComplete } = useStudyStore();
  const [topic, setTopic] = useState("");
  const [initialThoughts, setInitialThoughts] = useState("");
  const [counterarguments, setCounterarguments] = useState("");
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

  const generateArgumentsMutation = useMutation({
    mutationFn: async (data: { topic: string; initialThoughts?: string; counterarguments?: string }) => {
      // Create task record first if not already created
      if (!taskCreated && currentTask && participantId) {
        await createTaskMutation.mutateAsync({
          participantId,
          taskId: currentTask.id,
          taskType: currentTask.taskType,
          frictionType: currentTask.frictionType,
          topic: data.topic,
          initialThoughts: data.initialThoughts,
          counterarguments: data.counterarguments,
          generatedContent: {},
        });
        setTaskCreated(true);
      }

      const response = await fetch("/api/generate/argument-exploration/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          participantId,
          taskId: currentTask?.id,
        }),
      });

      if (!response.ok) {
        console.error("Failed to generate argument exploration:", response.status);
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
    // Save comprehensive task data to local storage
    if (currentTask) {
      markTaskComplete({
        taskId: currentTask.id,
        taskType: currentTask.taskType,
        frictionType: currentTask.frictionType,
        topic: topic || "No topic specified",
        initialThoughts: initialThoughts || "No initial thoughts provided",
        counterarguments: counterarguments || "No counterarguments provided",
        generatedContent: {
          argumentExploration: generatedContent,
          userPrompts: {
            topic: topic,
            initialThoughts: initialThoughts,
            counterarguments: counterarguments,
            preparatoryWork: isSelectiveFriction ? { initialThoughts, counterarguments } : null
          }
        },
      });
    }
    // Scroll to top when moving to questionnaire
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep("questionnaire");
  };

  const downloadArgumentExploration = () => {
    if (!generatedContent) return;
    
    const textContent = `Argument Exploration: ${topic || "Generated Analysis"}\n\n${generatedContent.replace(/<[^>]*>/g, '')}`;
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `argument_exploration_${topic ? topic.replace(/[^a-zA-Z0-9]/g, '_') : 'generated'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
          <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
            <p className="text-yellow-300 text-sm">
              ⚠️ LLM content may unintentionally reflect societal biases. Always verify claims with reputable sources.
            </p>
          </div>
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
              <>
                <Button 
                  variant="outline" 
                  onClick={downloadArgumentExploration}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Analysis
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
                  Generate New Arguments
                </Button>
              </>
            )}
            <Button 
              onClick={handleNext} 
              disabled={!generatedContent || generateArgumentsMutation.isPending}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
            >
              {generateArgumentsMutation.isPending ? "Generating..." : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}