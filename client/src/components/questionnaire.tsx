import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useStudyStore } from "@/lib/study-store";
import { apiRequest } from "@/lib/queryClient";

export default function Questionnaire() {
  const { currentTask, participantId, setCurrentStep, setCurrentTask, markTaskComplete, saveQuestionnaireResponse, updateProgress } = useStudyStore();
  const [responses, setResponses] = useState<Record<string, string>>({});

  const questions = [
    {
      id: "engagement_1",
      text: "How engaged did you feel during this task?",
      options: [
        { value: "1", label: "1 - Not engaged at all" },
        { value: "2", label: "2 - Slightly engaged" },
        { value: "3", label: "3 - Moderately engaged" },
        { value: "4", label: "4 - Very engaged" },
        { value: "5", label: "5 - Extremely engaged" },
      ],
    },
    {
      id: "engagement_2",
      text: "How engaged did you feel during this task?",
      options: [
        { value: "1", label: "1 - Not engaged at all" },
        { value: "2", label: "2 - Slightly engaged" },
        { value: "3", label: "3 - Moderately engaged" },
        { value: "4", label: "4 - Very engaged" },
        { value: "5", label: "5 - Extremely engaged" },
      ],
    },
    {
      id: "engagement_3",
      text: "How engaged did you feel during this task?",
      options: [
        { value: "1", label: "1 - Not engaged at all" },
        { value: "2", label: "2 - Slightly engaged" },
        { value: "3", label: "3 - Moderately engaged" },
        { value: "4", label: "4 - Very engaged" },
        { value: "5", label: "5 - Extremely engaged" },
      ],
    },
    {
      id: "engagement_4",
      text: "How engaged did you feel during this task?",
      options: [
        { value: "1", label: "1 - Not engaged at all" },
        { value: "2", label: "2 - Slightly engaged" },
        { value: "3", label: "3 - Moderately engaged" },
        { value: "4", label: "4 - Very engaged" },
        { value: "5", label: "5 - Extremely engaged" },
      ],
    },
    {
      id: "engagement_5",
      text: "How engaged did you feel during this task?",
      options: [
        { value: "1", label: "1 - Not engaged at all" },
        { value: "2", label: "2 - Slightly engaged" },
        { value: "3", label: "3 - Moderately engaged" },
        { value: "4", label: "4 - Very engaged" },
        { value: "5", label: "5 - Extremely engaged" },
      ],
    },
  ];

  const submitQuestionnaireMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/questionnaire", data);
      return response.json();
    },
    onSuccess: () => {
      // Save questionnaire response to local storage
      if (currentTask) {
        saveQuestionnaireResponse(currentTask.id, responses);
        
        // Note: Do not call markTaskComplete here as it would override
        // the comprehensive task data already saved by the task components
        
        updateProgress();
        
        // Check if all tasks are completed
        if (currentTask.id >= 4) {
          setCurrentStep("completion");
        } else {
          // Return to task selection to show sequential progress
          setCurrentStep("task_selection");
        }
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all questions are answered
    const unanswered = questions.filter(q => !responses[q.id]);
    if (unanswered.length > 0) {
      alert(`Please answer all questions. Missing: ${unanswered.map(q => q.text).join(", ")}`);
      return;
    }

    submitQuestionnaireMutation.mutate({
      participantId,
      taskId: currentTask?.id || 0,
      responses,
    });
  };

  const handleBack = () => {
    if (currentTask?.taskType === "literature_review") {
      setCurrentStep("literature_review");
    } else {
      setCurrentStep("argument_exploration");
    }
  };

  const isSelectiveFriction = currentTask?.frictionType === "selective_friction";

  return (
    <section className="py-8 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Task {currentTask?.id}: {currentTask?.taskType === "literature_review" ? "Literature Review" : "Argument Exploration"}{" "}
            <span className={isSelectiveFriction ? "text-primary" : "text-secondary"}>
              ({isSelectiveFriction ? "Selective Friction" : "Full AI Assistance"})
            </span>
          </h1>
          <p className="text-secondary">Questionnaire</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {questions.map((question, index) => (
            <Card key={question.id} className="surface border border-border">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-6">{question.text}</h3>
                
                <RadioGroup
                  value={responses[question.id] || ""}
                  onValueChange={(value) => setResponses(prev => ({ ...prev, [question.id]: value }))}
                  className="space-y-3"
                >
                  {question.options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 cursor-pointer hover:bg-surface-variant rounded-lg p-2 transition-colors">
                      <RadioGroupItem value={option.value} id={`${question.id}_${option.value}`} />
                      <Label 
                        htmlFor={`${question.id}_${option.value}`} 
                        className="text-secondary cursor-pointer flex-1"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-center space-x-4">
            <Button type="button" variant="outline" onClick={handleBack} className="btn-surface">
              Back
            </Button>
            <Button 
              type="submit" 
              disabled={submitQuestionnaireMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {submitQuestionnaireMutation.isPending ? "Submitting..." : "Next"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
