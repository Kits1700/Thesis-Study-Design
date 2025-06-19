import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
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
    q1_familiarity: [4] as number[],
    q2_frequency: "",
    q3_knowledge: [4] as number[],
    q4_purposes: [] as string[],
    q5_comparative: [4] as number[],
  });

  const handleScaleChange = (question: string, value: string) => {
    setResponses(prev => ({ ...prev, [question]: value }));
  };

  const handleSliderChange = (question: string, value: number[]) => {
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
    return responses.q1_familiarity.length > 0 && 
           responses.q2_frequency && 
           responses.q3_knowledge.length > 0 && 
           responses.q4_purposes.length > 0 && 
           responses.q5_comparative.length > 0;
  };

  const handleSubmit = () => {
    if (!isComplete()) return;
    
    // Save responses with task ID 0 (pre-study) - convert slider arrays to numbers
    const formattedResponses = {
      q1_familiarity: Math.round(responses.q1_familiarity[0]),
      q2_frequency: responses.q2_frequency,
      q3_knowledge: Math.round(responses.q3_knowledge[0]),
      q4_purposes: responses.q4_purposes,
      q5_comparative: Math.round(responses.q5_comparative[0]),
    };
    saveQuestionnaireResponse(0, formattedResponses);
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
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Not at all familiar</span>
                <span>Extremely familiar</span>
              </div>
              <div className="px-3">
                <Slider
                  value={responses.q1_familiarity}
                  onValueChange={(value) => handleSliderChange("q1_familiarity", value)}
                  max={7}
                  min={1}
                  step={0.1}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground px-3">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
                <span>7</span>
              </div>
              <div className="text-center text-sm">
                Current value: {Math.round(responses.q1_familiarity[0])}
              </div>
            </div>
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
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Strongly Disagree</span>
                <span>Strongly Agree</span>
              </div>
              <div className="px-3">
                <Slider
                  value={responses.q3_knowledge}
                  onValueChange={(value) => handleSliderChange("q3_knowledge", value)}
                  max={7}
                  min={1}
                  step={0.1}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground px-3">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
                <span>7</span>
              </div>
              <div className="text-center text-sm">
                Current value: {Math.round(responses.q3_knowledge[0])}
              </div>
            </div>
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
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Much less familiar</span>
                <span>Much more familiar</span>
              </div>
              <div className="px-3">
                <Slider
                  value={responses.q5_comparative}
                  onValueChange={(value) => handleSliderChange("q5_comparative", value)}
                  max={7}
                  min={1}
                  step={0.1}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground px-3">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
                <span>7</span>
              </div>
              <div className="text-center text-sm">
                Current value: {Math.round(responses.q5_comparative[0])}
              </div>
            </div>
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