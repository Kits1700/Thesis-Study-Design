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
      responses,
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
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-6 text-white">Thank You!</h1>
          <h2 className="text-2xl font-semibold mb-4 text-gray-300">Study Completed Successfully</h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            Your participation in this research study is greatly appreciated. Your responses have been recorded and will contribute valuable insights to our understanding of how different AI assistance approaches affect thinking and engagement in academic tasks.
          </p>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">What happens next?</h3>
            <div className="text-left space-y-3 text-gray-300">
              <p>• Your data will be analyzed alongside other participants to understand patterns in AI-human collaboration</p>
              <p>• All responses remain anonymous and confidential</p>
              <p>• Results will contribute to improving AI assistance design for academic work</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Study Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
            <div className="flex justify-between">
              <span>Tasks Completed:</span>
              <span className="font-semibold text-white">4 of 4</span>
            </div>
            <div className="flex justify-between">
              <span>Participant ID:</span>
              <span className="font-mono text-purple-400">{participantId}</span>
            </div>
            <div className="flex justify-between">
              <span>Literature Review:</span>
              <span className="text-teal-400">Summative Tasks</span>
            </div>
            <div className="flex justify-between">
              <span>Argument Exploration:</span>
              <span className="text-purple-400">Generative Tasks</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            You may now close this window. Thank you again for your participation!
          </p>
        </div>
      </div>
    </section>
  );
}
