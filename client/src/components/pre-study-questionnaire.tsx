import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useStudyStore } from "@/lib/study-store";

const scaleOptions = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "6", label: "6" },
  { value: "7", label: "7" },
];

const frequencyOptions = [
  { value: "never", label: "Never" },
  { value: "rarely", label: "Rarely (1-2 times a month)" },
  { value: "sometimes", label: "Sometimes (A few times a month)" },
  { value: "often", label: "Often (A few times a week)" },
  { value: "daily", label: "Daily" },
];

const usagePurposes = [
  { id: "academic", label: "Academic writing or research" },
  { id: "brainstorming", label: "Generating ideas or brainstorming" },
  { id: "professional", label: "Professional/work-related tasks" },
  { id: "creative", label: "Creative and/or personal tasks" },
  { id: "coding", label: "Coding or technical problem-solving" },
  { id: "never", label: "I have never used an LLM" },
];

export default function PreStudyQuestionnaire() {
  const { setCurrentStep, saveQuestionnaireResponse, participantId } = useStudyStore();
  const [responses, setResponses] = useState({
    q1_familiarity: "",
    q2_frequency: "",
    q3_knowledge: "",
    q4_purposes: [] as string[],
    q5_comparative: "",
  });

  const handleScaleChange = (question: string, value: string) => {
    setResponses(prev => ({ ...prev, [question]: value }));
  };

  const handlePurposeChange = (purposeId: string, checked: boolean) => {
    setResponses(prev => {
      const purposes = checked 
        ? [...prev.q4_purposes, purposeId]
        : prev.q4_purposes.filter(p => p !== purposeId);
      
      // If "never used" is checked, uncheck all others
      if (purposeId === "never" && checked) {
        return { ...prev, q4_purposes: ["never"] };
      }
      
      // If any other option is checked, uncheck "never used"
      if (purposeId !== "never" && checked) {
        return { ...prev, q4_purposes: purposes.filter(p => p !== "never") };
      }
      
      return { ...prev, q4_purposes: purposes };
    });
  };

  const isComplete = () => {
    return responses.q1_familiarity && 
           responses.q2_frequency && 
           responses.q3_knowledge && 
           responses.q4_purposes.length > 0 && 
           responses.q5_comparative;
  };

  const handleSubmit = () => {
    if (!isComplete()) return;
    
    // Save responses with task ID 0 (pre-study)
    saveQuestionnaireResponse(0, responses);
    setCurrentStep("task_selection");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Pre-Study Questionnaire</CardTitle>
          <CardDescription>
            Section A: AI Familiarity and Use
            <br />
            Please answer the following questions about your experience with AI tools like ChatGPT, Google Gemini, Claude, etc.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Question 1 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              1. How would you rate your overall familiarity with Large Language Models (LLMs)?
            </h3>
            <p className="text-sm text-muted-foreground">
              Scale: 1 = Not at all familiar, 7 = Extremely familiar
            </p>
            <RadioGroup 
              value={responses.q1_familiarity} 
              onValueChange={(value) => handleScaleChange("q1_familiarity", value)}
              className="flex space-x-4"
            >
              {scaleOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`q1-${option.value}`} />
                  <Label htmlFor={`q1-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Question 2 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              2. In the past month, how often have you used an LLM for tasks related to writing, brainstorming, or research?
            </h3>
            <RadioGroup 
              value={responses.q2_frequency} 
              onValueChange={(value) => handleScaleChange("q2_frequency", value)}
              className="space-y-2"
            >
              {frequencyOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`q2-${option.value}`} />
                  <Label htmlFor={`q2-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Question 3 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              3. Please rate your agreement with the statement: "I have a great deal of knowledge about LLMs."
            </h3>
            <p className="text-sm text-muted-foreground">
              Scale: 1 = Strongly Disagree, 7 = Strongly Agree
            </p>
            <RadioGroup 
              value={responses.q3_knowledge} 
              onValueChange={(value) => handleScaleChange("q3_knowledge", value)}
              className="flex space-x-4"
            >
              {scaleOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`q3-${option.value}`} />
                  <Label htmlFor={`q3-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Question 4 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              4. For which of the following purposes have you previously used LLMs? (Select all that apply)
            </h3>
            <div className="space-y-3">
              {usagePurposes.map((purpose) => (
                <div key={purpose.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`purpose-${purpose.id}`}
                    checked={responses.q4_purposes.includes(purpose.id)}
                    onCheckedChange={(checked) => handlePurposeChange(purpose.id, checked as boolean)}
                  />
                  <Label htmlFor={`purpose-${purpose.id}`}>{purpose.label}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Question 5 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              5. Compared to the average person, how would you rate your familiarity with LLMs?
            </h3>
            <p className="text-sm text-muted-foreground">
              Scale: 1 = Much less familiar, 7 = Much more familiar
            </p>
            <RadioGroup 
              value={responses.q5_comparative} 
              onValueChange={(value) => handleScaleChange("q5_comparative", value)}
              className="flex space-x-4"
            >
              {scaleOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`q5-${option.value}`} />
                  <Label htmlFor={`q5-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-end pt-6">
            <Button 
              onClick={handleSubmit} 
              disabled={!isComplete()}
              className="px-8"
            >
              Continue to Study Tasks
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}