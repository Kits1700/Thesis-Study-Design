import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStudyStore } from "@/lib/study-store";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, Download, Loader2 } from "lucide-react";

export default function CompletionScreen() {
  const { participantId, completedTasks, setCurrentStep } = useStudyStore();
  const [showFinalQuestionnaire, setShowFinalQuestionnaire] = useState(true);
  const [responses, setResponses] = useState<Record<string, string>>({});

  const finalQuestions = [
    {
      id: "overall_experience",
      text: "How would you rate your overall experience with this study?",
      type: "radio",
      options: [
        { value: "1", label: "1 - Very Poor" },
        { value: "2", label: "2 - Poor" },
        { value: "3", label: "3 - Fair" },
        { value: "4", label: "4 - Good" },
        { value: "5", label: "5 - Excellent" }
      ]
    },
    {
      id: "task_comparison",
      text: "Which type of task did you find more engaging?",
      type: "radio",
      options: [
        { value: "summative", label: "Summative Tasks (Tasks 1&2) - Immediate AI assistance" },
        { value: "generative", label: "Generative Tasks (Tasks 3&4) - Preparatory work first" },
        { value: "equal", label: "Both were equally engaging" }
      ]
    },
    {
      id: "friction_preference",
      text: "Did the 'preparatory work first' approach in Tasks 3&4 enhance your thinking process?",
      type: "radio",
      options: [
        { value: "strongly_agree", label: "Strongly Agree" },
        { value: "agree", label: "Agree" },
        { value: "neutral", label: "Neutral" },
        { value: "disagree", label: "Disagree" },
        { value: "strongly_disagree", label: "Strongly Disagree" }
      ]
    },
    {
      id: "learning_impact",
      text: "Which approach do you think helped you learn more effectively?",
      type: "radio",
      options: [
        { value: "immediate", label: "Immediate AI assistance (Tasks 1&2)" },
        { value: "friction", label: "Preparatory work first (Tasks 3&4)" },
        { value: "both", label: "Both approaches were equally effective" }
      ]
    },
    {
      id: "open_feedback",
      text: "Please share any additional thoughts about your experience with different AI assistance approaches:",
      type: "textarea"
    }
  ];

  const finalQuestionnaireMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/questionnaire/final", data);
      return response.json();
    },
    onSuccess: () => {
      setShowFinalQuestionnaire(false);
    },
  });

  const downloadDataMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/export/${participantId}`);
      if (!response.ok) throw new Error("Failed to export data");
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `study_data_${participantId}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
  });

  const handleDownloadData = () => {
    downloadDataMutation.mutate();
  };

  const handleSubmitFinalQuestionnaire = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required questions are answered
    const requiredQuestions = finalQuestions.filter(q => q.type === "radio");
    const unanswered = requiredQuestions.filter(q => !responses[q.id]);
    
    if (unanswered.length > 0) {
      alert(`Please answer all required questions: ${unanswered.map(q => q.text).join(", ")}`);
      return;
    }

    finalQuestionnaireMutation.mutate({
      participantId,
      taskId: "final",
      responses,
      timestamp: new Date().toISOString(),
    });
  };

  const handleReturnToMenu = () => {
    setCurrentStep("task_selection");
  };

  if (showFinalQuestionnaire) {
    return (
      <div className="min-h-screen bg-gray-900 py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4 text-white">Final Study Questionnaire</h1>
            <p className="text-gray-300">
              You've completed all four tasks! Please share your thoughts about the different AI assistance approaches.
            </p>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Overall Study Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitFinalQuestionnaire} className="space-y-8">
                {finalQuestions.map((question, index) => (
                  <div key={question.id} className="space-y-4">
                    <h3 className="text-lg font-medium text-white">
                      {index + 1}. {question.text}
                    </h3>
                    
                    {question.type === "radio" && question.options && (
                      <RadioGroup
                        value={responses[question.id] || ""}
                        onValueChange={(value) => 
                          setResponses(prev => ({ ...prev, [question.id]: value }))
                        }
                        className="space-y-3"
                      >
                        {question.options.map((option) => (
                          <div key={option.value} className="flex items-center space-x-3">
                            <RadioGroupItem 
                              value={option.value} 
                              id={`${question.id}-${option.value}`}
                              className="border-gray-400"
                            />
                            <Label 
                              htmlFor={`${question.id}-${option.value}`}
                              className="text-gray-300 cursor-pointer"
                            >
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                    
                    {question.type === "textarea" && (
                      <Textarea
                        placeholder="Share your thoughts..."
                        value={responses[question.id] || ""}
                        onChange={(e) => 
                          setResponses(prev => ({ ...prev, [question.id]: e.target.value }))
                        }
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 min-h-[100px]"
                      />
                    )}
                  </div>
                ))}
                
                <div className="flex justify-center">
                  <Button 
                    type="submit" 
                    disabled={finalQuestionnaireMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2"
                  >
                    {finalQuestionnaireMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Complete Study"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <section className="py-12 px-6 bg-gray-900 min-h-screen">
      <div className="max-w-3xl mx-auto text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-white">Study Completed Successfully</h1>
          <p className="text-gray-300 text-lg">
            Thank you for your participation in this research study. Your responses have been recorded and will contribute to our understanding of AI assistance in academic tasks.
          </p>
        </div>

        <Card className="surface border border-border mb-8">
          <CardHeader>
            <CardTitle>Study Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-secondary mb-1">Tasks Completed</p>
                <p className="font-semibold">{completedTasks.length} of 4</p>
              </div>
              <div>
                <p className="text-secondary mb-1">Participant ID</p>
                <p className="font-semibold font-mono">{participantId}</p>
              </div>
              <div>
                <p className="text-secondary mb-1">Condition A</p>
                <p className="font-semibold">Full AI Assistance</p>
              </div>
              <div>
                <p className="text-secondary mb-1">Condition B</p>
                <p className="font-semibold">Selective Friction</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Button 
            onClick={handleDownloadData}
            disabled={downloadDataMutation.isPending}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Download className="w-4 h-4 mr-2" />
            {downloadDataMutation.isPending ? "Downloading..." : "Download Study Data"}
          </Button>
          <Button 
            onClick={handleReturnToMenu}
            variant="outline" 
            className="w-full btn-surface"
          >
            Return to Main Menu
          </Button>
        </div>
      </div>
    </section>
  );
}
