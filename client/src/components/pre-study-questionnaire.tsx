import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useStudyStore } from "@/lib/study-store";

export default function PreStudyQuestionnaire() {
  const { setCurrentStep, saveQuestionnaireResponse } = useStudyStore();

  const [responses, setResponses] = useState({
    q1_familiarity: [4],
    q2_frequency: "",
    q3_knowledge: [4],
    q4_trust1: [4],
    q5_trust2: [4],
    q6_age: "",
    q7_gender: "",
    q8_field: "",
  });

  const isComplete = () =>
    responses.q1_familiarity.length &&
    responses.q2_frequency &&
    responses.q3_knowledge.length &&
    responses.q4_trust1.length &&
    responses.q5_trust2.length &&
    responses.q6_age.trim() &&
    responses.q7_gender.trim() &&
    responses.q8_field.trim();

  const handleSliderChange = (key: string, value: number[]) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
  };

  const handleInputChange = (key: string, value: string) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!isComplete()) return;

    const formatted = {
      q1_familiarity: Math.round(responses.q1_familiarity[0]),
      q2_frequency: responses.q2_frequency,
      q3_knowledge: Math.round(responses.q3_knowledge[0]),
      q4_trust1: Math.round(responses.q4_trust1[0]),
      q5_trust2: Math.round(responses.q5_trust2[0]),
      q6_age: responses.q6_age || null,
      q7_gender: responses.q7_gender || null,
      q8_field: responses.q8_field || null,
    };

    saveQuestionnaireResponse(0, formatted);
    setCurrentStep("task_selection");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pre-Study Questionnaire</CardTitle>
          <CardDescription>
            This short survey helps us understand your background and attitudes.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-10">
          {/* Section A: Slider-Based Questions */}
          <section className="space-y-6">
            <h3 className="text-xl font-semibold">
              Section A: AI Familiarity and Use
            </h3>

            {[
              {
                key: "q1_familiarity",
                text: "1. I am familiar with Large Language Models (LLMs).",
              },
              {
                key: "q3_knowledge",
                text: "2. I have a great deal of knowledge about LLMs.",
              },
              {
                key: "q4_trust1",
                text: "3. In general, I believe that most people can be counted on to do what they say they will do.",
              },
              {
                key: "q5_trust2",
                text: "4. I am inclined to trust people until I see evidence to the contrary.",
              },
            ].map(({ key, text }, index) => (
              <div key={key} className="space-y-2">
                <p className="font-medium">{text}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-400 px-1 select-none">
                    <span>1 = Strongly Disagree</span>
                    <span className="text-gray-300 font-medium">
                      4 = Neutral
                    </span>
                    <span>7 = Strongly Agree</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                      <Slider
                        value={
                          responses[key as keyof typeof responses] as number[]
                        }
                        onValueChange={(v) => handleSliderChange(key, v)}
                        min={1}
                        max={7}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span className="font-bold text-gray-300">4</span>
                        <span>5</span>
                        <span>6</span>
                        <span>7</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-300 w-8 text-center font-medium bg-gray-700 px-2 py-1 rounded">
                      {Math.round(
                        (
                          responses[key as keyof typeof responses] as number[]
                        )[0],
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Section B: Frequency (MCQ) */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold">
              Section B: Usage Frequency (Multiple Choice)
            </h3>

            <div className="space-y-2">
              <p className="font-medium">
                5. In the past month, how often have you used an LLM?
              </p>
              <RadioGroup
                value={responses.q2_frequency}
                onValueChange={(v) => handleInputChange("q2_frequency", v)}
                className="space-y-1"
              >
                {[
                  { value: "never", label: "Never" },
                  { value: "rarely", label: "Rarely (1–2 times/month)" },
                  {
                    value: "sometimes",
                    label: "Sometimes (a few times/month)",
                  },
                  { value: "often", label: "Often (a few times/week)" },
                  { value: "daily", label: "Daily" },
                ].map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem
                      id={`freq-${opt.value}`}
                      value={opt.value}
                    />
                    <Label htmlFor={`freq-${opt.value}`}>{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </section>

          {/* Section C: Demographics */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold">
              Section C: Demographics{" "}
              <span className="text-sm text-muted-foreground">(Optional)</span>
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="e.g., 29"
                  value={responses.q6_age}
                  onChange={(e) => handleInputChange("q6_age", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="gender">Gender</Label>
                <Input
                  id="gender"
                  placeholder="e.g., Female, Male, Non-binary..."
                  value={responses.q7_gender}
                  onChange={(e) =>
                    handleInputChange("q7_gender", e.target.value)
                  }
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="field">
                  8. What is your primary field of study or profession?
                </Label>
                <Input
                  id="field"
                  placeholder="e.g., Computer Science, Marketing, Law"
                  value={responses.q8_field}
                  onChange={(e) =>
                    handleInputChange("q8_field", e.target.value)
                  }
                  required
                />
              </div>
            </div>
          </section>

          {/* Submit Button */}
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
